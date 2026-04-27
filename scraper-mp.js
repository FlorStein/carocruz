/**
 * scraper-mp.js
 *
 * Scraper de imágenes de marketpaper.com.ar para el catálogo de Papelera Caro Cruz.
 * Genera / actualiza el archivo "imagenes-map.js" con el mapeo: id_producto → url_imagen
 *
 * Estrategia:
 *   1. Intenta la API REST de WordPress (/wp-json/wp/v2/product?_embed) → rápido, sin render JS
 *   2. Si la API no está disponible, crawlea las páginas de categorías para recopilar
 *      URLs de producto y luego fetchea cada página de producto para extraer og:image
 *      o cualquier src que apunte a wp-content/uploads
 *
 * Uso: node scraper-mp.js
 * Requiere: Node.js 14+ (sin dependencias externas)
 */

'use strict';

const https = require('https');
const http  = require('http');
const fs    = require('fs');
const path  = require('path');

// ─── Configuración ────────────────────────────────────────────────────────────

const DELAY_MS  = 700;   // Pausa entre requests (ms)
const BASE_URL  = 'https://marketpaper.com.ar';
const SALIDA    = path.join(__dirname, 'imagenes-mp.json');
const JS_SALIDA = path.join(__dirname, 'imagenes-map.js');

/** Categorías a crawlear (con paginación /page/N/) */
const CATEGORIAS = [
  { ruta: '/categoria/cajas-de-carton-corrugado/',                            maxPag: 10 },
  { ruta: '/categoria/gastronomia-descartable/',                              maxPag: 10 },
  { ruta: '/categoria/insumos-para-embalaje/',                               maxPag: 10 },
  { ruta: '/categoria/bolsas/',                                               maxPag: 10 },
  { ruta: '/categoria/limpieza/',                                             maxPag:  5 },
  { ruta: '/tienda/',                                                         maxPag: 15 },
];

/** Archivos del catálogo local a leer */
const ARCHIVOS_CATALOGO = [
  'catalogo-gastronomico.js',
  'catalogo-escolar.js',
  'catalogo-libreria.js',
  'catalogo-limpieza.js',
  'catalogo-descartables.js',
  'catalogo-embalaje.js',
  'catalogo-cajas.js',
  'catalogo-bolsas.js',
];

// ─── Utilidades ───────────────────────────────────────────────────────────────

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/** Descarga el contenido de una URL (HTTP/HTTPS). Sigue redirecciones. */
function fetchUrl(url, asJson = false) {
  return new Promise((resolve, reject) => {
    const parsed  = new URL(url);
    const lib     = parsed.protocol === 'https:' ? https : http;
    const options = {
      hostname: parsed.hostname,
      path:     parsed.pathname + parsed.search,
      headers: {
        'User-Agent':      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/124 Safari/537.36',
        'Accept':          asJson ? 'application/json' : 'text/html,application/xhtml+xml',
        'Accept-Language': 'es-AR,es;q=0.9',
      },
    };
    const req = lib.get(options, (res) => {
      if (res.statusCode === 301 || res.statusCode === 302 || res.statusCode === 307 || res.statusCode === 308) {
        const loc = res.headers.location;
        if (loc) return fetchUrl(loc.startsWith('http') ? loc : `${BASE_URL}${loc}`, asJson).then(resolve).catch(reject);
        return reject(new Error(`Redirect sin Location: ${url}`));
      }
      if (res.statusCode !== 200) {
        res.resume();
        return reject(new Error(`HTTP ${res.statusCode} — ${url}`));
      }
      const chunks = [];
      res.on('data', c => chunks.push(c));
      res.on('end', () => {
        const body = Buffer.concat(chunks).toString('utf-8');
        if (asJson) {
          try { resolve(JSON.parse(body)); }
          catch (e) { reject(new Error(`JSON inválido desde ${url}: ${e.message}`)); }
        } else {
          resolve(body);
        }
      });
    });
    req.on('error', reject);
    req.setTimeout(18000, () => { req.destroy(); reject(new Error(`Timeout: ${url}`)); });
  });
}

// ─── Conversión a slug ────────────────────────────────────────────────────────

function toSlug(str) {
  return str
    .toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[ñ]/g, 'n')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

// ─── Extracción de imagen desde HTML de página de producto ───────────────────

/**
 * Dado el HTML de una página de producto WooCommerce devuelve la URL
 * de la imagen principal del producto.
 *
 * Orden de búsqueda:
 *  1. <meta property="og:image" content="...">  (más confiable)
 *  2. Primera src dentro de .woocommerce-product-gallery
 *  3. Primera URL wp-content/uploads que NO sea icon/logo/banner
 */
function extraerImagenDeProducto(html) {
  // 1. og:image
  const ogMatch = html.match(/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i)
                || html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image["']/i);
  if (ogMatch && ogMatch[1] && ogMatch[1].includes('wp-content/uploads')) {
    return ogMatch[1];
  }

  // 2. Imagen dentro de galería de WooCommerce (data-large_image o href o src)
  const gallerySection = html.indexOf('woocommerce-product-gallery');
  if (gallerySection !== -1) {
    const fragment = html.slice(gallerySection, gallerySection + 3000);
    const galImg = fragment.match(/(?:data-large_image|href|src)=["'](https:\/\/marketpaper\.com\.ar\/wp-content\/uploads\/[^"'?#]+\.(?:jpg|jpeg|png|webp))["']/i);
    if (galImg) return galImg[1];
  }

  // 3. Primera wp-content/uploads válida en todo el HTML
  const reImg = /["'](https:\/\/marketpaper\.com\.ar\/wp-content\/uploads\/[^"'?#\s]+\.(?:jpg|jpeg|png|webp))["']/gi;
  let m;
  while ((m = reImg.exec(html)) !== null) {
    const u = m[1];
    // Saltar íconos, logos, banners y miniaturas muy pequeñas (con -NNxNN- en nombre)
    if (/logo|icon|banner|sprite|background/i.test(u)) continue;
    if (/-\d{1,3}x\d{1,3}\./i.test(u)) continue; // thumbnail generado por WP
    return u;
  }

  return null;
}

// ─── Extracción de slugs de productos desde página de listado ─────────────────

/**
 * Dado el HTML de una página de categoría WooCommerce devuelve array de slugs únicos.
 * Los links de productos tienen la forma /producto/{slug}/
 */
function extraerSlugsDeListado(html) {
  const slugs = new Set();
  const re = /href=["']https:\/\/marketpaper\.com\.ar\/producto\/([a-z0-9-]+)\//gi;
  let m;
  while ((m = re.exec(html)) !== null) {
    slugs.add(m[1]);
  }
  return Array.from(slugs);
}

/** Detecta si hay más páginas en una lista WooCommerce */
function hayMasPaginas(html, paginaActual) {
  // WooCommerce usa /page/N/ pero también puede usar ?paged=N
  const next = paginaActual + 1;
  return html.includes(`/page/${next}/`) || html.includes(`paged=${next}`);
}

// ─── Estrategia 1: API REST de WordPress ─────────────────────────────────────

/**
 * Intenta obtener todos los productos via /wp-json/wp/v2/product?_embed
 * Retorna Map<slug, imagen_url> o null si la API no está disponible.
 */
async function intentarApiRest() {
  console.log('\n🔌 Intentando API REST de WordPress…');
  const mpMap = new Map(); // slug → imagen_url

  let page = 1;
  while (true) {
    const url = `${BASE_URL}/wp-json/wp/v2/product?per_page=100&page=${page}&_embed=1`;
    let data;
    try {
      data = await fetchUrl(url, true);
    } catch (err) {
      if (page === 1) {
        console.log(`   ⚠  API REST no disponible: ${err.message}`);
        return null;
      }
      break; // no hay más páginas
    }

    if (!Array.isArray(data) || data.length === 0) break;

    for (const product of data) {
      const slug = product.slug;
      if (!slug) continue;

      // Obtener imagen destacada embebida
      let imgUrl = null;
      try {
        const media = product._embedded?.['wp:featuredmedia']?.[0];
        if (media) {
          // Preferir tamaño "full" o "woocommerce_single"
          imgUrl = media.media_details?.sizes?.woocommerce_single?.source_url
                || media.media_details?.sizes?.full?.source_url
                || media.source_url;
        }
      } catch {}

      // Fallback: og:image desde el link del producto
      if (!imgUrl && product.link) {
        // Se setea como null; se puede resolver después con un fetch individual
        imgUrl = null;
      }

      if (imgUrl && !mpMap.has(slug)) {
        mpMap.set(slug, imgUrl);
      } else if (!imgUrl && !mpMap.has(slug)) {
        // Guardar slug sin imagen para intento posterior
        mpMap.set(slug, null);
      }
    }

    console.log(`   Página ${page}: ${data.length} productos (total en mapa: ${mpMap.size})`);
    if (data.length < 100) break; // última página
    page++;
    await sleep(DELAY_MS);
  }

  const conImagen = Array.from(mpMap.values()).filter(Boolean).length;
  console.log(`   ✅ API REST: ${mpMap.size} productos, ${conImagen} con imagen`);

  // Si muchos productos no tienen imagen via API, intentar fetchear sus páginas
  const sinImagen = Array.from(mpMap.entries()).filter(([, v]) => !v);
  if (sinImagen.length > 0) {
    console.log(`   🔍 Resolviendo imágenes faltantes (${sinImagen.length} productos)…`);
    for (const [slug] of sinImagen.slice(0, 200)) { // máximo 200
      const prodUrl = `${BASE_URL}/producto/${slug}/`;
      try {
        const html = await fetchUrl(prodUrl);
        const img  = extraerImagenDeProducto(html);
        if (img) mpMap.set(slug, img);
      } catch {}
      await sleep(DELAY_MS);
    }
  }

  return mpMap;
}

// ─── Estrategia 2: Crawl de categorías ───────────────────────────────────────

/**
 * Crawlea las páginas de categorías para recopilar slugs de productos,
 * luego fetchea cada página de producto para extraer la imagen.
 * Retorna Map<slug, imagen_url>
 */
async function crawlearCategorias() {
  console.log('\n🕷  Crawleando categorías de MarketPaper…');
  const todosLosSlugs = new Set();

  for (const cat of CATEGORIAS) {
    console.log(`\n  📁 ${cat.ruta}`);
    let pag = 1;

    while (pag <= cat.maxPag) {
      const url = pag === 1
        ? `${BASE_URL}${cat.ruta}`
        : `${BASE_URL}${cat.ruta}page/${pag}/`;

      process.stdout.write(`     Página ${pag}… `);
      let html;
      try {
        html = await fetchUrl(url);
      } catch (err) {
        console.log(`ERROR: ${err.message}`);
        break;
      }

      const slugs   = extraerSlugsDeListado(html);
      let nuevos    = 0;
      for (const s of slugs) {
        if (!todosLosSlugs.has(s)) { todosLosSlugs.add(s); nuevos++; }
      }
      console.log(`${slugs.length} productos (${nuevos} nuevos)`);

      if (slugs.length === 0 || !hayMasPaginas(html, pag)) break;
      pag++;
      await sleep(DELAY_MS);
    }
  }

  console.log(`\n  ✅ Slugs únicos encontrados: ${todosLosSlugs.size}`);

  // Fetchear cada página de producto para obtener la imagen
  console.log(`\n  🖼  Obteniendo imágenes de cada producto…`);
  const mpMap = new Map();
  let i = 0;
  for (const slug of todosLosSlugs) {
    i++;
    if (i % 10 === 0) process.stdout.write(`  ${i}/${todosLosSlugs.size}… `);
    const prodUrl = `${BASE_URL}/producto/${slug}/`;
    try {
      const html = await fetchUrl(prodUrl);
      const img  = extraerImagenDeProducto(html);
      mpMap.set(slug, img || null);
    } catch (err) {
      mpMap.set(slug, null);
    }
    await sleep(DELAY_MS);
  }

  const conImg = Array.from(mpMap.values()).filter(Boolean).length;
  console.log(`\n  ✅ Imágenes obtenidas: ${conImg} / ${mpMap.size}`);
  return mpMap;
}

// ─── Lectura del catálogo local ───────────────────────────────────────────────

function leerCatalogosLocales() {
  const productos = [];
  for (const archivo of ARCHIVOS_CATALOGO) {
    const filePath = path.join(__dirname, archivo);
    if (!fs.existsSync(filePath)) {
      console.warn(`⚠  Archivo no encontrado: ${archivo}`);
      continue;
    }
    const src = fs.readFileSync(filePath, 'utf-8');
    const re  = /_\w+\(\s*'([^']+)'\s*,\s*'([^']+)'/g;
    let m;
    while ((m = re.exec(src)) !== null) {
      productos.push({
        id:     m[1],
        nombre: m[2].trim(),
        slug:   toSlug(m[2].trim()),
      });
    }
  }
  return productos;
}

// ─── Matching ─────────────────────────────────────────────────────────────────

const GENERIC_WORDS = new Set([
  'chico','grande','mediano','pequeno','ultra',
  'negro','negra','azul','rojo','roja','verde','blanco','blanca',
  'amarillo','amarilla','rosa','gris','naranja','celeste',
  'violeta','lila','marron','beige','dorado','dorada',
  'color','colores','surtido','surtida','surtidos','surtidas','varios',
  'papel',
  'metal','metalico','metalizada','metalizado',
  'acero','goma','madera','tela','cuero',
  'doble','triple','extra','super','mini','maxi',
  'original','classic','premium','profesional',
  'oferta','especial','natural','transparente','opaco',
]);

function normSlug(slug) {
  return slug.split('-').filter(w => {
    if (!w) return false;
    if (/^x?\d+u?$/i.test(w)) return false;
    if (/^\d+(u|ml|cc|kg|grs?|mm|cm|mts?|lts?|hs?)$/i.test(w)) return false;
    if (/^\d+m$/i.test(w)) return false;
    if (/^\d+(x\d+)+(m|cm|mm)?$/i.test(w)) return false;
    if (/^x\d+[a-z]*$/i.test(w)) return false;
    if (/^[a-zA-Z]\d{1,2}$/.test(w) || /^\d{1,2}[a-zA-Z]$/.test(w)) return false;
    if (/^\d{2,}$/.test(w)) return false;
    return true;
  }).join('-');
}

function keywords(slug) {
  return normSlug(slug).split('-').filter(w => w.length >= 3 && !GENERIC_WORDS.has(w));
}

function similitud(slugLocal, slugMP) {
  const nL = normSlug(slugLocal);
  const nM = normSlug(slugMP);

  if (slugLocal === slugMP) return 1;
  if (nL === nM && nL.length > 3) return 0.95;

  const kwL = keywords(slugLocal);
  const kwM = keywords(slugMP);

  if (kwL.length === 0 || kwM.length === 0) return 0;

  const anclaOK =
    kwM.some(w => w === kwL[0] || (kwL[0].length >= 4 && (w.startsWith(kwL[0]) || kwL[0].startsWith(w)))) ||
    kwL.some(w => w === kwM[0] || (kwM[0].length >= 4 && (w.startsWith(kwM[0]) || kwM[0].startsWith(w))));
  if (!anclaOK) return 0;

  const setM = new Set(kwM);
  let comunes = 0;
  for (const w of kwL) {
    if (setM.has(w)) {
      comunes += 1;
    } else if (w.length >= 5) {
      for (const wm of setM) {
        if (wm.includes(w) || w.includes(wm)) { comunes += 0.6; break; }
      }
    }
  }
  return comunes / Math.max(kwL.length, kwM.length);
}

// ─── Programa principal ────────────────────────────────────────────────────────

async function main() {
  console.log('═══════════════════════════════════════════════');
  console.log('  Scraper de imágenes MarketPaper → Caro Cruz  ');
  console.log('═══════════════════════════════════════════════\n');

  // 1. Obtener mapa slug → imagen de MarketPaper
  let mpMap = await intentarApiRest();
  if (!mpMap || mpMap.size === 0) {
    mpMap = await crawlearCategorias();
  }

  console.log(`\n✅ MarketPaper: ${mpMap.size} productos únicos`);

  // 2. Leer catálogos locales
  const catalogoLocal = leerCatalogosLocales();
  console.log(`✅ Local: ${catalogoLocal.length} productos\n`);

  // 3. Leer mapa existente (imagenes-tam.json) para no pisar imágenes ya encontradas
  let imageMapExistente = {};
  if (fs.existsSync(path.join(__dirname, 'imagenes-tam.json'))) {
    try {
      imageMapExistente = JSON.parse(fs.readFileSync(path.join(__dirname, 'imagenes-tam.json'), 'utf-8'));
    } catch {}
  }

  // 4. Matching
  const imageMap = {};     // id → { nombre, imagen, mpSlug, score }
  let conImagen  = 0;
  let sinImagen  = 0;

  const mpEntries = Array.from(mpMap.entries()); // [slug, imagen_url|null]

  for (const prod of catalogoLocal) {
    let mejorSlug  = null;
    let mejorScore = 0;
    let mejorImg   = null;

    for (const [mpSlug, mpImg] of mpEntries) {
      if (!mpImg) continue; // sin imagen no sirve
      const score = similitud(prod.slug, mpSlug);
      if (score > mejorScore) {
        mejorScore = score;
        mejorSlug  = mpSlug;
        mejorImg   = mpImg;
      }
    }

    const UMBRAL = 0.5;
    if (mejorScore >= UMBRAL && mejorImg) {
      imageMap[prod.id] = {
        nombre:  prod.nombre,
        imagen:  mejorImg,
        mpSlug:  mejorSlug,
        score:   Math.round(mejorScore * 100),
      };
      conImagen++;
    } else {
      // Si ya tenía imagen de TAM, conservarla
      if (imageMapExistente[prod.id]?.imagen) {
        imageMap[prod.id] = {
          ...imageMapExistente[prod.id],
          fuente: 'tam',
        };
        conImagen++;
      } else {
        sinImagen++;
        if (mejorScore >= UMBRAL) {
          imageMap[prod.id] = { nombre: prod.nombre, imagen: null, mpSlug: mejorSlug, score: Math.round(mejorScore * 100) };
        }
      }
    }
  }

  // 5. Guardar JSON de resultados
  fs.writeFileSync(SALIDA, JSON.stringify(imageMap, null, 2), 'utf-8');
  console.log(`  imagenes-mp.json guardado`);

  // 6. Generar / actualizar imagenes-map.js
  // Combinar: MP tiene prioridad sobre TAM para los productos que encontró
  let mapaBase = {};
  if (fs.existsSync(path.join(__dirname, 'imagenes-tam.json'))) {
    try { mapaBase = JSON.parse(fs.readFileSync(path.join(__dirname, 'imagenes-tam.json'), 'utf-8')); } catch {}
  }

  const jsLines = [
    `// Generado automáticamente por scraper-mp.js`,
    `// Mapa: id_producto → url_imagen (marketpaper.com.ar / tam.com.ar)`,
    `// Usa window. para evitar conflictos de re-declaración`,
    `window.IMAGENES_MAP = {`,
  ];

  // Empezar con el mapa TAM existente como base
  for (const [id, data] of Object.entries(mapaBase)) {
    if (data.imagen) jsLines.push(`  "${id}": "${data.imagen}",`);
  }
  // Sobrescribir con imágenes de MP (mayor calidad/relevancia)
  for (const [id, data] of Object.entries(imageMap)) {
    if (data.imagen && !data.fuente) { // fuente='tam' ya está en el mapa base
      // Sobrescribir o agregar
      const idx = jsLines.findIndex(l => l.startsWith(`  "${id}":`));
      const line = `  "${id}": "${data.imagen}",`;
      if (idx !== -1) jsLines[idx] = line;
      else jsLines.push(line);
    }
  }

  jsLines.push(`};`);
  fs.writeFileSync(JS_SALIDA, jsLines.join('\n') + '\n', 'utf-8');
  console.log(`  imagenes-map.js actualizado\n`);

  // 7. Resumen
  console.log('═══════════════════════════════════════════════');
  console.log(`  Resultado guardado en : imagenes-mp.json`);
  console.log(`  Productos CON imagen  : ${conImagen}`);
  console.log(`  Productos SIN imagen  : ${sinImagen}`);
  console.log(`  Total procesados      : ${catalogoLocal.length}`);
  console.log('═══════════════════════════════════════════════\n');

  // 8. Distribución de scores y archivo de revisión
  const rangos = { r100: [], r90: [], r70: [], r65: [], r50: [] };
  for (const [id, data] of Object.entries(imageMap)) {
    if (!data.imagen || data.fuente === 'tam') continue;
    const s = data.score || 0;
    if (s === 100)    rangos.r100.push({ id, data });
    else if (s >= 90) rangos.r90.push({ id, data });
    else if (s >= 70) rangos.r70.push({ id, data });
    else if (s >= 65) rangos.r65.push({ id, data });
    else              rangos.r50.push({ id, data });
  }
  console.log('Distribución de scores (solo imágenes de MP):');
  console.log(`  100%   : ${rangos.r100.length} (match exacto)`);
  console.log(`  90-99% : ${rangos.r90.length}  (casi exacto)`);
  console.log(`  70-89% : ${rangos.r70.length}  (buen match)`);
  console.log(`  65-69% : ${rangos.r65.length}  (aceptable)`);
  console.log(`  50-64% : ${rangos.r50.length}  (revisar)\n`);

  const lineasRevision = rangos.r50.map(
    ({ id, data }) => `[${data.score}%] ${id.padEnd(12)} ${data.nombre.padEnd(45)} → ${data.mpSlug}`
  );
  if (lineasRevision.length > 0) {
    fs.writeFileSync(
      path.join(__dirname, 'matches-mp-revisar.txt'),
      `# Matches MP con score 50-64% — revisar si la imagen es correcta\n` +
      `# Formato: [score] id  nombre_local  →  slug_MarketPaper\n\n` +
      lineasRevision.join('\n') + '\n',
      'utf-8'
    );
    console.log(`  matches-mp-revisar.txt generado (${rangos.r50.length} items)\n`);
  }

  // 9. Muestra de primeros 10 matches
  console.log('Muestra de matches MP (primeros 10):\n');
  let shown = 0;
  for (const [id, data] of Object.entries(imageMap)) {
    if (shown >= 10 || !data.imagen || data.fuente === 'tam') continue;
    console.log(`  [${data.score}%] ${data.nombre}`);
    console.log(`         → ${data.mpSlug}`);
    console.log(`         ${data.imagen}\n`);
    shown++;
  }
}

main().catch(err => {
  console.error('\n❌ Error fatal:', err.message);
  process.exit(1);
});
