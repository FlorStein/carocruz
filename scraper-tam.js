/**
 * scraper-tam.js
 * 
 * Scraper de imágenes de tam.com.ar para el catálogo de Papelera Caro Cruz.
 * Genera el archivo "imagenes-tam.json" con el mapeo: id_producto → url_imagen
 * 
 * Uso: node scraper-tam.js
 * Requiere: Node.js 14+ (sin dependencias externas)
 */

'use strict';

const https = require('https');
const fs   = require('fs');
const path = require('path');

// ─── Configuración ────────────────────────────────────────────────────────────

const DELAY_MS   = 600;   // Pausa entre requests (ms) — respetar servidor
const BASE_URL   = 'https://tam.com.ar';
const SALIDA     = path.join(__dirname, 'imagenes-tam.json');

/** Categorías de TAM a recorrer y máximo de páginas esperadas */
const CATEGORIAS = [
  { ruta: '/productos/libreria',              maxPag: 20 },
  { ruta: '/productos/resmas',                maxPag: 5  },
  { ruta: '/productos/utiles-escolares',      maxPag: 10 },
  { ruta: '/productos/alimentos',             maxPag: 5  },
  { ruta: '/productos/limpieza',              maxPag: 5  },
  { ruta: '/productos/articulos-de-embalaje', maxPag: 10 },
  { ruta: '/productos/cartuchos-y-toners',    maxPag: 10 },
  { ruta: '/productos/regalos',               maxPag: 5  },
  { ruta: '/productos/tecnologia',            maxPag: 5  },
  { ruta: '/productos/muebles-de-oficina',    maxPag: 5  },
  { ruta: '/productos/descartables',          maxPag: 5  },
];

/** Archivos del catálogo a leer para obtener la lista de productos propios */
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

/** Convierte un nombre de producto al formato slug para comparación */
function toSlug(str) {
  return str
    .toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '') // quitar acentos
    .replace(/[ñ]/g, 'n')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/** Descarga el HTML de una URL */
function fetchHtml(url) {
  return new Promise((resolve, reject) => {
    const options = {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml',
        'Accept-Language': 'es-AR,es;q=0.9',
      }
    };
    const req = https.get(url, options, (res) => {
      if (res.statusCode === 301 || res.statusCode === 302) {
        const redir = res.headers.location;
        if (redir) return fetchHtml(redir).then(resolve).catch(reject);
        return reject(new Error(`Redirect sin Location desde ${url}`));
      }
      if (res.statusCode !== 200) {
        res.resume();
        return reject(new Error(`HTTP ${res.statusCode} para ${url}`));
      }
      const chunks = [];
      res.on('data', c => chunks.push(c));
      res.on('end', () => resolve(Buffer.concat(chunks).toString('utf-8')));
    });
    req.on('error', reject);
    req.setTimeout(15000, () => { req.destroy(); reject(new Error(`Timeout: ${url}`)); });
  });
}

// ─── Extracción de productos desde página de listado ─────────────────────────

/**
 * Dado el HTML de una página de categoría de TAM, devuelve array de:
 * { id: string, slug: string, nombre: string, imagen: string|null }
 */
function extraerProductosDeListado(html) {
  const productos = [];
  const vistos    = new Set();

  // Primero: construir lista de ficha-IDs y slugs que aparecen en la página
  const reLink = /href='\/ficha-(\d+)-([a-z0-9-]+)'/g;
  const links  = [];
  let mLink;
  while ((mLink = reLink.exec(html)) !== null) {
    const id   = mLink[1];
    const slug = mLink[2];
    const key  = `${id}-${slug}`;
    if (!vistos.has(key)) {
      vistos.add(key);
      links.push({ id, slug, index: mLink.index });
    }
  }

  if (links.length === 0) return productos;

  // Segundo: para cada link buscar la imagen CDN más cercana (hacia atrás en el HTML)
  const reCDN = /src='(https:\/\/cdn\.billowshop\.com\/[^']+\.(?:webp|jpg|jpeg|png)(?:\?[^']*)?)'/g;
  const todasImagenes = [];
  let mImg;
  while ((mImg = reCDN.exec(html)) !== null) {
    // Saltar imágenes de medios de pago u otros (generalmente tienen paths con /otros/)
    if (!mImg[1].includes('/otros/') && !mImg[1].includes('/banner')) {
      todasImagenes.push({ url: mImg[1], index: mImg.index });
    }
  }

  for (const link of links) {
    // Buscar la imagen CDN más cercana ANTES del link (dentro de 3000 chars)
    let imgElegida = null;
    let menorDist  = Infinity;
    for (const img of todasImagenes) {
      const dist = link.index - img.index;
      if (dist > 0 && dist < 3000 && dist < menorDist) {
        menorDist  = dist;
        imgElegida = img.url;
      }
    }
    // Fallback: buscar la imagen más cercana DESPUÉS del link (dentro de 1500 chars)
    if (!imgElegida) {
      for (const img of todasImagenes) {
        const dist = img.index - link.index;
        if (dist > 0 && dist < 1500 && dist < menorDist) {
          menorDist  = dist;
          imgElegida = img.url;
        }
      }
    }

    // Extraer el nombre del producto del slug (para mostrar en log)
    const nombre = link.slug
      .replace(/-/g, ' ')
      .replace(/\b\w/g, c => c.toUpperCase());

    productos.push({
      id:     link.id,
      slug:   link.slug,
      nombre: nombre,
      imagen: imgElegida,
    });
  }

  return productos;
}

/** Detecta si hay más páginas en el HTML de listado */
function hayMasPaginas(html, paginaActual) {
  // BillowShop usa &amp;page=N en el HTML (entidad HTML para &)
  const next = paginaActual + 1;
  return html.includes(`page=${next}`);
}

// ─── Lectura del catálogo propio ──────────────────────────────────────────────

/**
 * Lee los archivos catalogo-*.js y devuelve array de:
 * { id: string, nombre: string, slug: string }
 */
function leerCatalogosLocales() {
  const productos = [];
  for (const archivo of ARCHIVOS_CATALOGO) {
    const filePath = path.join(__dirname, archivo);
    if (!fs.existsSync(filePath)) {
      console.warn(`⚠  Archivo no encontrado: ${archivo}`);
      continue;
    }
    const src = fs.readFileSync(filePath, 'utf-8');
    // Extraer llamadas a _X('id', 'nombre', precio) donde _X es el helper del archivo
    const re = /_\w+\(\s*'([^']+)'\s*,\s*'([^']+)'/g;
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

// Adjetivos/palabras genéricas que solas no pueden ser el único ancla de matching
const GENERIC_WORDS = new Set([
  'chico', 'grande', 'mediano', 'pequeño',
  'negro', 'azul', 'rojo', 'verde', 'blanco', 'amarillo', 'rosa', 'gris',
  'color', 'colores', 'surtido',
  'metal', 'metalico', 'metalizada', 'metalizado',
  'acero', 'plastico', 'plastica',
  'doble', 'triple', 'extra',
  'original', 'classic', 'premium',
]);

/**
 * Normaliza un slug para matching: quita sufijos de unidad y palabras de relleno.
 * CARTULINA COLOR XU → cartulina-color
 * CINTA ADHESIVA 48MMX100M X36ROLLOS → cinta-adhesiva-48mm-100m-x36rollo
 */
function normSlug(slug) {
  return slug
    .split('-')
    .filter(w => {
      if (!w) return false;
      // Quitar fragmentos puramente numéricos o sufijos como x10u, xu, x100, 50u, 500g
      if (/^x?\d+u?$/i.test(w)) return false;
      if (/^\d+(u|ml|cc|kg|grs?|mm|cm|mts?|lts?|hs?)$/i.test(w)) return false;
      return true;
    })
    .join('-');
}

/**
 * Devuelve las palabras "sustantivas" de un slug normalizado:
 * filtra genéricos y palabras muy cortas.
 */
function keywords(slug) {
  return normSlug(slug)
    .split('-')
    .filter(w => w.length >= 3 && !GENERIC_WORDS.has(w));
}

/**
 * Puntaje de similitud entre el slug de un producto local y el slug de TAM.
 * Devuelve un número entre 0 y 1 (1 = match exacto).
 *
 * Reglas:
 *  1. Coincidencia exacta o casi-exacta de slugs normalizados → 1.0 / 0.95
 *  2. La PRIMERA keyword del slug más corto debe aparecer en el otro slug.
 *     Esto evita "esponja-acero" → "regla-de-acero" donde solo "acero" coincide.
 *  3. Score final = palabras_clave_comunes / max(palabras_clave_local, palabras_clave_TAM)
 *     con bonus de prefijo.
 */
function similitud(slugLocal, slugTAM) {
  const normL = normSlug(slugLocal);
  const normT = normSlug(slugTAM);

  if (slugLocal === slugTAM) return 1;
  if (normL === normT && normL.length > 0) return 0.95;

  const kwL = keywords(slugLocal);
  const kwT = keywords(slugTAM);

  if (kwL.length === 0 || kwT.length === 0) return 0;

  // Regla: la primera keyword del slug MÁS CORTO (menos palabras) debe estar
  // presente en el otro. Evita matches de tipo "esponja-acero" → "regla-de-acero"
  const ancla = kwL.length <= kwT.length ? kwL[0] : kwT[0];
  const destino = kwL.length <= kwT.length ? kwT : kwL;
  // La ancla debe aparecer exactamente o como prefijo de alguna keyword destino
  const anclaPresente = destino.some(w => w === ancla || w.startsWith(ancla) || ancla.startsWith(w));
  if (!anclaPresente) return 0;

  // Score por keywords en común (con coincidencia parcial para palabras ≥5 chars)
  const setT = new Set(kwT);
  let comunes = 0;
  for (const w of kwL) {
    if (setT.has(w)) {
      comunes += 1;
    } else if (w.length >= 5) {
      for (const wt of setT) {
        if (wt.includes(w) || w.includes(wt)) { comunes += 0.6; break; }
      }
    }
  }
  const wordScore = comunes / Math.max(kwL.length, kwT.length);

  // Bonus de prefijo (sobre slugs normalizados)
  const minLen = Math.min(normL.length, normT.length);
  let prefMatch = 0;
  for (let i = 0; i < minLen; i++) {
    if (normL[i] === normT[i]) prefMatch++;
    else break;
  }
  const prefixScore = prefMatch / Math.max(normL.length, normT.length, 1);

  return Math.max(wordScore, prefixScore * 0.9);
}


// ─── Programa principal ────────────────────────────────────────────────────────

async function main() {
  console.log('═══════════════════════════════════════════');
  console.log('  Scraper de imágenes TAM → Caro Cruz');
  console.log('═══════════════════════════════════════════\n');

  // 1. Crawlear páginas de categorías en TAM
  const tamMap = new Map(); // slug → { id, imagen }

  for (const cat of CATEGORIAS) {
    console.log(`\n📁 Categoría: ${cat.ruta}`);
    let pag = 1;

    while (pag <= cat.maxPag) {
      const url = pag === 1
        ? `${BASE_URL}${cat.ruta}`
        : `${BASE_URL}${cat.ruta}?page=${pag}`;

      process.stdout.write(`   Página ${pag}... `);
      let html;
      try {
        html = await fetchHtml(url);
      } catch (err) {
        console.log(`ERROR: ${err.message}`);
        break;
      }

      const productos = extraerProductosDeListado(html);
      let nuevos = 0;
      for (const p of productos) {
        if (!tamMap.has(p.slug)) {
          tamMap.set(p.slug, { id: p.id, imagen: p.imagen });
          nuevos++;
        }
      }
      console.log(`${productos.length} productos (${nuevos} nuevos)`);

      if (productos.length === 0 || !hayMasPaginas(html, pag)) break;

      pag++;
      await sleep(DELAY_MS);
    }
  }

  console.log(`\n✅ TAM: ${tamMap.size} productos únicos encontrados`);

  // 2. Leer catálogos locales
  const catalogoLocal = leerCatalogosLocales();
  console.log(`✅ Local: ${catalogoLocal.length} productos en catálogos\n`);

  // 3. Matching
  const imageMap = {};   // id_producto_local → { nombre, imagen, tamSlug }
  let conImagen  = 0;
  let sinImagen  = 0;

  const tamEntries = Array.from(tamMap.entries()); // [slug, {id, imagen}]

  for (const prod of catalogoLocal) {
    // Buscar mejor match en TAM
    let mejorSlug  = null;
    let mejorScore = 0;
    let mejorData  = null;

    for (const [tamSlug, tamData] of tamEntries) {
      const score = similitud(prod.slug, tamSlug);
      if (score > mejorScore) {
        mejorScore = score;
        mejorSlug  = tamSlug;
        mejorData  = tamData;
      }
    }

    const UMBRAL = 0.5; // Mínimo score para considerar como match
    if (mejorScore >= UMBRAL && mejorData && mejorData.imagen) {
      imageMap[prod.id] = {
        nombre:  prod.nombre,
        imagen:  mejorData.imagen,
        tamSlug: mejorSlug,
        score:   Math.round(mejorScore * 100),
      };
      conImagen++;
    } else {
      sinImagen++;
      if (mejorScore >= UMBRAL) {
        // Match encontrado pero sin imagen en TAM
        imageMap[prod.id] = {
          nombre:  prod.nombre,
          imagen:  null,
          tamSlug: mejorSlug,
          score:   Math.round(mejorScore * 100),
        };
      }
    }
  }

  // 4. Guardar resultado JSON
  fs.writeFileSync(SALIDA, JSON.stringify(imageMap, null, 2), 'utf-8');

  // 4b. Generar imagenes-map.js para usar como <script> en el sitio
  const jsMapPath = path.join(__dirname, 'imagenes-map.js');
  const jsLines = [`// Generado automáticamente por scraper-tam.js`,
                   `// Mapa: id_producto → url_imagen (tam.com.ar / cdn.billowshop.com)`,
                   `// Usa window. para evitar conflictos de re-declaración`,
                   `window.IMAGENES_MAP = {`];
  for (const [id, data] of Object.entries(imageMap)) {
    if (data.imagen) {
      jsLines.push(`  "${id}": "${data.imagen}",`);
    }
  }
  jsLines.push(`};`);
  fs.writeFileSync(jsMapPath, jsLines.join('\n') + '\n', 'utf-8');
  console.log(`  imagenes-map.js generado (listo para agregar al sitio)`);


  console.log('═══════════════════════════════════════════');
  console.log(`  Resultado guardado en: imagenes-tam.json`);
  console.log(`  Productos CON imagen : ${conImagen}`);
  console.log(`  Productos SIN imagen : ${sinImagen}`);
  console.log(`  Total procesados     : ${catalogoLocal.length}`);
  console.log('═══════════════════════════════════════════\n');

  // 5. Resumen de los primeros matches para verificación
  console.log('Muestra de matches (primeros 10):\n');
  let shown = 0;
  for (const [id, data] of Object.entries(imageMap)) {
    if (shown >= 10) break;
    if (data.imagen) {
      console.log(`  [${data.score}%] ${data.nombre}`);
      console.log(`         → ${data.imagen}\n`);
      shown++;
    }
  }
}

main().catch(err => {
  console.error('\n❌ Error fatal:', err.message);
  process.exit(1);
});
