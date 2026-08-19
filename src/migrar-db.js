// migrar-db.js — crea las tablas y migra los datos actuales (JSON planos) a Postgres.
// Re-ejecutable de forma segura: usa ON CONFLICT / upsert donde corresponde.
const fs = require('fs');
const path = require('path');
const { query } = require('./db');

const DATA_DIR = process.env.DATA_DIR || '/tmp';

function leerJsonPlano(nombre, porDefecto) {
  try {
    const ruta = `${DATA_DIR}/${nombre}`;
    if (fs.existsSync(ruta)) return JSON.parse(fs.readFileSync(ruta, 'utf8'));
  } catch(e) {}
  return porDefecto;
}

async function ejecutarMigracion() {
  const resultado = { pasos: [] };

  // 1) Crear/ajustar tablas
  const schemaPath = path.join(__dirname, '..', 'db', 'schema.sql');
  const schemaSql = fs.readFileSync(schemaPath, 'utf8');
  await query(schemaSql);
  resultado.pasos.push('Tablas creadas/ajustadas OK');

  // 2) Cuenta
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

  // 3) Sitio reparaciondeportones.cl
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

  // 4) Migrar plan (upsert por sitio_id)
  const plan = leerJsonPlano('magenta-seo-plan.json', null);
  if (plan && plan.items) {
    await query(
      `INSERT INTO planes_estrategia (sitio_id, items, arreglos, generado_automaticamente, historial_id, actualizado_en)
       VALUES ($1,$2,$3,$4,$5, now())
       ON CONFLICT (sitio_id) DO UPDATE SET items=$2, arreglos=$3, generado_automaticamente=$4, historial_id=$5, actualizado_en=now()`,
      [sitioId, JSON.stringify(plan.items || []), JSON.stringify(plan.arreglos || []), !!plan.generadoAutomaticamente, plan.historialId || null]
    );
    resultado.pasos.push(`Plan migrado/actualizado (${(plan.items || []).length} articulos)`);
  } else {
    resultado.pasos.push('No habia plan guardado para migrar');
  }

  // 5) Migrar historial (upsert por id)
  const historial = leerJsonPlano('magenta-seo-historial.json', []);
  let historialMigrados = 0;
  for (const h of historial) {
    await query(
      `INSERT INTO historial_ciclos
        (id, sitio_id, fecha_guardado, articulos_count, total_clics_base, proyeccion_30, proyeccion_60, proyeccion_90, paginas_base, snapshot_completo, cerrado, fecha_cierre, resultado_final)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)
       ON CONFLICT (id) DO UPDATE SET
         fecha_guardado=$3, articulos_count=$4, total_clics_base=$5, proyeccion_30=$6, proyeccion_60=$7, proyeccion_90=$8,
         paginas_base=$9, snapshot_completo=$10, cerrado=$11, fecha_cierre=$12, resultado_final=$13`,
      [
        h.id,
        sitioId,
        h.fechaGuardado || new Date().toISOString(),
        h.articulosCount || 0,
        h.totalClicsBase || 0,
        h.proyeccion30 || null,
        h.proyeccion60 || null,
        h.proyeccion90 || null,
        JSON.stringify(h.paginasBase || []),
        h.snapshotCompleto ? JSON.stringify(h.snapshotCompleto) : null,
        !!h.cerrado,
        h.fechaCierre || null,
        h.resultadoFinal ? JSON.stringify(h.resultadoFinal) : null
      ]
    );
    historialMigrados++;
  }
  resultado.pasos.push(`Historial migrado/actualizado (${historialMigrados} ciclos)`);

  // Limpieza: filas basura del primer intento de migracion, que quedaron con un
  // id numerico corto (1, 2...) en vez del id real tipo timestamp que usa la app.
  const limpieza = await query(
    "DELETE FROM historial_ciclos WHERE sitio_id = $1 AND id ~ '^[0-9]{1,4}$' RETURNING id",
    [sitioId]
  );
  if (limpieza.rows.length > 0) {
    resultado.pasos.push(`Limpiadas ${limpieza.rows.length} filas basura del primer intento (ids: ${limpieza.rows.map(r => r.id).join(', ')})`);
  }

  // 6) Migrar cola: se borra y re-inserta completa cada vez (todavia no hay nada
  // en produccion leyendo de esta tabla, asi que resincronizar full es seguro y
  // evita quedar con columnas nuevas vacias por una migracion parcial anterior).
  await query('DELETE FROM cola_articulos WHERE sitio_id = $1', [sitioId]);
  const cola = leerJsonPlano('magenta-seo-cola.json', []);
  for (const item of cola) {
    await query(
      `INSERT INTO cola_articulos
        (sitio_id, tema, marca, carpeta, fecha_programada, estado, contenido_html, canonical,
         enlazar_a, enlazar_potencial, error_msg, meta, imagen, iso_date, date_str, publicado_en, generando, imagen_lista, error_generacion)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19)`,
      [
        sitioId,
        item.tema || '',
        item.marca || null,
        item.carpeta || 'blog',
        item.fechaProgramada || null,
        item.estado || 'pendiente',
        item.contenido || item.contenidoHtml || item.html || null,
        item.canonical || null,
        item.enlazarA || null,
        item.enlazarPotencial || null,
        item.errorMsg || null,
        item.meta ? JSON.stringify(item.meta) : null,
        item.imagen ? JSON.stringify(item.imagen) : null,
        item.isoDate || null,
        item.dateStr || null,
        item.publicadoEn || null,
        item.generando || false,
        item.imagenLista === undefined ? null : item.imagenLista,
        item.errorGeneracion || null,
      ]
    );
  }
  resultado.pasos.push(`Cola re-migrada completa (${cola.length} articulos)`);

  resultado.cuentaId = cuentaId;
  resultado.sitioId = sitioId;
  return resultado;
}

module.exports = { ejecutarMigracion };
