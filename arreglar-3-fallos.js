const { leerArchivo, subirArchivo } = require('./src/publisher');

// Ciudad para cada pagina, puesta a mano ya que sus H1 tienen formatos distintos
const ciudadesManual = {
  'a-domicilio-en-jardin-del-mar.html': 'Jardín Del Mar',
  'a-domicilio-en-perquenco.html': 'Perquenco',
  'a-domicilio-en-lautaro.html': 'Lautaro'
};

(async () => {
  for (const [pagina, ciudad] of Object.entries(ciudadesManual)) {
    let html = await leerArchivo(pagina);
    if (!html) { console.log('❌ No se pudo leer', pagina); continue; }

    if (html.includes('application/ld+json')) {
      console.log('⚠️', pagina, '- ya tiene schema, se omite');
      continue;
    }

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
  }
})();
