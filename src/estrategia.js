const fs = require('fs');

const DATA_DIR = process.env.DATA_DIR || '/tmp';
const PLAN_FILE = `${DATA_DIR}/magenta-seo-plan.json`;

function cargarPlan() {
  try {
    if (fs.existsSync(PLAN_FILE)) {
      return JSON.parse(fs.readFileSync(PLAN_FILE, 'utf8'));
    }
  } catch(e) {}
  return null;
}

function guardarPlan(plan) {
  try {
    const data = { ...plan, actualizadoEn: new Date().toISOString() };
    fs.writeFileSync(PLAN_FILE, JSON.stringify(data, null, 2));
    return data;
  } catch(e) {
    console.error('[ESTRATEGIA] Error guardando plan:', e.message);
    return null;
  }
}

const HISTORIAL_FILE = `${DATA_DIR}/magenta-seo-historial.json`;

function cargarHistorial() {
  try {
    if (fs.existsSync(HISTORIAL_FILE)) {
      return JSON.parse(fs.readFileSync(HISTORIAL_FILE, 'utf8'));
    }
  } catch(e) {}
  return [];
}

function guardarEnHistorial(entrada) {
  try {
    const historial = cargarHistorial();
    historial.push(entrada);
    fs.writeFileSync(HISTORIAL_FILE, JSON.stringify(historial, null, 2));
    return entrada;
  } catch(e) {
    console.error('[HISTORIAL] Error guardando:', e.message);
    return null;
  }
}

function eliminarDeHistorial(id) {
  try {
    const historial = cargarHistorial();
    const filtrado = historial.filter(h => h.id !== id);
    fs.writeFileSync(HISTORIAL_FILE, JSON.stringify(filtrado, null, 2));
    return true;
  } catch(e) {
    console.error('[HISTORIAL] Error eliminando:', e.message);
    return false;
  }
}

function limpiarPlan() {
  try {
    if (fs.existsSync(PLAN_FILE)) fs.unlinkSync(PLAN_FILE);
    return true;
  } catch(e) {
    console.error('[ESTRATEGIA] Error limpiando plan:', e.message);
    return false;
  }
}

module.exports = { cargarPlan, guardarPlan, cargarHistorial, guardarEnHistorial, eliminarDeHistorial, limpiarPlan };
