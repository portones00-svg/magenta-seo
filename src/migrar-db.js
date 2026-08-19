// migrar-db.js — crea las tablas y migra los datos actuales (JSON planos) a Postgres.
// Diseñada para ser segura de correr mas de una vez (idempotente).
const fs = require('fs');
const path = require('path');
const { query } = require('./db');
const { cargarPlan } = require('./estrategia');
const { cargarHistorial } = require('./estrategia');
const { obtenerCola } = require('./scheduler');

async function ejecutarMigracion() {
  const resultado = { pasos: [] };

  // 1) Crear tablas (CREATE TABLE IF NOT EXISTS, seguro repetir)
  const schemaPath = path.join(__dirname, '..', 'db', 'schema.sql');
  const schemaSql = fs.readFileSync(schemaPath, 'utf8');
  await query(schemaSql);
  resultado.pasos.push('Tablas creadas o ya existentes');

  // 2) Crear la cuenta (agencia) si no existe
  const email = process.env.ADMIN_EMAIL || 'portones00@gmail.com';
  let cuenta = await query('SELECT id FROM cuentas WHERE email = $1', [email]);
  let cuentaId;
  if (cuenta.rows.length === 0) {
    const insert = await query(
      `INSERT INTO cuentas (email, nombre, plan, max_sitios, estado) VALUES ($1, $2, 'agencia', 5, 'activo') RETURNING id`,
      [email, 'Magenta Electric']
    );
    cuentaId = insert.rows[0].id;
    resultado.pasos.push(`Cuenta creada (id ${cuentaId})`);
  } else {
    cuentaId = cuenta.rows[0].id;
    resultado.pasos.push(`Cuenta ya existia (id ${cuentaId})`);
  }

  // 3) Crear el sitio reparaciondeportones.cl si no existe
  let sitio = await query('SELECT id FROM sitios WHERE dominio = $1 AND cuenta_id = $2', ['reparaciondeportones.cl', cuentaId]);
  let sitioId;
  if (sitio.rows.length === 0) {
    const insert = await query(
      `INSERT INTO sitios (cuenta_id, nombre, dominio, activo) VALUES ($1, $2, $3, true) RETURNING id`,
      [cuentaId, 'Reparación de Portones', 'reparaciondeportones.cl']
    );
    sitioId = insert.rows[0].id;
    resultado.pasos.push(`Sitio creado (id ${sitioId})`);
  } else {
    sitioId = sitio.rows[0].id;
    resultado.pasos.push(`Sitio ya existia (id ${sitioId})`);
  }

  // 4) Migrar el plan actual (JSON plano -> tabla), solo si la tabla esta vacia para este sitio
  const planExistente = await query('SELECT id FROM planes_estrategia WHERE sitio_id = $1', [sitioId]);
  if (planExistente.rows.length === 0) {
    const plan = cargarPlan();
    if (plan && plan.items) {
      await query(
        `INSERT INTO planes_estrategia (sitio_id, items, arreglos, generado_automaticamente) VALUES ($1, $2, $3, $4)`,
        [sitioId, JSON.stringify(plan.items || []), JSON.stringify(plan.arreglos || []), !!plan.generadoAutomaticamente]
      );
      resultado.pasos.push(`Plan migrado (${(plan.items || []).length} articulos)`);
    } else {
      resultado.pasos.push('No habia plan guardado para migrar');
    }
  } else {
    resultado.pasos.push('Plan ya estaba migrado, se omite');
  }

  // 5) Migrar el historial de ciclos, solo si la tabla esta vacia para este sitio
  const historialExistente = await query('SELECT id FROM historial_ciclos WHERE sitio_id = $1 LIMIT 1', [sitioId]);
  if (historialExistente.rows.length === 0) {
    const historial = cargarHistorial();
    for (const h of historial || []) {
      await query(
        `INSERT INTO historial_ciclos (sitio_id, items, arreglos, snapshot_completo, proyeccion_30, proyeccion_60, proyeccion_90, cerrado, fecha_guardado, fecha_cierre, resultado_final)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)`,
        [
          sitioId,
          JSON.stringify(h.items || []),
          JSON.stringify(h.arreglos || []),
          h.snapshotCompleto ? JSON.stringify(h.snapshotCompleto) : null,
          h.proyeccion30 || null,
          h.proyeccion60 || null,
          h.proyeccion90 || null,
          !!h.cerrado,
          h.fechaGuardado || new Date().toISOString(),
          h.fechaCierre || null,
          h.resultadoFinal ? JSON.stringify(h.resultadoFinal) : null
        ]
      );
    }
    resultado.pasos.push(`Historial migrado (${(historial || []).length} ciclos)`);
  } else {
    resultado.pasos.push('Historial ya estaba migrado, se omite');
  }

  // 6) Migrar la cola de articulos, solo si la tabla esta vacia para este sitio
  const colaExistente = await query('SELECT id FROM cola_articulos WHERE sitio_id = $1 LIMIT 1', [sitioId]);
  if (colaExistente.rows.length === 0) {
    const cola = obtenerCola();
    for (const item of cola || []) {
      await query(
        `INSERT INTO cola_articulos (sitio_id, tema, marca, carpeta, fecha_programada, estado, contenido_html, canonical, enlazar_a, enlazar_potencial)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)`,
        [
          sitioId,
          item.tema || '',
          item.marca || null,
          item.carpeta || 'blog',
          item.fechaProgramada || null,
          item.estado || 'pendiente',
          item.contenidoHtml || item.html || null,
          item.canonical || null,
          item.enlazarA || null,
          item.enlazarPotencial || null
        ]
      );
    }
    resultado.pasos.push(`Cola migrada (${(cola || []).length} articulos)`);
  } else {
    resultado.pasos.push('Cola ya estaba migrada, se omite');
  }

  resultado.cuentaId = cuentaId;
  resultado.sitioId = sitioId;
  return resultado;
}

module.exports = { ejecutarMigracion };
