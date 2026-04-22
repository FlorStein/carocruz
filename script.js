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
const FIRESTORE_ADMIN_COLLECTION = 'productos_admin';
const PRODUCTOS_ADMIN = [];

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
let usaFirestoreAdmin = false;
let firebaseStorageRef = null;

function normalizarCategoria(categoria) {
  return String(categoria || '').trim().toUpperCase();
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

function comprimirImagenADataUrl(file) {
  return new Promise(function(resolve, reject) {
    const fr = new FileReader();
    fr.onerror = function() { reject(new Error('No se pudo leer el archivo')); };
    fr.onload = function(ev) {
      const img = new Image();
      img.onload = function() {
        const maxLado = 1280;
        const scale = Math.min(1, maxLado / Math.max(img.width, img.height));
        const w = Math.max(1, Math.round(img.width * scale));
        const h = Math.max(1, Math.round(img.height * scale));
        const canvas = document.createElement('canvas');
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('No se pudo procesar la imagen'));
          return;
        }
        ctx.drawImage(img, 0, 0, w, h);
        resolve(canvas.toDataURL('image/jpeg', 0.82));
      };
      img.onerror = function() { reject(new Error('El archivo no es una imagen válida')); };
      img.src = ev.target.result;
    };
    fr.readAsDataURL(file);
  });
}

async function obtenerImagenFinalAdmin(imagenUrl, archivo) {
  if (archivo) {
    if (firebaseStorageRef && window._authCurrentUser) {
      try {
        const safeName = archivo.name.replace(/[^a-zA-Z0-9._-]/g, '_');
        const ruta = `productos-admin/${Date.now()}-${safeName}`;
        const task = await withTimeout(
          firebaseStorageRef.ref(ruta).put(archivo, { contentType: archivo.type || 'image/jpeg' }),
          15000,
          'La subida de imagen tardó demasiado.'
        );
        return withTimeout(task.ref.getDownloadURL(), 8000, 'No se pudo obtener la URL de la imagen.');
      } catch (err) {
        console.warn('[Admin] Fallback imagen local por error de Storage:', err);
      }
    }
    return comprimirImagenADataUrl(archivo);
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

    return true;
  } catch (err) {
    console.warn('[Admin] Firestore no disponible:', err);
    return false;
  }
}

function actualizarMenuAdmin() {
  const adminMenu = document.getElementById('adminMenuItem');
  if (!adminMenu) return;
  adminMenu.style.display = usuarioAdminActivo ? 'flex' : 'none';
}

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
  renderAdminGestionList();
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

function productoEsSoloLocal(id) {
  return String(id || '').startsWith('adm-');
}

let adminGestionPaginaActual = 1;
const ADMIN_GESTION_PAGE_SIZE = 6;

function adminResetGestionPage() {
  adminGestionPaginaActual = 1;
}
window.adminResetGestionPage = adminResetGestionPage;

function adminCambiarPagina(delta) {
  adminGestionPaginaActual = Math.max(1, adminGestionPaginaActual + delta);
  renderAdminGestionList();
}
window.adminCambiarPagina = adminCambiarPagina;

function renderAdminGestionList() {
  const list = document.getElementById('adminGestionList');
  if (!list) return;
  const pageInfo = document.getElementById('adminGestionPageInfo');

  const q = normalizarTextoBusqueda(document.getElementById('adminGestionBuscar')?.value || '');
  const filtroEstado = String(document.getElementById('adminGestionEstado')?.value || 'TODOS');
  const filtroCategoria = String(document.getElementById('adminGestionCategoria')?.value || 'TODAS');
  const umbralRaw = Number(document.getElementById('adminGestionUmbral')?.value || 10);
  const umbral = Number.isFinite(umbralRaw) && umbralRaw > 0 ? Math.floor(umbralRaw) : 10;

  const productos = PRODUCTOS_ADMIN
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

  const totalPages = Math.max(1, Math.ceil(productos.length / ADMIN_GESTION_PAGE_SIZE));
  adminGestionPaginaActual = Math.min(totalPages, Math.max(1, adminGestionPaginaActual));
  const start = (adminGestionPaginaActual - 1) * ADMIN_GESTION_PAGE_SIZE;
  const productosPage = productos.slice(start, start + ADMIN_GESTION_PAGE_SIZE);

  if (pageInfo) {
    pageInfo.textContent = `Página ${adminGestionPaginaActual} de ${totalPages} (${productos.length} publicaciones)`;
  }

  if (productos.length === 0) {
    list.innerHTML = '<div class="admin-gestion-empty">No hay publicaciones para el filtro actual.</div>';
    return;
  }

  list.innerHTML = productosPage.map(function(p) {
    const k = adminDomKey(p.id);
    return `
      <article class="admin-item">
        <div class="admin-item-head">
          <div>
            <p class="admin-item-title">${escapeHtml(p.nombre)}</p>
            <p class="admin-item-cat">${escapeHtml(p.categoria)}</p>
          </div>
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
        </div>
        <div class="admin-item-actions">
          <button type="button" class="admin-item-btn" onclick="adminAjustarStock('${p.id.replace(/'/g, "\\'")}', -1)">-1 stock</button>
          <button type="button" class="admin-item-btn" onclick="adminAjustarStock('${p.id.replace(/'/g, "\\'")}', 1)">+1 stock</button>
          <button type="button" class="admin-item-btn admin-item-btn--primary" onclick="adminGuardarPublicacion('${p.id.replace(/'/g, "\\'")}')">Guardar cambios</button>
          <button type="button" class="admin-item-btn admin-item-btn--danger" onclick="adminEliminarPublicacion('${p.id.replace(/'/g, "\\'")}')">Eliminar</button>
        </div>
      </article>
    `;
  }).join('');
}
window.renderAdminGestionList = renderAdminGestionList;

function adminAjustarStock(id, delta) {
  const key = adminDomKey(id);
  const input = document.getElementById(`adminStockEdit-${key}`);
  if (!input) return;
  const actual = Number(input.value || 0);
  input.value = String(Math.max(0, Math.floor(actual + delta)));
}
window.adminAjustarStock = adminAjustarStock;

async function adminGuardarPublicacion(id) {
  const prod = PRODUCTOS_ADMIN.find(function(p) { return p.id === id; });
  if (!prod) return;

  const key = adminDomKey(id);
  const precio = Number(document.getElementById(`adminPrecioEdit-${key}`)?.value || 0);
  const stock = Number(document.getElementById(`adminStockEdit-${key}`)?.value || 0);

  if (!Number.isFinite(precio) || precio <= 0) {
    mostrarToast('Precio inválido en la publicación.');
    return;
  }
  if (!Number.isFinite(stock) || stock < 0) {
    mostrarToast('Stock inválido en la publicación.');
    return;
  }

  prod.precio = Math.floor(precio);
  prod.stock = Math.floor(stock);
  guardarProductosAdmin();
  refrescarCatalogoPrincipal();
  const searchInput = document.getElementById('searchInput');
  if (searchInput && searchInput.value.trim()) buscar();

  if (usaFirestoreAdmin && firestoreDb && !productoEsSoloLocal(id)) {
    try {
      await withTimeout(
        firestoreDb.collection(FIRESTORE_ADMIN_COLLECTION).doc(id).update({
          precio: prod.precio,
          stock: prod.stock,
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

  mostrarToast('Publicación actualizada.');
}
window.adminGuardarPublicacion = adminGuardarPublicacion;

async function adminEliminarPublicacion(id) {
  const prod = PRODUCTOS_ADMIN.find(function(p) { return p.id === id; });
  if (!prod) return;

  const ok = window.confirm(`Eliminar la publicación "${prod.nombre}"?`);
  if (!ok) return;

  const idx = PRODUCTOS_ADMIN.findIndex(function(p) { return p.id === id; });
  if (idx === -1) return;

  PRODUCTOS_ADMIN.splice(idx, 1);
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
  const stockHtml = Number.isFinite(prod.stock)
    ? `<span class="card-stock ${stockDisponible === 0 ? 'card-stock--out' : ''}">${stockDisponible === 0 ? 'Sin stock' : `Stock: ${stockDisponible}`}</span>`
    : '';
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
        <p class="card-name">${prod.nombre}</p>
        <p class="card-price">${formatPrecio(prod.precio)}</p>
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
    existente.cantidad += cantidad;
  } else {
    carrito.push({
      id: prod.id,
      nombre: prod.nombre,
      precio: prod.precio,
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
  return carrito.reduce((sum, i) => sum + i.precio * i.cantidad, 0);
}

function actualizarUI() {
  const total = calcularTotal();
  const count = carrito.reduce((s, i) => s + i.cantidad, 0);
  const MIN   = 80000;

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
      barText.textContent = 'Compra mínima $80.000';
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

  itemsEl.innerHTML = carrito.map(item => `
    <div class="cart-item">
      <div class="cart-item-top">
        <div class="cart-item-icon" style="background:${item.bgImg}">
          <span style="color:${item.iconColor}">${item.icon}</span>
        </div>
        <div class="cart-item-info">
          <p class="cart-item-name">${item.nombre}</p>
          <p class="cart-item-unit-price">${formatPrecio(item.precio)} c/u</p>
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
        <p class="cart-item-subtotal">${formatPrecio(item.precio * item.cantidad)}</p>
      </div>
    </div>
  `).join('');
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
  const MIN   = 80000;

  if (carrito.length === 0) {
    mostrarToast('Tu carrito está vacío');
    return;
  }
  if (total < MIN) {
    mostrarToast(`El pedido mínimo es ${formatPrecio(MIN)}. Te faltan ${formatPrecio(MIN - total)}.`);
    return;
  }

  // Arma mensaje para WhatsApp
  const lineas = carrito.map(i =>
    `• ${i.nombre} x${i.cantidad} = ${formatPrecio(i.precio * i.cantidad)}`
  );
  const msg = encodeURIComponent(
    `¡Hola! Quiero hacer el siguiente pedido:\n\n${lineas.join('\n')}\n\nTOTAL: ${formatPrecio(total)}`
  );
  window.open(`https://wa.me/5491100000000?text=${msg}`, '_blank');
}

// ── Navegación por categorías ────────────────────────────────────────────────

const _HOME_IDS = ['heroSection', 'benefitsSection', 'novedades', 'ofertas'];

function mostrarCategoria(cat, titulo) {
  _HOME_IDS.forEach(id => {
    const el = document.getElementById(id);
    if (el) el.style.display = 'none';
  });

  const catView  = document.getElementById('categoriaView');
  const catTitle = document.getElementById('categoriaTitulo');
  const catCount = document.getElementById('categoriaConteo');
  if (!catView) return;

  catView.style.display = '';
  if (catTitle) catTitle.textContent = (titulo || cat).toUpperCase();

  const prods = todosLosProductos().filter(p => p.categoria === cat);
  if (prods.length === 0) {
    if (catCount) catCount.textContent = '';
    const grid = document.getElementById('categoriaGrid');
    if (grid) grid.innerHTML = `<p style="color:#6B7280;grid-column:1/-1;padding:24px 0">Cargando productos de esta categoría…</p>`;
  } else {
    if (catCount) catCount.textContent = prods.length + ' productos';
    renderGrid(prods, 'categoriaGrid');
  }

  window.scrollTo({ top: 0, behavior: 'smooth' });
  document.querySelectorAll('.cat-item').forEach(el => {
    el.classList.toggle('cat-item--active', el.dataset.cat === cat);
  });
}

function volverAlHome(scrollTo) {
  const catView = document.getElementById('categoriaView');
  if (catView) catView.style.display = 'none';

  _HOME_IDS.forEach(id => {
    const el = document.getElementById(id);
    if (el) el.style.display = '';
  });

  document.querySelectorAll('.cat-item').forEach(el => el.classList.remove('cat-item--active'));

  if (scrollTo) {
    setTimeout(() => document.getElementById(scrollTo)?.scrollIntoView({ behavior: 'smooth' }), 50);
  } else {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}

// ── Búsqueda ─────────────────────────────────────────────────────────────────

function buscar() {
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
  const catCount = document.getElementById('categoriaConteo');
  const grid     = document.getElementById('categoriaGrid');

  if (catView)  catView.style.display = '';
  if (catTitle) catTitle.textContent = `RESULTADOS: "${String(qRaw || '').trim().toUpperCase()}"`;

  if (results.length === 0) {
    if (catCount) catCount.textContent = 'sin resultados';
    if (grid) grid.innerHTML = `<p style="color:#6B7280;grid-column:1/-1;padding:24px 0">No se encontraron productos para "<strong>${String(qRaw || '').trim()}</strong>".</p>`;
  } else {
    if (catCount) catCount.textContent = results.length + ' resultado' + (results.length !== 1 ? 's' : '');
    renderGrid(results, 'categoriaGrid');
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

// ── Enter en buscador ─────────────────────────────────────────────────────────

document.addEventListener('DOMContentLoaded', () => {
  inicializarStorageAdmin();
  usaFirestoreAdmin = inicializarFirestoreAdmin();
  cargarProductosAdmin();
  refrescarCatalogoPrincipal();
  cargarCarrito();
  actualizarUI();
  actualizarMenuAdmin();

  document.getElementById('searchInput')?.addEventListener('keydown', e => {
    if (e.key === 'Enter') buscar();
  });
});
