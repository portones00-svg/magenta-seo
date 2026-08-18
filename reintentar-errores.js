const { leerArchivo } = require('./src/publisher');
const fs = require('fs');

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

  return { ruta, tituloLen, titulo: title ? title.substring(0, 60) : '(sin title)', metaLen, h1Count, imgsSinAlt, totalImgs: imgTags.length, tieneSchema, tieneOG };
}

(async () => {
  const resultados = JSON.parse(fs.readFileSync('reporte-auditoria-seo.json', 'utf8'));
  const rutasConError = resultados.filter(r => r.error).map(r => r.ruta);

  console.log('Reintentando', rutasConError.length, 'rutas agregando index.html...');

  for (let i = 0; i < resultados.length; i++) {
    if (resultados[i].error) {
      const rutaCorregida = resultados[i].ruta + 'index.html';
      const nuevo = await auditarPagina(rutaCorregida);
      resultados[i] = nuevo;
      console.log(nuevo.error ? '❌ Sigue fallando: ' + rutaCorregida : '✅ ' + rutaCorregida);
    }
  }

  fs.writeFileSync('reporte-auditoria-seo.json', JSON.stringify(resultados, null, 2));

  const sinSchema = resultados.filter(r => !r.error && !r.tieneSchema);
  const sinOG = resultados.filter(r => !r.error && !r.tieneOG);
  const tituloMalo = resultados.filter(r => !r.error && (r.tituloLen < 10 || r.tituloLen > 70));
  const metaMala = resultados.filter(r => !r.error && (r.metaLen < 50 || r.metaLen > 160 || r.metaLen === 0));
  const imgsSinAltTotal = resultados.filter(r => !r.error && r.imgsSinAlt > 0);
  const errores = resultados.filter(r => r.error);

  console.log('');
  console.log('========== RESUMEN ACTUALIZADO ==========');
  console.log('Total paginas:', resultados.length, '| Errores restantes:', errores.length);
  console.log('Sin Schema.org:', sinSchema.length);
  console.log('Sin Open Graph:', sinOG.length);
  console.log('Titulo fuera de rango:', tituloMalo.length);
  console.log('Meta description fuera de rango:', metaMala.length);
  console.log('Paginas con imagenes sin alt:', imgsSinAltTotal.length);
})();
