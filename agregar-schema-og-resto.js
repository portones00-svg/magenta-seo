const { leerArchivo, subirArchivo } = require('./src/publisher');
const fs = require('fs');

const paginas = JSON.parse(fs.readFileSync('paginas-resto.json', 'utf8'));

function tipoSchema(pagina) {
  if (pagina === 'blog.html') return 'Blog';
  return 'Service';
}

(async () => {
  let exitosas = 0, fallidas = 0;

  for (const pagina of paginas) {
    try {
      let html = await leerArchivo(pagina);
      if (!html) { console.log('❌ No se pudo leer', pagina); fallidas++; continue; }

      const titleMatch = html.match(/<title>([^<]*)<\/title>/i);
      const titulo = titleMatch ? titleMatch[1] : 'Reparación de Portones';

      const metaMatch = html.match(/<meta\s+name=["']description["']\s+content=["']([^"']*)["']/i);
      const descripcion = metaMatch ? metaMatch[1] : 'Reparación y mantención de portones eléctricos en Chile.';

      const canonicalMatch = html.match(/<link\s+rel=["']canonical["']\s+href=["']([^"']*)["']/i);
      const url = canonicalMatch ? canonicalMatch[1] : ('https://www.reparaciondeportones.cl/' + pagina);

      let bloquesNuevos = '';

      // 1. Schema.org (si no lo tiene)
      if (!html.includes('application/ld+json')) {
        const tipo = tipoSchema(pagina);
        let schema;
        if (tipo === 'Blog') {
          schema = {
            "@context": "https://schema.org",
            "@type": "Blog",
            "name": titulo,
            "description": descripcion,
            "url": url,
            "publisher": {
              "@type": "LocalBusiness",
              "name": "Reparación de Portones",
              "telephone": "+56930713507",
              "url": "https://www.reparaciondeportones.cl"
            }
          };
        } else {
          schema = {
            "@context": "https://schema.org",
            "@type": "Service",
            "serviceType": titulo,
            "provider": {
              "@type": "LocalBusiness",
              "name": "Reparación de Portones",
              "telephone": "+56930713507",
              "url": "https://www.reparaciondeportones.cl",
              "address": { "@type": "PostalAddress", "addressCountry": "CL" }
            },
            "description": descripcion,
            "url": url
          };
        }
        bloquesNuevos += `  <script type="application/ld+json">\n${JSON.stringify(schema, null, 2)}\n  </script>\n`;
      }

      // 2. Open Graph (si no lo tiene)
      if (!html.includes('property="og:title"')) {
        bloquesNuevos += `  <meta property="og:title" content="${titulo}">
  <meta property="og:description" content="${descripcion}">
  <meta property="og:url" content="${url}">
  <meta property="og:type" content="website">
  <meta property="og:image" content="https://www.reparaciondeportones.cl/images/bg-comunas.jpg">
  <meta property="og:locale" content="es_CL">
  <meta property="og:site_name" content="Reparación de Portones">
`;
      }

      if (bloquesNuevos === '') {
        console.log('⚠️', pagina, '- ya tenia ambos, se omite');
        continue;
      }

      html = html.replace('</head>', bloquesNuevos + '</head>');
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
  console.log('Exitosas:', exitosas, '| Fallidas:', fallidas, '| Total:', paginas.length);
})();
