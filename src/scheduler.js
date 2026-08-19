// scheduler.js — Gestion del calendario y cola de publicaciones, ahora en Postgres (multi-sitio)
// Columnas explicitas por campo (mejor para escalar: consultas directas, indices reales).
// meta/imagen quedan JSONB porque son objetos anidados por naturaleza.
const { query } = require('./db');

// TODO: reemplazar por el sitio activo de la sesion cuando exista el selector de sitios.
const SITIO_ACTIVO_ID = 1;

function mapRow(r) {
  return {
    id: String(r.id),
    tema: r.tema,
    marca: r.marca || '',
    carpeta: r.carpeta || 'blog',
    fechaProgramada: r.fecha_programada,
    estado: r.estado,
    contenido: r.contenido_html,
    canonical: r.canonical,
    enlazarA: r.enlazar_a,
    enlazarPotencial: r.enlazar_potencial,
    errorMsg: r.error_msg,
    meta: r.meta,
    imagen: r.imagen,
    isoDate: r.iso_date,
    dateStr: r.date_str,
    publicadoEn: r.publicado_en,
    generando: r.generando,
    imagenLista: r.imagen_lista,
    errorGeneracion: r.error_generacion,
    creadoEn: r.creado_en,
  };
}

async function agregarACola(item) {
  const res = await query(
    `INSERT INTO cola_articulos
      (sitio_id, tema, marca, carpeta, fecha_programada, estado, contenido_html, canonical,
       enlazar_a, enlazar_potencial, meta, imagen, iso_date, date_str, generando, imagen_lista)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16)
     RETURNING id`,
    [
      SITIO_ACTIVO_ID,
      item.tema,
      item.marca || '',
      item.carpeta || 'blog',
      item.fechaProgramada || null,
      item.estado || 'pendiente',
      item.contenido || null,
      item.canonical || null,
      item.enlazarA || null,
      item.enlazarPotencial || null,
      item.meta ? JSON.stringify(item.meta) : null,
      item.imagen ? JSON.stringify(item.imagen) : null,
      item.isoDate || null,
      item.dateStr || null,
      item.generando || false,
      item.imagenLista === undefined ? null : item.imagenLista,
    ]
  );
  return String(res.rows[0].id);
}

async function obtenerCola() {
  const res = await query(
    'SELECT * FROM cola_articulos WHERE sitio_id = $1 ORDER BY fecha_programada ASC NULLS LAST, id ASC',
    [SITIO_ACTIVO_ID]
  );
  return res.rows.map(mapRow);
}

async function obtenerItemPorId(id) {
  const res = await query('SELECT * FROM cola_articulos WHERE id = $1 AND sitio_id = $2', [id, SITIO_ACTIVO_ID]);
  if (res.rows.length === 0) return null;
  return mapRow(res.rows[0]);
}

async function actualizarItem(id, cambios) {
  const actualRes = await query('SELECT * FROM cola_articulos WHERE id = $1 AND sitio_id = $2', [id, SITIO_ACTIVO_ID]);
  if (actualRes.rows.length === 0) return null;
  const f = { ...mapRow(actualRes.rows[0]), ...cambios };

  await query(
    `UPDATE cola_articulos SET
      tema=$1, marca=$2, carpeta=$3, fecha_programada=$4, estado=$5, contenido_html=$6, canonical=$7,
      enlazar_a=$8, enlazar_potencial=$9, error_msg=$10, meta=$11, imagen=$12, iso_date=$13, date_str=$14,
      publicado_en=$15, generando=$16, imagen_lista=$17, error_generacion=$18
     WHERE id=$19 AND sitio_id=$20`,
    [
      f.tema, f.marca, f.carpeta, f.fechaProgramada, f.estado, f.contenido || null, f.canonical || null,
      f.enlazarA || null, f.enlazarPotencial || null, f.errorMsg || null,
      f.meta ? JSON.stringify(f.meta) : null, f.imagen ? JSON.stringify(f.imagen) : null,
      f.isoDate || null, f.dateStr || null, f.publicadoEn || null,
      f.generando || false, f.imagenLista === undefined ? null : f.imagenLista, f.errorGeneracion || null,
      id, SITIO_ACTIVO_ID
    ]
  );
  return f;
}

async function eliminarItem(id) {
  await query('DELETE FROM cola_articulos WHERE id = $1 AND sitio_id = $2', [id, SITIO_ACTIVO_ID]);
}

async function obtenerItemsParaHoy() {
  const hoy = new Date().toISOString().split('T')[0];
  const res = await query(
    "SELECT * FROM cola_articulos WHERE sitio_id = $1 AND fecha_programada = $2 AND estado = 'aprobado'",
    [SITIO_ACTIVO_ID, hoy]
  );
  return res.rows.map(mapRow);
}

async function obtenerCalendarioMes(año, mes) {
  const prefijo = `${año}-${String(mes).padStart(2, '0')}`;
  const res = await query(
    "SELECT * FROM cola_articulos WHERE sitio_id = $1 AND fecha_programada::text LIKE $2 || '%'",
    [SITIO_ACTIVO_ID, prefijo]
  );
  return res.rows.map(mapRow);
}

module.exports = {
  agregarACola, obtenerCola, obtenerItemPorId,
  actualizarItem, eliminarItem, obtenerItemsParaHoy,
  obtenerCalendarioMes
};
