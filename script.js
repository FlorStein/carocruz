/* ======================================================
   PAPELERA CARO CRUZ — script.js
   - Catálogo de productos
   - Grids dinámicos
   - Carrito lateral con persistencia en localStorage
   ====================================================== */

'use strict';

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

// ── Helpers ──────────────────────────────────────────────────────────────────

function formatPrecio(n) {
  return '$\u202F' + n.toLocaleString('es-AR', { minimumFractionDigits: 2 });
}

// ── Render de cards ───────────────────────────────────────────────────────────

function renderProductCard(prod) {
  return `
    <article class="product-card" data-id="${prod.id}">
      <div class="card-img" style="background:${prod.bgImg}">
        <span style="color:${prod.iconColor}">${prod.icon}</span>
      </div>
      <div class="card-body">
        <span class="card-badge" style="background:${prod.categColor};color:${prod.categText}">${prod.categoria}</span>
        <p class="card-name">${prod.nombre}</p>
        <p class="card-price">${formatPrecio(prod.precio)}</p>
        <div class="qty-row">
          <button class="qty-btn" onclick="cambiarCantidad('${prod.id}', -1)">−</button>
          <span class="qty-value" id="qty-${prod.id}">0</span>
          <button class="qty-btn" onclick="cambiarCantidad('${prod.id}', 1)">+</button>
        </div>
        <button class="add-btn" onclick="agregarAlCarrito('${prod.id}')">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>
          AGREGAR
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

function cambiarCantidad(id, delta) {
  if (cantidades[id] === undefined) cantidades[id] = 0;
  cantidades[id] = Math.max(0, cantidades[id] + delta);
  const el = document.getElementById('qty-' + id);
  if (el) el.textContent = cantidades[id];
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
  const listas = [PRODUCTOS_NOVEDADES, PRODUCTOS_OFERTAS];
  if (typeof PRODUCTOS_GASTRONOMICO !== 'undefined') listas.push(PRODUCTOS_GASTRONOMICO);
  if (typeof PRODUCTOS_ESCOLAR      !== 'undefined') listas.push(PRODUCTOS_ESCOLAR);
  if (typeof PRODUCTOS_LIBRERIA     !== 'undefined') listas.push(PRODUCTOS_LIBRERIA);
  if (typeof PRODUCTOS_LIMPIEZA     !== 'undefined') listas.push(PRODUCTOS_LIMPIEZA);
  return listas.flat();
}

function agregarAlCarrito(id) {
  const cantidad = cantidades[id] || 0;
  if (cantidad === 0) {
    mostrarToast('Seleccioná una cantidad primero');
    return;
  }

  const prod = todosLosProductos().find(p => p.id === id);
  if (!prod) return;

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

  cantidades[id] = 0;
  const qtyEl = document.getElementById('qty-' + id);
  if (qtyEl) qtyEl.textContent = '0';

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
  item.cantidad = Math.max(1, item.cantidad + delta);
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
  const q = document.getElementById('searchInput').value.trim().toLowerCase();
  if (!q) return;

  const results = todosLosProductos().filter(p => p.nombre.toLowerCase().includes(q));

  _HOME_IDS.forEach(id => {
    const el = document.getElementById(id);
    if (el) el.style.display = 'none';
  });

  const catView  = document.getElementById('categoriaView');
  const catTitle = document.getElementById('categoriaTitulo');
  const catCount = document.getElementById('categoriaConteo');
  const grid     = document.getElementById('categoriaGrid');

  if (catView)  catView.style.display = '';
  if (catTitle) catTitle.textContent = `RESULTADOS: "${q.toUpperCase()}"`;

  if (results.length === 0) {
    if (catCount) catCount.textContent = 'sin resultados';
    if (grid) grid.innerHTML = `<p style="color:#6B7280;grid-column:1/-1;padding:24px 0">No se encontraron productos para "<strong>${q}</strong>".</p>`;
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
  renderGrid(PRODUCTOS_NOVEDADES, 'novedadesGrid');
  renderGrid(PRODUCTOS_OFERTAS,   'ofertasGrid');
  cargarCarrito();
  actualizarUI();

  document.getElementById('searchInput')?.addEventListener('keydown', e => {
    if (e.key === 'Enter') buscar();
  });
});
