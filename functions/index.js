'use strict';

const { onRequest } = require('firebase-functions/v2/https');
const { defineSecret } = require('firebase-functions/params');
const { setGlobalOptions } = require('firebase-functions/v2');
const admin = require('firebase-admin');
const { MercadoPagoConfig, Preference, Payment } = require('mercadopago');
const crypto = require('crypto');
const nodemailer = require('nodemailer');

admin.initializeApp();
setGlobalOptions({ region: 'us-central1', maxInstances: 10 });

const db = admin.firestore();

// ─── Secrets ───────────────────────────────────────────────────────────────────
const MP_ACCESS_TOKEN   = defineSecret('MP_ACCESS_TOKEN');
const MP_WEBHOOK_SECRET = defineSecret('MP_WEBHOOK_SECRET');
const GMAIL_USER        = defineSecret('GMAIL_USER');
const GMAIL_APP_PASS    = defineSecret('GMAIL_APP_PASS');

// ─── Orígenes permitidos ──────────────────────────────────────────────────────
const CORS_ORIGINS = [
  'https://papeleracarocruz.com',
  'https://www.papeleracarocruz.com',
  'http://localhost:5500',
  'http://127.0.0.1:5500',
];

const SITE_URL = 'https://papeleracarocruz.com';
const WEBHOOK_URL = 'https://webhookmp-f2t74egmxa-uc.a.run.app';

// ─── Helpers de precio (replica la lógica del frontend) ──────────────────────
function _normalizar(s) {
  return String(s || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toUpperCase()
    .trim();
}

function _toPct(v) {
  const n = Math.floor(Number(v || 0));
  return Number.isFinite(n) ? Math.max(0, Math.min(90, n)) : 0;
}

function calcularPrecioFinal(prod, config) {
  const base = Number(prod?.precio || 0);
  if (!base || base <= 0) return 0;

  // Descuento por categoría
  const cat = String(prod.categoria || '').trim().toUpperCase();
  const descCat = _toPct(config?.ofertasPorCategoria?.[cat]);

  // Descuento por marca
  const marcas = Array.isArray(config?.marcasPromocion) ? config.marcasPromocion : [];
  let descMarca = 0;
  if (marcas.length) {
    const nombreNorm = _normalizar(prod.nombre);
    const marcaNorm  = _normalizar(prod.marca || '');
    const enPromo = marcas.some(m => {
      const mm = _normalizar(m);
      return mm && (marcaNorm === mm || nombreNorm.includes(mm));
    });
    if (enPromo) descMarca = _toPct(config?.descuentoMarca);
  }

  const descTotal = Math.max(descCat, descMarca);
  if (descTotal <= 0) return Math.floor(base);
  return Math.max(1, Math.round(base * (100 - descTotal) / 100));
}

function calcularSubtotal(prod, cantidad, config) {
  const precioUnit = calcularPrecioFinal(prod, config);
  const cant = Math.max(1, Math.min(999, Math.floor(Number(cantidad || 1))));
  const es2x1 = Array.isArray(config?.productos2x1) && config.productos2x1.includes(prod.id);
  if (es2x1) {
    const cobrables = cant - Math.floor(cant / 2);
    return precioUnit * cobrables;
  }
  return precioUnit * cant;
}

// ─── Validación de email ──────────────────────────────────────────────────────
function emailValido(email) {
  return /^[^\s@]{1,64}@[^\s@]{1,253}\.[^\s@]{2,}$/.test(email);
}

// ─── ENDPOINT 1: Crear preferencia de pago ────────────────────────────────────
exports.crearPreferencia = onRequest(
  {
    region: 'us-central1',
    cors: true,
    secrets: [MP_ACCESS_TOKEN, GMAIL_USER, GMAIL_APP_PASS],
    timeoutSeconds: 30,
  },
  async (req, res) => {
    if (req.method === 'OPTIONS') {
      res.status(204).send('');
      return;
    }
    if (req.method !== 'POST') {
      res.status(405).json({ error: 'Method Not Allowed' });
      return;
    }

    const body = req.body;

    // ── Validar items ──────────────────────────────────────────────────────
    if (!Array.isArray(body?.items) || body.items.length === 0) {
      res.status(400).json({ error: 'items requerido' });
      return;
    }
    if (body.items.length > 50) {
      res.status(400).json({ error: 'Máximo 50 productos por pedido' });
      return;
    }

    // ── Datos del comprador (opcionales — MP los solicita en su propio checkout) ──
    const comprador = body.comprador || {};
    const nombre   = String(comprador.nombre  || '').trim().slice(0, 100);
    const email    = String(comprador.email   || '').trim().toLowerCase().slice(0, 200);
    const telefono = String(comprador.telefono || '').trim().slice(0, 30);

    try {
      // ── Leer config de descuentos desde Firestore (servidor) ─────────────
      const configSnap = await db.collection('config_admin').doc('comercial').get();
      const config = configSnap.exists ? configSnap.data() : {};
      const minCompra = Math.max(0, Number(config.minCompra || 0));

      // ── Validar IDs antes de ir a Firestore ─────────────────────────────
      const itemsEntrada = [];
      for (const item of body.items) {
        const id       = String(item.id || '').trim();
        const cantidad = Math.max(1, Math.min(999, Math.floor(Number(item.cantidad || 1))));
        if (!id || !/^[a-zA-Z0-9_-]{1,100}$/.test(id)) {
          res.status(400).json({ error: `ID de producto inválido: ${id}` });
          return;
        }
        itemsEntrada.push({ id, cantidad });
      }

      // ── Leer todos los productos en paralelo (una sola ronda de red) ────
      const docRefs = itemsEntrada.map(i => db.collection('productos_admin').doc(i.id));
      const snaps   = await db.getAll(...docRefs);

      const itemsValidados = [];
      for (let idx = 0; idx < itemsEntrada.length; idx++) {
        const { id, cantidad } = itemsEntrada[idx];
        const snap = snaps[idx];
        if (!snap.exists) {
          res.status(404).json({ error: `Producto no encontrado: ${id}` });
          return;
        }
        const prod = { id, ...snap.data() };
        if (prod.activo === false) {
          res.status(400).json({ error: `Producto no disponible: ${prod.nombre}` });
          return;
        }
        const precioUnitario = calcularPrecioFinal(prod, config);
        const subtotal       = calcularSubtotal(prod, cantidad, config);
        itemsValidados.push({
          id,
          nombre:       String(prod.nombre || '').slice(0, 256),
          cantidad,
          precioUnitario,
          subtotal,
          categoria:    String(prod.categoria || ''),
        });
      }

      const total = itemsValidados.reduce((s, i) => s + i.subtotal, 0);

      if (total < minCompra) {
        res.status(400).json({
          error: `Monto mínimo de compra: $${minCompra}. Tu pedido: $${total}`,
        });
        return;
      }

      // ── Crear pedido en Firestore (estado: pendiente) ────────────────────
      const pedidoRef = db.collection('pedidos').doc();
      await pedidoRef.set({
        items:      itemsValidados,
        total,
        comprador:  { nombre, email, telefono },
        estado:     'pendiente',
        creadoEn:   admin.firestore.FieldValue.serverTimestamp(),
        actualizadoEn: admin.firestore.FieldValue.serverTimestamp(),
      });

      // ── Crear preferencia en MercadoPago ─────────────────────────────────
      const mpClient = new MercadoPagoConfig({
        accessToken: MP_ACCESS_TOKEN.value(),
      });
      const preferenceApi = new Preference(mpClient);

      const prefResult = await preferenceApi.create({
        body: {
          items: itemsValidados.map(i => ({
            id:          i.id,
            title:       i.nombre,
            quantity:    i.cantidad,
            unit_price:  i.precioUnitario,
            currency_id: 'ARS',
          })),
          ...(nombre || email ? {
            payer: {
              ...(nombre   && { name: nombre }),
              ...(email    && { email }),
              ...(telefono && { phone: { number: telefono } }),
            },
          } : {}),
          back_urls: {
            success: `${SITE_URL}?pago=aprobado&pedido=${pedidoRef.id}`,
            failure: `${SITE_URL}?pago=rechazado&pedido=${pedidoRef.id}`,
            pending: `${SITE_URL}?pago=pendiente&pedido=${pedidoRef.id}`,
          },
          auto_return:          'approved',
          external_reference:   pedidoRef.id,
          notification_url:     WEBHOOK_URL,
          statement_descriptor: 'PAPELERA CARO CRUZ',
          expires:              false,
        },
      });

      // ── Guardar preferenceId en el pedido ────────────────────────────────
      await pedidoRef.update({
        preferenceId: prefResult.id,
        mpInitPoint:  prefResult.init_point,
      });

      res.status(200).json({
        preferenceId: prefResult.id,
        initPoint:    prefResult.init_point,
        pedidoId:     pedidoRef.id,
      });

    } catch (err) {
      console.error('[crearPreferencia] Error:', err);
      res.status(500).json({ error: 'Error interno. Intentá de nuevo.' });
    }
  }
);

// ─── ENDPOINT 2: Webhook de MercadoPago ──────────────────────────────────────
exports.webhookMP = onRequest(
  {
    region: 'us-central1',
    secrets: [MP_ACCESS_TOKEN, MP_WEBHOOK_SECRET, GMAIL_USER, GMAIL_APP_PASS],
    timeoutSeconds: 30,
  },
  async (req, res) => {
    if (req.method !== 'POST') {
      res.status(405).send('Method Not Allowed');
      return;
    }

    // ── Validar firma x-signature ──────────────────────────────────────────
    const xSignature  = String(req.headers['x-signature']  || '');
    const xRequestId  = String(req.headers['x-request-id'] || '');
    const dataId      = String(req.query?.['data.id'] || req.body?.data?.id || '');
    const webhookSecret = MP_WEBHOOK_SECRET.value();

    if (webhookSecret && xSignature) {
      // Parsear "ts=...,v1=..."
      const parts = {};
      xSignature.split(',').forEach(chunk => {
        const [k, v] = chunk.trim().split('=');
        if (k && v) parts[k] = v;
      });
      const ts = parts['ts'] || '';
      const v1 = parts['v1'] || '';

      if (!ts || !v1) {
        console.warn('[Webhook] Header x-signature malformado');
        res.status(401).send('Unauthorized');
        return;
      }

      const signedString = `id:${dataId};request-id:${xRequestId};ts:${ts}`;
      const digest = crypto.createHmac('sha256', webhookSecret).update(signedString).digest('hex');

      if (digest !== v1) {
        console.warn('[Webhook] Firma inválida. Expected:', digest, 'Got:', v1);
        res.status(401).send('Unauthorized');
        return;
      }
    }

    // Solo procesar notificaciones de tipo 'payment'
    const type = req.body?.type || req.query?.type;
    if (type !== 'payment') {
      res.status(200).send('ok');
      return;
    }

    if (!dataId) {
      res.status(400).send('Missing payment id');
      return;
    }

    try {
      // ── Verificar pago directamente con la API de MP ──────────────────────
      // NUNCA confiar en los datos del body del webhook — siempre consultar la API
      const mpClient = new MercadoPagoConfig({
        accessToken: MP_ACCESS_TOKEN.value(),
      });
      const paymentApi = new Payment(mpClient);
      const payment = await paymentApi.get({ id: dataId });

      const externalRef = payment.external_reference;
      if (!externalRef) {
        res.status(200).send('ok');
        return;
      }

      // ── Actualizar pedido en Firestore ────────────────────────────────────
      const pedidoRef  = db.collection('pedidos').doc(externalRef);
      const pedidoSnap = await pedidoRef.get();

      if (!pedidoSnap.exists) {
        console.warn('[Webhook] Pedido no encontrado:', externalRef);
        res.status(200).send('ok');
        return;
      }

      const estadoMap = {
        approved:   'aprobado',
        rejected:   'rechazado',
        cancelled:  'cancelado',
        in_process: 'en_proceso',
        pending:    'pendiente',
        refunded:   'reembolsado',
      };
      const nuevoEstado = estadoMap[payment.status] || payment.status;

      await pedidoRef.update({
        estado:         nuevoEstado,
        paymentId:      String(dataId),
        mpStatus:       payment.status,
        mpStatusDetail: payment.status_detail || '',
        actualizadoEn:  admin.firestore.FieldValue.serverTimestamp(),
      });

      console.log(`[Webhook] Pedido ${externalRef} → ${nuevoEstado} (${payment.status_detail})`);

      // ── Enviar emails si el pago fue aprobado ──────────────────────────────
      if (payment.status === 'approved') {
        try {
          const pedidoActualizado = (await pedidoRef.get()).data();
          const payerEmail = payment.payer?.email || '';
          await _enviarEmails(externalRef, pedidoActualizado, payerEmail);
        } catch (emailErr) {
          // No fallar el webhook por un error de email
          console.error('[Webhook] Error enviando emails:', emailErr);
        }
      }

      res.status(200).send('ok');

    } catch (err) {
      console.error('[Webhook] Error procesando pago:', err);
      // Responder 200 para que MP no reintente indefinidamente en errores internos
      res.status(200).send('error interno registrado');
    }
  }
);

// ─── Helper: formatear precio ARS ────────────────────────────────────────────
function _formatARS(n) {
  return '$' + Number(n || 0).toLocaleString('es-AR', { minimumFractionDigits: 2 });
}

// ─── Envío de emails post-pago ────────────────────────────────────────────────
async function _enviarEmails(pedidoId, pedido, payerEmail) {
  const gmailUser = GMAIL_USER.value();
  const gmailPass = GMAIL_APP_PASS.value();
  if (!gmailUser || !gmailPass) {
    console.warn('[Email] Secrets de Gmail no configurados, omitiendo envío.');
    return;
  }

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: { user: gmailUser, pass: gmailPass },
  });

  const items    = pedido.items || [];
  const total    = pedido.total || 0;
  const pedidoShort = pedidoId.slice(-8).toUpperCase();

  const itemsRowsHtml = items.map(i => `
    <tr>
      <td style="padding:8px 4px;border-bottom:1px solid #F1F5F9">${String(i.nombre || '').slice(0, 80)}</td>
      <td style="padding:8px 4px;border-bottom:1px solid #F1F5F9;text-align:center">${i.cantidad}</td>
      <td style="padding:8px 4px;border-bottom:1px solid #F1F5F9;text-align:right">${_formatARS(i.precioUnitario)}</td>
      <td style="padding:8px 4px;border-bottom:1px solid #F1F5F9;text-align:right;font-weight:600">${_formatARS(i.subtotal)}</td>
    </tr>`).join('');

  const tableHtml = `
    <table style="width:100%;border-collapse:collapse;font-size:14px">
      <thead>
        <tr style="background:#F8FAFC">
          <th style="padding:8px 4px;text-align:left;color:#64748B;font-weight:600">Producto</th>
          <th style="padding:8px 4px;text-align:center;color:#64748B;font-weight:600">Cant.</th>
          <th style="padding:8px 4px;text-align:right;color:#64748B;font-weight:600">P. Unit.</th>
          <th style="padding:8px 4px;text-align:right;color:#64748B;font-weight:600">Subtotal</th>
        </tr>
      </thead>
      <tbody>${itemsRowsHtml}</tbody>
      <tfoot>
        <tr>
          <td colspan="3" style="padding:12px 4px 4px;text-align:right;font-weight:700;font-size:15px">TOTAL</td>
          <td style="padding:12px 4px 4px;text-align:right;font-weight:700;font-size:15px;color:#E67A2E">${_formatARS(total)}</td>
        </tr>
      </tfoot>
    </table>`;

  // ── Email a la tienda ──────────────────────────────────────────────────────
  const compradorInfo = pedido.comprador || {};
  const compradorHtml = [
    compradorInfo.nombre   ? `<b>Nombre:</b> ${compradorInfo.nombre}` : '',
    payerEmail             ? `<b>Email MP:</b> ${payerEmail}` : '',
    compradorInfo.telefono ? `<b>Teléfono:</b> ${compradorInfo.telefono}` : '',
  ].filter(Boolean).join('<br>');

  await transporter.sendMail({
    from:    `"Papelera Caro Cruz" <${gmailUser}>`,
    to:      'papeleracarocruz@gmail.com',
    subject: `🛒 Nuevo pedido #${pedidoShort} — ${_formatARS(total)}`,
    html: `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto">
        <div style="background:#E67A2E;padding:24px;border-radius:12px 12px 0 0;text-align:center">
          <h1 style="color:#fff;margin:0;font-size:22px">🛒 Nuevo pedido recibido</h1>
          <p style="color:rgba(255,255,255,.85);margin:6px 0 0;font-size:14px">Pedido #${pedidoShort}</p>
        </div>
        <div style="background:#fff;padding:24px;border:1px solid #E5E7EB;border-top:none;border-radius:0 0 12px 12px">
          ${compradorHtml ? `<div style="background:#F8FAFC;border-radius:8px;padding:14px;margin-bottom:20px;font-size:14px;line-height:1.7">${compradorHtml}</div>` : ''}
          <h3 style="color:#1E293B;margin:0 0 12px;font-size:15px">Detalle del pedido</h3>
          ${tableHtml}
          <p style="margin-top:20px;font-size:12px;color:#94A3B8;text-align:center">
            ID completo: ${pedidoId}
          </p>
        </div>
      </div>`,
  });

  // ── Email al comprador (email ingresado + email de MP, sin duplicados) ──────
  const compradorEmail = (compradorInfo.email || '').toLowerCase().trim();
  const destinatarios = new Set();
  if (compradorEmail && emailValido(compradorEmail)) destinatarios.add(compradorEmail);
  if (payerEmail && emailValido(payerEmail))         destinatarios.add(payerEmail);

  for (const dest of destinatarios) {
    await transporter.sendMail({
      from:    `"Papelera Caro Cruz" <${gmailUser}>`,
      to:      dest,
      subject: `✅ Pedido #${pedidoShort} confirmado — Papelera Caro Cruz`,
      html: `
        <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto">
          <div style="background:#166534;padding:24px;border-radius:12px 12px 0 0;text-align:center">
            <div style="width:56px;height:56px;background:rgba(255,255,255,.15);border-radius:50%;display:inline-flex;align-items:center;justify-content:center;margin-bottom:12px">
              <span style="color:#fff;font-size:28px">✓</span>
            </div>
            <h1 style="color:#fff;margin:0;font-size:22px">¡Pago confirmado!</h1>
            <p style="color:rgba(255,255,255,.85);margin:6px 0 0;font-size:14px">Pedido #${pedidoShort}</p>
          </div>
          <div style="background:#fff;padding:24px;border:1px solid #E5E7EB;border-top:none;border-radius:0 0 12px 12px">
            <p style="color:#374151;font-size:14px;line-height:1.6">
              ¡Gracias por tu compra! Recibimos tu pago y estamos procesando tu pedido.
              Nos pondremos en contacto para coordinar la entrega.
            </p>
            <h3 style="color:#1E293B;margin:20px 0 12px;font-size:15px">Tu pedido</h3>
            ${tableHtml}
            <div style="margin-top:24px;padding:16px;background:#F0FDF4;border-radius:8px;font-size:13px;color:#166534">
              ¿Tenés alguna consulta? Escribinos a
              <a href="mailto:papeleracarocruz@gmail.com" style="color:#166534">papeleracarocruz@gmail.com</a>
              o por WhatsApp indicando tu número de pedido <b>#${pedidoShort}</b>.
            </div>
            <p style="margin-top:20px;font-size:11px;color:#94A3B8;text-align:center">
              Papelera Caro Cruz · papeleracarocruz.com
            </p>
          </div>
        </div>`,
    });
  }

  console.log(`[Email] Emails enviados para pedido ${pedidoShort} → ${[...destinatarios].join(', ')}`);
}
