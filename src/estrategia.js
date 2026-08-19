// estrategia.js — plan activo e historial de ciclos, ahora en Postgres (multi-sitio)
const { query } = require('./db');

// TODO: reemplazar por el sitio activo de la sesion cuando exista el selector de sitios.
const SITIO_ACTIVO_ID = 1;

async function cargarPlan() {
  try {
    const res = await query(
      'SELECT items, arreglos, generado_automaticamente, historial_id, actualizado_en FROM planes_estrategia WHERE sitio_id = $1',
      [SITIO_ACTIVO_ID]
    );
    if (res.rows.length === 0) return null;
    const r = res.rows[0];
    return {
      items: r.items || [],
      arreglos: r.arreglos || [],
      generadoAutomaticamente: r.generado_automaticamente,
      historialId: r.historial_id,
      actualizadoEn: r.actualizado_en,
    };
  } catch(e) {
    console.error('[ESTRATEGIA] Error cargando plan:', e.message);
    return null;
  }
}

async function guardarPlan(plan) {
  try {
    const items = plan.items || [];
    const arreglos = plan.arreglos || [];
    const generadoAutomaticamente = !!plan.generadoAutomaticamente;
    const historialId = plan.historialId || null;
    await query(
      `INSERT INTO planes_estrategia (sitio_id, items, arreglos, generado_automaticamente, historial_id, actualizado_en)
       VALUES ($1, $2, $3, $4, $5, now())
       ON CONFLICT (sitio_id) DO UPDATE SET
         items = $2, arreglos = $3, generado_automaticamente = $4, historial_id = $5, actualizado_en = now()`,
      [SITIO_ACTIVO_ID, JSON.stringify(items), JSON.stringify(arreglos), generadoAutomaticamente, historialId]
    );
    return { ...plan, actualizadoEn: new Date().toISOString() };
  } catch(e) {
    console.error('[ESTRATEGIA] Error guardando plan:', e.message);
    return null;
  }
}

async function limpiarPlan() {
  try {
    await query('DELETE FROM planes_estrategia WHERE sitio_id = $1', [SITIO_ACTIVO_ID]);
    return true;
  } catch(e) {
    console.error('[ESTRATEGIA] Error limpiando plan:', e.message);
    return false;
  }
}

function mapHistorialRow(r) {
  return {
    id: r.id,
    fechaGuardado: r.fecha_guardado,
    articulosCount: r.articulos_count,
    totalClicsBase: r.total_clics_base,
    proyeccion30: r.proyeccion_30,
    proyeccion60: r.proyeccion_60,
    proyeccion90: r.proyeccion_90,
    paginasBase: r.paginas_base,
    snapshotCompleto: r.snapshot_completo,
    cerrado: r.cerrado,
    fechaCierre: r.fecha_cierre,
    resultadoFinal: r.resultado_final,
  };
}

async function cargarHistorial() {
  try {
    const res = await query(
      'SELECT * FROM historial_ciclos WHERE sitio_id = $1 ORDER BY fecha_guardado ASC',
      [SITIO_ACTIVO_ID]
    );
    return res.rows.map(mapHistorialRow);
  } catch(e) {
    console.error('[HISTORIAL] Error cargando:', e.message);
    return [];
  }
}

async function guardarEnHistorial(entrada) {
  try {
    await query(
      `INSERT INTO historial_ciclos
        (id, sitio_id, fecha_guardado, articulos_count, total_clics_base, proyeccion_30, proyeccion_60, proyeccion_90, paginas_base, snapshot_completo, cerrado)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,false)
       ON CONFLICT (id) DO UPDATE SET
         fecha_guardado=$3, articulos_count=$4, total_clics_base=$5, proyeccion_30=$6, proyeccion_60=$7, proyeccion_90=$8, paginas_base=$9, snapshot_completo=$10`,
      [
        entrada.id,
        SITIO_ACTIVO_ID,
        entrada.fechaGuardado,
        entrada.articulosCount || 0,
        entrada.totalClicsBase || 0,
        entrada.proyeccion30 || null,
        entrada.proyeccion60 || null,
        entrada.proyeccion90 || null,
        JSON.stringify(entrada.paginasBase || []),
        entrada.snapshotCompleto ? JSON.stringify(entrada.snapshotCompleto) : null,
      ]
    );

    // Rotacion: solo conservar snapshotCompleto en los ultimos 2 ciclos con snapshot
    const conSnapshot = await query(
      'SELECT id FROM historial_ciclos WHERE sitio_id = $1 AND snapshot_completo IS NOT NULL ORDER BY fecha_guardado DESC',
      [SITIO_ACTIVO_ID]
    );
    if (conSnapshot.rows.length > 2) {
      const idsAPurgar = conSnapshot.rows.slice(2).map(r => r.id);
      await query('UPDATE historial_ciclos SET snapshot_completo = NULL WHERE id = ANY($1)', [idsAPurgar]);
    }

    return entrada;
  } catch(e) {
    console.error('[HISTORIAL] Error guardando:', e.message);
    return null;
  }
}

async function eliminarDeHistorial(id) {
  try {
    await query('DELETE FROM historial_ciclos WHERE id = $1 AND sitio_id = $2', [id, SITIO_ACTIVO_ID]);
    return true;
  } catch(e) {
    console.error('[HISTORIAL] Error eliminando:', e.message);
    return false;
  }
}

async function actualizarEntradaHistorial(id, cambios) {
  try {
    const actual = await query('SELECT * FROM historial_ciclos WHERE id = $1 AND sitio_id = $2', [id, SITIO_ACTIVO_ID]);
    if (actual.rows.length === 0) return null;
    const fusionado = { ...mapHistorialRow(actual.rows[0]), ...cambios };
    await query(
      `UPDATE historial_ciclos SET cerrado=$1, fecha_cierre=$2, resultado_final=$3 WHERE id=$4 AND sitio_id=$5`,
      [!!fusionado.cerrado, fusionado.fechaCierre || null, fusionado.resultadoFinal ? JSON.stringify(fusionado.resultadoFinal) : null, id, SITIO_ACTIVO_ID]
    );
    return fusionado;
  } catch(e) {
    console.error('[HISTORIAL] Error actualizando:', e.message);
    return null;
  }
}

module.exports = { cargarPlan, guardarPlan, cargarHistorial, guardarEnHistorial, eliminarDeHistorial, limpiarPlan, actualizarEntradaHistorial };
