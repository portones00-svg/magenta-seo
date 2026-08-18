const server = require('fs').readFileSync('./src/server.js', 'utf8');
const match = server.match(/const KW_SUGERIDAS = \[([\s\S]*?)\n\];/);
const temasEnLista = (match[1].match(/tema: '([^']+)'/g) || []).map(t => t.replace(/tema: '|'/g, ''));
console.log('Total temas en KW_SUGERIDAS:', temasEnLista.length);

const { obtenerCola } = require('./src/scheduler');
const cola = obtenerCola();
const temasUsados = new Set(cola.map(item => item.tema));
console.log('Total temas distintos ya usados en la cola:', temasUsados.size);

const disponibles = temasEnLista.filter(function(t) { return !temasUsados.has(t); });
console.log('Temas de KW_SUGERIDAS todavia disponibles:', disponibles.length);
