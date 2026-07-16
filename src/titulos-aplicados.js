const fs = require('fs');

const DATA_DIR = process.env.DATA_DIR || '/tmp';
const APLICADOS_FILE = `${DATA_DIR}/magenta-seo-titulos-aplicados.json`;

function cargarAplicados() {
  try {
    if (fs.existsSync(APLICADOS_FILE)) {
      return JSON.parse(fs.readFileSync(APLICADOS_FILE, 'utf8'));
    }
  } catch(e) {}
  return [];
}

function registrarAplicado(pagina) {
  try {
    const aplicados = cargarAplicados();
    aplicados.push({ pagina, fecha: new Date().toISOString() });
    fs.writeFileSync(APLICADOS_FILE, JSON.stringify(aplicados, null, 2));
  } catch(e) {
    console.error('[APLICADOS] Error guardando:', e.message);
  }
}

function fueAplicadoRecientemente(pagina, dias = 30) {
  const aplicados = cargarAplicados();
  const limite = Date.now() - dias * 24 * 60 * 60 * 1000;
  return aplicados.some(a => a.pagina === pagina && new Date(a.fecha).getTime() > limite);
}

module.exports = { registrarAplicado, fueAplicadoRecientemente, cargarAplicados };
