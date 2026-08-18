const { leerArchivo } = require('./src/publisher');

(async () => {
  const paginas = ['a-domicilio-en-puente-alto.html', 'en-la-serena.html', 'a-domicilio-en-vitacura.html'];
  for (const p of paginas) {
    const html = await leerArchivo(p);
    const h1 = html.match(/<h1[^>]*>([^<]*)<\/h1>/i);
    console.log(p, '→ H1:', h1 ? h1[1] : '(no encontrado)');
  }
})();
