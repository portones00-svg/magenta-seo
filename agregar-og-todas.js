const { leerArchivo, subirArchivo } = require('./src/publisher');
const fs = require('fs');

const paginas = JSON.parse(fs.readFileSync('paginas-ciudad-sin-og.json', 'utf8'));

(async () => {
  let exitosas = 0, saltadas = 0, fallidas = 0;

  for (const pagina of paginas) {
    try {
      let html = await leerArchivo(pagina);
      if (!html) { console.log('❌ No se pudo leer', pagina); fallidas++; continue; }

      if (html.includes('property="og:title"')) {
        console.log('⚠️', pagina, '- ya tiene Open Graph, se omite');
        saltadas++;
        continue;
      }

      const titleMatch = html.match(/<title>([^<]*)<\/title>/i);
      const titulo = titleMatch ? titleMatch[1] : 'Reparación de Portones';

      const metaMatch = html.match(/<meta\s+name=["']description["']\s+content=["']([^"']*)["']/i);
      const descripcion = metaMatch ? metaMatch[1] : 'Reparación y mantención de portones eléctricos.';

      const canonicalMatch = html.match(/<link\s+rel=["']canonical["']\s+href=["']([^"']*)["']/i);
      const url = canonicalMatch ? canonicalMatch[1] : ('https://www.reparaciondeportones.cl/' + pagina);

      const ogTags = `  <meta property="og:title" content="${titulo}">
  <meta property="og:description" content="${descripcion}">
  <meta property="og:url" content="${url}">
  <meta property="og:type" content="website">
  <meta property="og:image" content="https://www.reparaciondeportones.cl/images/bg-comunas.jpg">
  <meta property="og:locale" content="es_CL">
  <meta property="og:site_name" content="Reparación de Portones">
`;

      html = html.replace('</head>', ogTags + '</head>');
      await subirArchivo(pagina, html);
      console.log('✅', pagina);
      exitosas++;
    } catch (err) {
      console.log('❌ Error en', pagina, ':', err.message);
      fallidas++;
    }
  }

  console.log('');
  console.log('========== RESUMEN ==========');
  console.log('Exitosas:', exitosas, '| Saltadas:', saltadas, '| Fallidas:', fallidas, '| Total:', paginas.length);
})();
