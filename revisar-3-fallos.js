const { leerArchivo } = require('./src/publisher');

(async () => {
  for (const p of ['a-domicilio-en-perquenco.html', 'a-domicilio-en-lautaro.html']) {
    const html = await leerArchivo(p);
    console.log('=== ' + p + ' ===');
    const idx = html.indexOf('<main>');
    console.log(html.substring(idx, idx + 400));
    console.log('');
  }
})();
