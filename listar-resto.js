const fs = require('fs');
const resultados = JSON.parse(fs.readFileSync('reporte-auditoria-seo.json', 'utf8'));

const resto = resultados.filter(r =>
  !r.error &&
  (!r.tieneSchema || !r.tieneOG) &&
  !r.ruta.startsWith('a-domicilio-en-') &&
  !r.ruta.startsWith('en-')
);

console.log('Total paginas restantes (no ciudad):', resto.length);
resto.forEach(r => console.log(' -', r.ruta, '| Schema:', r.tieneSchema, '| OG:', r.tieneOG, '| Titulo:', r.titulo));

fs.writeFileSync('paginas-resto.json', JSON.stringify(resto.map(r => r.ruta), null, 2));
