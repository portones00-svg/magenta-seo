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

module.exports = { cargarPlan, guardarPlan };
