/* ======================================================
   PAPELERA CARO CRUZ — script.js
   - Catálogo de productos
   - Grids dinámicos
   - Carrito lateral con persistencia en localStorage
   ====================================================== */

'use strict';

// Fallback: si imagenes-map.js no se cargó, IMAGENES_MAP será un objeto vacío
if (typeof window.IMAGENES_MAP === 'undefined') window.IMAGENES_MAP = {};

// ── Catálogo ─────────────────────────────────────────────────────────────────

const PRODUCTOS_NOVEDADES = [
  {
    id: 'nov-1',
    nombre: 'Cuaderno Rivadavia tapa dura A4',
    precio: 1250,
    categoria: 'LIMPIEZA',
    categColor: '#EEF2FF',
    categText: '#1B3A6B',
    bgImg: '#EEF2FF',
    iconColor: '#93B4E8',
    icon: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>`
  },
  {
    id: 'nov-2',
    nombre: 'Resaltador FILGO Grueso colores Fluo x unidad',
    precio: 786,
    categoria: 'LIBRERÍA',
    categColor: '#FFF3E0',
    categText: '#92400E',
    bgImg: '#FFF3E0',
    iconColor: '#F4A460',
    icon: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/></svg>`
  },
  {
    id: 'nov-3',
    nombre: 'Tijera escolar punta redonda mango plástico x 12 u.',
    precio: 4320,
    categoria: 'OFICINA',
    categColor: '#F0FDF4',
    categText: '#166534',
    bgImg: '#F0FDF4',
    iconColor: '#4ADE80',
    icon: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="6" cy="6" r="3"/><circle cx="6" cy="18" r="3"/><line x1="20" y1="4" x2="8.12" y2="15.88"/><line x1="14.47" y1="14.48" x2="20" y2="20"/><line x1="8.12" y1="8.12" x2="12" y2="12"/></svg>`
  },
  {
    id: 'nov-4',
    nombre: 'Cinta adhesiva transparente 48mm x 100m caja x 6 u.',
    precio: 3800,
    categoria: 'EMBALAJE',
    categColor: '#FFF1F2',
    categText: '#9F1239',
    bgImg: '#FFF1F2',
    iconColor: '#F87171',
    icon: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></svg>`
  }
];

const PRODUCTOS_OFERTAS = [
  {
    id: 'of-1',
    nombre: 'Marcador permanente PILOT BPS-GP negro caja x 12 u.',
    precio: 6480,
    categoria: 'OFERTA',
    categColor: '#FEF3C7',
    categText: '#92400E',
    bgImg: '#FEF3C7',
    iconColor: '#D97706',
    icon: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>`
  },
  {
    id: 'of-2',
    nombre: 'Set bolígrafos BIC Crystal colores surtidos x 50 u.',
    precio: 9250,
    categoria: 'OFERTA',
    categColor: '#F0FFF4',
    categText: '#166534',
    bgImg: '#F0FFF4',
    iconColor: '#16A34A',
    icon: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/></svg>`
  },
  {
    id: 'of-3',
    nombre: 'Cuaderno LEDESMA espiral 48 hojas rayado x 10 unidades',
    precio: 14600,
    categoria: 'OFERTA',
    categColor: '#FEF2F2',
    categText: '#991B1B',
    bgImg: '#FEF2F2',
    iconColor: '#EF4444',
    icon: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>`
  },
  {
    id: 'of-4',
    nombre: 'Set geométrico escolar completo 4 piezas x 12 sets',
    precio: 5100,
    categoria: 'OFERTA',
    categColor: '#EFF6FF',
    categText: '#1E40AF',
    bgImg: '#EFF6FF',
    iconColor: '#2563EB',
    icon: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M21.3 15.3a2.4 2.4 0 0 1-3.4 3.4L2.5 3.4A2.4 2.4 0 0 1 5.9 0l15.4 15.3z"/><path d="M11.9 11.9l2 6-6-2"/></svg>`
  }
];

const STORAGE_ADMIN_PRODUCTOS = 'carocruz_admin_productos';
const STORAGE_ADMIN_OVERRIDES = 'carocruz_admin_overrides';
const STORAGE_ADMIN_CONFIG = 'carocruz_admin_config';
const FIRESTORE_ADMIN_COLLECTION = 'productos_admin';
const FIRESTORE_OVERRIDES_COLLECTION = 'productos_overrides';
const FIRESTORE_CONFIG_COLLECTION = 'config_admin';
const FIRESTORE_CONFIG_DOC = 'sitio';
const PRODUCTOS_ADMIN = [];
const PRODUCTOS_OVERRIDES = {};
const PRODUCTOS_BASE_ORIG = {};

const CATEGORIAS_OFERTA_CONFIG = [
  'LIMPIEZA',
  'LIBRERÍA',
  'ESCOLAR',
  'EMBALAJE',
  'BOLSAS',
  'DESCARTABLES',
  'CAJAS',
  'GASTRONÓMICO'
];

const CONFIG_COMERCIAL_DEFAULT = {
  minCompra: 50000,
  minEnvioCaba: 11000,
  minEnvioGba: 22000,
  announcementMain: '',
  announcementExtra: '',
  heroBadge: '¡TEMPORADA ESCOLAR 2026!',
  heroTitle: 'Todo para tu negocio\nen un solo lugar',
  heroSub: 'Artículos de papelería, librería y más\na precios mayoristas imbatibles.',
  heroBannerImage: '',
  marcasPromocion: [],
  descuentoMarca: 0,
  productos2x1: [],
  ofertasPorCategoria: {
    LIMPIEZA: 0,
    'LIBRERÍA': 0,
    ESCOLAR: 0,
    EMBALAJE: 0,
    BOLSAS: 0,
    DESCARTABLES: 0,
    CAJAS: 0,
    'GASTRONÓMICO': 0
  }
};

let configComercial = JSON.parse(JSON.stringify(CONFIG_COMERCIAL_DEFAULT));

const CATEGORIA_UI = {
  'LIMPIEZA':     { categColor: '#EEF2FF', categText: '#1B3A6B', bgImg: '#EEF2FF', iconColor: '#93B4E8' },
  'LIBRERÍA':    { categColor: '#FFF3E0', categText: '#92400E', bgImg: '#FFF3E0', iconColor: '#F4A460' },
  'ESCOLAR':      { categColor: '#F0FDF4', categText: '#166534', bgImg: '#F0FDF4', iconColor: '#4ADE80' },
  'EMBALAJE':     { categColor: '#FFF1F2', categText: '#9F1239', bgImg: '#FFF1F2', iconColor: '#F87171' },
  'BOLSAS':       { categColor: '#EFF6FF', categText: '#1E40AF', bgImg: '#EFF6FF', iconColor: '#2563EB' },
  'DESCARTABLES': { categColor: '#F5F3FF', categText: '#5B21B6', bgImg: '#F5F3FF', iconColor: '#8B5CF6' },
  'CAJAS':        { categColor: '#FEF3C7', categText: '#92400E', bgImg: '#FEF3C7', iconColor: '#D97706' },
  'GASTRONÓMICO': { categColor: '#ECFEFF', categText: '#0E7490', bgImg: '#ECFEFF', iconColor: '#06B6D4' },
  'OFERTA':       { categColor: '#FEF3C7', categText: '#92400E', bgImg: '#FEF3C7', iconColor: '#D97706' }
};

const ICONO_PRODUCTO_ADMIN = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M3 7h18"/><path d="M5 7l1.2 12a2 2 0 0 0 2 1.8h7.6a2 2 0 0 0 2-1.8L19 7"/><path d="M9 7V5a3 3 0 0 1 6 0v2"/></svg>`;

let usuarioAdminActivo = false;
let firestoreDb = null;
let firestoreSuscripcionAdmin = null;
let firestoreSuscripcionConfig = null;
let firestoreSuscripcionOverrides = null;
let usaFirestoreAdmin = false;
let firebaseStorageRef = null;
let adminSeleccionados = new Set();
let adminHeroBannerObjectUrl = '';
let adminPromo2x1Draft = [];
const adminImageCropDrafts = {};

function _toEnteroPositivo(value, fallback) {
  const n = Number(value);
  if (!Number.isFinite(n) || n <= 0) return fallback;
  return Math.floor(n);
}

function _toPorcentajeOferta(value) {
  const n = Number(value);
  if (!Number.isFinite(n)) return 0;
  return Math.max(0, Math.min(90, Math.floor(n)));
}

function clonarConfigComercial(raw) {
  const base = CONFIG_COMERCIAL_DEFAULT;
  const src = raw && typeof raw === 'object' ? raw : {};
  const ofertasRaw = src.ofertasPorCategoria && typeof src.ofertasPorCategoria === 'object'
    ? src.ofertasPorCategoria
    : {};
  const marcasRaw = Array.isArray(src.marcasPromocion) ? src.marcasPromocion : [];
  const productos2x1Raw = Array.isArray(src.productos2x1) ? src.productos2x1 : [];
  const ofertas = {};
  CATEGORIAS_OFERTA_CONFIG.forEach(function(cat) {
    ofertas[cat] = _toPorcentajeOferta(ofertasRaw[cat]);
  });

  return {
    minCompra: _toEnteroPositivo(src.minCompra, base.minCompra),
    minEnvioCaba: _toEnteroPositivo(src.minEnvioCaba, base.minEnvioCaba),
    minEnvioGba: _toEnteroPositivo(src.minEnvioGba, base.minEnvioGba),
    announcementMain: String(src.announcementMain || '').trim(),
    announcementExtra: String(src.announcementExtra || '').trim(),
    heroBadge: String(src.heroBadge || base.heroBadge).trim(),
    heroTitle: String(src.heroTitle || base.heroTitle).trim(),
    heroSub: String(src.heroSub || base.heroSub).trim(),
    heroBannerImage: String(src.heroBannerImage || '').trim(),
    marcasPromocion: marcasRaw
      .map(function(m) { return String(m || '').trim(); })
      .filter(Boolean),
    descuentoMarca: _toPorcentajeOferta(src.descuentoMarca),
    productos2x1: productos2x1Raw
      .map(function(id) { return String(id || '').trim(); })
      .filter(Boolean),
    ofertasPorCategoria: ofertas
  };
}

function guardarConfigComercialLocal() {
  localStorage.setItem(STORAGE_ADMIN_CONFIG, JSON.stringify(configComercial));
}

function cargarConfigComercialLocal() {
  try {
    const raw = localStorage.getItem(STORAGE_ADMIN_CONFIG);
    if (!raw) {
      configComercial = clonarConfigComercial(CONFIG_COMERCIAL_DEFAULT);
      return;
    }
    configComercial = clonarConfigComercial(JSON.parse(raw));
  } catch {
    configComercial = clonarConfigComercial(CONFIG_COMERCIAL_DEFAULT);
  }
}

function formatearMontoSinDecimales(n) {
  const m = _toEnteroPositivo(n, 0);
  return '$' + m.toLocaleString('es-AR');
}

function getAnnouncementMainDefault() {
  return `ENVÍOS A TODO EL PAÍS — COMPRA MÍNIMA ${formatearMontoSinDecimales(configComercial.minCompra)}`;
}

function getAnnouncementExtraDefault() {
  return `| CABA ${formatearMontoSinDecimales(configComercial.minEnvioCaba)} · GBA PRIMER CORDÓN ${formatearMontoSinDecimales(configComercial.minEnvioGba)}`;
}

function _setTextoConSaltos(id, texto) {
  const el = document.getElementById(id);
  if (!el) return;
  const safe = escapeHtml(String(texto || ''));
  el.innerHTML = safe.replace(/\n/g, '<br />');
}

function aplicarConfigComercialUI() {
  const annMain = document.getElementById('announcementMainText');
  const annExtra = document.getElementById('announcementExtraText');
  const benefitMin = document.getElementById('benefitMinimoText');

  if (annMain) annMain.textContent = configComercial.announcementMain || getAnnouncementMainDefault();
  if (annExtra) annExtra.textContent = configComercial.announcementExtra || (' ' + getAnnouncementExtraDefault());
  if (benefitMin) benefitMin.textContent = `Compra mínima desde ${formatearMontoSinDecimales(configComercial.minCompra)}`;

  const heroBadge = document.getElementById('heroBadgeText');
  if (heroBadge) heroBadge.textContent = configComercial.heroBadge || CONFIG_COMERCIAL_DEFAULT.heroBadge;
  _setTextoConSaltos('heroTitleText', configComercial.heroTitle || CONFIG_COMERCIAL_DEFAULT.heroTitle);
  _setTextoConSaltos('heroSubText', configComercial.heroSub || CONFIG_COMERCIAL_DEFAULT.heroSub);

  const heroImg = document.getElementById('heroBannerImg');
  const heroFallback = document.getElementById('heroBannerFallback');
  const heroSrc = String(configComercial.heroBannerImage || '').trim();
  if (heroImg) {
    heroImg.onerror = function() {
      heroImg.style.display = 'none';
      if (heroFallback) heroFallback.style.display = 'flex';
    };
    if (heroSrc) {
      heroImg.src = heroSrc;
      heroImg.style.display = 'block';
    } else {
      heroImg.removeAttribute('src');
      heroImg.style.display = 'none';
    }
  }
  if (heroFallback) {
    heroFallback.style.display = heroSrc ? 'none' : 'flex';
  }
}

function descuentoCategoriaActivo(categoria) {
  const cat = normalizarCategoria(categoria);
  return _toPorcentajeOferta(configComercial?.ofertasPorCategoria?.[cat] || 0);
}

function precioFinalProducto(prod) {
  const base = Number(prod?.precio || 0);
  if (!Number.isFinite(base) || base <= 0) return 0;
  const descuento = descuentoTotalProducto(prod);
  if (descuento <= 0) return Math.floor(base);
  return Math.max(1, Math.round(base * (100 - descuento) / 100));
}

function precioVigenteItemCarrito(item) {
  const prod = todosLosProductos().find(function(p) { return p.id === item.id; });
  if (prod) return precioFinalProducto(prod);
  const fallback = Number(item?.precio || 0);
  return Number.isFinite(fallback) && fallback > 0 ? Math.floor(fallback) : 0;
}

function minimoCompraActual() {
  return _toEnteroPositivo(configComercial?.minCompra, CONFIG_COMERCIAL_DEFAULT.minCompra);
}

function _limpiarAdminHeroBannerObjectUrl() {
  if (adminHeroBannerObjectUrl) {
    URL.revokeObjectURL(adminHeroBannerObjectUrl);
    adminHeroBannerObjectUrl = '';
  }
}

function _actualizarInfoSeleccionMasivaAdmin() {
  const el = document.getElementById('adminBulkSelectedInfo');
  if (!el) return;
  const n = adminSeleccionados.size;
  el.textContent = `${n} publicación${n === 1 ? '' : 'es'} seleccionada${n === 1 ? '' : 's'}`;
}

function setAdminMainTab(tabId) {
  const target = String(tabId || 'config');
  const titleEl = document.getElementById('adminModalTitle');

  document.querySelectorAll('.admin-main-tab-btn').forEach(function(btn) {
    btn.classList.toggle('admin-main-tab-btn--active', btn.dataset.mainTabId === target);
  });
  document.querySelectorAll('.admin-main-panel').forEach(function(panel) {
    panel.classList.toggle('admin-main-panel--active', panel.dataset.mainPanelId === target);
  });

  if (titleEl) {
    titleEl.textContent = target === 'gestion' ? 'Gestión de publicaciones' : 'Configuración';
  }
}
window.setAdminMainTab = setAdminMainTab;

function setAdminTab(scope, tabId) {
  const scopeSafe = String(scope || '');
  const tabSafe = String(tabId || '');

  document.querySelectorAll(`.admin-tab-btn[data-scope="${scopeSafe}"]`).forEach(function(btn) {
    btn.classList.toggle('admin-tab-btn--active', btn.dataset.tabId === tabSafe);
  });

  document.querySelectorAll(`.admin-tab-panel[data-scope="${scopeSafe}"]`).forEach(function(panel) {
    panel.classList.toggle('admin-tab-panel--active', panel.dataset.tabId === tabSafe);
  });
}
window.setAdminTab = setAdminTab;

function actualizarPreviewHeroBannerAdmin() {
  const previewImg = document.getElementById('adminHeroBannerPreviewImg');
  const previewEmpty = document.getElementById('adminHeroBannerPreviewEmpty');
  const inputUrl = document.getElementById('adminHeroBannerUrl');
  const inputFile = document.getElementById('adminHeroBannerArchivo');
  if (!previewImg || !previewEmpty) return;

  _limpiarAdminHeroBannerObjectUrl();
  let src = String(inputUrl?.value || '').trim();
  const file = inputFile?.files?.[0] || null;
  if (file && String(file.type || '').startsWith('image/')) {
    adminHeroBannerObjectUrl = URL.createObjectURL(file);
    src = adminHeroBannerObjectUrl;
  }

  if (src) {
    previewImg.src = src;
    previewImg.style.display = 'block';
    previewEmpty.style.display = 'none';
  } else {
    previewImg.removeAttribute('src');
    previewImg.style.display = 'none';
    previewEmpty.style.display = 'block';
  }
}

function normalizarMarca(valor) {
  return String(valor || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toUpperCase()
    .trim();
}

function esProducto2x1(prodOrId) {
  const id = typeof prodOrId === 'string' ? prodOrId : String(prodOrId?.id || '');
  return configComercial.productos2x1.includes(id);
}

function esMarcaEnPromocion(prod) {
  const marcas = Array.isArray(configComercial.marcasPromocion) ? configComercial.marcasPromocion : [];
  if (!marcas.length || !prod) return false;
  const nombreNorm = normalizarMarca(prod.nombre);
  const marcaNorm = normalizarMarca(prod.marca || '');
  return marcas.some(function(m) {
    const mm = normalizarMarca(m);
    if (!mm) return false;
    return (marcaNorm && marcaNorm === mm) || nombreNorm.includes(mm);
  });
}

function descuentoMarcaActivo(prod) {
  if (!esMarcaEnPromocion(prod)) return 0;
  return _toPorcentajeOferta(configComercial.descuentoMarca);
}

function descuentoTotalProducto(prod) {
  const porCategoria = descuentoCategoriaActivo(prod?.categoria);
  const porMarca = descuentoMarcaActivo(prod);
  return Math.max(porCategoria, porMarca);
}

function subtotalItemCarrito(item) {
  const precioUnit = precioVigenteItemCarrito(item);
  const cantidad = Math.max(1, Number(item?.cantidad || 1));
  if (esProducto2x1(item?.id)) {
    const cobrables = cantidad - Math.floor(cantidad / 2);
    return precioUnit * cobrables;
  }
  return precioUnit * cantidad;
}

function normalizarCategoria(categoria) {
  return String(categoria || '').trim().toUpperCase();
}

function listasCatalogoBase() {
  const listas = [PRODUCTOS_NOVEDADES, PRODUCTOS_OFERTAS];
  if (typeof PRODUCTOS_GASTRONOMICO !== 'undefined') listas.push(PRODUCTOS_GASTRONOMICO);
  if (typeof PRODUCTOS_ESCOLAR      !== 'undefined') listas.push(PRODUCTOS_ESCOLAR);
  if (typeof PRODUCTOS_LIBRERIA     !== 'undefined') listas.push(PRODUCTOS_LIBRERIA);
  if (typeof PRODUCTOS_LIMPIEZA     !== 'undefined') listas.push(PRODUCTOS_LIMPIEZA);
  if (typeof PRODUCTOS_DESCARTABLES !== 'undefined') listas.push(PRODUCTOS_DESCARTABLES);
  if (typeof PRODUCTOS_EMBALAJE     !== 'undefined') listas.push(PRODUCTOS_EMBALAJE);
  if (typeof PRODUCTOS_CAJAS        !== 'undefined') listas.push(PRODUCTOS_CAJAS);
  if (typeof PRODUCTOS_BOLSAS       !== 'undefined') listas.push(PRODUCTOS_BOLSAS);
  return listas;
}

function capturarBaseCatalogoOriginal() {
  listasCatalogoBase().forEach(function(lista) {
    lista.forEach(function(p) {
      if (!p || !p.id || PRODUCTOS_BASE_ORIG[p.id]) return;
      PRODUCTOS_BASE_ORIG[p.id] = {
        precio: Number(p.precio),
        stock: Number.isFinite(p.stock) ? Number(p.stock) : null,
        categoria: normalizarCategoria(p.categoria),
        imagen: String((window.IMAGENES_MAP && window.IMAGENES_MAP[p.id]) || '')
      };
    });
  });
}

function aplicarEstiloCategoriaProducto(prod, categoria) {
  const cat = normalizarCategoria(categoria);
  const estilo = obtenerEstiloCategoria(cat);
  prod.categoria = cat;
  prod.categColor = estilo.categColor;
  prod.categText = estilo.categText;
  prod.bgImg = estilo.bgImg;
  prod.iconColor = estilo.iconColor;
}

function buscarProductoCatalogoPorId(id) {
  const target = String(id || '');
  if (!target) return null;
  for (const lista of listasCatalogoBase()) {
    const found = lista.find(function(p) { return p.id === target; });
    if (found) return found;
  }
  return null;
}

function aplicarOverridesCatalogo() {
  Object.keys(PRODUCTOS_OVERRIDES).forEach(function(id) {
    const prod = buscarProductoCatalogoPorId(id);
    if (!prod) return;
    const ov = PRODUCTOS_OVERRIDES[id] || {};
    const precio = Number(ov.precio);
    const stock = Number(ov.stock);
    if (Number.isFinite(precio) && precio > 0) prod.precio = Math.floor(precio);
    if (Number.isFinite(stock) && stock >= 0) prod.stock = Math.floor(stock);
    if (ov.categoria && CATEGORIA_UI[normalizarCategoria(ov.categoria)]) {
      aplicarEstiloCategoriaProducto(prod, ov.categoria);
    }
    if (ov.imagenSet === true) {
      if (ov.imagen) window.IMAGENES_MAP[id] = String(ov.imagen);
      else delete window.IMAGENES_MAP[id];
    }
  });
}

function guardarOverridesLocal() {
  localStorage.setItem(STORAGE_ADMIN_OVERRIDES, JSON.stringify(PRODUCTOS_OVERRIDES));
}

function cargarOverridesLocal() {
  Object.keys(PRODUCTOS_OVERRIDES).forEach(function(k) { delete PRODUCTOS_OVERRIDES[k]; });
  try {
    const raw = localStorage.getItem(STORAGE_ADMIN_OVERRIDES);
    if (!raw) return;
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') return;
    Object.keys(parsed).forEach(function(id) {
      const item = parsed[id] || {};
      PRODUCTOS_OVERRIDES[id] = {
        precio: Number(item.precio),
        stock: Number(item.stock),
        categoria: normalizarCategoria(item.categoria),
        imagenSet: item.imagenSet === true,
        imagen: typeof item.imagen === 'string' ? item.imagen : ''
      };
    });
  } catch {
    // noop
  }
}

function obtenerEstiloCategoria(categoria) {
  return CATEGORIA_UI[normalizarCategoria(categoria)] || CATEGORIA_UI.LIMPIEZA;
}

function productosNovedadesVisibles() {
  return PRODUCTOS_NOVEDADES.concat(PRODUCTOS_ADMIN.filter(p => p.categoria !== 'OFERTA'));
}

function productosOfertasVisibles() {
  return PRODUCTOS_OFERTAS.concat(PRODUCTOS_ADMIN.filter(p => p.categoria === 'OFERTA'));
}

function guardarProductosAdmin() {
  if (usaFirestoreAdmin) return;

  const serializado = PRODUCTOS_ADMIN.map(function(p) {
    return {
      id: p.id,
      nombre: p.nombre,
      precio: p.precio,
      stock: Number.isFinite(p.stock) ? p.stock : null,
      categoria: p.categoria,
      imagen: (window.IMAGENES_MAP && window.IMAGENES_MAP[p.id]) || '',
      creadoPor: p.creadoPor || ''
    };
  });
  localStorage.setItem(STORAGE_ADMIN_PRODUCTOS, JSON.stringify(serializado));
}

function cargarProductosAdmin() {
  if (usaFirestoreAdmin) return;

  PRODUCTOS_ADMIN.length = 0;
  try {
    const raw = localStorage.getItem(STORAGE_ADMIN_PRODUCTOS);
    if (!raw) return;

    const lista = JSON.parse(raw);
    if (!Array.isArray(lista)) return;

    lista.forEach(function(item) {
      const nombre = String(item.nombre || '').trim();
      const precio = Number(item.precio);
      const stockRaw = Number(item.stock);
      const stock = Number.isFinite(stockRaw) && stockRaw >= 0 ? Math.floor(stockRaw) : null;
      const categoria = normalizarCategoria(item.categoria);
      if (!nombre || !Number.isFinite(precio) || precio <= 0 || !categoria) return;

      const estilo = obtenerEstiloCategoria(categoria);
      const id = item.id || `adm-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
      PRODUCTOS_ADMIN.push({
        id,
        nombre,
        precio,
        stock,
        categoria,
        categColor: estilo.categColor,
        categText: estilo.categText,
        bgImg: estilo.bgImg,
        iconColor: estilo.iconColor,
        icon: ICONO_PRODUCTO_ADMIN,
        creadoPor: item.creadoPor || ''
      });

      if (item.imagen) {
        window.IMAGENES_MAP[id] = item.imagen;
      }
    });
  } catch {
    PRODUCTOS_ADMIN.length = 0;
  }
}

function refrescarCatalogoPrincipal() {
  renderGrid(productosNovedadesVisibles(), 'novedadesGrid');
  renderGrid(productosOfertasVisibles(), 'ofertasGrid');
  renderAdminGestionList();
}

function stockDisponibleProducto(prod) {
  return Number.isFinite(prod.stock) ? Math.max(0, prod.stock) : Infinity;
}

function cantidadEnCarrito(id) {
  return carrito.find(i => i.id === id)?.cantidad || 0;
}

function productoAdminDesdeData(id, data) {
  const nombre = String(data.nombre || '').trim();
  const precio = Number(data.precio);
  const stockRaw = Number(data.stock);
  const stock = Number.isFinite(stockRaw) && stockRaw >= 0 ? Math.floor(stockRaw) : null;
  const categoria = normalizarCategoria(data.categoria);
  if (!nombre || !Number.isFinite(precio) || precio <= 0 || !categoria) return null;

  const estilo = obtenerEstiloCategoria(categoria);
  return {
    id,
    nombre,
    precio,
    stock,
    categoria,
    categColor: estilo.categColor,
    categText: estilo.categText,
    bgImg: estilo.bgImg,
    iconColor: estilo.iconColor,
    icon: ICONO_PRODUCTO_ADMIN,
    creadoPor: String(data.creadoPor || '')
  };
}

function firebaseFirestoreDisponible() {
  return typeof window.firebase !== 'undefined' &&
    typeof window.firebase.firestore === 'function';
}

function inicializarStorageAdmin() {
  if (typeof window.firebase === 'undefined' || typeof window.firebase.storage !== 'function') return false;
  try {
    firebaseStorageRef = window.firebase.storage();
    return true;
  } catch (err) {
    console.warn('[Admin] Storage no disponible:', err);
    firebaseStorageRef = null;
    return false;
  }
}

function procesarImagenArchivoAdmin(file, opciones) {
  const opts = opciones || {};
  const squareCrop = opts.squareCrop === true;
  const maxLado = Number.isFinite(opts.maxLado) ? Math.max(256, Number(opts.maxLado)) : 1280;
  const quality = Number.isFinite(opts.quality) ? Math.min(0.95, Math.max(0.55, Number(opts.quality))) : 0.82;
  const cropX = Number.isFinite(opts.cropX) ? Math.max(0, Math.min(1, Number(opts.cropX))) : 0.5;
  const cropY = Number.isFinite(opts.cropY) ? Math.max(0, Math.min(1, Number(opts.cropY))) : 0.5;

  return new Promise(function(resolve, reject) {
    const fr = new FileReader();
    fr.onerror = function() { reject(new Error('No se pudo leer el archivo')); };
    fr.onload = function(ev) {
      const img = new Image();
      img.onload = function() {
        let sx = 0;
        let sy = 0;
        let sSizeW = img.width;
        let sSizeH = img.height;

        if (squareCrop) {
          const lado = Math.min(img.width, img.height);
          sx = Math.floor((img.width - lado) * cropX);
          sy = Math.floor((img.height - lado) * cropY);
          sSizeW = lado;
          sSizeH = lado;
        }

        const scale = Math.min(1, maxLado / Math.max(sSizeW, sSizeH));
        const w = Math.max(1, Math.round(sSizeW * scale));
        const h = Math.max(1, Math.round(sSizeH * scale));
        const canvas = document.createElement('canvas');
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('No se pudo procesar la imagen'));
          return;
        }
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, sx, sy, sSizeW, sSizeH, 0, 0, w, h);
        const dataUrl = canvas.toDataURL('image/jpeg', quality);
        canvas.toBlob(function(blob) {
          resolve({
            dataUrl,
            blob: blob || null,
            contentType: 'image/jpeg'
          });
        }, 'image/jpeg', quality);
      };
      img.onerror = function() { reject(new Error('El archivo no es una imagen válida')); };
      img.src = ev.target.result;
    };
    fr.readAsDataURL(file);
  });
}

async function comprimirImagenADataUrl(file) {
  const out = await procesarImagenArchivoAdmin(file);
  return out.dataUrl;
}

async function obtenerImagenFinalAdmin(imagenUrl, archivo, opciones) {
  if (archivo) {
    let procesada = null;
    try {
      procesada = await procesarImagenArchivoAdmin(archivo, opciones);
    } catch (err) {
      console.warn('[Admin] Error procesando imagen:', err);
      throw err;
    }

    if (firebaseStorageRef && window._authCurrentUser) {
      try {
        const safeName = archivo.name.replace(/[^a-zA-Z0-9._-]/g, '_');
        const ruta = `productos-admin/${Date.now()}-${safeName.replace(/\.[a-zA-Z0-9]+$/, '')}.jpg`;
        const payload = procesada?.blob || archivo;
        const task = await withTimeout(
          firebaseStorageRef.ref(ruta).put(payload, { contentType: 'image/jpeg' }),
          15000,
          'La subida de imagen tardó demasiado.'
        );
        return withTimeout(task.ref.getDownloadURL(), 8000, 'No se pudo obtener la URL de la imagen.');
      } catch (err) {
        console.warn('[Admin] Fallback imagen local por error de Storage:', err);
      }
    }
    return procesada?.dataUrl || comprimirImagenADataUrl(archivo);
  }
  return imagenUrl;
}

function withTimeout(promise, ms, msg) {
  return Promise.race([
    promise,
    new Promise(function(_, reject) {
      setTimeout(function() { reject(new Error(msg)); }, ms);
    })
  ]);
}

function inicializarFirestoreAdmin() {
  if (!firebaseFirestoreDisponible()) return false;

  try {
    firestoreDb = window.firebase.firestore();
    if (firestoreSuscripcionAdmin) firestoreSuscripcionAdmin();
    if (firestoreSuscripcionConfig) firestoreSuscripcionConfig();
    if (firestoreSuscripcionOverrides) firestoreSuscripcionOverrides();
    firestoreSuscripcionAdmin = firestoreDb
      .collection(FIRESTORE_ADMIN_COLLECTION)
      .onSnapshot(function(snapshot) {
        PRODUCTOS_ADMIN.length = 0;

        const docsOrdenados = snapshot.docs.slice().sort(function(a, b) {
          const ta = a.data()?.createdAt?.seconds || 0;
          const tb = b.data()?.createdAt?.seconds || 0;
          return tb - ta;
        });

        docsOrdenados.forEach(function(doc) {
          const data = doc.data() || {};
          const producto = productoAdminDesdeData(doc.id, data);
          if (!producto) return;

          PRODUCTOS_ADMIN.push(producto);
          if (data.imagen) {
            window.IMAGENES_MAP[doc.id] = String(data.imagen);
          }
        });

        refrescarCatalogoPrincipal();
        const searchInput = document.getElementById('searchInput');
        if (searchInput && searchInput.value.trim()) buscar();
      }, function(error) {
        console.warn('[Admin] Error al leer Firestore:', error);
        mostrarToast('No se pudieron sincronizar los productos admin.');
      });

    firestoreSuscripcionConfig = firestoreDb
      .collection(FIRESTORE_CONFIG_COLLECTION)
      .doc(FIRESTORE_CONFIG_DOC)
      .onSnapshot(function(doc) {
        if (!doc.exists) return;
        configComercial = clonarConfigComercial(doc.data() || {});
        guardarConfigComercialLocal();
        aplicarConfigComercialUI();
        refrescarCatalogoPrincipal();
        actualizarUI();
        if (_modoVistaActual) aplicarOrdenYFiltro();
      }, function(error) {
        console.warn('[Admin] Error al leer config comercial:', error);
      });

    firestoreSuscripcionOverrides = firestoreDb
      .collection(FIRESTORE_OVERRIDES_COLLECTION)
      .onSnapshot(function(snapshot) {
        Object.keys(PRODUCTOS_OVERRIDES).forEach(function(k) { delete PRODUCTOS_OVERRIDES[k]; });
        snapshot.docs.forEach(function(doc) {
          const data = doc.data() || {};
          PRODUCTOS_OVERRIDES[doc.id] = {
            precio: Number(data.precio),
            stock: Number(data.stock),
            categoria: normalizarCategoria(data.categoria),
            imagenSet: data.imagenSet === true,
            imagen: typeof data.imagen === 'string' ? data.imagen : ''
          };
        });
        guardarOverridesLocal();
        aplicarOverridesCatalogo();
        refrescarCatalogoPrincipal();
        actualizarUI();
        if (_modoVistaActual) aplicarOrdenYFiltro();
      }, function(error) {
        console.warn('[Admin] Error al leer overrides de catálogo:', error);
      });

    return true;
  } catch (err) {
    console.warn('[Admin] Firestore no disponible:', err);
    return false;
  }
}

function actualizarMenuAdmin() {
  const adminMenu = document.getElementById('adminMenuItem');
  if (adminMenu) adminMenu.style.display = usuarioAdminActivo ? 'flex' : 'none';
}

function cargarFormularioConfigComercialAdmin() {
  const setVal = function(id, value) {
    const el = document.getElementById(id);
    if (el) el.value = String(value ?? '');
  };

  setVal('adminMinCompra', minimoCompraActual());
  setVal('adminMinEnvioCaba', _toEnteroPositivo(configComercial.minEnvioCaba, CONFIG_COMERCIAL_DEFAULT.minEnvioCaba));
  setVal('adminMinEnvioGba', _toEnteroPositivo(configComercial.minEnvioGba, CONFIG_COMERCIAL_DEFAULT.minEnvioGba));
  setVal('adminAnnouncementMain', configComercial.announcementMain || getAnnouncementMainDefault());
  setVal('adminAnnouncementExtra', configComercial.announcementExtra || getAnnouncementExtraDefault());
  setVal('adminHeroBadge', configComercial.heroBadge || CONFIG_COMERCIAL_DEFAULT.heroBadge);
  setVal('adminHeroTitle', configComercial.heroTitle || CONFIG_COMERCIAL_DEFAULT.heroTitle);
  setVal('adminHeroSub', configComercial.heroSub || CONFIG_COMERCIAL_DEFAULT.heroSub);
  setVal('adminHeroBannerUrl', configComercial.heroBannerImage || '');
  setVal('adminMarcasPromo', (configComercial.marcasPromocion || []).join(', '));
  setVal('adminDescuentoMarca', _toPorcentajeOferta(configComercial.descuentoMarca));
  const bannerFile = document.getElementById('adminHeroBannerArchivo');
  if (bannerFile) bannerFile.value = '';

  setVal('adminOfertaLimpieza', descuentoCategoriaActivo('LIMPIEZA'));
  setVal('adminOfertaLibreria', descuentoCategoriaActivo('LIBRERÍA'));
  setVal('adminOfertaEscolar', descuentoCategoriaActivo('ESCOLAR'));
  setVal('adminOfertaEmbalaje', descuentoCategoriaActivo('EMBALAJE'));
  setVal('adminOfertaBolsas', descuentoCategoriaActivo('BOLSAS'));
  setVal('adminOfertaDescartables', descuentoCategoriaActivo('DESCARTABLES'));
  setVal('adminOfertaCajas', descuentoCategoriaActivo('CAJAS'));
  setVal('adminOfertaGastronomico', descuentoCategoriaActivo('GASTRONÓMICO'));
  adminPromo2x1Draft = Array.isArray(configComercial.productos2x1) ? configComercial.productos2x1.slice() : [];
  adminRenderProductos2x1();
  adminRenderSelectorProductos2x1();
  actualizarPreviewHeroBannerAdmin();
  _actualizarInfoSeleccionMasivaAdmin();
}

function adminObtenerProductos2x1Filtrados() {
  const categoria = String(document.getElementById('adminPromo2x1Categoria')?.value || 'TODAS');
  return todosLosProductos()
    .filter(function(p) {
      if (!p || !p.id || !p.nombre) return false;
      if (categoria === 'TODAS') return true;
      return normalizarCategoria(p.categoria) === normalizarCategoria(categoria);
    })
    .sort(function(a, b) {
      return String(a.nombre || '').localeCompare(String(b.nombre || ''), 'es');
    });
}

function adminCambiarFiltro2x1() {
  adminRenderSelectorProductos2x1();
  adminRenderProductos2x1();
}
window.adminCambiarFiltro2x1 = adminCambiarFiltro2x1;

function adminRenderProductos2x1() {
  const list = document.getElementById('adminPromo2x1List');
  if (!list) return;
  if (!adminPromo2x1Draft.length) {
    list.innerHTML = '<div class="admin-gestion-empty">No hay productos en 2x1.</div>';
    return;
  }

  const categoria = String(document.getElementById('adminPromo2x1Categoria')?.value || 'TODAS');
  const productos = todosLosProductos();
  const seleccionados = adminPromo2x1Draft.map(function(id) {
    const p = productos.find(function(x) { return x.id === id; });
    if (!p) return null;
    if (categoria !== 'TODAS' && normalizarCategoria(p.categoria) !== normalizarCategoria(categoria)) return null;
    return p;
  }).filter(Boolean);

  if (!seleccionados.length) {
    list.innerHTML = `<div class="admin-gestion-empty">No hay productos 2x1 en la categoría filtrada. Total seleccionados: ${adminPromo2x1Draft.length}</div>`;
    return;
  }

  list.innerHTML = seleccionados.map(function(p) {
    return `
      <div class="admin-promo-2x1-item">
        <span>${escapeHtml(p.nombre)} <small>(${escapeHtml(p.categoria)})</small></span>
        <button type="button" class="admin-item-btn admin-item-btn--danger" onclick="adminQuitarProducto2x1('${p.id.replace(/'/g, "\\'")}')">Quitar</button>
      </div>
    `;
  }).join('');
}

function adminRenderSelectorProductos2x1() {
  const wrap = document.getElementById('adminPromo2x1Selector');
  if (!wrap) return;

  const productos = adminObtenerProductos2x1Filtrados();
  if (!productos.length) {
    wrap.innerHTML = '<div class="admin-gestion-empty">No hay productos para la categoría seleccionada.</div>';
    return;
  }

  wrap.innerHTML = productos.map(function(p) {
    const checked = adminPromo2x1Draft.includes(p.id) ? 'checked' : '';
    return `
      <label class="admin-promo-2x1-check">
        <input type="checkbox" ${checked} onchange="adminToggleProducto2x1('${p.id.replace(/'/g, "\\'")}', this.checked)" />
        <span>${escapeHtml(p.nombre)} <small>(${escapeHtml(p.categoria)})</small></span>
      </label>
    `;
  }).join('');
}
window.adminRenderSelectorProductos2x1 = adminRenderSelectorProductos2x1;

function adminToggleProducto2x1(id, checked) {
  const idx = adminPromo2x1Draft.indexOf(id);
  if (checked && idx === -1) adminPromo2x1Draft.push(id);
  if (!checked && idx >= 0) adminPromo2x1Draft.splice(idx, 1);
  adminRenderProductos2x1();
}
window.adminToggleProducto2x1 = adminToggleProducto2x1;

function adminSeleccionarFiltrados2x1(select) {
  const productos = adminObtenerProductos2x1Filtrados();
  if (!productos.length) {
    mostrarToast('No hay productos para la categoría filtrada.');
    return;
  }

  if (select) {
    productos.forEach(function(p) {
      if (!adminPromo2x1Draft.includes(p.id)) adminPromo2x1Draft.push(p.id);
    });
  } else {
    const setIds = new Set(productos.map(function(p) { return p.id; }));
    adminPromo2x1Draft = adminPromo2x1Draft.filter(function(id) { return !setIds.has(id); });
  }

  adminRenderSelectorProductos2x1();
  adminRenderProductos2x1();
}
window.adminSeleccionarFiltrados2x1 = adminSeleccionarFiltrados2x1;

function adminQuitarProducto2x1(id) {
  adminPromo2x1Draft = adminPromo2x1Draft.filter(function(x) { return x !== id; });
  adminRenderSelectorProductos2x1();
  adminRenderProductos2x1();
}
window.adminQuitarProducto2x1 = adminQuitarProducto2x1;

async function guardarConfigComercialAdmin() {
  if (!usuarioAdminActivo) {
    mostrarToast('Solo usuarios admin pueden modificar la configuración comercial.');
    return;
  }

  const getVal = function(id) {
    return String(document.getElementById(id)?.value || '').trim();
  };
  const archivoBanner = document.getElementById('adminHeroBannerArchivo')?.files?.[0] || null;
  const heroBannerUrlInput = getVal('adminHeroBannerUrl');
  const marcasPromo = getVal('adminMarcasPromo')
    .split(',')
    .map(function(m) { return String(m || '').trim(); })
    .filter(Boolean);

  if (heroBannerUrlInput && !/^https?:\/\/.+/i.test(heroBannerUrlInput) && !heroBannerUrlInput.startsWith('data:image/')) {
    mostrarToast('La URL del banner hero debe ser http(s) o data:image válida.');
    return;
  }
  if (archivoBanner && !String(archivoBanner.type || '').startsWith('image/')) {
    mostrarToast('El archivo del banner hero no es una imagen válida.');
    return;
  }

  let heroBannerFinal = heroBannerUrlInput;
  if (archivoBanner) {
    try {
      heroBannerFinal = await withTimeout(
        obtenerImagenFinalAdmin(heroBannerUrlInput, archivoBanner),
        12000,
        'La imagen del banner hero tardó demasiado en procesarse.'
      );
    } catch (err) {
      console.warn('[Admin] No se pudo procesar banner hero:', err);
      mostrarToast('No se pudo procesar el banner hero.');
      return;
    }
  }

  const nuevo = clonarConfigComercial({
    minCompra: getVal('adminMinCompra'),
    minEnvioCaba: getVal('adminMinEnvioCaba'),
    minEnvioGba: getVal('adminMinEnvioGba'),
    announcementMain: getVal('adminAnnouncementMain'),
    announcementExtra: getVal('adminAnnouncementExtra'),
    heroBadge: getVal('adminHeroBadge'),
    heroTitle: getVal('adminHeroTitle'),
    heroSub: getVal('adminHeroSub'),
    heroBannerImage: heroBannerFinal,
    marcasPromocion: marcasPromo,
    descuentoMarca: getVal('adminDescuentoMarca'),
    productos2x1: adminPromo2x1Draft,
    ofertasPorCategoria: {
      LIMPIEZA: getVal('adminOfertaLimpieza'),
      'LIBRERÍA': getVal('adminOfertaLibreria'),
      ESCOLAR: getVal('adminOfertaEscolar'),
      EMBALAJE: getVal('adminOfertaEmbalaje'),
      BOLSAS: getVal('adminOfertaBolsas'),
      DESCARTABLES: getVal('adminOfertaDescartables'),
      CAJAS: getVal('adminOfertaCajas'),
      'GASTRONÓMICO': getVal('adminOfertaGastronomico')
    }
  });

  configComercial = nuevo;
  guardarConfigComercialLocal();
  aplicarConfigComercialUI();
  refrescarCatalogoPrincipal();
  actualizarUI();
  if (_modoVistaActual) aplicarOrdenYFiltro();

  if (usaFirestoreAdmin && firestoreDb) {
    try {
      await withTimeout(
        firestoreDb.collection(FIRESTORE_CONFIG_COLLECTION).doc(FIRESTORE_CONFIG_DOC).set({
          ...configComercial,
          updatedAt: window.firebase.firestore.FieldValue.serverTimestamp(),
          updatedBy: window._authCurrentUser?.email || ''
        }, { merge: true }),
        8000,
        'No se pudo sincronizar la configuración comercial.'
      );
    } catch (err) {
      console.warn('[Admin] Config comercial guardada localmente; fallo Firestore:', err);
      mostrarToast('Configuración guardada localmente. Firestore no respondió.');
      return;
    }
  }

  mostrarToast('Configuración comercial actualizada.');
}
window.guardarConfigComercialAdmin = guardarConfigComercialAdmin;

function abrirAdminPanel() {
  cerrarUserDropdown();
  if (!usuarioAdminActivo) {
    mostrarToast('Solo usuarios admin pueden cargar productos.');
    return;
  }

  const modal = document.getElementById('adminModal');
  const overlay = document.getElementById('adminOverlay');
  if (!modal || !overlay) return;

  modal.classList.add('open');
  overlay.classList.remove('hidden');
  document.body.style.overflow = 'hidden';
  setAdminMainTab('config');
  setAdminTab('form', 'publicaciones');
  setAdminTab('gestion', 'listado');
  adminSeleccionados.clear();
  cargarFormularioConfigComercialAdmin();
  renderAdminGestionList();
  _actualizarInfoSeleccionMasivaAdmin();
  document.getElementById('adminNombre')?.focus();
}
window.abrirAdminPanel = abrirAdminPanel;

function cerrarAdminPanel() {
  const modal = document.getElementById('adminModal');
  const overlay = document.getElementById('adminOverlay');
  if (modal) modal.classList.remove('open');
  if (overlay) overlay.classList.add('hidden');
  document.body.style.overflow = '';

  const error = document.getElementById('adminError');
  if (error) {
    error.textContent = '';
    error.style.display = 'none';
  }

  const buscador = document.getElementById('adminGestionBuscar');
  if (buscador) buscador.value = '';
  adminResetGestionPage();
  adminSeleccionados.clear();
  _actualizarInfoSeleccionMasivaAdmin();
  _limpiarAdminHeroBannerObjectUrl();
}
window.cerrarAdminPanel = cerrarAdminPanel;

function mostrarErrorAdmin(msg) {
  const error = document.getElementById('adminError');
  if (!error) return;
  error.textContent = msg;
  error.style.display = 'block';
}

function escapeHtml(texto) {
  return String(texto || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function adminDomKey(id) {
  return String(id || '').replace(/[^a-zA-Z0-9_-]/g, '_');
}

function solicitarListaMayorista(e) {
  if (e && typeof e.preventDefault === 'function') e.preventDefault();

  const input = document.getElementById('mayoristaEmail');
  const email = String(input?.value || '').trim();
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    mostrarToast('Ingresá un correo válido para solicitar la lista mayorista.');
    if (input) input.focus();
    return;
  }

  const subject = encodeURIComponent('Lista Mayorista y Comerciantes');
  const body = encodeURIComponent(
    `Hola, quiero recibir la lista mayorista.\n\nCorreo de contacto: ${email}\nTipo de cliente: Mayorista / Revendedor\n\nGracias.`
  );
  window.location.href = `mailto:ventas@papeleracarocruz.com?subject=${subject}&body=${body}`;

  if (input) input.value = '';
  mostrarToast('Solicitud preparada. Revisá tu mail para enviarla.');
}
window.solicitarListaMayorista = solicitarListaMayorista;

function productoEsSoloLocal(id) {
  return String(id || '').startsWith('adm-');
}

let adminGestionPaginaActual = 1;
const ADMIN_GESTION_PAGE_SIZE = 6;

function adminResetGestionPage() {
  adminGestionPaginaActual = 1;
}
window.adminResetGestionPage = adminResetGestionPage;

function obtenerItemsGestionAdmin() {
  const adminIds = new Set(PRODUCTOS_ADMIN.map(function(p) { return p.id; }));
  const map = new Map();

  todosLosProductos().forEach(function(p) {
    if (!p || !p.id) return;
    if (map.has(p.id)) return;
    const source = adminIds.has(p.id) ? 'ADMIN' : 'CATALOGO';
    map.set(p.id, {
      id: p.id,
      nombre: p.nombre,
      precio: p.precio,
      stock: Number.isFinite(p.stock) ? p.stock : 0,
      categoria: p.categoria,
      _source: source
    });
  });

  return Array.from(map.values());
}

function adminCambiarPagina(delta) {
  adminGestionPaginaActual = Math.max(1, adminGestionPaginaActual + delta);
  renderAdminGestionList();
}
window.adminCambiarPagina = adminCambiarPagina;

function obtenerProductosAdminFiltrados() {
  const q = normalizarTextoBusqueda(document.getElementById('adminGestionBuscar')?.value || '');
  const filtroEstado = String(document.getElementById('adminGestionEstado')?.value || 'TODOS');
  const filtroCategoria = String(document.getElementById('adminGestionCategoria')?.value || 'TODAS');
  const umbralRaw = Number(document.getElementById('adminGestionUmbral')?.value || 10);
  const umbral = Number.isFinite(umbralRaw) && umbralRaw > 0 ? Math.floor(umbralRaw) : 10;

  return obtenerItemsGestionAdmin()
    .slice()
    .sort(function(a, b) { return a.nombre.localeCompare(b.nombre, 'es'); })
    .filter(function(p) {
      const stock = Number.isFinite(p.stock) ? p.stock : 0;
      if (filtroCategoria !== 'TODAS' && p.categoria !== filtroCategoria) return false;
      if (filtroEstado === 'SIN_STOCK' && stock !== 0) return false;
      if (filtroEstado === 'BAJO_STOCK' && !(stock > 0 && stock <= umbral)) return false;
      if (filtroEstado === 'CON_STOCK' && stock <= 0) return false;
      if (!q) return true;
      const nombre = normalizarTextoBusqueda(p.nombre);
      const cat = normalizarTextoBusqueda(p.categoria);
      return nombre.includes(q) || cat.includes(q);
    });
}

function adminToggleSeleccionPublicacion(id, checked) {
  if (checked) adminSeleccionados.add(id);
  else adminSeleccionados.delete(id);
  _actualizarInfoSeleccionMasivaAdmin();
}
window.adminToggleSeleccionPublicacion = adminToggleSeleccionPublicacion;

function adminSeleccionarVisibles(select) {
  const visibles = obtenerProductosAdminFiltrados().slice(
    (adminGestionPaginaActual - 1) * ADMIN_GESTION_PAGE_SIZE,
    (adminGestionPaginaActual - 1) * ADMIN_GESTION_PAGE_SIZE + ADMIN_GESTION_PAGE_SIZE
  );

  visibles.forEach(function(p) {
    if (select) adminSeleccionados.add(p.id);
    else adminSeleccionados.delete(p.id);
  });

  renderAdminGestionList();
  _actualizarInfoSeleccionMasivaAdmin();
}
window.adminSeleccionarVisibles = adminSeleccionarVisibles;

function renderAdminGestionList() {
  const list = document.getElementById('adminGestionList');
  if (!list) return;
  const pageInfo = document.getElementById('adminGestionPageInfo');

  const productos = obtenerProductosAdminFiltrados();

  const totalPages = Math.max(1, Math.ceil(productos.length / ADMIN_GESTION_PAGE_SIZE));
  adminGestionPaginaActual = Math.min(totalPages, Math.max(1, adminGestionPaginaActual));
  const start = (adminGestionPaginaActual - 1) * ADMIN_GESTION_PAGE_SIZE;
  const productosPage = productos.slice(start, start + ADMIN_GESTION_PAGE_SIZE);
  _actualizarInfoSeleccionMasivaAdmin();

  if (pageInfo) {
    pageInfo.textContent = `Página ${adminGestionPaginaActual} de ${totalPages} (${productos.length} publicaciones)`;
  }

  if (productos.length === 0) {
    list.innerHTML = '<div class="admin-gestion-empty">No hay publicaciones para el filtro actual.</div>';
    return;
  }

  list.innerHTML = productosPage.map(function(p) {
    const k = adminDomKey(p.id);
    const imgUrl = String((window.IMAGENES_MAP && window.IMAGENES_MAP[p.id]) || '').trim();
    const thumbHtml = imgUrl
      ? `<img src="${imgUrl}" alt="${escapeHtml(p.nombre)}" class="admin-item-thumb" />`
      : `<div class="admin-item-thumb admin-item-thumb--empty">Sin imagen</div>`;
    return `
      <article class="admin-item">
        <div class="admin-item-head">
          <div class="admin-item-media">
            <button type="button" class="admin-item-thumb-btn" onclick="adminZoomImagen('${p.id.replace(/'/g, "\\'")}')">
              ${thumbHtml}
            </button>
          </div>
          <div>
            <p class="admin-item-title">${escapeHtml(p.nombre)}</p>
            <p class="admin-item-cat">${escapeHtml(p.categoria)} · ${p._source === 'ADMIN' ? 'Manual' : 'Catálogo CSV'}</p>
          </div>
          <label class="admin-item-select">
            <input type="checkbox" ${adminSeleccionados.has(p.id) ? 'checked' : ''} onchange="adminToggleSeleccionPublicacion('${p.id.replace(/'/g, "\\'")}', this.checked)" />
            Seleccionar
          </label>
        </div>
        <div class="admin-item-grid">
          <div class="admin-item-field">
            <label for="adminPrecioEdit-${k}">Precio</label>
            <input id="adminPrecioEdit-${k}" type="number" min="1" step="1" value="${Number(p.precio) || 0}" />
          </div>
          <div class="admin-item-field">
            <label for="adminStockEdit-${k}">Stock</label>
            <input id="adminStockEdit-${k}" type="number" min="0" step="1" value="${Number.isFinite(p.stock) ? p.stock : 0}" />
          </div>
          <div class="admin-item-field">
            <label for="adminCategoriaEdit-${k}">Categoría</label>
            <select id="adminCategoriaEdit-${k}" class="admin-select">
              <option value="LIMPIEZA" ${p.categoria === 'LIMPIEZA' ? 'selected' : ''}>Limpieza</option>
              <option value="LIBRERÍA" ${p.categoria === 'LIBRERÍA' ? 'selected' : ''}>Librería</option>
              <option value="ESCOLAR" ${p.categoria === 'ESCOLAR' ? 'selected' : ''}>Escolar</option>
              <option value="EMBALAJE" ${p.categoria === 'EMBALAJE' ? 'selected' : ''}>Embalaje</option>
              <option value="BOLSAS" ${p.categoria === 'BOLSAS' ? 'selected' : ''}>Bolsas</option>
              <option value="DESCARTABLES" ${p.categoria === 'DESCARTABLES' ? 'selected' : ''}>Descartables</option>
              <option value="CAJAS" ${p.categoria === 'CAJAS' ? 'selected' : ''}>Cajas</option>
              <option value="GASTRONÓMICO" ${p.categoria === 'GASTRONÓMICO' ? 'selected' : ''}>Gastronómico</option>
              <option value="OFERTA" ${p.categoria === 'OFERTA' ? 'selected' : ''}>Oferta</option>
            </select>
          </div>
          <div class="admin-item-field admin-item-field--full">
            <label for="adminImagenEdit-${k}">Imagen URL</label>
            <input id="adminImagenEdit-${k}" type="url" placeholder="https://..." value="${escapeHtml(imgUrl)}" />
          </div>
          <div class="admin-item-field admin-item-field--full">
            <label for="adminImagenArchivoEdit-${k}">Imagen archivo (recorte cuadrado automático)</label>
            <input id="adminImagenArchivoEdit-${k}" type="file" accept="image/*" onchange="adminPrepararRecorteImagen('${p.id.replace(/'/g, "\\'")}')" />
          </div>
          <div id="adminCropWrap-${k}" class="admin-item-field admin-item-field--full admin-crop-wrap hidden">
            <label>Previsualización de recorte (arrastrá X/Y para encuadrar)</label>
            <canvas id="adminCropCanvas-${k}" class="admin-crop-canvas" width="180" height="180"></canvas>
            <div class="admin-crop-controls">
              <label for="adminCropX-${k}">X <span id="adminCropXVal-${k}">50%</span></label>
              <input id="adminCropX-${k}" type="range" min="0" max="100" step="1" value="50" oninput="adminActualizarPreviewRecorte('${p.id.replace(/'/g, "\\'")}')" />
              <label for="adminCropY-${k}">Y <span id="adminCropYVal-${k}">50%</span></label>
              <input id="adminCropY-${k}" type="range" min="0" max="100" step="1" value="50" oninput="adminActualizarPreviewRecorte('${p.id.replace(/'/g, "\\'")}')" />
              <button type="button" class="admin-item-btn" onclick="adminResetearRecorteImagen('${p.id.replace(/'/g, "\\'")}')">Centrar recorte</button>
            </div>
          </div>
        </div>
        <div class="admin-item-actions">
          <button type="button" class="admin-item-btn" onclick="adminAjustarStock('${p.id.replace(/'/g, "\\'")}', -1)">-1 stock</button>
          <button type="button" class="admin-item-btn" onclick="adminAjustarStock('${p.id.replace(/'/g, "\\'")}', 1)">+1 stock</button>
          <button type="button" class="admin-item-btn" onclick="adminGuardarImagenPublicacion('${p.id.replace(/'/g, "\\'")}')">Guardar imagen</button>
          <button type="button" class="admin-item-btn" onclick="adminEliminarImagenPublicacion('${p.id.replace(/'/g, "\\'")}')">Quitar imagen</button>
          <button type="button" class="admin-item-btn admin-item-btn--primary" onclick="adminGuardarPublicacion('${p.id.replace(/'/g, "\\'")}')">Guardar cambios</button>
          ${p._source === 'ADMIN'
            ? `<button type="button" class="admin-item-btn admin-item-btn--danger" onclick="adminEliminarPublicacion('${p.id.replace(/'/g, "\\'")}')">Eliminar</button>`
            : `<button type="button" class="admin-item-btn" onclick="adminRestaurarPublicacionCatalogo('${p.id.replace(/'/g, "\\'")}')">Restaurar CSV</button>`}
        </div>
      </article>
    `;
  }).join('');

  productosPage.forEach(function(p) {
    adminPintarPreviewRecorte(p.id);
  });
}
window.renderAdminGestionList = renderAdminGestionList;

function _adminSetCsvImportResult(texto, isError) {
  const el = document.getElementById('adminBulkCsvResult');
  if (!el) return;
  el.textContent = String(texto || '').trim();
  el.style.color = isError ? '#B91C1C' : '#334155';
}

function _adminNormalizarHeaderCsv(header) {
  return String(header || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');
}

function _adminDetectarSeparadorCsv(texto) {
  const primera = String(texto || '')
    .replace(/^\uFEFF/, '')
    .split(/\r?\n/)
    .map(function(l) { return l.trim(); })
    .find(Boolean) || '';

  const candidatos = [';', ',', '\t'];
  let ganador = ';';
  let score = -1;
  candidatos.forEach(function(sep) {
    const partes = primera.split(sep).length;
    if (partes > score) {
      score = partes;
      ganador = sep;
    }
  });
  return ganador;
}

function _adminParseCsv(texto, separador) {
  const rows = [];
  const str = String(texto || '').replace(/^\uFEFF/, '');
  let row = [];
  let field = '';
  let inQuotes = false;

  for (let i = 0; i < str.length; i += 1) {
    const ch = str[i];
    const next = str[i + 1];

    if (ch === '"') {
      if (inQuotes && next === '"') {
        field += '"';
        i += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }

    if (!inQuotes && ch === separador) {
      row.push(field);
      field = '';
      continue;
    }

    if (!inQuotes && (ch === '\n' || ch === '\r')) {
      if (ch === '\r' && next === '\n') i += 1;
      row.push(field);
      rows.push(row);
      row = [];
      field = '';
      continue;
    }

    field += ch;
  }

  if (field.length > 0 || row.length > 0) {
    row.push(field);
    rows.push(row);
  }

  return rows;
}

function _adminCsvToNumber(raw) {
  const txt = String(raw || '').trim();
  if (!txt) return NaN;

  let clean = txt.replace(/\$/g, '').replace(/\s+/g, '');
  if (clean.includes('.') && clean.includes(',')) {
    clean = clean.replace(/\./g, '').replace(/,/g, '.');
  } else if (clean.includes(',')) {
    clean = clean.replace(/,/g, '.');
  }
  clean = clean.replace(/[^0-9.-]/g, '');
  return Number(clean);
}

function _adminCsvToStock(raw) {
  const txt = String(raw || '').trim();
  if (!txt) return 0;
  const n = Number(txt.replace(/[^0-9-]/g, ''));
  if (!Number.isFinite(n)) return 0;
  return Math.max(0, Math.floor(n));
}

function _adminFindCsvHeaderIndex(headersNormalizados, aliases) {
  for (let i = 0; i < aliases.length; i += 1) {
    const idx = headersNormalizados.indexOf(aliases[i]);
    if (idx >= 0) return idx;
  }
  return -1;
}

function _adminIdCsvUnico(baseId, usados) {
  const base = String(baseId || '').trim() || `adm-csv-${Date.now()}`;
  if (!usados.has(base)) {
    usados.add(base);
    return base;
  }
  let n = 2;
  while (usados.has(`${base}-${n}`)) n += 1;
  const out = `${base}-${n}`;
  usados.add(out);
  return out;
}

function _adminCodigoCsvKeys(value) {
  const base = String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
  if (!base) return [];

  const keys = [
    base,
    base.replace(/\s+/g, ''),
    base.replace(/[^a-z0-9_-]/g, ''),
    base.replace(/[^a-z0-9]/g, ''),
    base.replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')
  ].filter(Boolean);

  return Array.from(new Set(keys));
}

function _adminConstruirIndiceImagenes(files) {
  const indice = new Map();
  (files || []).forEach(function(file) {
    const nombre = String(file?.name || '');
    const esImagen = /^image\//i.test(String(file?.type || ''))
      || /\.(png|jpe?g|webp|gif|avif|bmp|svg)$/i.test(nombre);
    if (!esImagen) return;

    const baseName = nombre.replace(/\.[^.]+$/, '');
    _adminCodigoCsvKeys(baseName).forEach(function(key) {
      if (!indice.has(key)) indice.set(key, file);
    });
  });
  return indice;
}

function _adminBuscarImagenCarpetaPorCodigo(indice, codigo) {
  if (!indice || !indice.size) return null;
  const keys = _adminCodigoCsvKeys(codigo);
  for (let i = 0; i < keys.length; i += 1) {
    const file = indice.get(keys[i]);
    if (file) return file;
  }
  return null;
}

function adminDescargarPlantillaCsv() {
  if (!usuarioAdminActivo) {
    mostrarToast('Solo usuarios admin pueden descargar la plantilla CSV.');
    return;
  }

  const lineas = [
    'id;nombre;precio;stock;categoria;imagen',
    'lapicera-azul;Lapicera azul x1;1200;50;LIBRERIA;https://ejemplo.com/imagenes/lapicera-azul.jpg',
    'cuaderno-a4;Cuaderno A4 tapa dura;8500;20;ESCOLAR;https://ejemplo.com/imagenes/cuaderno-a4.jpg'
  ];

  // BOM UTF-8 para que Excel abra acentos correctamente.
  const contenido = '\uFEFF' + lineas.join('\n');
  const blob = new Blob([contenido], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'plantilla_productos_carocruz.csv';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
  mostrarToast('Plantilla CSV descargada.');
}
window.adminDescargarPlantillaCsv = adminDescargarPlantillaCsv;

async function adminImportarCsvMasivo() {
  if (!usuarioAdminActivo) {
    mostrarToast('Solo usuarios admin pueden importar CSV.');
    return;
  }

  const fileInput = document.getElementById('adminBulkCsvFile');
  const folderInput = document.getElementById('adminBulkImagesFolder');
  const mode = String(document.getElementById('adminBulkCsvMode')?.value || 'UPSERT');
  const btn = document.getElementById('adminBulkCsvImportBtn');
  const file = fileInput?.files?.[0] || null;
  const folderFiles = Array.from(folderInput?.files || []);
  const indiceImagenesCarpeta = _adminConstruirIndiceImagenes(folderFiles);

  if (!file) {
    _adminSetCsvImportResult('Seleccioná un archivo CSV para importar.', true);
    mostrarToast('Seleccioná un archivo CSV.');
    return;
  }

  if (btn) {
    btn.disabled = true;
    btn.textContent = 'Importando…';
  }

  try {
    const texto = await file.text();
    if (!String(texto || '').trim()) {
      _adminSetCsvImportResult('El archivo está vacío.', true);
      mostrarToast('El CSV está vacío.');
      return;
    }

    const separador = _adminDetectarSeparadorCsv(texto);
    const rows = _adminParseCsv(texto, separador)
      .filter(function(r) {
        return r.some(function(cell) { return String(cell || '').trim() !== ''; });
      });

    if (rows.length < 2) {
      _adminSetCsvImportResult('El CSV debe tener encabezados y al menos una fila de datos.', true);
      mostrarToast('CSV inválido para importación.');
      return;
    }

    const headers = rows[0].map(function(h) { return String(h || '').trim(); });
    const headersNorm = headers.map(_adminNormalizarHeaderCsv);

    const idxId = _adminFindCsvHeaderIndex(headersNorm, ['id', 'codigo', 'codigo_producto', 'sku']);
    const idxNombre = _adminFindCsvHeaderIndex(headersNorm, ['nombre', 'producto', 'descripcion', 'titulo', 'title']);
    const idxPrecio = _adminFindCsvHeaderIndex(headersNorm, ['precio', 'price', 'precio_venta', 'importe', 'valor']);
    const idxStock = _adminFindCsvHeaderIndex(headersNorm, ['stock', 'cantidad', 'inventario', 'existencia']);
    const idxCategoria = _adminFindCsvHeaderIndex(headersNorm, ['categoria', 'rubro', 'familia', 'categoria_producto']);
    const idxImagen = _adminFindCsvHeaderIndex(headersNorm, ['imagen', 'image', 'foto', 'imagen_url', 'url_imagen']);

    if (idxNombre < 0 || idxPrecio < 0 || idxImagen < 0) {
      _adminSetCsvImportResult('Faltan columnas obligatorias. Debe incluir nombre/producto, precio e imagen.', true);
      mostrarToast('No se encontraron columnas obligatorias en el CSV.');
      return;
    }

    const hasId = idxId >= 0;
    const hasStock = idxStock >= 0;
    const hasCategoria = idxCategoria >= 0;
    const hasImagen = true;

    const usados = new Set(todosLosProductos().map(function(p) { return p.id; }));
    const errores = [];
    const adminIdsSync = new Set();
    const overridesIdsSync = new Set();

    let procesadas = 0;
    let creadas = 0;
    let actualizadasAdmin = 0;
    let actualizadasCatalogo = 0;
    let ignoradas = 0;
    let imagenesDesdeCarpeta = 0;
    let imagenesSinMatch = 0;
    let imagenesConError = 0;

    for (let i = 1; i < rows.length; i += 1) {
      const row = rows[i];
      const rawId = hasId ? String(row[idxId] || '').trim() : '';
      const rawNombre = String(row[idxNombre] || '').trim();
      const rawPrecio = String(row[idxPrecio] || '').trim();
      const rawStock = hasStock ? String(row[idxStock] || '').trim() : '';
      const rawCategoria = hasCategoria ? String(row[idxCategoria] || '').trim() : '';
      const rawImagen = hasImagen ? String(row[idxImagen] || '').trim() : '';

      if (!rawNombre && !rawPrecio && !rawId) {
        ignoradas += 1;
        continue;
      }

      procesadas += 1;

      const nombre = rawNombre;
      const precio = _adminCsvToNumber(rawPrecio);
      const stock = hasStock ? _adminCsvToStock(rawStock) : 0;
      const idPreferido = rawId ? rawId : `adm-csv-${Date.now()}-${i}`;
      const categoriaNormalizada = hasCategoria
        ? normalizarCategoria(rawCategoria)
        : 'LIMPIEZA';
      const categoria = CATEGORIA_UI[categoriaNormalizada] ? categoriaNormalizada : 'LIMPIEZA';
      let imagen = rawImagen;
      let imagenValida = !imagen || /^https?:\/\/.+/i.test(imagen) || imagen.startsWith('data:image/');

      if (indiceImagenesCarpeta.size && (!imagen || !imagenValida)) {
        const codigoMatch = rawId || nombre;
        const archivoImagen = _adminBuscarImagenCarpetaPorCodigo(indiceImagenesCarpeta, codigoMatch);
        if (archivoImagen) {
          try {
            imagen = await obtenerImagenFinalAdmin('', archivoImagen, {
              maxWidth: 1200,
              maxHeight: 1200,
              quality: 0.85
            });
            imagenValida = !!imagen;
            if (imagenValida) imagenesDesdeCarpeta += 1;
            else imagenesConError += 1;
          } catch (err) {
            if (errores.length < 8) errores.push(`Fila ${i + 1}: no se pudo subir imagen de carpeta para "${codigoMatch}".`);
            imagenesConError += 1;
          }
        } else if (!imagen) {
          imagenesSinMatch += 1;
        }
      }

      if (!nombre || nombre.length < 2) {
        if (errores.length < 8) errores.push(`Fila ${i + 1}: nombre inválido.`);
        continue;
      }
      if (!Number.isFinite(precio) || precio <= 0) {
        if (errores.length < 8) errores.push(`Fila ${i + 1}: precio inválido.`);
        continue;
      }
      if (!imagenValida) {
        if (errores.length < 8) errores.push(`Fila ${i + 1}: imagen ignorada por URL inválida.`);
      }

      const estilo = obtenerEstiloCategoria(categoria);
      const existenteAdminIdx = PRODUCTOS_ADMIN.findIndex(function(p) { return p.id === idPreferido; });
      const existenteGlobal = todosLosProductos().find(function(p) { return p.id === idPreferido; });

      if (mode === 'SOLO_NUEVOS' && existenteGlobal) {
        ignoradas += 1;
        continue;
      }

      if (existenteAdminIdx >= 0) {
        const actual = PRODUCTOS_ADMIN[existenteAdminIdx];
        actual.nombre = nombre;
        actual.precio = Math.floor(precio);
        if (hasStock) actual.stock = stock;
        if (hasCategoria) aplicarEstiloCategoriaProducto(actual, categoria);
        if (hasImagen) {
          if (imagenValida && imagen) window.IMAGENES_MAP[actual.id] = imagen;
          else delete window.IMAGENES_MAP[actual.id];
        }
        adminIdsSync.add(actual.id);
        actualizadasAdmin += 1;
        continue;
      }

      if (mode === 'UPSERT' && existenteGlobal && !PRODUCTOS_ADMIN.some(function(p) { return p.id === idPreferido; })) {
        existenteGlobal.precio = Math.floor(precio);
        if (hasStock) existenteGlobal.stock = stock;
        if (hasCategoria) aplicarEstiloCategoriaProducto(existenteGlobal, categoria);

        const prev = PRODUCTOS_OVERRIDES[idPreferido] || {};
        const nextOverride = {
          ...prev,
          precio: Number(existenteGlobal.precio),
          stock: Number.isFinite(existenteGlobal.stock) ? existenteGlobal.stock : 0,
          categoria: normalizarCategoria(existenteGlobal.categoria)
        };
        if (hasImagen) {
          nextOverride.imagenSet = true;
          nextOverride.imagen = (imagenValida && imagen) ? imagen : '';
          if (imagenValida && imagen) window.IMAGENES_MAP[idPreferido] = imagen;
          else delete window.IMAGENES_MAP[idPreferido];
        }
        PRODUCTOS_OVERRIDES[idPreferido] = nextOverride;
        overridesIdsSync.add(idPreferido);
        actualizadasCatalogo += 1;
        continue;
      }

      const idNuevo = _adminIdCsvUnico(idPreferido, usados);
      const nuevo = {
        id: idNuevo,
        nombre,
        precio: Math.floor(precio),
        stock,
        categoria,
        categColor: estilo.categColor,
        categText: estilo.categText,
        bgImg: estilo.bgImg,
        iconColor: estilo.iconColor,
        icon: ICONO_PRODUCTO_ADMIN,
        creadoPor: window._authCurrentUser?.email || 'import-csv'
      };
      PRODUCTOS_ADMIN.unshift(nuevo);
      if (hasImagen) {
        if (imagenValida && imagen) window.IMAGENES_MAP[idNuevo] = imagen;
        else delete window.IMAGENES_MAP[idNuevo];
      }
      adminIdsSync.add(idNuevo);
      creadas += 1;
    }

    guardarOverridesLocal();
    guardarProductosAdmin();
    refrescarCatalogoPrincipal();
    adminRenderSelectorProductos2x1();
    const searchInput = document.getElementById('searchInput');
    if (searchInput && searchInput.value.trim()) buscar();

    if (usaFirestoreAdmin && firestoreDb && (adminIdsSync.size || overridesIdsSync.size)) {
      try {
        const jobs = [];

        adminIdsSync.forEach(function(id) {
          const prod = PRODUCTOS_ADMIN.find(function(p) { return p.id === id; });
          if (!prod) return;
          jobs.push(withTimeout(
            firestoreDb.collection(FIRESTORE_ADMIN_COLLECTION).doc(id).set({
              nombre: prod.nombre,
              precio: prod.precio,
              stock: Number.isFinite(prod.stock) ? prod.stock : 0,
              categoria: prod.categoria,
              imagen: String((window.IMAGENES_MAP && window.IMAGENES_MAP[id]) || ''),
              creadoPor: prod.creadoPor || (window._authCurrentUser?.email || ''),
              updatedAt: window.firebase.firestore.FieldValue.serverTimestamp(),
              updatedBy: window._authCurrentUser?.email || ''
            }, { merge: true }),
            8000,
            'No se pudo sincronizar un producto importado.'
          ));
        });

        overridesIdsSync.forEach(function(id) {
          const ov = PRODUCTOS_OVERRIDES[id];
          if (!ov) return;
          jobs.push(withTimeout(
            firestoreDb.collection(FIRESTORE_OVERRIDES_COLLECTION).doc(id).set({
              ...ov,
              updatedAt: window.firebase.firestore.FieldValue.serverTimestamp(),
              updatedBy: window._authCurrentUser?.email || ''
            }, { merge: true }),
            8000,
            'No se pudo sincronizar un override importado.'
          ));
        });

        await Promise.all(jobs);
      } catch (err) {
        console.warn('[Admin] Importación CSV: sync Firestore parcial/fallida:', err);
        mostrarToast('Importación aplicada localmente. Firestore no respondió para algunos ítems.');
      }
    }

    const resumen = [
      `Archivo: ${file.name}`,
      `Filas procesadas: ${procesadas}`,
      `Creadas: ${creadas}`,
      `Actualizadas (manual): ${actualizadasAdmin}`,
      `Actualizadas (catálogo): ${actualizadasCatalogo}`,
      `Ignoradas: ${ignoradas}`,
      `Con incidencias: ${errores.length}`
    ];
    if (indiceImagenesCarpeta.size) {
      resumen.push(`Imágenes detectadas en carpeta: ${indiceImagenesCarpeta.size}`);
      resumen.push(`Imágenes matcheadas/subidas: ${imagenesDesdeCarpeta}`);
      resumen.push(`Sin match por código: ${imagenesSinMatch}`);
      resumen.push(`Fallas de subida/proceso: ${imagenesConError}`);
    }
    if (errores.length) resumen.push('', errores.join('\n'));
    _adminSetCsvImportResult(resumen.join('\n'), false);

    if (fileInput) fileInput.value = '';
    if (folderInput) folderInput.value = '';
    adminResetGestionPage();
    renderAdminGestionList();
    mostrarToast(`CSV importado: ${creadas + actualizadasAdmin + actualizadasCatalogo} publicaciones impactadas.`);
  } catch (err) {
    console.warn('[Admin] Error importando CSV:', err);
    _adminSetCsvImportResult(err?.message || 'No se pudo importar el CSV.', true);
    mostrarToast('No se pudo importar el CSV.');
  } finally {
    if (btn) {
      btn.disabled = false;
      btn.textContent = 'Importar CSV';
    }
  }
}
window.adminImportarCsvMasivo = adminImportarCsvMasivo;

async function adminAplicarCambiosMasivos() {
  if (!usuarioAdminActivo) {
    mostrarToast('Solo usuarios admin pueden aplicar cambios masivos.');
    return;
  }

  const precioPctRaw = String(document.getElementById('adminBulkPrecioPct')?.value || '').trim();
  const stockDeltaRaw = String(document.getElementById('adminBulkStockDelta')?.value || '').trim();
  const categoriaDestinoRaw = String(document.getElementById('adminBulkCategoriaDestino')?.value || '').trim();
  const scope = String(document.getElementById('adminBulkScope')?.value || 'FILTRADOS');
  const categoriaDestino = categoriaDestinoRaw ? normalizarCategoria(categoriaDestinoRaw) : '';

  const usaPrecio = precioPctRaw !== '';
  const usaStock = stockDeltaRaw !== '';
  const usaCategoria = !!categoriaDestino;
  if (!usaPrecio && !usaStock && !usaCategoria) {
    mostrarToast('Completá al menos un cambio masivo.');
    return;
  }

  const precioPct = usaPrecio ? Number(precioPctRaw) : 0;
  const stockDelta = usaStock ? Number(stockDeltaRaw) : 0;
  if (usaPrecio && (!Number.isFinite(precioPct) || precioPct <= -95 || precioPct > 500)) {
    mostrarToast('El ajuste de precio debe estar entre -95% y 500%.');
    return;
  }
  if (usaStock && (!Number.isFinite(stockDelta) || Math.abs(stockDelta) > 100000)) {
    mostrarToast('El ajuste de stock no es válido.');
    return;
  }
  if (usaCategoria && !CATEGORIA_UI[categoriaDestino]) {
    mostrarToast('La categoría de destino no es válida.');
    return;
  }

  const productosFiltrados = obtenerProductosAdminFiltrados();
  const productosObjetivo = scope === 'SELECCIONADOS'
    ? productosFiltrados.filter(function(p) { return adminSeleccionados.has(p.id); })
    : productosFiltrados;
  if (!productosObjetivo.length) {
    mostrarToast(scope === 'SELECCIONADOS'
      ? 'No hay publicaciones seleccionadas dentro del filtro actual.'
      : 'No hay publicaciones filtradas para modificar.');
    return;
  }

  const confirmar = window.confirm(`Se aplicarán cambios masivos sobre ${productosObjetivo.length} publicaciones (${scope === 'SELECCIONADOS' ? 'seleccionadas' : 'filtradas'}). ¿Continuar?`);
  if (!confirmar) return;

  const actualizadosFirestoreAdmin = [];
  const actualizadosFirestoreOverrides = [];

  productosObjetivo.forEach(function(item) {
    const prod = todosLosProductos().find(function(p) { return p.id === item.id; });
    if (!prod) return;
    const esManual = PRODUCTOS_ADMIN.some(function(p) { return p.id === prod.id; });
    const updates = {};

    if (usaPrecio) {
      prod.precio = Math.max(1, Math.round(Number(prod.precio || 0) * (1 + (precioPct / 100))));
      updates.precio = prod.precio;
    }
    if (usaStock) {
      const currentStock = Number.isFinite(prod.stock) ? prod.stock : 0;
      prod.stock = Math.max(0, Math.floor(currentStock + stockDelta));
      updates.stock = prod.stock;
    }
    if (usaCategoria) {
      aplicarEstiloCategoriaProducto(prod, categoriaDestino);
      updates.categoria = prod.categoria;
    }

    if (!esManual) {
      const prev = PRODUCTOS_OVERRIDES[prod.id] || {};
      PRODUCTOS_OVERRIDES[prod.id] = {
        ...prev,
        precio: Number(prod.precio),
        stock: Number(prod.stock),
        categoria: normalizarCategoria(prod.categoria)
      };
    }

    if (usaFirestoreAdmin && firestoreDb && !productoEsSoloLocal(prod.id)) {
      if (esManual) actualizadosFirestoreAdmin.push({ id: prod.id, updates: updates });
      else actualizadosFirestoreOverrides.push({ id: prod.id, updates: updates });
    }
  });

  guardarOverridesLocal();
  guardarProductosAdmin();
  refrescarCatalogoPrincipal();
  const searchInput = document.getElementById('searchInput');
  if (searchInput && searchInput.value.trim()) buscar();

  if (usaFirestoreAdmin && firestoreDb && (actualizadosFirestoreAdmin.length || actualizadosFirestoreOverrides.length)) {
    try {
      const jobs = [];

      actualizadosFirestoreAdmin.forEach(function(item) {
        jobs.push(withTimeout(
          firestoreDb.collection(FIRESTORE_ADMIN_COLLECTION).doc(item.id).update({
            ...item.updates,
            updatedAt: window.firebase.firestore.FieldValue.serverTimestamp()
          }),
          8000,
          'No se pudo sincronizar una actualización masiva de admin.'
        ));
      });

      actualizadosFirestoreOverrides.forEach(function(item) {
        jobs.push(withTimeout(
          firestoreDb.collection(FIRESTORE_OVERRIDES_COLLECTION).doc(item.id).set({
            ...item.updates,
            updatedAt: window.firebase.firestore.FieldValue.serverTimestamp(),
            updatedBy: window._authCurrentUser?.email || ''
          }, { merge: true }),
          8000,
          'No se pudo sincronizar una actualización masiva de catálogo.'
        ));
      });

      await Promise.all(jobs);
    } catch (err) {
      console.warn('[Admin] Cambios masivos: sync Firestore parcial/fallida:', err);
      mostrarToast('Cambios masivos aplicados localmente. Firestore no respondió para algunos ítems.');
      renderAdminGestionList();
      return;
    }
  }

  renderAdminGestionList();
  if (scope === 'SELECCIONADOS') {
    adminSeleccionados.clear();
    _actualizarInfoSeleccionMasivaAdmin();
  }
  mostrarToast(`Cambios masivos aplicados en ${productosObjetivo.length} publicaciones.`);
}
window.adminAplicarCambiosMasivos = adminAplicarCambiosMasivos;

function adminAjustarStock(id, delta) {
  const key = adminDomKey(id);
  const input = document.getElementById(`adminStockEdit-${key}`);
  if (!input) return;
  const actual = Number(input.value || 0);
  input.value = String(Math.max(0, Math.floor(actual + delta)));
}
window.adminAjustarStock = adminAjustarStock;

function adminZoomImagen(id) {
  const src = String((window.IMAGENES_MAP && window.IMAGENES_MAP[id]) || '').trim();
  if (!src) {
    mostrarToast('Este producto no tiene imagen.');
    return;
  }
  const overlay = document.getElementById('adminImageZoomOverlay');
  const img = document.getElementById('adminImageZoomImg');
  if (!overlay || !img) return;
  img.src = src;
  overlay.classList.remove('hidden');
}
window.adminZoomImagen = adminZoomImagen;

function _adminClampCropPercent(n, fallback) {
  const value = Number(n);
  if (!Number.isFinite(value)) return fallback;
  return Math.max(0, Math.min(100, value));
}

function _adminCoordsEnCanvasDesdeEvento(canvas, ev) {
  if (!canvas || !ev) return null;
  const rect = canvas.getBoundingClientRect();
  let clientX = null;
  let clientY = null;

  if (ev.touches && ev.touches[0]) {
    clientX = ev.touches[0].clientX;
    clientY = ev.touches[0].clientY;
  } else if (ev.changedTouches && ev.changedTouches[0]) {
    clientX = ev.changedTouches[0].clientX;
    clientY = ev.changedTouches[0].clientY;
  } else if (typeof ev.clientX === 'number' && typeof ev.clientY === 'number') {
    clientX = ev.clientX;
    clientY = ev.clientY;
  }

  if (!Number.isFinite(clientX) || !Number.isFinite(clientY) || rect.width <= 0 || rect.height <= 0) {
    return null;
  }

  const relX = (clientX - rect.left) / rect.width;
  const relY = (clientY - rect.top) / rect.height;
  return {
    x: Math.max(0, Math.min(1, relX)),
    y: Math.max(0, Math.min(1, relY))
  };
}

function _adminActualizarRecorteDesdeDrag(id, ev) {
  const k = adminDomKey(id);
  const canvas = document.getElementById(`adminCropCanvas-${k}`);
  const inputX = document.getElementById(`adminCropX-${k}`);
  const inputY = document.getElementById(`adminCropY-${k}`);
  if (!canvas || !inputX || !inputY) return;

  const point = _adminCoordsEnCanvasDesdeEvento(canvas, ev);
  if (!point) return;

  inputX.value = String(Math.round(point.x * 100));
  inputY.value = String(Math.round(point.y * 100));
  adminPintarPreviewRecorte(id);
}

function _adminIniciarDragRecorte(id, ev) {
  const draft = adminImageCropDrafts[id];
  if (!draft) return;
  draft.dragging = true;
  if (ev && typeof ev.preventDefault === 'function') ev.preventDefault();
  _adminActualizarRecorteDesdeDrag(id, ev);
}

function _adminMoverDragRecorte(id, ev) {
  const draft = adminImageCropDrafts[id];
  if (!draft || draft.dragging !== true) return;
  if (ev && typeof ev.preventDefault === 'function') ev.preventDefault();
  _adminActualizarRecorteDesdeDrag(id, ev);
}

function _adminTerminarDragRecorte(id) {
  const draft = adminImageCropDrafts[id];
  if (!draft) return;
  draft.dragging = false;
}

function adminPintarPreviewRecorte(id) {
  const k = adminDomKey(id);
  const draft = adminImageCropDrafts[id];
  const wrap = document.getElementById(`adminCropWrap-${k}`);
  const canvas = document.getElementById(`adminCropCanvas-${k}`);
  const inputX = document.getElementById(`adminCropX-${k}`);
  const inputY = document.getElementById(`adminCropY-${k}`);
  const labelX = document.getElementById(`adminCropXVal-${k}`);
  const labelY = document.getElementById(`adminCropYVal-${k}`);

  if (!wrap || !canvas || !inputX || !inputY || !labelX || !labelY) return;
  if (!draft || !draft.img) {
    wrap.classList.add('hidden');
    return;
  }

  wrap.classList.remove('hidden');
  const x = _adminClampCropPercent(inputX.value, _adminClampCropPercent(draft.cropX, 50));
  const y = _adminClampCropPercent(inputY.value, _adminClampCropPercent(draft.cropY, 50));
  inputX.value = String(Math.round(x));
  inputY.value = String(Math.round(y));
  labelX.textContent = `${Math.round(x)}%`;
  labelY.textContent = `${Math.round(y)}%`;

  draft.cropX = x;
  draft.cropY = y;

  const img = draft.img;
  const lado = Math.max(1, Math.min(img.width, img.height));
  const sx = Math.round((img.width - lado) * (x / 100));
  const sy = Math.round((img.height - lado) * (y / 100));

  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(img, sx, sy, lado, lado, 0, 0, canvas.width, canvas.height);

  if (!canvas.dataset.cropDragBound) {
    canvas.dataset.cropDragBound = '1';

    canvas.addEventListener('mousedown', function(ev) {
      _adminIniciarDragRecorte(id, ev);
    });
    canvas.addEventListener('mousemove', function(ev) {
      _adminMoverDragRecorte(id, ev);
    });
    canvas.addEventListener('mouseup', function() {
      _adminTerminarDragRecorte(id);
    });
    canvas.addEventListener('mouseleave', function() {
      _adminTerminarDragRecorte(id);
    });

    canvas.addEventListener('touchstart', function(ev) {
      _adminIniciarDragRecorte(id, ev);
    }, { passive: false });
    canvas.addEventListener('touchmove', function(ev) {
      _adminMoverDragRecorte(id, ev);
    }, { passive: false });
    canvas.addEventListener('touchend', function() {
      _adminTerminarDragRecorte(id);
    }, { passive: true });
    canvas.addEventListener('touchcancel', function() {
      _adminTerminarDragRecorte(id);
    }, { passive: true });
  }
}
window.adminPintarPreviewRecorte = adminPintarPreviewRecorte;

function adminActualizarPreviewRecorte(id) {
  adminPintarPreviewRecorte(id);
}
window.adminActualizarPreviewRecorte = adminActualizarPreviewRecorte;

function adminResetearRecorteImagen(id) {
  const k = adminDomKey(id);
  const inputX = document.getElementById(`adminCropX-${k}`);
  const inputY = document.getElementById(`adminCropY-${k}`);
  if (inputX) inputX.value = '50';
  if (inputY) inputY.value = '50';
  adminPintarPreviewRecorte(id);
}
window.adminResetearRecorteImagen = adminResetearRecorteImagen;

function adminPrepararRecorteImagen(id) {
  const k = adminDomKey(id);
  const fileInput = document.getElementById(`adminImagenArchivoEdit-${k}`);
  const file = fileInput?.files?.[0] || null;

  if (!file) {
    delete adminImageCropDrafts[id];
    adminPintarPreviewRecorte(id);
    return;
  }
  if (!String(file.type || '').startsWith('image/')) {
    mostrarToast('El archivo seleccionado no es una imagen válida.');
    if (fileInput) fileInput.value = '';
    delete adminImageCropDrafts[id];
    adminPintarPreviewRecorte(id);
    return;
  }

  const fr = new FileReader();
  fr.onerror = function() {
    mostrarToast('No se pudo leer el archivo para previsualizar.');
  };
  fr.onload = function(ev) {
    const src = String(ev.target?.result || '');
    if (!src) {
      mostrarToast('No se pudo preparar la previsualización.');
      return;
    }

    const img = new Image();
    img.onload = function() {
      adminImageCropDrafts[id] = {
        img,
        cropX: 50,
        cropY: 50
      };
      adminPintarPreviewRecorte(id);
    };
    img.onerror = function() {
      mostrarToast('No se pudo previsualizar esa imagen.');
    };
    img.src = src;
  };
  fr.readAsDataURL(file);
}
window.adminPrepararRecorteImagen = adminPrepararRecorteImagen;

function cerrarAdminImageZoom() {
  const overlay = document.getElementById('adminImageZoomOverlay');
  const img = document.getElementById('adminImageZoomImg');
  if (overlay) overlay.classList.add('hidden');
  if (img) img.removeAttribute('src');
}
window.cerrarAdminImageZoom = cerrarAdminImageZoom;

async function adminGuardarImagenPublicacion(id) {
  const key = adminDomKey(id);
  const prod = todosLosProductos().find(function(p) { return p.id === id; });
  if (!prod) return;

  const imagenUrl = String(document.getElementById(`adminImagenEdit-${key}`)?.value || '').trim();
  const archivo = document.getElementById(`adminImagenArchivoEdit-${key}`)?.files?.[0] || null;
  const esManual = PRODUCTOS_ADMIN.some(function(p) { return p.id === id; });

  if (!imagenUrl && !archivo) {
    mostrarToast('Ingresá una URL o seleccioná un archivo para cargar imagen.');
    return;
  }
  if (imagenUrl && !/^https?:\/\/.+/i.test(imagenUrl) && !imagenUrl.startsWith('data:image/')) {
    mostrarToast('La URL de imagen debe ser http(s) o data:image válida.');
    return;
  }
  if (archivo && !String(archivo.type || '').startsWith('image/')) {
    mostrarToast('El archivo seleccionado no es una imagen válida.');
    return;
  }

  let imagenFinal = imagenUrl;
  if (archivo) {
    const cropXInput = document.getElementById(`adminCropX-${key}`);
    const cropYInput = document.getElementById(`adminCropY-${key}`);
    const cropX = _adminClampCropPercent(cropXInput?.value, adminImageCropDrafts[id]?.cropX ?? 50) / 100;
    const cropY = _adminClampCropPercent(cropYInput?.value, adminImageCropDrafts[id]?.cropY ?? 50) / 100;
    try {
      imagenFinal = await withTimeout(
        obtenerImagenFinalAdmin(imagenUrl, archivo, { squareCrop: true, maxLado: 1080, quality: 0.84, cropX, cropY }),
        12000,
        'La imagen tardó demasiado en procesarse.'
      );
    } catch (err) {
      console.warn('[Admin] Error procesando imagen en gestor:', err);
      mostrarToast('No se pudo procesar la imagen.');
      return;
    }
  }

  if (imagenFinal) window.IMAGENES_MAP[id] = imagenFinal;

  if (!esManual) {
    const prev = PRODUCTOS_OVERRIDES[id] || {};
    PRODUCTOS_OVERRIDES[id] = {
      ...prev,
      imagenSet: true,
      imagen: imagenFinal
    };
    guardarOverridesLocal();
  }

  guardarProductosAdmin();
  refrescarCatalogoPrincipal();
  if ((document.getElementById('searchInput')?.value || '').trim()) buscar();

  if (usaFirestoreAdmin && firestoreDb && !productoEsSoloLocal(id)) {
    try {
      if (esManual) {
        await withTimeout(
          firestoreDb.collection(FIRESTORE_ADMIN_COLLECTION).doc(id).update({
            imagen: imagenFinal,
            updatedAt: window.firebase.firestore.FieldValue.serverTimestamp()
          }),
          8000,
          'No se pudo sincronizar imagen con Firestore.'
        );
      } else {
        await withTimeout(
          firestoreDb.collection(FIRESTORE_OVERRIDES_COLLECTION).doc(id).set({
            imagenSet: true,
            imagen: imagenFinal,
            updatedAt: window.firebase.firestore.FieldValue.serverTimestamp(),
            updatedBy: window._authCurrentUser?.email || ''
          }, { merge: true }),
          8000,
          'No se pudo sincronizar imagen del catálogo.'
        );
      }
    } catch (err) {
      console.warn('[Admin] Imagen guardada localmente, Firestore falló:', err);
      mostrarToast('Imagen guardada localmente. Firestore no respondió.');
      renderAdminGestionList();
      return;
    }
  }

  delete adminImageCropDrafts[id];
  renderAdminGestionList();
  mostrarToast('Imagen actualizada.');
}
window.adminGuardarImagenPublicacion = adminGuardarImagenPublicacion;

async function adminEliminarImagenPublicacion(id) {
  const esManual = PRODUCTOS_ADMIN.some(function(p) { return p.id === id; });
  delete adminImageCropDrafts[id];
  delete window.IMAGENES_MAP[id];

  if (!esManual) {
    const prev = PRODUCTOS_OVERRIDES[id] || {};
    PRODUCTOS_OVERRIDES[id] = {
      ...prev,
      imagenSet: true,
      imagen: ''
    };
    guardarOverridesLocal();
  }

  guardarProductosAdmin();
  refrescarCatalogoPrincipal();
  if ((document.getElementById('searchInput')?.value || '').trim()) buscar();

  if (usaFirestoreAdmin && firestoreDb && !productoEsSoloLocal(id)) {
    try {
      if (esManual) {
        await withTimeout(
          firestoreDb.collection(FIRESTORE_ADMIN_COLLECTION).doc(id).update({
            imagen: '',
            updatedAt: window.firebase.firestore.FieldValue.serverTimestamp()
          }),
          8000,
          'No se pudo sincronizar eliminación de imagen.'
        );
      } else {
        await withTimeout(
          firestoreDb.collection(FIRESTORE_OVERRIDES_COLLECTION).doc(id).set({
            imagenSet: true,
            imagen: '',
            updatedAt: window.firebase.firestore.FieldValue.serverTimestamp(),
            updatedBy: window._authCurrentUser?.email || ''
          }, { merge: true }),
          8000,
          'No se pudo sincronizar eliminación de imagen del catálogo.'
        );
      }
    } catch (err) {
      console.warn('[Admin] Imagen eliminada localmente, Firestore falló:', err);
      mostrarToast('Imagen eliminada localmente. Firestore no respondió.');
      renderAdminGestionList();
      return;
    }
  }

  renderAdminGestionList();
  mostrarToast('Imagen eliminada.');
}
window.adminEliminarImagenPublicacion = adminEliminarImagenPublicacion;

async function adminGuardarPublicacion(id) {
  const prod = todosLosProductos().find(function(p) { return p.id === id; });
  if (!prod) return;

  const key = adminDomKey(id);
  const precio = Number(document.getElementById(`adminPrecioEdit-${key}`)?.value || 0);
  const stock = Number(document.getElementById(`adminStockEdit-${key}`)?.value || 0);
  const categoriaEdit = normalizarCategoria(document.getElementById(`adminCategoriaEdit-${key}`)?.value || prod.categoria);

  if (!Number.isFinite(precio) || precio <= 0) {
    mostrarToast('Precio inválido en la publicación.');
    return;
  }
  if (!Number.isFinite(stock) || stock < 0) {
    mostrarToast('Stock inválido en la publicación.');
    return;
  }
  if (!CATEGORIA_UI[categoriaEdit]) {
    mostrarToast('Categoría inválida en la publicación.');
    return;
  }

  prod.precio = Math.floor(precio);
  prod.stock = Math.floor(stock);
  aplicarEstiloCategoriaProducto(prod, categoriaEdit);

  const esManual = PRODUCTOS_ADMIN.some(function(p) { return p.id === id; });
  if (!esManual) {
    const prev = PRODUCTOS_OVERRIDES[id] || {};
    PRODUCTOS_OVERRIDES[id] = {
      ...prev,
      precio: prod.precio,
      stock: prod.stock,
      categoria: prod.categoria
    };
    guardarOverridesLocal();
  }

  guardarProductosAdmin();
  refrescarCatalogoPrincipal();
  const searchInput = document.getElementById('searchInput');
  if (searchInput && searchInput.value.trim()) buscar();

  if (usaFirestoreAdmin && firestoreDb && !productoEsSoloLocal(id) && esManual) {
    try {
      await withTimeout(
        firestoreDb.collection(FIRESTORE_ADMIN_COLLECTION).doc(id).update({
          precio: prod.precio,
          stock: prod.stock,
          categoria: prod.categoria,
          updatedAt: window.firebase.firestore.FieldValue.serverTimestamp()
        }),
        8000,
        'No se pudo sincronizar el cambio con Firestore.'
      );
    } catch (err) {
      console.warn('[Admin] No se pudo actualizar en Firestore:', err);
      mostrarToast('Cambio guardado localmente. Firestore no respondió.');
      return;
    }
  }

  if (usaFirestoreAdmin && firestoreDb && !esManual) {
    try {
      await withTimeout(
        firestoreDb.collection(FIRESTORE_OVERRIDES_COLLECTION).doc(id).set({
          precio: prod.precio,
          stock: prod.stock,
          categoria: prod.categoria,
          updatedAt: window.firebase.firestore.FieldValue.serverTimestamp(),
          updatedBy: window._authCurrentUser?.email || ''
        }, { merge: true }),
        8000,
        'No se pudo sincronizar override del catálogo.'
      );
    } catch (err) {
      console.warn('[Admin] Override catálogo guardado localmente; falló Firestore:', err);
      mostrarToast('Cambio guardado localmente. Firestore no respondió.');
      return;
    }
  }

  mostrarToast('Publicación actualizada.');
}
window.adminGuardarPublicacion = adminGuardarPublicacion;

async function adminRestaurarPublicacionCatalogo(id) {
  const prod = buscarProductoCatalogoPorId(id);
  const base = PRODUCTOS_BASE_ORIG[id];
  if (!prod || !base) {
    mostrarToast('No se pudo restaurar el producto seleccionado.');
    return;
  }

  prod.precio = base.precio;
  prod.stock = Number.isFinite(base.stock) ? base.stock : 0;
  aplicarEstiloCategoriaProducto(prod, base.categoria);
  if (base.imagen) window.IMAGENES_MAP[id] = base.imagen;
  else delete window.IMAGENES_MAP[id];

  delete PRODUCTOS_OVERRIDES[id];
  guardarOverridesLocal();
  guardarProductosAdmin();
  refrescarCatalogoPrincipal();
  const searchInput = document.getElementById('searchInput');
  if (searchInput && searchInput.value.trim()) buscar();

  if (usaFirestoreAdmin && firestoreDb) {
    try {
      await withTimeout(
        firestoreDb.collection(FIRESTORE_OVERRIDES_COLLECTION).doc(id).delete(),
        8000,
        'No se pudo eliminar override en Firestore.'
      );
    } catch (err) {
      console.warn('[Admin] Restauración local OK, Firestore falló:', err);
      mostrarToast('Restaurado localmente. Firestore no respondió.');
      renderAdminGestionList();
      return;
    }
  }

  renderAdminGestionList();
  mostrarToast('Producto restaurado a valores del catálogo.');
}
window.adminRestaurarPublicacionCatalogo = adminRestaurarPublicacionCatalogo;

async function adminEliminarPublicacion(id) {
  const prod = PRODUCTOS_ADMIN.find(function(p) { return p.id === id; });
  if (!prod) return;

  const ok = window.confirm(`Eliminar la publicación "${prod.nombre}"?`);
  if (!ok) return;

  const idx = PRODUCTOS_ADMIN.findIndex(function(p) { return p.id === id; });
  if (idx === -1) return;

  PRODUCTOS_ADMIN.splice(idx, 1);
  adminSeleccionados.delete(id);
  _actualizarInfoSeleccionMasivaAdmin();
  delete window.IMAGENES_MAP[id];
  adminResetGestionPage();
  guardarProductosAdmin();
  refrescarCatalogoPrincipal();
  const searchInput = document.getElementById('searchInput');
  if (searchInput && searchInput.value.trim()) buscar();

  if (usaFirestoreAdmin && firestoreDb && !productoEsSoloLocal(id)) {
    try {
      await withTimeout(
        firestoreDb.collection(FIRESTORE_ADMIN_COLLECTION).doc(id).delete(),
        8000,
        'No se pudo eliminar en Firestore.'
      );
    } catch (err) {
      console.warn('[Admin] No se pudo eliminar en Firestore:', err);
      mostrarToast('Eliminado localmente. Firestore no respondió.');
      renderAdminGestionList();
      return;
    }
  }

  renderAdminGestionList();
  mostrarToast('Publicación eliminada.');
}
window.adminEliminarPublicacion = adminEliminarPublicacion;

async function handleAltaProductoAdmin(e) {
  e.preventDefault();

  if (!usuarioAdminActivo) {
    mostrarErrorAdmin('Tu cuenta no tiene permisos de administrador.');
    return;
  }

  const nombre = document.getElementById('adminNombre')?.value.trim() || '';
  const precio = Number(document.getElementById('adminPrecio')?.value || 0);
  const stockRaw = Number(document.getElementById('adminStock')?.value);
  const stock = Number.isFinite(stockRaw) && stockRaw >= 0 ? Math.floor(stockRaw) : null;
  const categoria = normalizarCategoria(document.getElementById('adminCategoria')?.value);
  const imagen = (document.getElementById('adminImagen')?.value || '').trim();
  const archivoImagen = document.getElementById('adminImagenArchivo')?.files?.[0] || null;
  const btn = document.getElementById('btnAdminGuardar');

  if (!nombre || nombre.length < 4) {
    mostrarErrorAdmin('Ingresá un nombre de al menos 4 caracteres.');
    return;
  }
  if (!Number.isFinite(precio) || precio <= 0) {
    mostrarErrorAdmin('Ingresá un precio válido mayor a 0.');
    return;
  }
  if (!CATEGORIA_UI[categoria]) {
    mostrarErrorAdmin('Seleccioná una categoría válida.');
    return;
  }
  if (stock === null) {
    mostrarErrorAdmin('Ingresá stock válido (0 o mayor).');
    return;
  }
  if (imagen && !/^https?:\/\/.+/i.test(imagen)) {
    mostrarErrorAdmin('La imagen debe ser una URL http(s) válida.');
    return;
  }
  if (archivoImagen && !String(archivoImagen.type || '').startsWith('image/')) {
    mostrarErrorAdmin('El archivo seleccionado no es una imagen válida.');
    return;
  }

  if (btn) {
    btn.disabled = true;
    btn.textContent = 'Guardando…';
  }

  const guardadoWatchdog = setTimeout(function() {
    if (btn && btn.disabled) {
      btn.disabled = false;
      btn.textContent = 'Guardar producto';
      mostrarErrorAdmin('La operación demoró demasiado. Probá guardar sin imagen o recargá la página.');
    }
  }, 15000);

  try {
    let imagenFinal = imagen;
    try {
      imagenFinal = await withTimeout(
        obtenerImagenFinalAdmin(imagen, archivoImagen),
        12000,
        'La imagen tardó demasiado en procesarse.'
      );
    } catch (imgErr) {
      console.warn('[Admin] Imagen no disponible, se guarda sin imagen:', imgErr);
      imagenFinal = imagen || '';
    }

    const estilo = obtenerEstiloCategoria(categoria);
    const idLocal = `adm-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const producto = {
      id: idLocal,
      nombre,
      precio,
      stock,
      categoria,
      categColor: estilo.categColor,
      categText: estilo.categText,
      bgImg: estilo.bgImg,
      iconColor: estilo.iconColor,
      icon: ICONO_PRODUCTO_ADMIN,
      creadoPor: window._authCurrentUser?.email || ''
    };

    // Guardado optimista: aparece al instante incluso si Firestore está lento.
    PRODUCTOS_ADMIN.unshift(producto);
    if (imagenFinal) window.IMAGENES_MAP[idLocal] = imagenFinal;
    guardarProductosAdmin();
    refrescarCatalogoPrincipal();
    const searchInput = document.getElementById('searchInput');
    if (searchInput && searchInput.value.trim()) buscar();

    if (usaFirestoreAdmin && firestoreDb) {
      try {
        const ref = await withTimeout(
          firestoreDb.collection(FIRESTORE_ADMIN_COLLECTION).add({
            nombre,
            precio,
            stock,
            categoria,
            imagen: imagenFinal,
            creadoPor: window._authCurrentUser?.email || '',
            createdAt: window.firebase.firestore.FieldValue.serverTimestamp()
          }),
          8000,
          'Firestore no respondió a tiempo.'
        );

        const idx = PRODUCTOS_ADMIN.findIndex(function(p) { return p.id === idLocal; });
        if (idx >= 0) PRODUCTOS_ADMIN[idx].id = ref.id;
        if (imagenFinal) {
          window.IMAGENES_MAP[ref.id] = imagenFinal;
          delete window.IMAGENES_MAP[idLocal];
        }
        guardarProductosAdmin();
      } catch (syncErr) {
        console.warn('[Admin] Guardado local OK, sync Firestore falló:', syncErr);
        mostrarToast('Guardado localmente. No se pudo sincronizar con Firestore ahora.');
      }
    }

    const activeCat = document.querySelector('.cat-item--active')?.dataset?.cat;
    if (activeCat) mostrarCategoria(activeCat, activeCat);

    document.getElementById('adminForm')?.reset();
    mostrarToast('Producto cargado correctamente.');
    cerrarAdminPanel();
  } catch (err) {
    console.warn('[Admin] Error guardando producto:', err);
    mostrarErrorAdmin(err?.message || 'No se pudo guardar. Verificá permisos de Firestore/Storage.');
  } finally {
    clearTimeout(guardadoWatchdog);
    if (btn) {
      btn.disabled = false;
      btn.textContent = 'Guardar producto';
    }
  }
}
window.handleAltaProductoAdmin = handleAltaProductoAdmin;

window.actualizarEstadoAdmin = function(esAdmin, user) {
  usuarioAdminActivo = !!esAdmin;
  window._authCurrentUser = user || null;
  actualizarMenuAdmin();
  if (!usuarioAdminActivo) cerrarAdminPanel();
};

// ── Helpers ──────────────────────────────────────────────────────────────────

function formatPrecio(n) {
  return '$\u202F' + n.toLocaleString('es-AR', { minimumFractionDigits: 2 });
}

function normalizarTextoBusqueda(txt) {
  return String(txt || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

// ── Render de cards ───────────────────────────────────────────────────────────

function renderProductCard(prod) {
  const imgUrl = (window.IMAGENES_MAP && window.IMAGENES_MAP[prod.id]) || null;
  const stockDisponible = stockDisponibleProducto(prod);
  const precioBase = Number(prod.precio) || 0;
  const descuento = descuentoTotalProducto(prod);
  const precioFinal = precioFinalProducto(prod);
  const badgePromo2x1 = esProducto2x1(prod) ? '<span class="card-stock" style="background:#DBEAFE;color:#1E3A8A">Promo 2x1</span>' : '';
  const stockHtml = Number.isFinite(prod.stock)
    ? `<span class="card-stock ${stockDisponible === 0 ? 'card-stock--out' : ''}">${stockDisponible === 0 ? 'Sin stock' : `Stock: ${stockDisponible}`}</span>`
    : '';
  const precioHtml = descuento > 0 && precioFinal < precioBase
    ? `<p class="card-price"><span class="card-price-old">${formatPrecio(precioBase)}</span><span class="card-price-new">${formatPrecio(precioFinal)}</span></p>`
    : `<p class="card-price">${formatPrecio(precioFinal)}</p>`;
  const cardBg      = imgUrl ? 'background:#fff;border-bottom:1px solid #eee' : `background:${prod.bgImg}`;
  const cardContent = imgUrl
    ? `<img src="${imgUrl}" alt="${prod.nombre}" class="card-foto" loading="lazy" onerror="this.closest('.card-img').classList.add('card-img--fallback');this.remove()">`
    : `<span style="color:${prod.iconColor}">${prod.icon}</span>`;
  return `
    <article class="product-card" data-id="${prod.id}">
      <div class="card-img" style="${cardBg}">
        ${cardContent}
      </div>
      <div class="card-body">
        <span class="card-badge" style="background:${prod.categColor};color:${prod.categText}">${prod.categoria}</span>
        ${stockHtml}
        ${badgePromo2x1}
        <p class="card-name">${prod.nombre}</p>
        ${precioHtml}
        <div class="qty-row">
          <button class="qty-btn" onclick="cambiarCantidad('${prod.id}', -1)">−</button>
          <span class="qty-value" id="qty-${prod.id}" data-qty-id="${prod.id}">1</span>
          <button class="qty-btn" onclick="cambiarCantidad('${prod.id}', 1)">+</button>
        </div>
        <button class="add-btn" onclick="agregarAlCarrito('${prod.id}')" ${stockDisponible === 0 ? 'disabled' : ''}>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>
          ${stockDisponible === 0 ? 'SIN STOCK' : 'AGREGAR'}
        </button>
      </div>
    </article>
  `;
}

function renderGrid(productos, gridId) {
  const el = document.getElementById(gridId);
  if (!el) return;
  el.innerHTML = productos.map(renderProductCard).join('');
}

// ── Cantidades locales ────────────────────────────────────────────────────────

const cantidades = {};

function actualizarQtyEnVista(id, valor) {
  document.querySelectorAll('.qty-value').forEach(function(el) {
    if (el.dataset && el.dataset.qtyId === id) el.textContent = valor;
  });
}

function cambiarCantidad(id, delta) {
  if (cantidades[id] === undefined) cantidades[id] = 1;
  cantidades[id] = Math.max(1, cantidades[id] + delta);
  actualizarQtyEnVista(id, cantidades[id]);
}

// ── Carrito ───────────────────────────────────────────────────────────────────

let carrito = [];

function cargarCarrito() {
  try {
    const saved = localStorage.getItem('carocruz_carrito');
    carrito = saved ? JSON.parse(saved) : [];
  } catch {
    carrito = [];
  }
}

function guardarCarrito() {
  localStorage.setItem('carocruz_carrito', JSON.stringify(carrito));
}

function todosLosProductos() {
  const listas = [PRODUCTOS_NOVEDADES, PRODUCTOS_OFERTAS, PRODUCTOS_ADMIN];
  if (typeof PRODUCTOS_GASTRONOMICO !== 'undefined') listas.push(PRODUCTOS_GASTRONOMICO);
  if (typeof PRODUCTOS_ESCOLAR      !== 'undefined') listas.push(PRODUCTOS_ESCOLAR);
  if (typeof PRODUCTOS_LIBRERIA     !== 'undefined') listas.push(PRODUCTOS_LIBRERIA);
  if (typeof PRODUCTOS_LIMPIEZA     !== 'undefined') listas.push(PRODUCTOS_LIMPIEZA);
  if (typeof PRODUCTOS_DESCARTABLES !== 'undefined') listas.push(PRODUCTOS_DESCARTABLES);
  if (typeof PRODUCTOS_EMBALAJE     !== 'undefined') listas.push(PRODUCTOS_EMBALAJE);
  if (typeof PRODUCTOS_CAJAS        !== 'undefined') listas.push(PRODUCTOS_CAJAS);
  if (typeof PRODUCTOS_BOLSAS       !== 'undefined') listas.push(PRODUCTOS_BOLSAS);
  return listas.flat();
}

function agregarAlCarrito(id) {
  const cantidad = cantidades[id] || 1;
  if (cantidad === 0) {
    mostrarToast('Seleccioná una cantidad primero');
    return;
  }

  const prod = todosLosProductos().find(p => p.id === id);
  if (!prod) return;

  const disponible = stockDisponibleProducto(prod);
  const yaEnCarrito = cantidadEnCarrito(id);
  if (disponible !== Infinity && (yaEnCarrito + cantidad) > disponible) {
    const restante = Math.max(0, disponible - yaEnCarrito);
    mostrarToast(restante > 0 ? `Solo quedan ${restante} unidades disponibles.` : 'No hay más stock disponible.');
    return;
  }

  const existente = carrito.find(i => i.id === id);
  if (existente) {
    existente.precio = precioFinalProducto(prod);
    existente.cantidad += cantidad;
  } else {
    carrito.push({
      id: prod.id,
      nombre: prod.nombre,
      precio: precioFinalProducto(prod),
      bgImg: prod.bgImg,
      iconColor: prod.iconColor,
      icon: prod.icon,
      cantidad
    });
  }

  cantidades[id] = 1;
  actualizarQtyEnVista(id, '1');

  guardarCarrito();
  actualizarUI();
  mostrarToast(`"${prod.nombre.substring(0, 30)}…" agregado al carrito`);
}

function quitarDelCarrito(id) {
  carrito = carrito.filter(i => i.id !== id);
  guardarCarrito();
  actualizarUI();
}

function cambiarCantidadCarrito(id, delta) {
  const item = carrito.find(i => i.id === id);
  if (!item) return;

  const prod = todosLosProductos().find(p => p.id === id);
  const disponible = prod ? stockDisponibleProducto(prod) : Infinity;
  const siguiente = Math.max(1, item.cantidad + delta);

  if (disponible !== Infinity && siguiente > disponible) {
    mostrarToast(`Stock máximo para este producto: ${disponible}.`);
    return;
  }

  item.cantidad = siguiente;
  guardarCarrito();
  actualizarUI();
}

function vaciarCarrito() {
  carrito = [];
  guardarCarrito();
  actualizarUI();
}

function calcularTotal() {
  return carrito.reduce((sum, i) => sum + subtotalItemCarrito(i), 0);
}

function actualizarUI() {
  const total = calcularTotal();
  const count = carrito.reduce((s, i) => s + i.cantidad, 0);
  const MIN   = minimoCompraActual();

  // Badge header
  const badge = document.getElementById('cartCount');
  if (badge) {
    badge.textContent = count;
    badge.classList.toggle('hidden', count === 0);
  }

  // Total y cantidad
  const totalEl   = document.getElementById('cartTotal');
  const countEl   = document.getElementById('cartItemsCount');
  if (totalEl) totalEl.textContent = formatPrecio(total);
  if (countEl) countEl.textContent = count === 1 ? '1 producto' : `${count} productos`;

  // Botón vaciar
  const btnVaciar = document.getElementById('btnVaciarCarrito');
  if (btnVaciar) btnVaciar.style.display = carrito.length > 0 ? 'inline-flex' : 'none';

  // Progress bar
  const pct     = Math.min(100, (total / MIN) * 100);
  const bar     = document.getElementById('cartProgressBar');
  const barText = document.getElementById('cartProgressText');
  if (bar) {
    bar.style.width      = pct + '%';
    bar.style.background = pct >= 100 ? '#22C55E' : 'var(--orange)';
  }
  if (barText) {
    if (pct >= 100) {
      barText.textContent = '¡Llegaste al mínimo de compra! ✓';
      barText.style.color = '#22C55E';
    } else if (total === 0) {
      barText.textContent = `Compra mínima ${formatearMontoSinDecimales(MIN)}`;
      barText.style.color = '';
    } else {
      barText.textContent = `Te faltan ${formatPrecio(MIN - total)} para el mínimo`;
      barText.style.color = '';
    }
  }

  // Items
  const itemsEl = document.getElementById('cartItems');
  if (!itemsEl) return;

  if (carrito.length === 0) {
    itemsEl.innerHTML = `
      <div class="cart-empty">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>
        <p>Tu carrito está vacío</p>
      </div>
    `;
    return;
  }

  itemsEl.innerHTML = carrito.map(function(item) {
    const precioUnit = precioVigenteItemCarrito(item);
    const tiene2x1 = esProducto2x1(item.id);
    const subtotal = subtotalItemCarrito(item);
    return `
    <div class="cart-item">
      <div class="cart-item-top">
        <div class="cart-item-icon" style="background:${item.bgImg}">
          <span style="color:${item.iconColor}">${item.icon}</span>
        </div>
        <div class="cart-item-info">
          <p class="cart-item-name">${item.nombre}</p>
          <p class="cart-item-unit-price">${formatPrecio(precioUnit)} c/u ${tiene2x1 ? '· 2x1 activo' : ''}</p>
        </div>
        <button class="cart-item-remove" onclick="quitarDelCarrito('${item.id}')" aria-label="Eliminar">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
        </button>
      </div>
      <div class="cart-item-bottom">
        <div class="cart-qty-row">
          <button class="cart-qty-btn" onclick="cambiarCantidadCarrito('${item.id}', -1)">−</button>
          <span class="cart-qty-value">${item.cantidad}</span>
          <button class="cart-qty-btn" onclick="cambiarCantidadCarrito('${item.id}', 1)">+</button>
        </div>
        <p class="cart-item-subtotal">${formatPrecio(subtotal)}</p>
      </div>
    </div>
  `;
  }).join('');
}

// ── Toggle carrito ────────────────────────────────────────────────────────────

function toggleCart() {
  const panel   = document.getElementById('cartPanel');
  const overlay = document.getElementById('cartOverlay');
  const open    = panel.classList.toggle('open');
  overlay.classList.toggle('hidden', !open);
  document.body.style.overflow = open ? 'hidden' : '';
}

// ── Finalizar compra ──────────────────────────────────────────────────────────

function finalizarCompra() {
  const total = calcularTotal();
  const MIN   = minimoCompraActual();

  if (carrito.length === 0) {
    mostrarToast('Tu carrito está vacío');
    return;
  }
  if (total < MIN) {
    mostrarToast(`El pedido mínimo es ${formatPrecio(MIN)}. Te faltan ${formatPrecio(MIN - total)}.`);
    return;
  }

  // Arma mensaje para WhatsApp
  const lineas = carrito.map(function(i) {
    const precioUnit = precioVigenteItemCarrito(i);
    const subtotal = subtotalItemCarrito(i);
    const extra = esProducto2x1(i.id) ? ' (2x1)' : '';
    return `• ${i.nombre} x${i.cantidad}${extra} = ${formatPrecio(subtotal)}`;
  });
  const msg = encodeURIComponent(
    `¡Hola! Quiero hacer el siguiente pedido:\n\n${lineas.join('\n')}\n\nTOTAL: ${formatPrecio(total)}`
  );
  window.open(`https://wa.me/5491100000000?text=${msg}`, '_blank');
}

// ── Navegación por categorías ────────────────────────────────────────────────

const _HOME_IDS = ['heroSection', 'benefitsSection', 'novedades', 'ofertas', 'lista-mayorista', 'faq'];
const _CAT_FAVS_STORAGE_KEY = 'carocruz_cat_favoritas';
const _CAT_RECENTS_STORAGE_KEY = 'carocruz_cat_recientes';

let _catFavoritas = [];
let _catRecientes = [];

function _esMobileViewport() {
  return window.matchMedia('(max-width: 640px)').matches;
}

function _normalizarCategoriaClave(cat) {
  return String(cat || '').trim().toUpperCase();
}

function _cargarPreferenciasCategorias() {
  try {
    const favsRaw = JSON.parse(localStorage.getItem(_CAT_FAVS_STORAGE_KEY) || '[]');
    _catFavoritas = Array.isArray(favsRaw) ? favsRaw.map(_normalizarCategoriaClave) : [];
  } catch {
    _catFavoritas = [];
  }
  try {
    const recentRaw = JSON.parse(localStorage.getItem(_CAT_RECENTS_STORAGE_KEY) || '[]');
    _catRecientes = Array.isArray(recentRaw) ? recentRaw.map(_normalizarCategoriaClave) : [];
  } catch {
    _catRecientes = [];
  }
}

function _guardarPreferenciasCategorias() {
  localStorage.setItem(_CAT_FAVS_STORAGE_KEY, JSON.stringify(_catFavoritas));
  localStorage.setItem(_CAT_RECENTS_STORAGE_KEY, JSON.stringify(_catRecientes));
}

function _mapaTituloCategorias() {
  const map = {};
  document.querySelectorAll('.cat-item[data-cat]').forEach((el) => {
    const key = _normalizarCategoriaClave(el.dataset.cat);
    if (!map[key]) map[key] = String(el.textContent || '').trim();
  });
  return map;
}

function _renderFavoritasMobile() {
  const wrap = document.getElementById('catFavsWrap');
  const list = document.getElementById('catFavList');
  if (!wrap || !list) return;

  if (_catFavoritas.length === 0) {
    wrap.style.display = 'none';
    list.innerHTML = '';
    return;
  }

  const titulos = _mapaTituloCategorias();
  wrap.style.display = '';
  list.innerHTML = _catFavoritas
    .map((cat) => {
      const texto = titulos[cat] || cat;
      return `<button type="button" class="cat-fav-chip" onclick="mostrarCategoria('${cat}','${texto}');return false;">${texto}</button>`;
    })
    .join('');
}

function _actualizarBotonesFavorita() {
  document.querySelectorAll('.cat-fav-btn[data-cat]').forEach((btn) => {
    const cat = _normalizarCategoriaClave(btn.dataset.cat);
    btn.classList.toggle('cat-fav-btn--active', _catFavoritas.includes(cat));
  });
}

function _aplicarOrdenRecientesMobile() {
  const entries = [...document.querySelectorAll('.cat-entry[data-cat]')];
  if (!entries.length) return;

  if (!_esMobileViewport()) {
    entries.forEach((entry) => {
      entry.style.order = '';
      entry.classList.remove('cat-entry--recent');
    });
    return;
  }

  entries.forEach((entry, idx) => {
    const cat = _normalizarCategoriaClave(entry.dataset.cat);
    const recentIndex = _catRecientes.indexOf(cat);
    entry.style.order = recentIndex >= 0 ? String(recentIndex) : String(100 + idx);
    entry.classList.toggle('cat-entry--recent', recentIndex >= 0);
  });
}

function _registrarUsoCategoria(cat) {
  const key = _normalizarCategoriaClave(cat);
  if (!key) return;
  _catRecientes = [key].concat(_catRecientes.filter((c) => c !== key)).slice(0, 6);
  _guardarPreferenciasCategorias();
  _aplicarOrdenRecientesMobile();
}

function toggleCategoriaFavorita(cat) {
  const key = _normalizarCategoriaClave(cat);
  if (!key) return;

  if (_catFavoritas.includes(key)) {
    _catFavoritas = _catFavoritas.filter((c) => c !== key);
  } else {
    _catFavoritas = _catFavoritas.concat(key).slice(0, 6);
  }

  _guardarPreferenciasCategorias();
  _actualizarBotonesFavorita();
  _renderFavoritasMobile();
}

function toggleMobileCatMenu(forceOpen) {
  const nav = document.getElementById('catNav');
  const btn = document.getElementById('catMenuToggle');
  if (!nav || !btn) return;

  if (!_esMobileViewport()) {
    nav.classList.remove('cat-nav--open');
    btn.setAttribute('aria-expanded', 'false');
    return;
  }

  const nextState = typeof forceOpen === 'boolean'
    ? forceOpen
    : !nav.classList.contains('cat-nav--open');

  nav.classList.toggle('cat-nav--open', nextState);
  btn.setAttribute('aria-expanded', nextState ? 'true' : 'false');
}

function cerrarMobileCatMenu() {
  toggleMobileCatMenu(false);
}

// Estado del catálogo filtrado
let _productosCategoriaActual = [];
let _modoVistaActual = null; // 'categoria' | 'busqueda'
let _catalogPageActual = 1;
const CATALOG_PAGE_SIZE = 30;

function _resetPaginaCatalogo() {
  _catalogPageActual = 1;
}

function _actualizarPaginacionCatalogo(totalItems, totalPages) {
  const wrap = document.getElementById('catalogPagination');
  const info = document.getElementById('catalogPageInfo');
  if (!wrap || !info) return;

  if (totalItems <= CATALOG_PAGE_SIZE) {
    wrap.classList.add('hidden');
    return;
  }

  wrap.classList.remove('hidden');
  info.textContent = `Página ${_catalogPageActual} de ${totalPages} (${totalItems} productos)`;

  const buttons = wrap.querySelectorAll('button');
  if (buttons[0]) buttons[0].disabled = _catalogPageActual <= 1;
  if (buttons[1]) buttons[1].disabled = _catalogPageActual >= totalPages;
}

function cambiarPaginaCatalogo(delta) {
  const step = Number(delta) || 0;
  if (!step) return;
  _catalogPageActual = Math.max(1, _catalogPageActual + step);
  aplicarOrdenYFiltro(true);
  document.getElementById('categoriaView')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
}
window.cambiarPaginaCatalogo = cambiarPaginaCatalogo;

function _resetFiltros() {
  const orden = document.getElementById('ordenarPor');
  const catF  = document.getElementById('filtroCategoria');
  const stock = document.getElementById('filtroConStock');
  if (orden) orden.value = '';
  if (catF)  catF.value = '';
  if (stock) stock.checked = false;
  _actualizarBotonLimpiar();
}

function _actualizarBotonLimpiar() {
  const orden = document.getElementById('ordenarPor');
  const catF  = document.getElementById('filtroCategoria');
  const stock = document.getElementById('filtroConStock');
  const btn   = document.getElementById('filtroBtnLimpiar');
  if (!btn) return;
  const activo = (orden && orden.value) || (catF && catF.value) || (stock && stock.checked);
  btn.style.display = activo ? '' : 'none';
}

function aplicarOrdenYFiltro(keepPage) {
  let prods = [..._productosCategoriaActual];

  if (!keepPage) _resetPaginaCatalogo();

  // Filtro por categoría (solo en búsqueda)
  const catF = document.getElementById('filtroCategoria');
  if (catF && catF.value) {
    prods = prods.filter(p => p.categoria === catF.value);
  }

  // Filtro por stock
  const stockEl = document.getElementById('filtroConStock');
  if (stockEl && stockEl.checked) {
    prods = prods.filter(p => stockDisponibleProducto(p) > 0);
  }

  // Ordenamiento
  const ordenEl = document.getElementById('ordenarPor');
  const orden = ordenEl ? ordenEl.value : '';
  if (orden === 'precio-asc')   prods.sort((a, b) => precioFinalProducto(a) - precioFinalProducto(b));
  else if (orden === 'precio-desc') prods.sort((a, b) => precioFinalProducto(b) - precioFinalProducto(a));
  else if (orden === 'nombre-asc')  prods.sort((a, b) => a.nombre.localeCompare(b.nombre, 'es'));
  else if (orden === 'nombre-desc') prods.sort((a, b) => b.nombre.localeCompare(a.nombre, 'es'));

  // Actualizar conteo
  const catCount = document.getElementById('categoriaConteo');
  if (catCount) {
    catCount.textContent = prods.length + ' producto' + (prods.length !== 1 ? 's' : '');
  }

  const totalPages = Math.max(1, Math.ceil(prods.length / CATALOG_PAGE_SIZE));
  _catalogPageActual = Math.min(totalPages, Math.max(1, _catalogPageActual));
  const start = (_catalogPageActual - 1) * CATALOG_PAGE_SIZE;
  const pageItems = prods.slice(start, start + CATALOG_PAGE_SIZE);

  // Renderizar
  const grid = document.getElementById('categoriaGrid');
  if (prods.length === 0) {
    if (grid) grid.innerHTML = `<p style="color:#6B7280;grid-column:1/-1;padding:24px 0">No hay productos que coincidan con los filtros aplicados.</p>`;
    _actualizarPaginacionCatalogo(0, 1);
  } else {
    renderGrid(pageItems, 'categoriaGrid');
    _actualizarPaginacionCatalogo(prods.length, totalPages);
  }

  _aplicarZoomGrid();
  _actualizarBotonLimpiar();
}

function limpiarFiltros() {
  _resetFiltros();
  aplicarOrdenYFiltro();
}

// ── Zoom de grilla ────────────────────────────────────────────────────────────

const _ZOOM_STORAGE_KEY = 'carocruz_zoom_grid';
let _zoomActual = localStorage.getItem(_ZOOM_STORAGE_KEY) || 'normal';

function setZoomGrid(modo) {
  _zoomActual = modo;
  localStorage.setItem(_ZOOM_STORAGE_KEY, modo);
  _aplicarZoomGrid();
}

function _aplicarZoomGrid() {
  const grid = document.getElementById('categoriaGrid');
  if (grid) {
    grid.classList.remove('products-grid--compacto', 'products-grid--normal', 'products-grid--grande');
    if (_zoomActual === 'compacto') grid.classList.add('products-grid--compacto');
    else if (_zoomActual === 'normal') grid.classList.add('products-grid--normal');
    else if (_zoomActual === 'grande') grid.classList.add('products-grid--grande');
  }

  ['Compacto', 'Normal', 'Grande'].forEach(nombre => {
    const btn = document.getElementById('zoomBtn' + nombre);
    if (btn) btn.classList.toggle('zoom-btn--active', _zoomActual === nombre.toLowerCase());
  });
}

function mostrarCategoria(cat, titulo) {
  cerrarMobileCatMenu();
  _registrarUsoCategoria(cat);

  const catNorm = normalizarCategoria(cat);

  _HOME_IDS.forEach(id => {
    const el = document.getElementById(id);
    if (el) el.style.display = 'none';
  });

  const catView  = document.getElementById('categoriaView');
  const catTitle = document.getElementById('categoriaTitulo');
  if (!catView) return;

  catView.style.display = '';
  if (catTitle) catTitle.textContent = (titulo || cat).toUpperCase();

  // Ocultar filtro de categoría (ya estamos en una)
  const filtroCatWrap = document.getElementById('filtroCategoriaWrap');
  if (filtroCatWrap) filtroCatWrap.style.display = 'none';

  // Guardar lista base y resetear filtros
  _productosCategoriaActual = catNorm === 'NOVEDADES'
    ? productosNovedadesVisibles().slice()
    : todosLosProductos().filter(p => normalizarCategoria(p.categoria) === catNorm);
  _modoVistaActual = 'categoria';
  _resetFiltros();
  _resetPaginaCatalogo();

  if (_productosCategoriaActual.length === 0) {
    const catCount = document.getElementById('categoriaConteo');
    if (catCount) catCount.textContent = '';
    const grid = document.getElementById('categoriaGrid');
    if (grid) grid.innerHTML = `<p style="color:#6B7280;grid-column:1/-1;padding:24px 0">Cargando productos de esta categoría…</p>`;
  } else {
    aplicarOrdenYFiltro();
  }

  window.scrollTo({ top: 0, behavior: 'smooth' });
  document.querySelectorAll('.cat-item').forEach(el => {
    el.classList.toggle('cat-item--active', normalizarCategoria(el.dataset.cat || '') === catNorm);
  });
}

function _obtenerOffsetNavegacion() {
  const header = document.querySelector('.header');
  const catNav = document.querySelector('.cat-nav');
  const headerH = header ? Math.ceil(header.getBoundingClientRect().height) : 0;
  const navH = catNav ? Math.ceil(catNav.getBoundingClientRect().height) : 0;
  return headerH + navH + 10;
}

function _scrollASeccionConOffset(targetId) {
  const target = document.getElementById(targetId);
  if (!target) {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    return;
  }
  const offset = _obtenerOffsetNavegacion();
  const y = Math.max(0, window.scrollY + target.getBoundingClientRect().top - offset);
  window.scrollTo({ top: y, behavior: 'smooth' });
}

function volverAlHome(scrollTo) {
  cerrarMobileCatMenu();

  const catView = document.getElementById('categoriaView');
  if (catView) catView.style.display = 'none';

  _HOME_IDS.forEach(id => {
    const el = document.getElementById(id);
    if (el) el.style.display = '';
  });

  const pag = document.getElementById('catalogPagination');
  if (pag) pag.classList.add('hidden');

  document.querySelectorAll('.cat-item').forEach(el => el.classList.remove('cat-item--active'));

  if (scrollTo) {
    setTimeout(() => _scrollASeccionConOffset(scrollTo), 50);
  } else {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}

// ── Búsqueda ─────────────────────────────────────────────────────────────────

function buscar() {
  cerrarMobileCatMenu();

  const qRaw = document.getElementById('searchInput').value;
  const q = normalizarTextoBusqueda(qRaw);
  if (!q) return;

  const results = todosLosProductos().filter(function(p) {
    const nombre = normalizarTextoBusqueda(p.nombre);
    const categoria = normalizarTextoBusqueda(p.categoria);
    return nombre.includes(q) || categoria.includes(q);
  });

  _HOME_IDS.forEach(id => {
    const el = document.getElementById(id);
    if (el) el.style.display = 'none';
  });

  const catView  = document.getElementById('categoriaView');
  const catTitle = document.getElementById('categoriaTitulo');
  if (catView)  catView.style.display = '';
  if (catTitle) catTitle.textContent = `RESULTADOS: "${String(qRaw || '').trim().toUpperCase()}"`;

  // Mostrar filtro de categoría si hay resultados de múltiples categorías
  const categorias = [...new Set(results.map(p => p.categoria))].sort();
  const filtroCatWrap = document.getElementById('filtroCategoriaWrap');
  const filtroCatSel  = document.getElementById('filtroCategoria');
  if (filtroCatWrap && filtroCatSel) {
    if (categorias.length > 1) {
      filtroCatSel.innerHTML = '<option value="">Todas</option>' +
        categorias.map(c => `<option value="${c}">${c.charAt(0) + c.slice(1).toLowerCase()}</option>`).join('');
      filtroCatWrap.style.display = '';
    } else {
      filtroCatWrap.style.display = 'none';
    }
  }

  // Guardar lista base y resetear filtros
  _productosCategoriaActual = results;
  _modoVistaActual = 'busqueda';
  _resetFiltros();
  _resetPaginaCatalogo();

  if (results.length === 0) {
    const catCount = document.getElementById('categoriaConteo');
    const grid = document.getElementById('categoriaGrid');
    if (catCount) catCount.textContent = 'sin resultados';
    if (grid) grid.innerHTML = `<p style="color:#6B7280;grid-column:1/-1;padding:24px 0">No se encontraron productos para "<strong>${String(qRaw || '').trim()}</strong>".</p>`;
  } else {
    aplicarOrdenYFiltro();
  }

  window.scrollTo({ top: 0, behavior: 'smooth' });
  document.querySelectorAll('.cat-item').forEach(el => el.classList.remove('cat-item--active'));
}

// ── Toast ─────────────────────────────────────────────────────────────────────

function mostrarToast(msg) {
  let toast = document.getElementById('toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'toast';
    toast.style.cssText = `
      position:fixed; bottom:24px; left:50%; transform:translateX(-50%);
      background:#1B3A6B; color:#fff; padding:12px 24px; border-radius:8px;
      font-size:13px; font-weight:600; z-index:9999; box-shadow:0 4px 16px rgba(0,0,0,.2);
      transition:opacity .3s ease; max-width:90vw; text-align:center;
    `;
    document.body.appendChild(toast);
  }
  toast.textContent = msg;
  toast.style.opacity = '1';
  clearTimeout(toast._timer);
  toast._timer = setTimeout(() => { toast.style.opacity = '0'; }, 3000);
}

function inicializarFaqAcordeonEstricto() {
  const items = Array.from(document.querySelectorAll('#faq .faq-item'));
  if (!items.length) return;

  // Si ninguna pregunta está abierta, abrimos la primera por defecto.
  if (!items.some(function(item) { return item.hasAttribute('open'); })) {
    items[0].setAttribute('open', 'open');
  }

  items.forEach(function(item) {
    item.addEventListener('toggle', function() {
      if (!item.open) return;
      items.forEach(function(other) {
        if (other !== item && other.open) other.removeAttribute('open');
      });
    });
  });
}

function scrollToTop() {
  window.scrollTo({ top: 0, behavior: 'smooth' });
}
window.scrollToTop = scrollToTop;

function inicializarBotonVolverArriba() {
  const btn = document.getElementById('backToTopBtn');
  if (!btn) return;

  const onScroll = function() {
    btn.classList.toggle('back-to-top--visible', window.scrollY > 480);
  };

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
}

// ── Enter en buscador ─────────────────────────────────────────────────────────

document.addEventListener('DOMContentLoaded', () => {
  capturarBaseCatalogoOriginal();
  cargarOverridesLocal();
  aplicarOverridesCatalogo();
  cargarConfigComercialLocal();
  aplicarConfigComercialUI();
  inicializarStorageAdmin();
  usaFirestoreAdmin = inicializarFirestoreAdmin();
  cargarProductosAdmin();
  refrescarCatalogoPrincipal();
  cargarCarrito();
  actualizarUI();
  actualizarMenuAdmin();
  _aplicarZoomGrid();
  inicializarFaqAcordeonEstricto();

  document.getElementById('searchInput')?.addEventListener('keydown', e => {
    if (e.key === 'Enter') buscar();
  });

  document.getElementById('adminHeroBannerUrl')?.addEventListener('input', actualizarPreviewHeroBannerAdmin);
  document.getElementById('adminHeroBannerArchivo')?.addEventListener('change', actualizarPreviewHeroBannerAdmin);

  _cargarPreferenciasCategorias();
  _actualizarBotonesFavorita();
  _renderFavoritasMobile();
  _aplicarOrdenRecientesMobile();
  inicializarBotonVolverArriba();

  window.addEventListener('resize', () => {
    if (!_esMobileViewport()) cerrarMobileCatMenu();
    _aplicarOrdenRecientesMobile();
  });

  document.addEventListener('click', (e) => {
    if (!_esMobileViewport()) return;
    const nav = document.getElementById('catNav');
    if (!nav) return;
    if (!nav.contains(e.target)) cerrarMobileCatMenu();
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      cerrarMobileCatMenu();
      cerrarAdminImageZoom();
    }
  });
});
