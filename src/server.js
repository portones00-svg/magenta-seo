require('dotenv').config();
const express = require('express');
const cron = require('node-cron');
const { generarArticulo, generarMetadata } = require('./generator');
const { generarYSubirImagen } = require('./imagen');
const { buildArticlePage, buildDate } = require('./builder');
const { publicarArticulo } = require('./publisher');
const { actualizarSitemap } = require('./sitemap');
const { testConexion } = require('./publisher');
const {
  agregarACola, obtenerCola, obtenerItemPorId,
  actualizarItem, eliminarItem, obtenerItemsParaHoy,
  obtenerCalendarioMes
} = require('./scheduler');

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const SITE_URL = process.env.SITE_URL || 'https://www.reparaciondeportones.cl';
const historial = [];
const borradores = {};

// ─── KEYWORDS SUGERIDAS POR PRIORIDAD SEO ────────────────────────────────────
const KW_SUGERIDAS = [
  { tema: 'servicio técnico Nice portones Chile', marca: 'nice', carpeta: 'nice' },
  { tema: 'motor BFT batiente condominio Santiago', marca: 'bft', carpeta: 'bft' },
  { tema: 'reparación portón eléctrico Las Condes', marca: '', carpeta: 'blog' },
  { tema: 'técnico portón eléctrico La Reina', marca: '', carpeta: 'blog' },
  { tema: 'instalación motor portón Lo Barnechea', marca: '', carpeta: 'blog' },
  { tema: 'servicio técnico portones Vitacura', marca: '', carpeta: 'blog' },
  { tema: 'motor Centurion reparación Chile', marca: 'centurion', carpeta: 'centurion' },
  { tema: 'reparación portón automático Chicureo', marca: '', carpeta: 'blog' },
  { tema: 'técnico portón eléctrico Concepción', marca: '', carpeta: 'blog' },
  { tema: 'servicio técnico portones Santiago urgente', marca: '', carpeta: 'blog' },
  { tema: 'motor Nice corredera residencial Chile', marca: 'nice', carpeta: 'nice' },
  { tema: 'mantencion portón automático Las Condes', marca: '', carpeta: 'blog' },
  { tema: 'reparación motor BFT corredera empresa', marca: 'bft', carpeta: 'bft' },
  { tema: 'portón automático falla Santiago solución', marca: '', carpeta: 'blog' },
  { tema: 'instalación portón automático Vitacura', marca: '', carpeta: 'blog' },
  { tema: 'Centurion D5 Evo reparación Chile', marca: 'centurion', carpeta: 'centurion' },
  { tema: 'servicio técnico portones Antofagasta', marca: '', carpeta: 'blog' },
  { tema: 'reparación portón eléctrico La Florida', marca: '', carpeta: 'blog' },
  { tema: 'motor Nice batiente casa residencial', marca: 'nice', carpeta: 'nice' },
  { tema: 'técnico portón automático Maipú', marca: '', carpeta: 'blog' },
  { tema: 'reparación portón Puente Alto urgente', marca: '', carpeta: 'blog' },
  { tema: 'instalación motor BFT industrial empresa', marca: 'bft', carpeta: 'bft' },
  { tema: 'portón automático no cierra solución rápida', marca: '', carpeta: 'blog' },
  { tema: 'servicio técnico portones Viña del Mar', marca: '', carpeta: 'blog' },
  { tema: 'motor Centurion corredera industrial', marca: 'centurion', carpeta: 'centurion' },
  { tema: 'reparación portón automático Temuco', marca: '', carpeta: 'blog' },
  { tema: 'Nice Wingo instalación reparación Chile', marca: 'nice', carpeta: 'nice' },
  { tema: 'técnico portón eléctrico Las Condes urgente', marca: '', carpeta: 'blog' },
  { tema: 'portón industrial BFT mantención empresa', marca: 'bft', carpeta: 'bft' },
  { tema: 'servicio técnico portones La Serena', marca: '', carpeta: 'blog' },
];

// ─── HELPERS HTML ─────────────────────────────────────────────────────────────
function renderCalendario(año, mes) {
  const itemsMes = obtenerCalendarioMes(año, mes);
  const diasEnMes = new Date(año, mes, 0).getDate();
  const primerDia = new Date(año, mes - 1, 1).getDay();
  const nombresMes = ['','Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];
  const hoy = new Date().toISOString().split('T')[0];

  let html = `<div style="display:grid;grid-template-columns:repeat(7,1fr);gap:4px;margin-bottom:8px">`;
  ['Dom','Lun','Mar','Mié','Jue','Vie','Sáb'].forEach(d => {
    html += `<div style="text-align:center;font-size:11px;color:#999;padding:4px">${d}</div>`;
  });
  html += '</div><div style="display:grid;grid-template-columns:repeat(7,1fr);gap:4px">';

  for (let i = 0; i < primerDia; i++) {
    html += '<div></div>';
  }

  for (let dia = 1; dia <= diasEnMes; dia++) {
    const fecha = `${año}-${String(mes).padStart(2,'0')}-${String(dia).padStart(2,'0')}`;
    const item = itemsMes.find(i => i.fechaProgramada === fecha);
    const esHoy = fecha === hoy;
    const esPasado = fecha < hoy;

    let bg = '#f9f9f9';
    let border = '1px solid #eee';
    if (esHoy) { bg = '#eef1ef'; border = '1px solid #216416'; }
    if (esPasado && item) { bg = '#e1f5ee'; }

    html += `<div style="background:${bg};border:${border};border-radius:6px;padding:6px;min-height:70px;cursor:pointer;position:relative"
      onclick="seleccionarDia('${fecha}', this)">
      <div style="font-size:11px;font-weight:600;color:${esHoy?'#216416':'#666'}">${dia}</div>`;

    if (item) {
      const color = item.estado === 'publicado' ? '#0f6e56' : item.estado === 'aprobado' ? '#216416' : '#854f0b';
      const bg2 = item.estado === 'publicado' ? '#e1f5ee' : item.estado === 'aprobado' ? '#eef1ef' : '#faeeda';
      html += `<div style="font-size:10px;color:${color};background:${bg2};border-radius:3px;padding:2px 4px;margin-top:2px;line-height:1.3">${item.tema.substring(0,30)}...</div>`;
    }

    html += '</div>';
  }
  html += '</div>';
  return html;
}

// ─── PANEL PRINCIPAL ──────────────────────────────────────────────────────────
app.get('/', (req, res) => {
  const ahora = new Date();
  const año = parseInt(req.query.año || ahora.getFullYear());
  const mes = parseInt(req.query.mes || ahora.getMonth() + 1);
  const nombresMes = ['','Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];

  const cola = obtenerCola();
  const pendientes = cola.filter(i => i.estado === 'pendiente').length;
  const aprobados = cola.filter(i => i.estado === 'aprobado').length;
  const publicados = cola.filter(i => i.estado === 'publicado').length;

  const filasHistorial = historial.slice(-10).reverse().map(h => `
    <tr>
      <td style="font-size:12px">${h.fecha}</td>
      <td>${h.ok ? '✅' : '❌'}</td>
      <td style="font-size:12px"><a href="${h.canonical||'#'}" target="_blank" style="color:#216416">${h.title||'-'}</a></td>
    </tr>`).join('');

  const kwOptions = KW_SUGERIDAS.map((kw, i) =>
    `<option value="${i}" data-marca="${kw.marca}" data-carpeta="${kw.carpeta}">${kw.tema}</option>`
  ).join('');

  res.send(`<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>Magenta SEO — Calendario</title>
  <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600&display=swap" rel="stylesheet">
  <style>
    *{box-sizing:border-box;margin:0;padding:0}
    body{font-family:"Poppins",sans-serif;background:#f5f5f5;color:#1a1a1a}
    .container{max-width:1000px;margin:0 auto}
    .layout{display:flex;min-height:100vh}
    .sidebar{width:220px;background:#fff;border-right:1px solid #e5e5e5;padding:20px 0;flex-shrink:0}
    .sidebar h1{font-size:16px;font-weight:600;color:#216416;padding:0 20px 20px}
    .nav-item{display:flex;align-items:center;gap:10px;padding:12px 20px;font-size:13px;color:#666;cursor:pointer;border-left:3px solid transparent;text-decoration:none}
    .nav-item:hover{background:#f5f5f5}
    .nav-item.active{background:#eef6ec;color:#216416;font-weight:500;border-left-color:#216416}
    .nav-item.disabled{opacity:0.4;cursor:not-allowed}
    .main{flex:1;padding:24px 32px;overflow-x:hidden}
    h1{font-size:20px;font-weight:600;color:#216416;margin-bottom:2px}
    .sub{font-size:13px;color:#666;margin-bottom:20px}
    .grid3{display:grid;grid-template-columns:1fr 1fr 1fr;gap:12px;margin-bottom:20px}
    .metric{background:#fff;border-radius:10px;border:1px solid #e5e5e5;padding:16px;text-align:center}
    .metric-val{font-size:28px;font-weight:600;color:#216416}
    .metric-lab{font-size:12px;color:#999;margin-top:2px}
    .card{background:#fff;border-radius:12px;border:1px solid #e5e5e5;padding:20px;margin-bottom:16px}
    .card-title{font-size:15px;font-weight:600;margin-bottom:16px}
    .btn{padding:10px 20px;border:none;border-radius:8px;font-size:13px;font-weight:500;cursor:pointer;font-family:Poppins,sans-serif}
    .btn-primary{background:#216416;color:#fff}
    .btn-primary:hover{background:#1a5212}
    .btn-secondary{background:#f5f5f5;color:#444;border:1px solid #ddd}
    .btn-secondary:hover{background:#e8e8e8}
    .btn-danger{background:#faece7;color:#993c1d;border:1px solid #f5c4b3}
    .btn:disabled{opacity:0.5;cursor:not-allowed}
    select,input{width:100%;padding:9px 12px;border:1px solid #ddd;border-radius:8px;font-size:13px;font-family:Poppins,sans-serif;outline:none;margin-bottom:10px}
    select:focus,input:focus{border-color:#216416}
    .cal-nav{display:flex;align-items:center;justify-content:space-between;margin-bottom:12px}
    .cal-title{font-size:16px;font-weight:600;color:#1a1a1a}
    table{width:100%;border-collapse:collapse;font-size:13px}
    th{text-align:left;padding:8px;color:#999;font-weight:400;font-size:12px;border-bottom:1px solid #eee}
    td{padding:8px;border-bottom:1px solid #eee;vertical-align:top}
    .badge{display:inline-block;font-size:11px;padding:2px 8px;border-radius:99px;font-weight:500}
    .badge-ok{background:#e1f5ee;color:#0f6e56}
    .badge-pend{background:#faeeda;color:#854f0b}
    .badge-aprov{background:#eef1ef;color:#216416}
    .status-bar{padding:10px 14px;border-radius:8px;font-size:13px;margin-top:10px;display:none}
    .status-ok{background:#e1f5ee;color:#0f6e56}
    .status-error{background:#faece7;color:#993c1d}
    .status-info{background:#e6f1fb;color:#185fa5}
    .modal{display:none;position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.5);z-index:100;align-items:center;justify-content:center}
    .modal.open{display:flex}
    .modal-box{background:#fff;border-radius:12px;padding:24px;max-width:600px;width:90%;max-height:80vh;overflow-y:auto}
    .modal-title{font-size:16px;font-weight:600;margin-bottom:16px}
    .preview-img{width:100%;height:200px;object-fit:cover;border-radius:8px;margin-bottom:12px}
    .preview-content{font-size:14px;line-height:1.7;max-height:250px;overflow-y:auto;border:1px solid #eee;border-radius:8px;padding:12px;margin-bottom:16px}
    .progress{height:4px;background:#e5e5e5;border-radius:2px;overflow:hidden;display:none;margin:10px 0}
    .progress-fill{height:100%;background:#216416;border-radius:2px;transition:width 0.5s}
    .grid2{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-top:12px}
  </style>
</head>
<body>
<div class="layout">
  ${renderSidebar('calendario')}
  <div class="main">
<div class="container">
  <h1>🚀 Magenta SEO</h1>
  <p class="sub">Sistema automático de publicación — reparaciondeportones.cl</p>

  <div class="grid3">
    <div class="metric"><div class="metric-val">${pendientes}</div><div class="metric-lab">Generando / pendientes</div></div>
    <div class="metric"><div class="metric-val" style="color:#854f0b">${aprobados}</div><div class="metric-lab">Aprobados en cola</div></div>
    <div class="metric"><div class="metric-val">${publicados}</div><div class="metric-lab">Publicados este mes</div></div>
  </div>

  <!-- CALENDARIO -->
  <div class="card">
    <div class="cal-nav">
      <a href="/?mes=${mes === 1 ? 12 : mes - 1}&año=${mes === 1 ? año - 1 : año}" class="btn btn-secondary" style="text-decoration:none">← Anterior</a>
      <span class="cal-title">${nombresMes[mes]} ${año}</span>
      <a href="/?mes=${mes === 12 ? 1 : mes + 1}&año=${mes === 12 ? año + 1 : año}" class="btn btn-secondary" style="text-decoration:none">Siguiente →</a>
    </div>
    ${renderCalendario(año, mes)}
    <p style="font-size:11px;color:#999;margin-top:8px">Click en un día para agregar o ver el artículo programado</p>
  </div>

  <!-- PLANIFICAR MES -->
  <div class="card">
    <div class="card-title">📅 Planificar artículos del mes</div>
    <p style="font-size:13px;color:#666;margin-bottom:16px">Selecciona una keyword, asígnale una fecha y genera el artículo. Luego lo revisas y apruebas.</p>

    <label style="font-size:12px;color:#666;display:block;margin-bottom:4px">Keyword sugerida (basada en Search Console)</label>
    <select id="kwSelect" onchange="onKwChange(this)">
      <option value="">— Selecciona una keyword —</option>
      ${kwOptions}
    </select>

    <label style="font-size:12px;color:#666;display:block;margin-bottom:4px">O escribe tu propio tema</label>
    <input type="text" id="temaCustom" placeholder="ej: reparación motor FAAC batiente Chicureo">

    <div class="grid2">
      <div>
        <label style="font-size:12px;color:#666;display:block;margin-bottom:4px">Marca</label>
        <select id="marcaSelect">
          <option value="">— Sin marca —</option>
          <option value="nice">Nice</option>
          <option value="bft">BFT</option>
          <option value="centurion">Centurion</option>
          <option value="faac">FAAC</option>
          <option value="ppa">PPA</option>
        </select>
      </div>
      <div>
        <label style="font-size:12px;color:#666;display:block;margin-bottom:4px">Carpeta destino</label>
        <select id="carpetaSelect">
          <option value="blog">blog/</option>
          <option value="nice">nice/</option>
          <option value="bft">bft/</option>
          <option value="centurion">centurion/</option>
          <option value="faac">faac/</option>
        </select>
      </div>
    </div>

    <label style="font-size:12px;color:#666;display:block;margin-bottom:4px">Fecha de publicación</label>
    <input type="date" id="fechaProg" min="${new Date().toISOString().split('T')[0]}">

    <div style="margin-top:4px">
      <button class="btn btn-primary" onclick="generarYAgregarACola()" id="btnGenerar">⚡ Generar artículo y agregar al calendario</button>
    </div>
    <div class="progress" id="progress"><div class="progress-fill" id="progressFill" style="width:0%"></div></div>
    <div class="status-bar" id="statusGen"></div>
  </div>

  <!-- COLA DE ARTÍCULOS -->
  <div class="card" id="cola">
    <div class="card-title">📋 Cola de publicaciones</div>
    <div id="colaContainer">${renderCola()}</div>
  </div>

  <!-- HISTORIAL -->
  <div class="card">
    <div class="card-title">📊 Últimas publicaciones</div>
    ${historial.length === 0
      ? '<p style="font-size:13px;color:#999">Sin publicaciones aún.</p>'
      : `<table><thead><tr><th>Fecha</th><th>Estado</th><th>Artículo</th></tr></thead><tbody>${filasHistorial}</tbody></table>`}
  </div>
</div>
  </div>
</div>

<!-- MODAL PREVIEW -->
<div class="modal" id="modalPreview">
  <div class="modal-box">
    <div class="modal-title" id="modalTitle">Vista previa</div>
    <div id="modalMeta" style="background:#f9f9f9;border-radius:8px;padding:12px;margin-bottom:12px;font-size:12px;line-height:1.8"></div>
    <img class="preview-img" id="modalImg" src="" onerror="this.style.display='none'">
    <div class="preview-content" id="modalContent"></div>
    <div class="grid2">
      <button class="btn btn-primary" id="btnAprobar" onclick="aprobarItem()">✅ Aprobar — queda en cola</button>
      <button class="btn btn-danger" onclick="descartarItem()">🗑️ Descartar</button>
    </div>
    <button class="btn btn-secondary" onclick="cerrarModal()" style="width:100%;margin-top:8px">Cerrar</button>
    <div class="status-bar" id="statusModal"></div>
  </div>
</div>

<!-- MODAL DÍA -->
<div class="modal" id="modalDia">
  <div class="modal-box">
    <div class="modal-title" id="modalDiaTitle">Día seleccionado</div>
    <div id="modalDiaContent"></div>
    <button class="btn btn-secondary" onclick="cerrarModalDia()" style="width:100%;margin-top:12px">Cerrar</button>
  </div>
</div>

<script>
let itemActualId = null;

function onKwChange(sel) {
  const opt = sel.options[sel.selectedIndex];
  if (!opt.value) return;
  const idx = parseInt(opt.value);
  const kws = ${JSON.stringify(KW_SUGERIDAS)};
  document.getElementById('temaCustom').value = '';
  document.getElementById('marcaSelect').value = kws[idx].marca;
  document.getElementById('carpetaSelect').value = kws[idx].carpeta;
}

async function generarYAgregarACola() {
  const kwSel = document.getElementById('kwSelect');
  const temaCustom = document.getElementById('temaCustom').value.trim();
  let tema = temaCustom;

  if (!tema && kwSel.value) {
    const kws = ${JSON.stringify(KW_SUGERIDAS)};
    tema = kws[parseInt(kwSel.value)].tema;
  }

  if (!tema) { alert('Selecciona o escribe un tema'); return; }

  const fecha = document.getElementById('fechaProg').value;
  if (!fecha) { alert('Selecciona una fecha de publicación'); return; }

  const marca = document.getElementById('marcaSelect').value;
  const carpeta = document.getElementById('carpetaSelect').value;
  const btn = document.getElementById('btnGenerar');

  btn.disabled = true;
  btn.textContent = '⏳ Generando artículo...';
  document.getElementById('progress').style.display = 'block';
  showStatus('statusGen', 'info', '⏳ Claude está escribiendo el artículo (~30 segundos)...');
  setProgress(20);

  try {
    const res = await fetch('/generar-para-cola', {
      method: 'POST',
      headers: {'Content-Type':'application/json'},
      body: JSON.stringify({ tema, marca, carpeta, fechaProgramada: fecha })
    });
    setProgress(80);
    const data = await res.json();

    if (data.ok) {
      setProgress(100);
      showStatus('statusGen', 'ok', '✅ Artículo generado. Revísalo y apruébalo en la cola.');
      setTimeout(() => location.reload(), 1500);
    } else {
      showStatus('statusGen', 'error', '❌ Error: ' + data.error);
    }
  } catch(err) {
    showStatus('statusGen', 'error', '❌ Error: ' + err.message);
  } finally {
    btn.disabled = false;
    btn.textContent = '⚡ Generar artículo y agregar al calendario';
    document.getElementById('progress').style.display = 'none';
  }
}

function verPreview(id) {
  itemActualId = id;
  fetch('/item/' + id).then(r => r.json()).then(data => {
    if (!data.ok) return;
    const item = data.item;
    document.getElementById('modalTitle').textContent = item.tema;
    document.getElementById('modalMeta').innerHTML =
      '<strong>Title:</strong> ' + (item.meta?.title || '-') + '<br>' +
      '<strong>URL:</strong> ' + (item.canonical || '-') + '<br>' +
      '<strong>Fecha:</strong> ' + item.fechaProgramada + '<br>' +
      '<strong>Estado:</strong> ' + item.estado;
    document.getElementById('modalImg').src = item.imagen || '';
    document.getElementById('modalContent').innerHTML = item.contenido || '<em>Sin contenido</em>';
    document.getElementById('modalPreview').classList.add('open');
  });
}

async function aprobarItem() {
  if (!itemActualId) return;
  const btn = document.getElementById('btnAprobar');
  btn.disabled = true;
  btn.textContent = '⏳ Aprobando...';

  const res = await fetch('/aprobar/' + itemActualId, { method: 'POST' });
  const data = await res.json();

  if (data.ok) {
    showStatus('statusModal', 'ok', '✅ Aprobado. Se publicará el ' + data.fechaProgramada);
    setTimeout(() => { cerrarModal(); location.reload(); }, 1500);
  } else {
    showStatus('statusModal', 'error', '❌ Error: ' + data.error);
    btn.disabled = false;
    btn.textContent = '✅ Aprobar';
  }
}

async function descartarItem() {
  if (!itemActualId) return;
  if (!confirm('¿Descartar este artículo?')) return;
  await fetch('/descartar/' + itemActualId, { method: 'DELETE' });
  cerrarModal();
  location.reload();
}

function seleccionarDia(fecha, el) {
  fetch('/dia/' + fecha).then(r => r.json()).then(data => {
    document.getElementById('modalDiaTitle').textContent = 'Artículo para el ' + fecha;
    if (data.item) {
      document.getElementById('modalDiaContent').innerHTML =
        '<p style="font-size:13px;margin-bottom:12px"><strong>' + data.item.tema + '</strong></p>' +
        '<p style="font-size:12px;color:#666">Estado: ' + data.item.estado + '</p>' +
        (data.item.canonical ? '<a href="' + data.item.canonical + '" target="_blank" style="color:#216416;font-size:13px">Ver artículo publicado →</a>' : '') +
        '<div class="grid2" style="margin-top:12px">' +
          '<button class="btn btn-primary" onclick="verPreview(\'' + data.item.id + '\');cerrarModalDia()">Ver / editar</button>' +
          '<button class="btn btn-danger" onclick="fetch(\'/descartar/' + data.item.id + '\',{method:\'DELETE\'}).then(()=>location.reload())">Eliminar</button>' +
        '</div>';
    } else {
      document.getElementById('fechaProg').value = fecha;
      document.getElementById('modalDiaContent').innerHTML =
        '<p style="font-size:13px;color:#666">No hay artículo programado para este día.</p>' +
        '<button class="btn btn-primary" onclick="cerrarModalDia()" style="margin-top:12px;width:100%">Agregar artículo arriba ↑</button>';
    }
    document.getElementById('modalDia').classList.add('open');
  });
}

function cerrarModal() { document.getElementById('modalPreview').classList.remove('open'); itemActualId = null; }
function cerrarModalDia() { document.getElementById('modalDia').classList.remove('open'); }
function setProgress(pct) { document.getElementById('progressFill').style.width = pct + '%'; }
function showStatus(id, type, msg) {
  const el = document.getElementById(id);
  el.className = 'status-bar status-' + type;
  el.innerHTML = msg;
  el.style.display = 'block';
}
</script>
</body>
</html>`);
});

// Helper para renderizar la cola
function renderCola() {
  const cola = obtenerCola().sort((a,b) => (a.fechaProgramada||'').localeCompare(b.fechaProgramada||''));
  if (!cola.length) return '<p style="font-size:13px;color:#999">La cola está vacía. Genera artículos arriba para llenarla.</p>';

  return `<table>
    <thead><tr><th>Fecha</th><th>Tema</th><th>Estado</th><th>Acciones</th></tr></thead>
    <tbody>${cola.map(i => `
      <tr>
        <td style="font-size:12px;white-space:nowrap">${i.fechaProgramada||'Sin fecha'}</td>
        <td style="font-size:12px">${i.tema}</td>
        <td><span class="badge ${i.estado==='publicado'?'badge-ok':i.estado==='aprobado'?'badge-aprov':'badge-pend'}">${i.estado}</span></td>
        <td>
          <button onclick="verPreview('${i.id}')" style="font-size:11px;padding:4px 10px;border:1px solid #ddd;border-radius:4px;cursor:pointer;background:#fff">👁️ Ver</button>
          ${i.estado!=='publicado'?`<button onclick="fetch('/descartar/${i.id}',{method:'DELETE'}).then(()=>location.reload())" style="font-size:11px;padding:4px 10px;border:1px solid #f5c4b3;border-radius:4px;cursor:pointer;background:#faece7;color:#993c1d;margin-left:4px">🗑️</button>`:''}
        </td>
      </tr>`).join('')}
    </tbody>
  </table>`;
}

// ─── ENDPOINTS ────────────────────────────────────────────────────────────────

// Generar artículo y agregar a la cola
app.post('/generar-para-cola', async (req, res) => {
  const { tema, marca, carpeta = 'blog', fechaProgramada } = req.body;
  if (!tema) return res.json({ ok: false, error: 'Falta el tema' });

  try {
    const meta = await generarMetadata({ tema, marca, tipo: 'articulo' });
    const contenido = await generarArticulo({ tema, marca, slug: meta.slug });
    const { isoDate, dateStr } = buildDate(0);
    const canonical = SITE_URL + '/' + carpeta + '/' + meta.slug + '/';
    const imagen = await generarYSubirImagen({ tema, marca, slug: meta.slug });

    const id = agregarACola({
      tema, marca, carpeta, fechaProgramada, meta, contenido,
      isoDate, dateStr, canonical, imagen, estado: 'pendiente'
    });

    res.json({ ok: true, id, title: meta.title, canonical });
  } catch(err) {
    console.error('[GENERAR-COLA]', err.message);
    res.json({ ok: false, error: err.message });
  }
});

// Ver item de la cola
app.get('/item/:id', (req, res) => {
  const item = obtenerItemPorId(req.params.id);
  if (!item) return res.json({ ok: false, error: 'No encontrado' });
  res.json({ ok: true, item });
});

// Aprobar item
app.post('/aprobar/:id', (req, res) => {
  const item = actualizarItem(req.params.id, { estado: 'aprobado' });
  if (!item) return res.json({ ok: false, error: 'No encontrado' });
  res.json({ ok: true, fechaProgramada: item.fechaProgramada });
});

// Descartar item
app.delete('/descartar/:id', (req, res) => {
  eliminarItem(req.params.id);
  res.json({ ok: true });
});

// Ver items de un día
app.get('/dia/:fecha', (req, res) => {
  const cola = obtenerCola();
  const item = cola.find(i => i.fechaProgramada === req.params.fecha);
  res.json({ ok: true, item: item || null });
});

// Vista previa en tiempo real
app.post('/preview', async (req, res) => {
  const { tema, marca, carpeta = 'blog' } = req.body;
  if (!tema) return res.json({ ok: false, error: 'Falta el tema' });
  try {
    const meta = await generarMetadata({ tema, marca, tipo: 'articulo' });
    const contenido = await generarArticulo({ tema, marca, slug: meta.slug });
    const canonical = SITE_URL + '/' + carpeta + '/' + meta.slug + '/';
    const imagen = await generarYSubirImagen({ tema, marca, slug: meta.slug });
    const id = Date.now().toString();
    borradores[id] = { meta, contenido, canonical, imagen, carpeta, marca, tema };
    res.json({ ok: true, id, title: meta.h1||meta.title, description: meta.description, canonical, imagen, contenido, slug: meta.slug });
  } catch(err) {
    res.json({ ok: false, error: err.message });
  }
});

// Test SFTP
app.get('/test-sftp', async (req, res) => {
  const ok = await testConexion();
  res.json({ ok });
});

app.get('/health', (req, res) => res.json({ ok: true, uptime: process.uptime(), cola: obtenerCola().length }));

// ─── CRON: publicar artículo del día a las 7am Chile (10am UTC) ───────────────
cron.schedule('0 10 * * *', async () => {
  console.log('[CRON] Revisando artículos para hoy...');
  const items = obtenerItemsParaHoy();

  if (!items.length) {
    console.log('[CRON] Sin artículos programados para hoy');
    return;
  }

  for (const item of items) {
    console.log('[CRON] Publicando:', item.tema);
    try {
      const htmlCompleto = buildArticlePage({
        title: item.meta.h1 || item.meta.title,
        description: item.meta.description,
        canonical: item.canonical,
        isoDate: item.isoDate,
        dateStr: item.dateStr,
        image: item.imagen,
        content: item.contenido,
        marca: item.marca || null,
        backUrl: '../../blog/',
        backLabel: 'Volver al blog',
        relacionados: []
      });

      await publicarArticulo({ slug: item.meta.slug, carpeta: item.carpeta, htmlContent: htmlCompleto });
      await actualizarSitemap({ canonical: item.canonical });
      actualizarItem(item.id, { estado: 'publicado', publicadoEn: new Date().toISOString() });

      historial.push({
        fecha: new Date().toLocaleString('es-CL'),
        ok: true, canonical: item.canonical,
        title: item.meta.title, duracion: '-'
      });

      console.log('[CRON] ✅ Publicado:', item.canonical);
    } catch(err) {
      console.error('[CRON] ❌ Error publicando', item.tema, ':', err.message);
      actualizarItem(item.id, { estado: 'error', errorMsg: err.message });
    }
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log('[SERVER] Puerto', PORT));

// ─── RUTAS SEO / SEARCH CONSOLE ──────────────────────────────────────────────
const { getAuthUrl, getTokensFromCode, loadTokens } = require('./gsc-auth');
const { getDiagnostico, getTodasLasKeywords, getComparativaHistorica, getComparativaCustom, getTodasLasPaginas, getKeywordsDePagina } = require('./gsc-diagnostico');
const AnthropicSDK = require('@anthropic-ai/sdk');
const anthropicClient = new AnthropicSDK({ apiKey: process.env.ANTHROPIC_API_KEY });
const { cargarPlan, guardarPlan } = require('./estrategia');
const { renderSeoPanel, renderConnectCard, renderSidebar } = require('./seo-panel');

// Iniciar autorización con Google
app.get('/auth/google', (req, res) => {
  const url = getAuthUrl();
  res.redirect(url);
});

// Callback de Google OAuth
app.get('/auth/callback', async (req, res) => {
  const { code } = req.query;
  if (!code) return res.send('Error: sin código de autorización');
  try {
    await getTokensFromCode(code);
    res.send(`
      <h2>✅ ¡Conectado con Google Search Console!</h2>
      <p>Ya puedes ver el diagnóstico SEO.</p>
      <a href="/seo">Ver diagnóstico SEO →</a>
    `);
  } catch(err) {
    res.send('❌ Error: ' + err.message);
  }
});

// Terminos y condiciones de datos
app.get('/terminos-datos', (req, res) => {
  res.send(`<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>Terminos y condiciones de datos — Magenta SEO</title>
  <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600&display=swap" rel="stylesheet">
  <style>
    *{box-sizing:border-box;margin:0;padding:0}
    body{font-family:"Poppins",sans-serif;background:#f5f5f5;color:#1a1a1a;padding:40px 20px}
    .card{background:#fff;border-radius:16px;border:1px solid #e5e5e5;padding:40px;max-width:680px;margin:0 auto}
    h1{font-size:20px;font-weight:600;color:#216416;margin-bottom:24px}
    h2{font-size:15px;font-weight:600;margin:24px 0 8px}
    p{font-size:13px;color:#444;line-height:1.7;margin-bottom:8px}
    ul{margin:8px 0 8px 20px}
    li{font-size:13px;color:#444;line-height:1.7;margin-bottom:6px}
    .back{display:inline-block;margin-top:28px;font-size:12px;color:#216416;text-decoration:none}
  </style>
</head>
<body>
  <div class="card">
    <h1>Terminos y condiciones de datos</h1>

    <h2>Por que los numeros pueden diferir levemente de Search Console</h2>
    <p>Este panel usa la misma API oficial de Google Search Console que usa la interfaz web de Google. Aun asi, es normal ver pequenas diferencias entre lo que muestra este panel y lo que muestra Search Console directamente, por las siguientes razones documentadas por Google:</p>

    <ul>
      <li><strong>Zona horaria del corte diario:</strong> Search Console define el inicio y fin de cada "dia" de datos usando la zona horaria de EE.UU. Pacifico (PT), sin importar la ubicacion del sitio o del servidor. Este panel calcula los rangos de fecha usando UTC. En periodos largos (60-90 dias), ese desfase de zona horaria se acumula y puede generar diferencias visibles en los totales.</li>
      <li><strong>Datos en proceso:</strong> Google sigue completando y ajustando los datos de los ultimos 1-2 dias despues de que aparecen por primera vez. Los numeros de los dias mas recientes suben con el tiempo a medida que Google termina de procesarlos.</li>
      <li><strong>Filtro de privacidad en keywords:</strong> Search Console oculta automaticamente las busquedas de muy bajo volumen en el desglose por keyword individual (para proteger la privacidad de los usuarios que buscaron), pero si las incluye en los totales generales del sitio. Por eso la suma de la tabla de keywords individuales siempre sera un poco menor que las metricas generales.</li>
      <li><strong>Limite de la API:</strong> Google documenta explicitamente que los datos entregados por la API de Search Analytics pueden no coincidir exactamente con la interfaz web, ya que esta ultima aplica procesamiento adicional no expuesto via API.</li>
    </ul>

    <h2>Que si es confiable</h2>
    <p>Las tendencias, posiciones relativas entre keywords, y la direccion de los cambios (subidas y bajadas) son consistentes y confiables para tomar decisiones de contenido y SEO, incluso si los totales exactos difieren en un pequeno porcentaje respecto a la vista web de Search Console.</p>

    <a href="/seo" class="back">← Volver al diagnostico</a>
  </div>
</body>
</html>`);
});

// Dashboard de diagnóstico SEO
app.get('/seo', async (req, res) => {
  const tokens = loadTokens();
  if (!tokens) {
    return res.send(renderConnectCard());
  }
  res.send(renderSeoPanel());
});

// API endpoint para el dashboard interno
app.get('/seo/data', async (req, res) => {
  try {
    const dias = parseInt(req.query.dias || '28');
    const data = await getDiagnostico(dias);
    res.json({ ok: true, data });
  } catch(err) {
    res.json({ ok: false, error: err.message });
  }
});

// Todas las keywords sin recortar
app.get('/seo/keywords', async (req, res) => {
  try {
    const dias = parseInt(req.query.dias || '28');
    const data = await getTodasLasKeywords(dias);
    res.json({ ok: true, data });
  } catch(err) {
    res.json({ ok: false, error: err.message });
  }
});

// Todas las paginas sin recortar
app.get('/seo/paginas', async (req, res) => {
  try {
    const dias = parseInt(req.query.dias || '28');
    const data = await getTodasLasPaginas(dias);
    res.json({ ok: true, data });
  } catch(err) {
    res.json({ ok: false, error: err.message });
  }
});

// Keywords de una pagina especifica (drill-down)
app.get('/seo/pagina-keywords', async (req, res) => {
  try {
    const dias = parseInt(req.query.dias || '28');
    const url = req.query.url;
    if (!url) return res.json({ ok: false, error: 'Falta parametro url' });
    const data = await getKeywordsDePagina(url, dias);
    res.json({ ok: true, data });
  } catch(err) {
    res.json({ ok: false, error: err.message });
  }
});

// Comparativa 30/60/90 dias
app.get('/seo/comparativa', async (req, res) => {
  try {
    const data = await getComparativaHistorica();
    res.json({ ok: true, data });
  } catch(err) {
    res.json({ ok: false, error: err.message });
  }
});

// Comparativa custom entre dos rangos de fecha
app.get('/seo/comparativa-custom', async (req, res) => {
  try {
    const { desdeA, hastaA, desdeB, hastaB } = req.query;
    if (!desdeA || !hastaA || !desdeB || !hastaB) {
      return res.json({ ok: false, error: 'Faltan parametros de fecha' });
    }
    const data = await getComparativaCustom(desdeA, hastaA, desdeB, hastaB);
    res.json({ ok: true, data });
  } catch(err) {
    res.json({ ok: false, error: err.message });
  }
});

function clasificarIntencionServer(pagina) {
  const p = pagina.toLowerCase();
  const informativas = ['falla', 'codigo-de-error', 'como-resetear', 'como-elegir', 'guia-rapida', 'manual', 'significado', 'capacitacion', 'que-hacer-si'];
  const comerciales = ['a-domicilio', 'reparacion', 'instalacion', 'servicio-tecnico', 'mantencion', 'urgente', 'cotiza', 'precio', 'venta'];
  if (informativas.some(k => p.includes(k))) return 'informativa';
  if (comerciales.some(k => p.includes(k))) return 'comercial';
  return 'comercial';
}

function normalizarTexto(s) {
  return s.toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

async function extraerPrioridades(textoLibre) {
  if (!textoLibre || !textoLibre.trim()) return [];
  try {
    const msg = await anthropicClient.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 300,
      system: 'Extraes nombres de comunas, ciudades o marcas de portones mencionados en un texto en español escrito por un usuario (puede tener errores de tipeo y ortografia). Corrige la ortografia de cada nombre (ej: "lo barnechea" -> "Lo Barnechea", "nunoa" -> "Ñuñoa"). Ignora cualquier palabra que no sea un lugar o marca real (relleno conversacional como "quiero que", "me gusta", "tambien dentro de tus ambitos", etc). Responde SOLO con un array JSON de strings, sin texto adicional, sin markdown, sin explicacion. Si no detectas ningun lugar o marca real, responde [].',
      messages: [{ role: 'user', content: textoLibre }]
    });
    const texto = msg.content[0].text.trim();
    const limpio = texto.replace(/```json|```/g, '').trim();
    const arr = JSON.parse(limpio);
    return Array.isArray(arr) ? arr.filter(x => typeof x === 'string' && x.trim()) : [];
  } catch(e) {
    console.error('[PRIORIDADES] Error extrayendo con Claude:', e.message);
    return [];
  }
}

async function generarPlanAutomatico(prioridades = []) {
  const paginas = await getTodasLasPaginas(90);
  const comerciales = paginas
    .map(p => {
      const ctrActual = p.ctr / 100;
      const potencial = Math.max(0, Math.round(p.impresiones * (0.28 - ctrActual)));
      return { ...p, potencial };
    })
    .filter(p => clasificarIntencionServer(p.pagina) === 'comercial')
    .sort((a, b) => b.potencial - a.potencial);

  const usoContador = {};
  comerciales.forEach(p => { usoContador[p.pagina] = 0; });

  const hoy = new Date();

  // Insertar prioridades del usuario al principio de la lista de temas
  const prioritarios = [];
  const yaUsados = new Set();
  prioridades.forEach(prio => {
    const prioNorm = normalizarTexto(prio);
    if (!prioNorm) return;
    const existente = KW_SUGERIDAS.find(t => normalizarTexto(t.tema).includes(prioNorm) && !yaUsados.has(t.tema));
    if (existente) {
      prioritarios.push(existente);
      yaUsados.add(existente.tema);
    } else {
      const nuevoTema = 'reparación portón eléctrico ' + prio.trim();
      prioritarios.push({ tema: nuevoTema, marca: '', carpeta: 'blog' });
      yaUsados.add(nuevoTema);
    }
  });
  const resto = KW_SUGERIDAS.filter(t => !yaUsados.has(t.tema));
  const listaTemas = [...prioritarios, ...resto];

  // Arreglos rapidos: paginas que YA rankean bien (posicion <= 6) pero con
  // CTR muy por debajo de lo esperado - se arreglan con titulo/meta, no con articulos nuevos
  const arreglosRapidos = comerciales
    .filter(p => p.posicion <= 6 && p.potencial >= 20)
    .slice(0, 8)
    .map(p => ({ pagina: p.pagina, posicion: p.posicion, ctr: p.ctr, potencial: p.potencial }));

  const articulos = listaTemas.map((item, idx) => {
    const temaNorm = normalizarTexto(item.tema);
    const palabras = temaNorm.split(' ').filter(w => w.length > 3);

    let mejor = null;
    for (const p of comerciales) {
      const paginaNorm = normalizarTexto(p.pagina);
      if (palabras.some(w => paginaNorm.includes(w))) {
        if (!mejor || p.potencial > mejor.potencial) mejor = p;
      }
    }
    if (!mejor && comerciales.length > 0) {
      mejor = [...comerciales].sort((a, b) =>
        (usoContador[a.pagina] - usoContador[b.pagina]) || (b.potencial - a.potencial)
      )[0];
    }
    if (mejor) usoContador[mejor.pagina] = (usoContador[mejor.pagina] || 0) + 1;

    const fecha = new Date(hoy);
    fecha.setDate(fecha.getDate() + idx + 1);

    return {
      tema: item.tema,
      marca: item.marca || '',
      carpeta: item.carpeta || '',
      enlazarA: mejor ? mejor.pagina : null,
      enlazarPotencial: mejor ? mejor.potencial : 0,
      fecha: fecha.toISOString().split('T')[0],
      prioritario: idx < prioritarios.length,
    };
  });

  return { articulos, arreglosRapidos };
}

// Genera el plan del mes automaticamente (con prioridades opcionales del usuario)
app.post('/seo/plan-automatico', async (req, res) => {
  try {
    const textoLibre = typeof req.body.texto === 'string' ? req.body.texto : '';
    const prioridadesManual = Array.isArray(req.body.prioridades) ? req.body.prioridades : [];
    const prioridadesExtraidas = textoLibre ? await extraerPrioridades(textoLibre) : [];
    const prioridades = prioridadesExtraidas.length > 0 ? prioridadesExtraidas : prioridadesManual;
    const plan = await generarPlanAutomatico(prioridades);
    res.json({ ok: true, data: plan });
  } catch (err) {
    res.json({ ok: false, error: err.message });
  }
});

// Compatibilidad: version GET sin prioridades
app.get('/seo/plan-automatico', async (req, res) => {
  try {
    const plan = await generarPlanAutomatico();
    res.json({ ok: true, data: plan });
  } catch (err) {
    res.json({ ok: false, error: err.message });
  }
});

// Plan de estrategia del mes
app.get('/seo/estrategia', (req, res) => {
  try {
    const data = cargarPlan();
    res.json({ ok: true, data });
  } catch(err) {
    res.json({ ok: false, error: err.message });
  }
});

app.post('/seo/estrategia', (req, res) => {
  try {
    const data = guardarPlan(req.body);
    res.json({ ok: true, data });
  } catch(err) {
    res.json({ ok: false, error: err.message });
  }
});
