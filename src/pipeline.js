const { generarArticulo, generarMetadata } = require('./generator');
const { buildArticlePage, buildDate } = require('./builder');
const { publicarArticulo } = require('./publisher');
const { actualizarSitemap } = require('./sitemap');
const { generarYSubirImagen } = require('./imagen');

const SITE_URL = process.env.SITE_URL || 'https://www.reparaciondeportones.cl';

// Función principal — publicar un artículo completo de punta a punta
async function publicarArticuloCompleto({ tema, marca, carpeta = 'blog', daysAgo = 0, relacionados = [] }) {
  console.log(`\n[PIPELINE] Iniciando publicación: "${tema}"`);
  const inicio = Date.now();

  try {
    // 1. Generar metadata (title, description, slug, h1)
    console.log('[PIPELINE] 1/4 Generando metadata...');
    const meta = await generarMetadata({ tema, marca, tipo: 'articulo' });
    console.log('[PIPELINE] Slug:', meta.slug, '| Title:', meta.title);

    // 2. Generar contenido del artículo
    console.log('[PIPELINE] 2/4 Generando contenido (~1000 palabras)...');
    const contenido = await generarArticulo({ tema, marca, slug: meta.slug });

    // 3. Generar imagen con DALL-E 3
    console.log('[PIPELINE] 3/5 Generando imagen con DALL-E 3...');
    const { isoDate, dateStr } = buildDate(daysAgo);
    const canonical = `${SITE_URL}/${carpeta}/${meta.slug}/`;
    const imagen = await generarYSubirImagen({ tema, marca, slug: meta.slug });

    // 4. Construir HTML completo con plantilla del sitio
    console.log('[PIPELINE] 4/5 Construyendo HTML...');

    const htmlCompleto = buildArticlePage({
      title: meta.h1 || meta.title,
      description: meta.description,
      canonical,
      isoDate,
      dateStr,
      image: imagen,
      content: contenido,
      marca: marca || null,
      backUrl: `../../blog/`,
      backLabel: 'Volver al blog',
      relacionados
    });

    // 5. Subir HTML a Bluehost vía SFTP
    console.log('[PIPELINE] 5/5 Subiendo HTML a Bluehost...');
    await publicarArticulo({
      slug: meta.slug,
      carpeta,
      htmlContent: htmlCompleto
    });

    // 5. Actualizar sitemap
    await actualizarSitemap({ canonical });

    const duracion = ((Date.now() - inicio) / 1000).toFixed(1);
    console.log(`[PIPELINE] ✅ Completado en ${duracion}s: ${canonical}`);

    return {
      ok: true,
      slug: meta.slug,
      title: meta.title,
      canonical,
      imagen,
      isoDate,
      dateStr,
      excerpt: meta.description,
      duracion
    };

  } catch (err) {
    console.error('[PIPELINE] ❌ Error:', err.message);
    return { ok: false, error: err.message };
  }
}

// Publicar múltiples artículos en secuencia (con pausa entre cada uno)
async function publicarLote(articulos, pausaMs = 3000) {
  const resultados = [];
  for (let i = 0; i < articulos.length; i++) {
    console.log(`\n[LOTE] ${i + 1}/${articulos.length}`);
    const resultado = await publicarArticuloCompleto(articulos[i]);
    resultados.push(resultado);
    if (i < articulos.length - 1) {
      console.log(`[LOTE] Pausa ${pausaMs / 1000}s...`);
      await new Promise(r => setTimeout(r, pausaMs));
    }
  }
  return resultados;
}

module.exports = { publicarArticuloCompleto, publicarLote };
