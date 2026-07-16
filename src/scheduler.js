// scheduler.js — Gestión del calendario y cola de publicaciones
const fs = require('fs');
const path = require('path');

// En producción esto debería estar en MySQL, por ahora en memoria + archivo JSON
const COLA_FILE = (process.env.DATA_DIR || '/tmp') + '/magenta-seo-cola.json';

function cargarCola() {
  try {
    if (fs.existsSync(COLA_FILE)) {
      return JSON.parse(fs.readFileSync(COLA_FILE, 'utf8'));
    }
  } catch(e) {}
  return [];
}

function guardarCola(cola) {
  try {
    fs.writeFileSync(COLA_FILE, JSON.stringify(cola, null, 2));
  } catch(e) {
    console.error('[SCHEDULER] Error guardando cola:', e.message);
  }
}

function agregarACola(item) {
  const cola = cargarCola();
  const id = Date.now().toString() + '-' + Math.random().toString(36).slice(2, 8);
  cola.push({ id, ...item, estado: item.estado || 'pendiente', creadoEn: new Date().toISOString() });
  guardarCola(cola);
  return id;
}

function obtenerCola() {
  return cargarCola();
}

function obtenerItemPorId(id) {
  return cargarCola().find(i => i.id === id);
}

function actualizarItem(id, cambios) {
  const cola = cargarCola();
  const idx = cola.findIndex(i => i.id === id);
  if (idx >= 0) {
    cola[idx] = { ...cola[idx], ...cambios };
    guardarCola(cola);
    return cola[idx];
  }
  return null;
}

function eliminarItem(id) {
  const cola = cargarCola().filter(i => i.id !== id);
  guardarCola(cola);
}

function obtenerItemsParaHoy() {
  const hoy = new Date().toISOString().split('T')[0];
  return cargarCola().filter(i => i.fechaProgramada === hoy && i.estado === 'aprobado');
}

function obtenerCalendarioMes(año, mes) {
  const cola = cargarCola();
  const prefijo = `${año}-${String(mes).padStart(2, '0')}`;
  return cola.filter(i => i.fechaProgramada && i.fechaProgramada.startsWith(prefijo));
}

module.exports = {
  agregarACola, obtenerCola, obtenerItemPorId,
  actualizarItem, eliminarItem, obtenerItemsParaHoy,
  obtenerCalendarioMes
};
