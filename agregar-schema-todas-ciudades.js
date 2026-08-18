const { leerArchivo, subirArchivo } = require('./src/publisher');
const fs = require('fs');

const paginas = JSON.parse(fs.readFileSync('paginas-ciudad-sin-schema.json', 'utf8'));

(async () => {
  let exitosas = 0, saltadas = 0, fallidas = 0;

  for (const pagina of paginas) {
    try {
      let html = await leerArchivo(pagina);
      if (!html) { console.log('❌ No se pudo leer', pagina); fallidas++; continue; }

      if (html.includes('application/ld+json')) {
        console.log('⚠️', pagina, '- ya tiene schema, se omite');
        saltadas++;
        continue;
      }

      const h1Match = html.match(/<h1[^>]*>([^<]*)<\/h1>/i);
      if (!h1Match) { console.log('⚠️ Sin H1:', pagina); fallidas++; continue; }

      const h1 = h1Match[1];
      const idxEn = h1.lastIndexOf(' en ');
      if (idxEn === -1) { console.log('⚠️ No se pudo extraer ciudad de:', pagina, '(H1:', h1, ')'); fallidas++; continue; }
      const ciudad = h1.substring(idxEn + 4).trim();

      const metaMatch = html.match(/<meta\s+name=["']description["']\s+content=["']([^"']*)["']/i);
      const descripcion = metaMatch ? metaMatch[1] : `Servicio de reparación y mantención de portones eléctricos en ${ciudad}.`;

      const canonicalMatch = html.match(/<link\s+rel=["']canonical["']\s+href=["']([^"']*)["']/i);
      const url = canonicalMatch ? canonicalMatch[1] : ('https://www.reparaciondeportones.cl/' + pagina);

      const schema = {
        "@context": "https://schema.org",
        "@type": "Service",
        "serviceType": "Reparación y mantención de portones eléctricos",
        "provider": {
          "@type": "LocalBusiness",
          "name": "Reparación de Portones",
          "telephone": "+56930713507",
          "url": "https://www.reparaciondeportones.cl",
          "address": { "@type": "PostalAddress", "addressCountry": "CL" }
        },
        "areaServed": { "@type": "City", "name": ciudad },
        "description": descripcion,
        "url": url
      };

      const scriptTag = `  <script type="application/ld+json">\n${JSON.stringify(schema, null, 2)}\n  </script>\n`;
      html = html.replace('</head>', scriptTag + '</head>');

      await subirArchivo(pagina, html);
      console.log('✅', pagina, '→', ciudad);
      exitosas++;
    } catch (err) {
      console.log('❌ Error en', pagina, ':', err.message);
      fallidas++;
    }
  }

  console.log('');
  console.log('========== RESUMEN ==========');
  console.log('Exitosas:', exitosas, '| Saltadas (ya tenian):', saltadas, '| Fallidas:', fallidas, '| Total:', paginas.length);
})();
