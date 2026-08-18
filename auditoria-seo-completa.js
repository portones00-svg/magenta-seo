const { leerArchivo } = require('./src/publisher');
const https = require('https');

function fetchText(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(data));
    }).on('error', reject);
  });
}

function extraerRutas(xml) {
  const matches = xml.match(/<loc>([^<]*)<\/loc>/g) || [];
  return matches.map(m => {
    const url = m.replace('<loc>', '').replace('</loc>', '');
    return url.replace('https://www.reparaciondeportones.cl/', '').replace('https://reparaciondeportones.cl/', '');
  }).filter(r => r.length > 0);
}

async function auditarPagina(ruta) {
  const html = await leerArchivo(ruta);
  if (!html) return { ruta, error: 'No se pudo leer' };

  const titleMatch = html.match(/<title>([^<]*)<\/title>/i);
  const title = titleMatch ? titleMatch[1] : null;
  const tituloLen = title ? title.length : 0;

  const metaMatch = html.match(/<meta\s+name=["']description["']\s+content=["']([^"']*)["']/i);
  const meta = metaMatch ? metaMatch[1] : null;
  const metaLen = meta ? meta.length : 0;

  const h1Count = (html.match(/<h1[\s>]/gi) || []).length;

  const imgTags = html.match(/<img[^>]*>/gi) || [];
  const imgsSinAlt = imgTags.filter(img => !/alt=/i.test(img)).length;

  const tieneSchema = /itemtype=["']https?:\/\/schema\.org|application\/ld\+json/i.test(html);
  const tieneOG = /property=["']og:title["']/i.test(html);

  return {
    ruta,
    tituloLen,
    titulo: title ? title.substring(0, 60) : '(sin title)',
    metaLen,
    h1Count,
    imgsSinAlt,
    totalImgs: imgTags.length,
    tieneSchema,
    tieneOG
  };
}

(async () => {
  console.log('Descargando sitemaps...');
  const sitemapPaginas = await fetchText('https://www.reparaciondeportones.cl/sitemap.xml');
  const sitemapBlog = await fetchText('https://www.reparaciondeportones.cl/sitemap-blog.xml');

  const rutasPaginas = extraerRutas(sitemapPaginas);
  const rutasBlog = extraerRutas(sitemapBlog);
  const todasLasRutas = [...new Set([...rutasPaginas, ...rutasBlog])];

  console.log('Total de paginas a auditar:', todasLasRutas.length);
  console.log('');

  const resultados = [];
  let i = 0;
  for (const ruta of todasLasRutas) {
    i++;
    process.stdout.write('\rAuditando ' + i + '/' + todasLasRutas.length + '...');
    const r = await auditarPagina(ruta);
    resultados.push(r);
  }
  console.log('\n');

  // Resumen de problemas
  const sinSchema = resultados.filter(r => !r.error && !r.tieneSchema);
  const sinOG = resultados.filter(r => !r.error && !r.tieneOG);
  const tituloMalo = resultados.filter(r => !r.error && (r.tituloLen < 10 || r.tituloLen > 70));
  const metaMala = resultados.filter(r => !r.error && (r.metaLen < 50 || r.metaLen > 160 || r.metaLen === 0));
  const sinH1 = resultados.filter(r => !r.error && r.h1Count === 0);
  const multiplesH1 = resultados.filter(r => !r.error && r.h1Count > 1);
  const imgsSinAltTotal = resultados.filter(r => !r.error && r.imgsSinAlt > 0);
  const errores = resultados.filter(r => r.error);

  console.log('========== RESUMEN DE LA AUDITORIA ==========');
  console.log('Total paginas analizadas:', resultados.length);
  console.log('Errores de lectura:', errores.length);
  console.log('');
  console.log('Sin Schema.org:', sinSchema.length, '/', resultados.length);
  console.log('Sin Open Graph:', sinOG.length, '/', resultados.length);
  console.log('Titulo fuera de rango (10-70 caracteres):', tituloMalo.length);
  console.log('Meta description fuera de rango (50-160 caracteres):', metaMala.length);
  console.log('Sin H1:', sinH1.length);
  console.log('Con multiples H1:', multiplesH1.length);
  console.log('Paginas con imagenes sin alt:', imgsSinAltTotal.length);

  const fs = require('fs');
  fs.writeFileSync('reporte-auditoria-seo.json', JSON.stringify(resultados, null, 2));
  console.log('');
  console.log('✅ Reporte completo guardado en reporte-auditoria-seo.json');
})();
