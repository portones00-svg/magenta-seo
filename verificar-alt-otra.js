const { leerArchivo } = require('./src/publisher');

(async () => {
  const html = await leerArchivo('en-la-serena.html');
  const imgTags = html.match(/<img[^>]*>/gi) || [];
  const sinAlt = imgTags.filter(img => !/alt=/i.test(img));
  console.log('Imagenes totales:', imgTags.length);
  console.log('Sin alt:', sinAlt.length);
  sinAlt.forEach(img => console.log(' →', img));
})();
