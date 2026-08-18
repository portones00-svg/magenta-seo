const fs = require('fs');
const resultados = JSON.parse(fs.readFileSync('reporte-auditoria-seo.json', 'utf8'));

const paginasCiudad = resultados.filter(r =>
  !r.error &&
  !r.tieneOG &&
  (r.ruta.startsWith('a-domicilio-en-') || r.ruta.startsWith('en-')) &&
  r.ruta.endsWith('.html')
);

console.log('Total paginas de ciudad sin Open Graph:', paginasCiudad.length);
fs.writeFileSync('paginas-ciudad-sin-og.json', JSON.stringify(paginasCiudad.map(p => p.ruta), null, 2));
