'use strict';

const { onRequest } = require('firebase-functions/v2/https');
const { defineSecret } = require('firebase-functions/params');
const { setGlobalOptions } = require('firebase-functions/v2');
const admin = require('firebase-admin');
const { MercadoPagoConfig, Preference, Payment } = require('mercadopago');
const crypto = require('crypto');

admin.initializeApp();
setGlobalOptions({ region: 'us-central1', maxInstances: 10 });

const db = admin.firestore();

// ─── Secrets (configurar con: firebase functions:secrets:set MP_ACCESS_TOKEN) ─
const MP_ACCESS_TOKEN  = defineSecret('MP_ACCESS_TOKEN');
const MP_WEBHOOK_SECRET = defineSecret('MP_WEBHOOK_SECRET');

// ─── Orígenes permitidos ──────────────────────────────────────────────────────
const CORS_ORIGINS = [
  'https://papeleracarocruz.com',
  'http://localhost:5500',
  'http://127.0.0.1:5500',
];

const SITE_URL = 'https://papeleracarocruz.com';
const WEBHOOK_URL = 'https://us-central1-carocruz-4bccc.cloudfunctions.net/webhookMP';

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
    cors: CORS_ORIGINS,
    secrets: [MP_ACCESS_TOKEN],
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

      // ── Leer precios reales de Firestore (nunca confiar en el cliente) ───
      const itemsValidados = [];
      for (const item of body.items) {
        const id       = String(item.id || '').trim();
        const cantidad = Math.max(1, Math.min(999, Math.floor(Number(item.cantidad || 1))));

        if (!id || !/^[a-zA-Z0-9_-]{1,100}$/.test(id)) {
          res.status(400).json({ error: `ID de producto inválido: ${id}` });
          return;
        }

        const prodSnap = await db.collection('productos_admin').doc(id).get();
        if (!prodSnap.exists) {
          res.status(404).json({ error: `Producto no encontrado: ${id}` });
          return;
        }

        const prod = { id, ...prodSnap.data() };
        // Rechazar productos inactivos
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
    secrets: [MP_ACCESS_TOKEN, MP_WEBHOOK_SECRET],
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
      res.status(200).send('ok');

    } catch (err) {
      console.error('[Webhook] Error procesando pago:', err);
      // Responder 200 para que MP no reintente indefinidamente en errores internos
      res.status(200).send('error interno registrado');
    }
  }
);
