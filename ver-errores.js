const fs = require('fs');
const resultados = JSON.parse(fs.readFileSync('reporte-auditoria-seo.json', 'utf8'));
const errores = resultados.filter(r => r.error);
errores.forEach(e => console.log(e.ruta));
