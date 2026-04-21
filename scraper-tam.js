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

// Palabras que solas NO pueden anclar un match: adjetivos, colores, genéricos.
const GENERIC_WORDS = new Set([
  // Tamaños
  'chico', 'grande', 'mediano', 'pequeno', 'ultra',
  // Colores — masculino Y femenino para evitar "goma blanca" → "cartulina blanca"
  'negro', 'negra', 'azul', 'rojo', 'roja', 'verde', 'blanco', 'blanca',
  'amarillo', 'amarilla', 'rosa', 'gris', 'naranja', 'celeste',
  'violeta', 'lila', 'marron', 'beige', 'dorado', 'dorada',
  'color', 'colores', 'surtido', 'surtida', 'surtidos', 'surtidas', 'varios',
  // "papel" es tan genérico en una papelería que no puede anclar solo
  // (evita "blondas de papel" → "papel afiche", "papel parafinado" → "papel afiche")
  'papel',
  // Materiales — forzosamente genéricos
  'metal', 'metalico', 'metalizada', 'metalizado',
  // OJO: "plastico"/"plastica" NO están aquí a propósito.
  // Son discriminadores válidos: "bandeja carton" ≠ "bandeja plastica",
  // "caja carton" ≠ "caja plastica", etc.
  'acero', 'goma', 'madera', 'tela', 'cuero',
  // Calificadores
  'doble', 'triple', 'extra', 'super', 'mini', 'maxi',
  'original', 'classic', 'premium', 'profesional',
  'oferta', 'especial', 'natural', 'transparente', 'opaco',
]);

/**
 * Normaliza un slug para matching:
 *  - Elimina tokens puramente numéricos o de unidad   (50u, x10u, xu, 5kg)
 *  - Elimina dimensiones simples y compuestas         (48mm, 100m, 12x30, 80x110cm)
 *  - Elimina cantidades con prefijo x                 (x300m, x500ml, x100)
 *  - Elimina códigos de formato/tamaño alfanuméricos  (a4, n3, n6, 2b, a3)
 *  - Elimina SKUs/números de orden de 2+ dígitos      (403, 65, 850)
 *
 * Resultado: sólo quedan palabras que describen QUÉ es el producto.
 * "CINTA ADHESIVA 18X50 XU STIKO" → "cinta-adhesiva-stiko"
 * "ROLLO FILM 38X300M NARANJA XU" → "rollo-film"   (naranja filtrado en keywords)
 * "CUADERNO EXITO N7 X96H XU"    → "cuaderno-exito"
 */
function normSlug(slug) {
  return slug
    .split('-')
    .filter(w => {
      if (!w) return false;
      // Puramente numérico / xu / x100 / 50u
      if (/^x?\d+u?$/i.test(w)) return false;
      // Magnitud con unidad: 48mm, 5kg, 750ml, 100grs, 30mts, 1lt
      if (/^\d+(u|ml|cc|kg|grs?|mm|cm|mts?|lts?|hs?)$/i.test(w)) return false;
      // Metros solos: 100m, 300m
      if (/^\d+m$/i.test(w)) return false;
      // Dimensiones simples o compuestas: 12x30, 80x110, 42x32x25, 12x30cm
      if (/^\d+(x\d+)+(m|cm|mm)?$/i.test(w)) return false;
      // Cantidades con prefijo x y unidad opcional: x300m, x500ml, x100
      if (/^x\d+[a-z]*$/i.test(w)) return false;
      // Códigos de formato/tamaño: a4, n3, n6, 2b, a3, a5 (1 letra + 1-2 dígitos o viceversa)
      if (/^[a-zA-Z]\d{1,2}$/.test(w) || /^\d{1,2}[a-zA-Z]$/.test(w)) return false;
      // SKUs / números de orden de 2+ dígitos puros
      if (/^\d{2,}$/.test(w)) return false;
      return true;
    })
    .join('-');
}

/**
 * Keywords sustantivas: palabras ≥ 3 chars que no son adjetivos/colores genéricos.
 */
function keywords(slug) {
  return normSlug(slug)
    .split('-')
    .filter(w => w.length >= 3 && !GENERIC_WORDS.has(w));
}

/**
 * Similitud entre slugLocal (catálogo Caro Cruz) y slugTAM.
 *
 * Estrategia de ancla BIDIRECCIONAL:
 *   - Dirección A: primera keyword de LOCAL aparece en TAM
 *     (funciona cuando el local empieza con marca/tipo)
 *   - Dirección B: primera keyword de TAM aparece en LOCAL
 *     (funciona cuando el local omite la marca que TAM sí tiene)
 *   Con UNA de las dos basta para pasar el filtro de ancla.
 *
 * Beneficio: "ROLLO FILM 38X300M" y "rollo-film-strech-resinite" matchean
 *   aunque ninguno contenga la dimensión del otro.
 *   "ESPONJA VERDE" y "regla-de-acero" NO matchean porque ni "esponja"
 *   ni "verde" aparecen en {regla}.
 */
function similitud(slugLocal, slugTAM) {
  const nL = normSlug(slugLocal);
  const nT = normSlug(slugTAM);

  if (slugLocal === slugTAM) return 1;
  if (nL === nT && nL.length > 3) return 0.95;

  const kwL = keywords(slugLocal);
  const kwT = keywords(slugTAM);

  if (kwL.length === 0 || kwT.length === 0) return 0;

  // Ancla bidireccional: la primera keyword de CUALQUIERA de los dos
  // debe aparecer en el otro (exacta o como prefijo de ≥4 chars).
  const anclaOK =
    kwT.some(w => w === kwL[0] || (kwL[0].length >= 4 && (w.startsWith(kwL[0]) || kwL[0].startsWith(w)))) ||
    kwL.some(w => w === kwT[0] || (kwT[0].length >= 4 && (w.startsWith(kwT[0]) || kwT[0].startsWith(w))));
  if (!anclaOK) return 0;

  // Score: palabras clave en común / max de ambas listas
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

  return comunes / Math.max(kwL.length, kwT.length);
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

  // 5. Distribución de scores + archivo de revisión manual
  const rangos = { r100: [], r90: [], r70: [], r65: [], r50: [] };
  for (const [id, data] of Object.entries(imageMap)) {
    if (!data.imagen) continue;
    const s = data.score;
    if (s === 100)     rangos.r100.push({ id, data });
    else if (s >= 90)  rangos.r90.push({ id, data });
    else if (s >= 70)  rangos.r70.push({ id, data });
    else if (s >= 65)  rangos.r65.push({ id, data });
    else               rangos.r50.push({ id, data });
  }
  console.log('Distribución de scores:');
  console.log(`  100%   : ${rangos.r100.length} (match exacto)`);
  console.log(`  90-99% : ${rangos.r90.length}  (casi exacto)`);
  console.log(`  70-89% : ${rangos.r70.length}  (buen match)`);
  console.log(`  65-69% : ${rangos.r65.length}  (match aceptable)`);
  console.log(`  50-64% : ${rangos.r50.length}  (revisar manualmente)\n`);

  // Guardar items ≤ 64% para revisión manual
  const lineasRevision = rangos.r50.map(
    ({ id, data }) => `[${data.score}%] ${id.padEnd(12)} ${data.nombre.padEnd(45)} → ${data.tamSlug}`
  );
  fs.writeFileSync(
    path.join(__dirname, 'matches-revisar.txt'),
    `# Matches con score 50-64% — revisar si la imagen es correcta\n` +
    `# Formato: [score] id  nombre_local  →  slug_TAM\n\n` +
    lineasRevision.join('\n') + '\n',
    'utf-8'
  );
  console.log(`  matches-revisar.txt generado (${rangos.r50.length} items para revisar)\n`);

  // 6. Muestra de los primeros 10 matches para verificación rápida
  console.log('Muestra de matches (primeros 10):\n');
  let shown = 0;
  for (const [id, data] of Object.entries(imageMap)) {
    if (shown >= 10) break;
    if (data.imagen) {
      console.log(`  [${data.score}%] ${data.nombre}`);
      console.log(`         → ${data.tamSlug}\n`);
      shown++;
    }
  }
}

main().catch(err => {
  console.error('\n❌ Error fatal:', err.message);
  process.exit(1);
});
