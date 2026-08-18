const { leerArchivo, subirArchivo } = require('./src/publisher');

const PAGINAS_PRUEBA = ['a-domicilio-en-puente-alto.html', 'a-domicilio-en-la-florida.html'];

(async () => {
  for (const pagina of PAGINAS_PRUEBA) {
    let html = await leerArchivo(pagina);
    if (!html) { console.log('❌ No se pudo leer', pagina); continue; }

    if (html.includes('property="og:title"')) {
      console.log('⚠️', pagina, '- ya tiene Open Graph, se omite');
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
    console.log('✅', pagina, '→ Open Graph agregado');
  }
})();
