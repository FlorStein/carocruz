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
  'https://carocruzpapelera.com',
  'https://www.carocruzpapelera.com',
  'http://localhost:5500',
  'http://127.0.0.1:5500',
  'null',
];

const SITE_URL = 'https://carocruzpapelera.com';
const WEBHOOK_URL = 'https://webhookmp-f2t74egmxa-uc.a.run.app';
const FIRESTORE_CONFIG_DOC = 'sitio';

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

function _toEnteroPositivo(value, fallback) {
  const normalized = String(value || '').replace(/[.,]/g, '').trim();
  const n = Number(normalized);
  if (!Number.isFinite(n) || n <= 0) return fallback;
  return Math.floor(n);
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
    secrets: [MP_ACCESS_TOKEN, GMAIL_USER, GMAIL_APP_PASS],
    timeoutSeconds: 30,
  },
  async (req, res) => {
    // Set CORS headers for all responses when the origin is allowed
    const origin = req.headers.origin || '';
    if (Array.isArray(CORS_ORIGINS) && CORS_ORIGINS.includes(origin)) {
      res.set('Access-Control-Allow-Origin', origin);
      res.set('Vary', 'Origin');
      res.set('Access-Control-Allow-Methods', 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS');
      res.set('Access-Control-Allow-Headers', req.headers['access-control-request-headers'] || 'Content-Type');
    }

    if (req.method === 'OPTIONS') {
      res.status(204).send('');
      return;
    }
    if (req.method !== 'POST') {
      res.status(405).json({ error: 'Method Not Allowed' });
      return;
    }

    try {
      const body = req.body;

      // ── Validar email ────────────────────────────────────────────────────
      const email = String(body?.comprador?.email || '').trim();
      if (!emailValido(email)) {
        res.status(400).json({ error: 'Email inválido' });
        return;
      }

      // ── Extraer campos ───────────────────────────────────────────────────
      const nombre    = String(body?.comprador?.nombre || '').trim().slice(0, 100);
      const telefono  = String(body?.comprador?.telefono || '').trim().slice(0, 20);
      const items     = Array.isArray(body?.items) ? body.items : [];

      if (!nombre) {
        res.status(400).json({ error: 'Nombre requerido' });
        return;
      }
      if (items.length === 0) {
        res.status(400).json({ error: 'Carrito vacío' });
        return;
      }

      // ── Cargar configuración ─────────────────────────────────────────────
      const configSnap = await db.collection('config_admin').doc(FIRESTORE_CONFIG_DOC).get();
      let config = configSnap.exists ? configSnap.data() : {};
      if (!configSnap.exists) {
        const fallbackSnap = await db.collection('config_admin').doc('config').get();
        if (fallbackSnap.exists) {
          config = fallbackSnap.data();
        }
      }
      const minCompraRaw = _toEnteroPositivo(config?.minCompra, 20000);
      const minCompra = (minCompraRaw === 50000 || minCompraRaw === 50) ? 20000 : minCompraRaw;

      // ── Validar y normalizar items ───────────────────────────────────────
      const itemsEntrada = [];
      for (const item of items) {
        const id       = String(item?.id || '').trim();
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

    try {
      const dataId = req.body?.data?.id;
      if (!dataId) {
        res.status(400).send('Missing payment id');
        return;
      }

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

      // ── Decrementar stock si el pago fue aprobado ──────────────────────────
      if (payment.status === 'approved') {
        try {
          const pedidoActualizado = (await pedidoRef.get()).data();
          const items = Array.isArray(pedidoActualizado?.items) ? pedidoActualizado.items : [];
          
          for (const item of items) {
            const prodRef = db.collection('productos_admin').doc(item.id);
            await prodRef.update({
              stock: admin.firestore.FieldValue.increment(-item.cantidad),
              actualizadoEn: admin.firestore.FieldValue.serverTimestamp(),
            });
            console.log(`[Webhook] Stock ${item.id}: -${item.cantidad}`);
          }
        } catch (stockErr) {
          console.error('[Webhook] Error decrementando stock:', stockErr);
          // No fallar el webhook por error de stock
        }
      }

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

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: { user: gmailUser, pass: gmailPass },
  });

  const itemsHTML = (pedido?.items || [])
    .map(i => `
      <tr>
        <td style="padding: 8px; border-bottom: 1px solid #ddd;">${i.nombre}</td>
        <td style="padding: 8px; border-bottom: 1px solid #ddd; text-align: right;">x${i.cantidad}</td>
        <td style="padding: 8px; border-bottom: 1px solid #ddd; text-align: right;">${_formatARS(i.precioUnitario)}</td>
        <td style="padding: 8px; border-bottom: 1px solid #ddd; text-align: right;">${_formatARS(i.subtotal)}</td>
      </tr>
    `)
    .join('');

  const totalHTML = _formatARS(pedido?.total);

  const htmlCliente = `
    <html>
      <body style="font-family: Arial, sans-serif; color: #333;">
        <h2>¡Gracias por tu compra!</h2>
        <p>Tu pedido fue confirmado exitosamente.</p>
        <p><strong>Nº de Pedido:</strong> ${pedidoId}</p>
        <table style="width: 100%; margin-top: 20px; border-collapse: collapse;">
          <thead>
            <tr style="background-color: #f5f5f5;">
              <th style="padding: 8px; text-align: left; border-bottom: 2px solid #ddd;">Producto</th>
              <th style="padding: 8px; text-align: right; border-bottom: 2px solid #ddd;">Cantidad</th>
              <th style="padding: 8px; text-align: right; border-bottom: 2px solid #ddd;">Precio Unit.</th>
              <th style="padding: 8px; text-align: right; border-bottom: 2px solid #ddd;">Subtotal</th>
            </tr>
          </thead>
          <tbody>${itemsHTML}</tbody>
        </table>
        <p style="margin-top: 15px; font-size: 18px;"><strong>Total: ${totalHTML}</strong></p>
        <hr style="margin-top: 30px; border: none; border-top: 1px solid #ddd;">
        <p style="font-size: 12px; color: #999;">Este es un email automático. Por favor, no responder.</p>
      </body>
    </html>
  `;

  try {
    await transporter.sendMail({
      from: gmailUser,
      to: payerEmail,
      subject: `Pedido confirmado #${pedidoId} - Papelera Caro Cruz`,
      html: htmlCliente,
    });
    console.log(`[Email] Enviado a ${payerEmail}`);
  } catch (err) {
    console.error(`[Email] Error enviando a ${payerEmail}:`, err);
  }

  try {
    await transporter.sendMail({
      from: gmailUser,
      to: gmailUser,
      subject: `Nuevo pedido #${pedidoId}`,
      html: `<p><strong>Nuevo pedido recibido:</strong></p>${htmlCliente}`,
    });
  } catch (err) {
    console.error('[Email] Error notificando admin:', err);
  }
}
