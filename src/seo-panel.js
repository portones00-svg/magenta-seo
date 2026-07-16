// seo-panel.js — Panel de Diagnóstico y Estrategia SEO

function renderSidebar(active) {
  const items = [
    { id: 'diagnostico', icon: '\ud83d\udcca', label: 'Diagnóstico', href: '/seo' },
    { id: 'estrategia', icon: '\ud83c\udfaf', label: 'Estrategia', href: '/seo#estrategia' },
    { id: 'calendario', icon: '\ud83d\udcc5', label: 'Calendario', href: '/' },
  ];
  const linksHtml = items.map(it => {
    const isActive = active === it.id;
    return `<a class="nav-item${isActive ? ' active' : ''}" href="${it.href}" data-view="${it.id}">${it.icon} ${it.label}</a>`;
  }).join('\n    ');
  const publicacionActive = active === 'publicacion' || active === 'calendario';
  return `<div class="sidebar">
    <h1>\ud83d\ude80 Magenta SEO</h1>
    ${linksHtml}
    <a class="nav-item${publicacionActive ? ' active' : ''}" href="/#cola" data-view="publicacion">\ud83d\udce4 Publicación</a>
    <div style="padding:14px 20px 0">
      <a href="/terminos-datos" target="_blank" style="font-size:11px;color:#999">Términos y condiciones de datos</a>
    </div>
  </div>`;
}

function renderSeoPanel() {
  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>Magenta SEO — Diagnóstico</title>
  <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600&display=swap" rel="stylesheet">
  <style>
    *{box-sizing:border-box;margin:0;padding:0}
    body{font-family:"Poppins",sans-serif;background:#f5f5f5;color:#1a1a1a}
    a{color:#216416}
    .layout{display:flex;min-height:100vh}
    .sidebar{width:220px;background:#fff;border-right:1px solid #e5e5e5;padding:20px 0;flex-shrink:0}
    .sidebar h1{font-size:16px;font-weight:600;color:#216416;padding:0 20px 20px}
    .nav-item{display:flex;align-items:center;gap:10px;padding:12px 20px;font-size:13px;color:#666;cursor:pointer;border-left:3px solid transparent}
    .nav-item:hover{background:#f5f5f5}
    .nav-item.active{background:#eef6ec;color:#216416;font-weight:500;border-left-color:#216416}
    .nav-item.disabled{opacity:0.4;cursor:not-allowed}
    .main{flex:1;padding:24px 32px;max-width:1200px}
    .sub{font-size:13px;color:#666;margin-bottom:20px}
    .grid3{display:grid;grid-template-columns:1fr 1fr 1fr;gap:12px;margin-bottom:20px}
    .metric{background:#fff;border-radius:10px;border:1px solid #e5e5e5;padding:16px;text-align:center}
    .metric-val{font-size:28px;font-weight:600;color:#216416}
    .metric-lab{font-size:12px;color:#999;margin-top:2px}
    .card{background:#fff;border-radius:12px;border:1px solid #e5e5e5;padding:20px;margin-bottom:16px}
    .card-title{font-size:15px;font-weight:600;margin-bottom:16px;display:flex;align-items:center;justify-content:space-between}
    .btn{padding:10px 20px;border:none;border-radius:8px;font-size:13px;font-weight:500;cursor:pointer;font-family:Poppins,sans-serif}
    .btn-primary{background:#216416;color:#fff}
    .btn-primary:hover{background:#1a5212}
    .btn-secondary{background:#f5f5f5;color:#444;border:1px solid #ddd}
    .btn-secondary:hover{background:#e8e8e8}
    .btn-sm{padding:6px 12px;font-size:12px}
    .btn:disabled{opacity:0.5;cursor:not-allowed}
    select,input{padding:9px 12px;border:1px solid #ddd;border-radius:8px;font-size:13px;font-family:Poppins,sans-serif;outline:none}
    select:focus,input:focus{border-color:#216416}
    table{width:100%;border-collapse:collapse;font-size:13px}
    th{text-align:left;padding:8px;color:#999;font-weight:400;font-size:12px;border-bottom:1px solid #eee;cursor:pointer;user-select:none;white-space:nowrap}
    th:hover{color:#216416}
    th.sorted{color:#216416;font-weight:500}
    td{padding:8px;border-bottom:1px solid #eee;vertical-align:top}
    .badge{display:inline-block;font-size:11px;padding:2px 8px;border-radius:99px;font-weight:500}
    .badge-ok{background:#e1f5ee;color:#0f6e56}
    .badge-warn{background:#faeeda;color:#854f0b}
    .badge-bad{background:#faece7;color:#993c1d}
    .delta-up{color:#0f6e56;font-weight:500}
    .delta-down{color:#993c1d;font-weight:500}
    .delta-flat{color:#999}
    .filters-row{display:flex;gap:10px;align-items:center;margin-bottom:16px;flex-wrap:wrap}
    .filters-row input, .filters-row select{margin-bottom:0}
    .table-wrap{max-height:600px;overflow-y:auto}
    .table-wrap table{position:relative}
    .table-wrap thead{position:sticky;top:0;background:#fff;z-index:1}
    .loading{text-align:center;padding:40px;color:#999;font-size:13px}
    .empty{text-align:center;padding:40px;color:#999;font-size:13px}
    .step{display:none}
    .step.active{display:block}
    .step-dots{display:flex;gap:6px;margin-bottom:20px}
    .step-dot{width:8px;height:8px;border-radius:50%;background:#ddd}
    .step-dot.active{background:#216416}
    .step-dot.done{background:#8fbf86}
    .kw-pick{display:flex;align-items:center;gap:10px;padding:10px;border:1px solid #eee;border-radius:8px;margin-bottom:8px;cursor:pointer}
    .kw-pick:hover{border-color:#216416}
    .kw-pick.selected{background:#eef6ec;border-color:#216416}
    .kw-pick input{margin:0}
    .kw-pick .kw-info{flex:1}
    .kw-pick .kw-name{font-size:13px;font-weight:500}
    .kw-pick .kw-meta{font-size:11px;color:#999}
    .plan-summary{background:#eef6ec;border-radius:10px;padding:16px;margin-bottom:16px}
    .plan-summary h3{font-size:14px;color:#216416;margin-bottom:8px}
    .chip{display:inline-block;background:#fff;border:1px solid #cde3c6;color:#216416;font-size:12px;padding:4px 10px;border-radius:99px;margin:2px}
    .status-bar{padding:10px 14px;border-radius:8px;font-size:13px;margin-top:10px;display:none}
    .status-ok{background:#e1f5ee;color:#0f6e56}
    .status-error{background:#faece7;color:#993c1d}
    .modal{display:none;position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.5);z-index:100;align-items:center;justify-content:center}
    .modal.open{display:flex}
    .modal-box{background:#fff;border-radius:12px;padding:24px;max-width:500px;width:90%;max-height:80vh;overflow-y:auto}
    .modal-title{font-size:16px;font-weight:600;margin-bottom:16px}
  </style>
</head>
<body>
<div class="layout">
  ${renderSidebar('diagnostico')}

  <div class="main">

    <!-- ═══════════════ VISTA: DIAGNÓSTICO ═══════════════ -->
    <div id="view-diagnostico" class="view">
      <div class="card-title" style="margin-bottom:4px">Diagnóstico SEO</div>
      <div class="sub">Todas las keywords que compites, comparadas en el tiempo</div>

      <div style="display:flex;gap:8px;margin-bottom:16px">
        <button class="btn btn-primary btn-sm" id="tabKeywords" onclick="mostrarTabDiag('keywords')">Keywords</button>
        <button class="btn btn-secondary btn-sm" id="tabPaginas" onclick="mostrarTabDiag('paginas')">Páginas</button>
      </div>

      <div class="filters-row">
        <span style="font-size:12px;color:#666">Comparar:</span>
        <select id="rangoComparar">
          <option value="30">Últimos 30 días</option>
          <option value="60">Últimos 60 días</option>
          <option value="90">Últimos 90 días</option>
          <option value="custom">Fechas personalizadas</option>
        </select>
        <span id="customFechas" style="display:none;gap:8px;align-items:center">
          <input type="date" id="fechaDesdeA" style="width:135px">
          <span style="font-size:12px;color:#999">vs</span>
          <input type="date" id="fechaDesdeB" style="width:135px">
        </span>
        <button class="btn btn-primary btn-sm" id="btnCargarDiag">Actualizar</button>
        <input type="text" id="buscarKw" placeholder="Buscar keyword..." style="margin-left:auto;width:220px">
      </div>

      <div id="diagResumen" class="grid3"></div>
      <p style="font-size:11px;color:#999;font-style:italic;margin:-12px 0 20px">Los números pueden variar levemente respecto a Search Console: Google sigue completando datos de los últimos 1-2 días con retraso, así que las cifras más recientes suben con el tiempo.</p>

      <div class="card" id="seccionKeywords">
        <div class="card-title">
          <span>Todas las keywords (<span id="totalKwCount">0</span>)</span>
          <span style="font-size:12px;color:#999;font-weight:400">Click en columna para ordenar</span>
        </div>
        <div class="table-wrap">
          <table id="tablaKw">
            <thead>
              <tr>
                <th data-sort="keyword">Keyword</th>
                <th data-sort="posicion">Posición</th>
                <th data-sort="clics">Clics</th>
                <th data-sort="impresiones">Impresiones</th>
                <th data-sort="ctr">CTR</th>
                <th data-sort="delta">Cambio</th>
              </tr>
            </thead>
            <tbody id="tablaKwBody">
              <tr><td colspan="6" class="loading">Cargando keywords…</td></tr>
            </tbody>
          </table>
        </div>
      </div>

      <div class="card" id="seccionPaginas" style="display:none">
        <div class="card-title">
          <span>Todas las páginas (<span id="totalPagCount">0</span>)</span>
          <input type="text" id="buscarPag" placeholder="Buscar página..." style="width:220px;margin-bottom:0">
        </div>
        <div class="table-wrap">
          <table id="tablaPag">
            <thead>
              <tr>
                <th data-sortpag="pagina">Página</th>
                <th data-sortpag="posicion">Posición</th>
                <th data-sortpag="clics">Clics</th>
                <th data-sortpag="impresiones">Impresiones</th>
                <th data-sortpag="ctr">CTR</th>
                <th data-sortpag="potencial">Potencial \ud83d\udd25</th>
                <th data-sortpag="intencion">Intención</th>
              </tr>
            </thead>
            <tbody id="tablaPagBody">
              <tr><td colspan="7" class="loading">Cargando páginas…</td></tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- ═══════════════ VISTA: ESTRATEGIA ══════════════ -->
    <div id="view-estrategia" class="view" style="display:none">
      <div class="card-title" style="margin-bottom:4px">Estrategia del mes</div>
      <div class="sub">Plan de contenido generado automáticamente — sin selección manual</div>

      <div id="planGuardadoBox"></div>

      <div class="card">
        <div class="card-title">⚡ Arreglos rápidos de título/meta</div>
        <div class="sub">Páginas que ya rankean bien pero pierden clics por un título poco atractivo — se arreglan hoy, sin esperar contenido nuevo.</div>
        <div class="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Página</th>
                <th>Posición</th>
                <th>CTR actual</th>
                <th>Potencial si se arregla</th>
                <th>Acción</th>
              </tr>
            </thead>
            <tbody id="arreglosRapidosBody">
              <tr><td colspan="5" class="loading">Cargando…</td></tr>
            </tbody>
          </table>
        </div>
      </div>

      <div class="card">
        <div class="card-title">
          <span>Plan automático (<span id="planAutoCount">0</span> artículos)</span>
          <button class="btn btn-secondary btn-sm" id="btnRegenerarPlan">🔄 Regenerar</button>
        </div>
        <div style="display:flex;gap:8px;margin-bottom:16px">
          <input type="text" id="prioridadesInput" placeholder="¿Algo que priorizar este mes? Ej: Vitacura, Lo Barnechea, La Dehesa" style="flex:1;margin-bottom:0">
          <button class="btn btn-primary btn-sm" id="btnAplicarPrioridades">Aplicar y regenerar</button>
        </div>
        <div class="sub">Cruza tus keywords sugeridas con las páginas comerciales de más potencial — cada artículo ya trae asignado a qué página enlazar internamente.</div>

        <div id="metaEstrategia" style="margin-bottom:20px"></div>
        <div id="planExplicacion" style="margin-bottom:20px"></div>
        <div class="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Tema del artículo</th>
                <th>Marca</th>
                <th>Enlazar internamente a</th>
              </tr>
            </thead>
            <tbody id="planAutoBody">
              <tr><td colspan="4" class="loading">Generando plan…</td></tr>
            </tbody>
          </table>
        </div>
        <div style="margin-top:16px;display:flex;justify-content:flex-end">
          <button class="btn btn-primary" id="btnGuardarPlanAuto">Guardar plan del mes</button>
        </div>
        <div id="estrategiaStatus" class="status-bar"></div>
      </div>

      <div class="card">
        <div class="card-title">📊 Historial de estrategias guardadas</div>
        <div class="sub">Cada vez que guardas un plan queda una foto de línea base — vuelve en 30/60/90 días a auditar si se cumplió la meta.</div>
        <div class="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Guardado el</th>
                <th>Artículos</th>
                <th>Meta 30 días</th>
                <th>Acción</th>
              </tr>
            </thead>
            <tbody id="historialEstrategiaBody">
              <tr><td colspan="4" class="loading">Cargando…</td></tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

  </div>
</div>

<div class="modal" id="modalPagKw">
  <div class="modal-box">
    <div class="modal-title" id="modalPagKwTitle">Keywords de esta página</div>
    <div id="modalPagKwBody" style="max-height:400px;overflow-y:auto"></div>
    <button class="btn btn-secondary" onclick="cerrarModalPagKw()" style="width:100%;margin-top:12px">Cerrar</button>
  </div>
</div>

<div class="modal" id="modalAuditoria">
  <div class="modal-box" style="max-width:650px">
    <div class="modal-title">Auditoría: proyectado vs. real</div>
    <div id="modalAuditoriaBody"></div>
    <button class="btn btn-secondary" onclick="cerrarModalAuditoria()" style="width:100%;margin-top:12px">Cerrar</button>
  </div>
</div>

<div class="modal" id="modalConfirmar">
  <div class="modal-box" style="max-width:420px;text-align:center">
    <div style="font-size:32px;margin-bottom:12px">⚠️</div>
    <div class="modal-title" style="text-align:center" id="modalConfirmarTitulo">Confirmar acción</div>
    <p id="modalConfirmarMensaje" style="font-size:13px;color:#666;line-height:1.6;margin-bottom:20px"></p>
    <div style="display:flex;gap:10px">
      <button class="btn btn-secondary" id="btnConfirmarCancelar" style="flex:1">Cancelar</button>
      <button class="btn btn-primary" id="btnConfirmarAceptar" style="flex:1">Confirmar</button>
    </div>
  </div>
</div>

<div class="modal" id="modalSugerencia">
  <div class="modal-box" style="max-width:600px">
    <div class="modal-title">Propuesta de título/meta (sin aplicar todavía)</div>
    <div id="modalSugerenciaBody"></div>
    <button class="btn btn-secondary" onclick="cerrarModalSugerencia()" style="width:100%;margin-top:12px">Cerrar</button>
  </div>
</div>

<script>
// ─── Navegación sidebar ───────────────────────────────────────────────
document.querySelectorAll('.nav-item[data-view]').forEach(item => {
  item.addEventListener('click', (e) => {
    const target = item.dataset.view;
    if (!document.getElementById('view-' + target)) return;
    e.preventDefault();
    document.querySelectorAll('.nav-item[data-view]').forEach(i => i.classList.remove('active'));
    item.classList.add('active');
    document.querySelectorAll('.view').forEach(v => v.style.display = 'none');
    document.getElementById('view-' + target).style.display = 'block';
    if (target === 'diagnostico' && !window.__diagCargado) cargarDiagnostico();
    if (target === 'estrategia' && !window.__estrategiaCargada) cargarEstrategia();
  });
});

if (window.location.hash === '#estrategia') {
  const estrategiaTab = document.querySelector('.nav-item[data-view="estrategia"]');
  if (estrategiaTab) estrategiaTab.click();
}

// ─── Helper: detecta sesion de Google vencida y redirige a login ────────
async function fetchGSC(url, opts) {
  const res = await fetch(url, opts).then(r => r.json());
  if (!res.ok && res.error && /token|invalid_grant|unauthorized|unauthenticated/i.test(res.error)) {
    window.location.href = '/auth/google';
    return new Promise(() => {});
  }
  return res;
}

function confirmarAccion(mensaje, titulo) {
  return new Promise((resolve) => {
    document.getElementById('modalConfirmarTitulo').textContent = titulo || 'Confirmar acción';
    document.getElementById('modalConfirmarMensaje').textContent = mensaje;
    document.getElementById('modalConfirmar').classList.add('open');

    const btnCancelar = document.getElementById('btnConfirmarCancelar');
    const btnAceptar = document.getElementById('btnConfirmarAceptar');

    function limpiar(resultado) {
      document.getElementById('modalConfirmar').classList.remove('open');
      btnCancelar.removeEventListener('click', onCancelar);
      btnAceptar.removeEventListener('click', onAceptar);
      resolve(resultado);
    }
    function onCancelar() { limpiar(false); }
    function onAceptar() { limpiar(true); }

    btnCancelar.addEventListener('click', onCancelar);
    btnAceptar.addEventListener('click', onAceptar);
  });
}

// ─── DIAGNÓSTICO ───────────────────────────────────────────────────────
let kwData = [];
let sortField = 'impresiones';
let sortDir = -1;

document.getElementById('rangoComparar').addEventListener('change', (e) => {
  document.getElementById('customFechas').style.display = e.target.value === 'custom' ? 'flex' : 'none';
});
document.getElementById('btnCargarDiag').addEventListener('click', cargarDiagnostico);
document.getElementById('buscarKw').addEventListener('input', renderTablaKw);

async function cargarDiagnostico() {
  window.__diagCargado = true;
  document.getElementById('tablaKwBody').innerHTML = '<tr><td colspan="6" class="loading">Cargando keywords…</td></tr>';

  try {
    const rango = document.getElementById('rangoComparar').value;
    const diasParam = (rango !== 'custom') ? rango : '28';

    const [resumenRes, kwRes] = await Promise.all([
      fetchGSC('/seo/data?dias=' + diasParam),
      fetchGSC('/seo/keywords?dias=' + diasParam)
    ]);

    if (resumenRes.ok) {
      const d = resumenRes.data;
      document.getElementById('diagResumen').innerHTML = \`
        <div class="metric"><div class="metric-val">\${d.resumen.totalClics}</div><div class="metric-lab">Clics (\${d.resumen.dias}d)</div></div>
        <div class="metric"><div class="metric-val">\${d.resumen.totalImpresiones}</div><div class="metric-lab">Impresiones</div></div>
        <div class="metric"><div class="metric-val">\${d.resumen.posPromedio}</div><div class="metric-lab">Posición promedio</div></div>
      \`;
    }

    let deltaMap = {};
    if (rango !== 'custom') {
      const comp = await fetchGSC('/seo/comparativa');
      if (comp.ok) {
        const campo = 'delta' + rango;
        comp.data.forEach(r => { deltaMap[r.keyword] = r[campo]; });
      }
    } else {
      const desdeA = document.getElementById('fechaDesdeA').value;
      const desdeB = document.getElementById('fechaDesdeB').value;
      if (desdeA && desdeB) {
        const hoy = new Date().toISOString().split('T')[0];
        const comp = await fetchGSC(\`/seo/comparativa-custom?desdeA=\${desdeA}&hastaA=\${hoy}&desdeB=\${desdeB}&hastaB=\${hoy}\`);
        if (comp.ok) comp.data.forEach(r => { deltaMap[r.keyword] = r.delta; });
      }
    }

    if (kwRes.ok) {
      kwData = kwRes.data.map(r => ({ ...r, delta: deltaMap[r.keyword] ?? null }));
      renderTablaKw();
    } else {
      document.getElementById('tablaKwBody').innerHTML = '<tr><td colspan="6" class="empty">' + (kwRes.error || 'Error cargando datos') + '</td></tr>';
    }
  } catch(e) {
    document.getElementById('tablaKwBody').innerHTML = '<tr><td colspan="6" class="empty">Error: ' + e.message + '</td></tr>';
  }
}

document.querySelectorAll('#tablaKw th[data-sort]').forEach(th => {
  th.addEventListener('click', () => {
    const field = th.dataset.sort;
    if (sortField === field) { sortDir *= -1; } else { sortField = field; sortDir = -1; }
    document.querySelectorAll('#tablaKw th').forEach(t => t.classList.remove('sorted'));
    th.classList.add('sorted');
    renderTablaKw();
  });
});

function renderTablaKw() {
  const busqueda = document.getElementById('buscarKw').value.toLowerCase();
  let filtrado = kwData.filter(r => r.keyword.toLowerCase().includes(busqueda));

  filtrado.sort((a, b) => {
    let va = a[sortField], vb = b[sortField];
    if (va === null || va === undefined) va = sortField === 'posicion' ? 999 : -Infinity;
    if (vb === null || vb === undefined) vb = sortField === 'posicion' ? 999 : -Infinity;
    if (typeof va === 'string') return va.localeCompare(vb) * sortDir;
    return (va - vb) * sortDir;
  });

  document.getElementById('totalKwCount').textContent = filtrado.length;

  if (filtrado.length === 0) {
    document.getElementById('tablaKwBody').innerHTML = '<tr><td colspan="6" class="empty">Sin resultados</td></tr>';
    return;
  }

  document.getElementById('tablaKwBody').innerHTML = filtrado.map(r => {
    let deltaHtml = '<span class="delta-flat">—</span>';
    if (r.delta !== null && r.delta !== undefined) {
      if (r.delta > 0.3) deltaHtml = \`<span class="delta-up">▲ \${r.delta}</span>\`;
      else if (r.delta < -0.3) deltaHtml = \`<span class="delta-down">▼ \${Math.abs(r.delta)}</span>\`;
      else deltaHtml = '<span class="delta-flat">≈ sin cambio</span>';
    }
    let posBadge = 'badge-bad';
    if (r.posicion <= 3) posBadge = 'badge-ok';
    else if (r.posicion <= 10) posBadge = 'badge-warn';
    return \`<tr>
      <td>\${r.keyword}</td>
      <td><span class="badge \${posBadge}">\${r.posicion}</span></td>
      <td>\${r.clics}</td>
      <td>\${r.impresiones}</td>
      <td>\${r.ctr}%</td>
      <td>\${deltaHtml}</td>
    </tr>\`;
  }).join('');
}

function mostrarTabDiag(tab) {
  const btnKw = document.getElementById('tabKeywords');
  const btnPag = document.getElementById('tabPaginas');
  const secKw = document.getElementById('seccionKeywords');
  const secPag = document.getElementById('seccionPaginas');
  if (tab === 'keywords') {
    btnKw.className = 'btn btn-primary btn-sm';
    btnPag.className = 'btn btn-secondary btn-sm';
    secKw.style.display = 'block';
    secPag.style.display = 'none';
  } else {
    btnKw.className = 'btn btn-secondary btn-sm';
    btnPag.className = 'btn btn-primary btn-sm';
    secKw.style.display = 'none';
    secPag.style.display = 'block';
    if (!window.__pagCargado) cargarPaginas();
  }
}

let pagData = [];
let sortFieldPag = 'potencial';
let sortDirPag = -1;

function clasificarIntencion(pagina) {
  const p = pagina.toLowerCase();
  const informativas = ['falla', 'codigo-de-error', 'como-resetear', 'como-elegir', 'guia-rapida', 'manual', 'significado', 'capacitacion', 'que-hacer-si'];
  const comerciales = ['a-domicilio', 'reparacion', 'instalacion', 'servicio-tecnico', 'mantencion', 'urgente', 'cotiza', 'precio', 'venta'];
  if (informativas.some(k => p.includes(k))) return 'informativa';
  if (comerciales.some(k => p.includes(k))) return 'comercial';
  return 'comercial';
}

async function cargarPaginas() {
  window.__pagCargado = true;
  document.getElementById('tablaPagBody').innerHTML = '<tr><td colspan="7" class="loading">Cargando páginas…</td></tr>';
  try {
    const dias = document.getElementById('rangoComparar').value;
    const diasParam = (dias !== 'custom') ? dias : '28';
    const res = await fetchGSC('/seo/paginas?dias=' + diasParam);
    if (res.ok) {
      pagData = res.data.map(r => {
        const ctrActual = r.ctr / 100;
        const potencial = Math.max(0, Math.round(r.impresiones * (0.28 - ctrActual)));
        const intencion = clasificarIntencion(r.pagina);
        return { ...r, potencial, intencion };
      });
      renderTablaPag();
    } else {
      document.getElementById('tablaPagBody').innerHTML = '<tr><td colspan="7" class="empty">' + (res.error || 'Error cargando datos') + '</td></tr>';
    }
  } catch(e) {
    document.getElementById('tablaPagBody').innerHTML = '<tr><td colspan="7" class="empty">Error: ' + e.message + '</td></tr>';
  }
}

document.querySelectorAll('#tablaPag th[data-sortpag]').forEach(th => {
  th.addEventListener('click', () => {
    const field = th.dataset.sortpag;
    if (sortFieldPag === field) { sortDirPag *= -1; } else { sortFieldPag = field; sortDirPag = -1; }
    document.querySelectorAll('#tablaPag th').forEach(t => t.classList.remove('sorted'));
    th.classList.add('sorted');
    renderTablaPag();
  });
});

document.getElementById('buscarPag').addEventListener('input', renderTablaPag);

function renderTablaPag() {
  const busqueda = document.getElementById('buscarPag').value.toLowerCase();
  let filtrado = pagData.filter(r => r.pagina.toLowerCase().includes(busqueda));
  filtrado.sort((a, b) => {
    let va = a[sortFieldPag], vb = b[sortFieldPag];
    if (typeof va === 'string') return va.localeCompare(vb) * sortDirPag;
    return (va - vb) * sortDirPag;
  });
  document.getElementById('totalPagCount').textContent = filtrado.length;
  if (filtrado.length === 0) {
    document.getElementById('tablaPagBody').innerHTML = '<tr><td colspan="7" class="empty">Sin resultados</td></tr>';
    return;
  }
  document.getElementById('tablaPagBody').innerHTML = filtrado.map((r, i) => {
    let posBadge = 'badge-bad';
    if (r.posicion <= 3) posBadge = 'badge-ok';
    else if (r.posicion <= 10) posBadge = 'badge-warn';
    const potHtml = r.potencial > 0 ? \`<span class="delta-up">+\${r.potencial} clics/mes</span>\` : '<span class="delta-flat">—</span>';
    const intHtml = r.intencion === 'comercial'
      ? '<span class="badge badge-ok">\ud83d\udcb0 Comercial</span>'
      : '<span class="badge badge-warn">\ud83d\udcda Informativa</span>';
    return \`<tr style="cursor:pointer" data-idx="\${i}">
      <td>\${r.pagina}</td>
      <td><span class="badge \${posBadge}">\${r.posicion}</span></td>
      <td>\${r.clics}</td>
      <td>\${r.impresiones}</td>
      <td>\${r.ctr}%</td>
      <td>\${potHtml}</td>
      <td>\${intHtml}</td>
    </tr>\`;
  }).join('');
  document.querySelectorAll('#tablaPagBody tr[data-idx]').forEach(tr => {
    tr.addEventListener('click', () => {
      const row = filtrado[parseInt(tr.dataset.idx)];
      abrirModalPagKw(row.urlCompleta, row.pagina);
    });
  });
}

async function abrirModalPagKw(urlCompleta, pagina) {
  document.getElementById('modalPagKwTitle').textContent = 'Keywords de: ' + pagina;
  document.getElementById('modalPagKwBody').innerHTML = '<p class="loading">Cargando…</p>';
  document.getElementById('modalPagKw').classList.add('open');
  try {
    const dias = document.getElementById('rangoComparar').value;
    const diasParam = (dias !== 'custom') ? dias : '28';
    const res = await fetchGSC('/seo/pagina-keywords?url=' + encodeURIComponent(urlCompleta) + '&dias=' + diasParam);
    if (res.ok && res.data.length > 0) {
      document.getElementById('modalPagKwBody').innerHTML = '<table><thead><tr><th>Keyword</th><th>Posición</th><th>Impresiones</th></tr></thead><tbody>' +
        res.data.map(k => \`<tr><td>\${k.keyword}</td><td>\${k.posicion}</td><td>\${k.impresiones}</td></tr>\`).join('') +
        '</table>';
    } else {
      document.getElementById('modalPagKwBody').innerHTML = '<p class="empty">Sin datos de keywords para esta página.</p>';
    }
  } catch(e) {
    document.getElementById('modalPagKwBody').innerHTML = '<p class="empty">Error: ' + e.message + '</p>';
  }
}

function cerrarModalPagKw() {
  document.getElementById('modalPagKw').classList.remove('open');
}

let sugerenciaActual = null;

async function abrirModalSugerencia(pagina, posicion, ctr) {
  sugerenciaActual = null;
  document.getElementById('modalSugerenciaBody').innerHTML = '<p class="loading">Leyendo la página en vivo y generando propuesta…</p>';
  document.getElementById('modalSugerencia').classList.add('open');
  try {
    const res = await fetchGSC('/seo/sugerir-titulo', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pagina, posicion, ctr })
    });
    if (!res.ok) throw new Error(res.error || 'Error generando la propuesta');
    const d = res.data;
    sugerenciaActual = { pagina, tituloNuevo: d.sugerencia.tituloSugerido, metaNueva: d.sugerencia.metaSugerida };
    document.getElementById('modalSugerenciaBody').innerHTML = \`
      <p style="font-size:12px;color:#999;margin-bottom:12px">\${pagina}</p>
      <div style="background:#faece7;border-radius:8px;padding:12px;margin-bottom:12px">
        <div style="font-size:11px;color:#993c1d;font-weight:500;margin-bottom:6px">ACTUAL</div>
        <div style="font-size:13px;margin-bottom:4px"><strong>Título:</strong> \${d.actual.titulo}</div>
        <div style="font-size:13px"><strong>Meta:</strong> \${d.actual.meta}</div>
      </div>
      <div style="background:#e1f5ee;border-radius:8px;padding:12px;margin-bottom:12px">
        <div style="font-size:11px;color:#0f6e56;font-weight:500;margin-bottom:6px">PROPUESTA</div>
        <div style="font-size:13px;margin-bottom:4px"><strong>Título:</strong> \${d.sugerencia.tituloSugerido}</div>
        <div style="font-size:13px"><strong>Meta:</strong> \${d.sugerencia.metaSugerida}</div>
      </div>
      <p style="font-size:12px;color:#666;font-style:italic">\${d.sugerencia.razon}</p>
      <p style="font-size:11px;color:#999;margin-top:12px">Revisa con cuidado antes de aplicar — este cambio se sube directo a tu sitio en vivo.</p>
      <button class="btn btn-primary" id="btnAplicarSugerencia" style="width:100%;margin-top:8px" onclick="aplicarSugerenciaActual()">✅ Aplicar este cambio a la página</button>
      <div id="aplicarSugerenciaStatus" class="status-bar"></div>
    \`;
  } catch(e) {
    document.getElementById('modalSugerenciaBody').innerHTML = '<p class="empty">Error: ' + e.message + '</p>';
  }
}

let cambioAplicadoExitoso = false;

async function aplicarSugerenciaActual() {
  if (!sugerenciaActual) return;
  const confirmado = await confirmarAccion('¿Seguro que quieres aplicar este título y meta description a ' + sugerenciaActual.pagina + '? Se va a subir directo a tu sitio en vivo ahora mismo.', 'Aplicar cambio al sitio');
  if (!confirmado) return;

  const btn = document.getElementById('btnAplicarSugerencia');
  const statusEl = document.getElementById('aplicarSugerenciaStatus');
  btn.disabled = true;
  btn.textContent = '⏳ Aplicando...';

  try {
    const res = await fetch('/seo/aplicar-titulo', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(sugerenciaActual)
    }).then(r => r.json());
    if (res.ok) {
      statusEl.className = 'status-bar status-ok';
      statusEl.style.display = 'block';
      statusEl.textContent = '✅ Aplicado. La página ya tiene el título y meta nuevos.';
      btn.style.display = 'none';
      cambioAplicadoExitoso = true;
    } else {
      throw new Error(res.error || 'Error desconocido');
    }
  } catch(e) {
    statusEl.className = 'status-bar status-error';
    statusEl.style.display = 'block';
    statusEl.textContent = '❌ Error: ' + e.message;
    btn.disabled = false;
    btn.textContent = '✅ Aplicar este cambio a la página';
  }
}

function cerrarModalSugerencia() {
  document.getElementById('modalSugerencia').classList.remove('open');
  if (cambioAplicadoExitoso) {
    cambioAplicadoExitoso = false;
    generarPlanAuto();
  }
}

// ─── ESTRATEGIA (automatica, sin seleccion manual) ──────────────────────
let planAutoData = [];
let arreglosData = [];

async function refrescarPlanGuardadoBox() {
  const existente = await fetchGSC('/seo/estrategia').catch(() => null);
  if (existente && existente.ok && existente.data) {
    const p = existente.data;
    document.getElementById('planGuardadoBox').innerHTML = \`
      <div class="plan-summary">
        <h3>\ud83d\udccc Ya tienes un plan guardado (actualizado \${new Date(p.actualizadoEn).toLocaleDateString('es-CL')})</h3>
        <div style="font-size:12px;color:#666">\${(p.items || []).length} artículos guardados</div>
      </div>\`;
  } else {
    document.getElementById('planGuardadoBox').innerHTML = '';
  }
}

async function cargarEstrategia() {
  window.__estrategiaCargada = true;
  await refrescarPlanGuardadoBox();
  await generarPlanAuto();
  await cargarHistorialEstrategias();
}

async function cargarHistorialEstrategias() {
  const tbody = document.getElementById('historialEstrategiaBody');
  tbody.innerHTML = '<tr><td colspan="4" class="loading">Cargando…</td></tr>';
  try {
    const res = await fetchGSC('/seo/estrategia/historial');
    if (!res.ok) throw new Error(res.error || 'Error cargando historial');
    const historial = res.data;
    tbody.innerHTML = historial.length > 0
      ? historial.map(h => \`<tr>
          <td>\${new Date(h.fechaGuardado).toLocaleDateString('es-CL')}</td>
          <td>\${h.articulosCount}</td>
          <td>+\${h.proyeccion30} clics/mes</td>
          <td>
            <button class="btn btn-secondary btn-sm" onclick="abrirModalAuditoria('\${h.id}')">Ver auditoría</button>
            <button class="btn btn-danger btn-sm" onclick="eliminarEstrategiaHistorial('\${h.id}')">Eliminar</button>
          </td>
        </tr>\`).join('')
      : '<tr><td colspan="4" class="empty">Aún no has guardado ninguna estrategia</td></tr>';
  } catch(e) {
    tbody.innerHTML = '<tr><td colspan="4" class="empty">Error: ' + e.message + '</td></tr>';
  }
}

async function eliminarEstrategiaHistorial(id) {
  const confirmado = await confirmarAccion('¿Seguro que quieres eliminar esta estrategia guardada? Esta acción no se puede deshacer y perderás la línea base para auditar ese período.', 'Eliminar estrategia');
  if (!confirmado) return;
  try {
    const res = await fetch('/seo/estrategia/historial/' + id, { method: 'DELETE' }).then(r => r.json());
    if (res.ok) {
      await cargarHistorialEstrategias();
      await refrescarPlanGuardadoBox();
    } else {
      alert('Error eliminando: ' + (res.error || 'desconocido'));
    }
  } catch(e) {
    alert('Error: ' + e.message);
  }
}

async function abrirModalAuditoria(id) {
  document.getElementById('modalAuditoriaBody').innerHTML = '<p class="loading">Calculando resultados reales…</p>';
  document.getElementById('modalAuditoria').classList.add('open');
  try {
    const res = await fetchGSC('/seo/estrategia/auditoria/' + id);
    if (!res.ok) throw new Error(res.error || 'Error calculando auditoria');
    const d = res.data;
    const cumplimientoColor = d.cumplimiento >= 100 ? '#0f6e56' : (d.cumplimiento >= 50 ? '#854f0b' : '#993c1d');
    const filasComparativa = d.comparativa.map(c => \`<tr>
      <td>\${c.pagina}</td>
      <td>\${c.posicionBase ?? '—'} → \${c.posicionActual ?? '—'}</td>
      <td>\${c.clicsBase} → \${c.clicsActual}</td>
    </tr>\`).join('');
    document.getElementById('modalAuditoriaBody').innerHTML = \`
      <p style="font-size:12px;color:#999;margin-bottom:12px">Guardado el \${new Date(d.fechaGuardado).toLocaleDateString('es-CL')} — \${d.diasTranscurridos} días transcurridos</p>
      <div class="grid3" style="margin-bottom:16px">
        <div class="metric"><div class="metric-val">\${d.totalClicsBase}</div><div class="metric-lab">Clics/mes al guardar</div></div>
        <div class="metric"><div class="metric-val">\${d.totalClicsActual}</div><div class="metric-lab">Clics/mes ahora</div></div>
        <div class="metric"><div class="metric-val" style="color:\${cumplimientoColor}">\${d.cumplimiento ?? '—'}%</div><div class="metric-lab">Cumplimiento meta \${d.hito}d</div></div>
      </div>
      <table>
        <thead><tr><th>Página</th><th>Posición (antes → ahora)</th><th>Clics (antes → ahora)</th></tr></thead>
        <tbody>\${filasComparativa || '<tr><td colspan="3" class="empty">Sin páginas para comparar</td></tr>'}</tbody>
      </table>
    \`;
  } catch(e) {
    document.getElementById('modalAuditoriaBody').innerHTML = '<p class="empty">Error: ' + e.message + '</p>';
  }
}

function cerrarModalAuditoria() {
  document.getElementById('modalAuditoria').classList.remove('open');
}

function renderExplicacionPlan(data) {
  const nuevas = data.length;
  const paginasMap = {};
  data.forEach(item => {
    if (item.enlazarA) {
      if (!paginasMap[item.enlazarA]) paginasMap[item.enlazarA] = { potencial: item.enlazarPotencial || 0, veces: 0 };
      paginasMap[item.enlazarA].veces++;
    }
  });
  const paginasUnicas = Object.keys(paginasMap);
  const potencialTotal = paginasUnicas.reduce((s, p) => s + paginasMap[p].potencial, 0);
  const topPaginas = paginasUnicas
    .sort((a,b) => paginasMap[b].potencial - paginasMap[a].potencial)
    .slice(0, 5);
  const topTexto = topPaginas.map(p => p + ' (' + paginasMap[p].veces + ' enlace' + (paginasMap[p].veces > 1 ? 's' : '') + ')').join(', ') || 'ninguna por ahora';

  const prioritariosData = data.filter(item => item.prioritario);
  const prioridadesHtml = prioritariosData.length > 0
    ? \`<p style="font-size:13px;line-height:1.7;margin-top:10px;padding-top:10px;border-top:1px solid #cde3c6"><strong>Sobre lo que pediste:</strong> \${prioritariosData.map(item => item.tema + ' → ' + (item.enlazarA || 'sin página asignada aún')).join('; ')}. Quedaron primeras en el calendario de este mes.</p>\`
    : '';

  document.getElementById('planExplicacion').innerHTML = \`
    <div class="plan-summary">
      <p style="font-size:13px;line-height:1.7;margin-bottom:10px"><strong>Qué va a hacer:</strong> este plan crea \${nuevas} páginas nuevas de contenido a lo largo del mes — artículos de marca (Nice, BFT, Centurion) y de ciudades donde hoy no tienes cobertura. Cada una queda indexada con una keyword objetivo distinta.</p>
      <p style="font-size:13px;line-height:1.7;margin-bottom:10px"><strong>Resultado esperado:</strong> no es solo tráfico nuevo — cada artículo enlaza internamente a la página comercial existente que más necesita el empuje. En total, este plan refuerza \${paginasUnicas.length} páginas ya publicadas, con un potencial combinado de +\${potencialTotal} clics/mes si logran llegar a posición 1.</p>
      <p style="font-size:13px;line-height:1.7"><strong>Cómo lo hace:</strong> reparte los enlaces para no sobrecargar una sola página. Las que más refuerzo reciben este mes son: \${topTexto}.</p>
      \${prioridadesHtml}
    </div>\`;
}

function renderMetaEstrategia(totalClicsActual) {
  // Modelo conservador anclado al trafico real actual, no a potenciales optimistas sumados.
  // Rangos tipicos de crecimiento organico real para un sitio chico con trabajo consistente de SEO.
  const p30 = Math.round(totalClicsActual * 0.08);
  const p60 = Math.round(totalClicsActual * 0.20);
  const p90 = Math.round(totalClicsActual * 0.35);

  document.getElementById('metaEstrategia').innerHTML = \`
    <div class="grid3">
      <div class="metric"><div class="metric-val">\${totalClicsActual}</div><div class="metric-lab">Clics/mes HOY (línea base)</div></div>
      <div class="metric"><div class="metric-val">+\${p30}</div><div class="metric-lab">Meta conservadora 30 días</div></div>
      <div class="metric"><div class="metric-val">+\${p90}</div><div class="metric-lab">Meta conservadora 90 días</div></div>
    </div>
    <p style="font-size:11px;color:#999;font-style:italic;margin-top:-8px;margin-bottom:16px">Estimación conservadora basada en tu tráfico real actual (\${totalClicsActual} clics/mes), no en potenciales ideales sumados. A 60 días la meta es +\${p60} clics/mes. Guarda el plan para auditar el resultado real contra esta meta en 30/60/90 días.</p>
  \`;
}

async function generarPlanAuto() {
  const texto = document.getElementById('prioridadesInput').value;
  document.getElementById('planAutoBody').innerHTML = '<tr><td colspan="4" class="loading">Generando plan…</td></tr>';
  document.getElementById('planExplicacion').innerHTML = '';
  try {
    const res = await fetchGSC('/seo/plan-automatico', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ texto })
    });
    if (!res.ok) throw new Error(res.error || 'Error generando el plan');
    planAutoData = res.data.articulos || [];
    const arreglos = res.data.arreglosRapidos || [];
    document.getElementById('planAutoCount').textContent = planAutoData.length;
    document.getElementById('planAutoBody').innerHTML = planAutoData.map(item => \`<tr>
      <td>\${item.fecha}</td>
      <td>\${item.tema}</td>
      <td>\${item.marca || '—'}</td>
      <td>\${item.enlazarA ? item.enlazarA : 'Sin sugerencia'}\${item.enlazarPotencial ? ' <span class="delta-up">(+' + item.enlazarPotencial + ' clics/mes)</span>' : ''}</td>
    </tr>\`).join('') || '<tr><td colspan="4" class="empty">No hay temas sugeridos configurados</td></tr>';
    if (planAutoData.length > 0) renderExplicacionPlan(planAutoData);

    arreglosData = arreglos;
    try {
      const resumenRes = await fetchGSC('/seo/data?dias=28');
      const totalClicsActual = (resumenRes.ok && resumenRes.data && resumenRes.data.resumen) ? resumenRes.data.resumen.totalClics : 0;
      renderMetaEstrategia(totalClicsActual);
    } catch(e2) {
      document.getElementById('metaEstrategia').innerHTML = '';
    }
    document.getElementById('arreglosRapidosBody').innerHTML = arreglos.length > 0
      ? arreglos.map((a, i) => \`<tr>
          <td>\${a.pagina}</td>
          <td><span class="badge badge-ok">\${a.posicion}</span></td>
          <td>\${a.ctr}%</td>
          <td><span class="delta-up">+\${a.potencial} clics/mes</span></td>
          <td><button class="btn btn-secondary btn-sm" data-idx-arreglo="\${i}">Ver propuesta</button></td>
        </tr>\`).join('')
      : '<tr><td colspan="5" class="empty">No se detectaron arreglos urgentes esta semana</td></tr>';
    document.querySelectorAll('[data-idx-arreglo]').forEach(btn => {
      btn.addEventListener('click', () => {
        const a = arreglosData[parseInt(btn.dataset.idxArreglo)];
        abrirModalSugerencia(a.pagina, a.posicion, a.ctr);
      });
    });
  } catch(e) {
    document.getElementById('planAutoBody').innerHTML = '<tr><td colspan="4" class="empty">Error: ' + e.message + '</td></tr>';
    document.getElementById('arreglosRapidosBody').innerHTML = '<tr><td colspan="4" class="empty">Error</td></tr>';
  }
}

document.getElementById('btnRegenerarPlan').addEventListener('click', () => generarPlanAuto());
document.getElementById('btnAplicarPrioridades').addEventListener('click', () => generarPlanAuto());

document.getElementById('btnGuardarPlanAuto').addEventListener('click', async () => {
  const statusEl = document.getElementById('estrategiaStatus');
  try {
    const res = await fetch('/seo/estrategia', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ items: planAutoData, arreglos: arreglosData, generadoAutomaticamente: true })
    }).then(r => r.json());
    if (res.ok) {
      statusEl.className = 'status-bar status-ok';
      statusEl.style.display = 'block';
      statusEl.textContent = '✅ Plan guardado con foto de línea base. Vuelve en 30 días para auditar el avance.';
      await cargarHistorialEstrategias();
    } else {
      throw new Error(res.error || 'Error desconocido');
    }
  } catch(e) {
    statusEl.className = 'status-bar status-error';
    statusEl.style.display = 'block';
    statusEl.textContent = '❌ Error: ' + e.message;
  }
});

// Carga inicial
cargarDiagnostico();
</script>
</body>
</html>`;
}

function renderConnectCard() {
  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>Magenta SEO — Conectar</title>
  <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600&display=swap" rel="stylesheet">
  <style>
    *{box-sizing:border-box;margin:0;padding:0}
    body{font-family:"Poppins",sans-serif;background:#f5f5f5;color:#1a1a1a;min-height:100vh;display:flex;align-items:center;justify-content:center;padding:20px}
    .card{background:#fff;border-radius:16px;border:1px solid #e5e5e5;padding:40px;max-width:440px;width:100%;text-align:center;box-shadow:0 4px 20px rgba(0,0,0,0.04)}
    .icon{font-size:40px;margin-bottom:16px}
    h1{font-size:20px;font-weight:600;color:#1a1a1a;margin-bottom:8px}
    p{font-size:14px;color:#666;line-height:1.6;margin-bottom:28px}
    .btn{display:inline-block;background:#216416;color:#fff;padding:14px 32px;border-radius:10px;text-decoration:none;font-size:14px;font-weight:500;font-family:Poppins,sans-serif}
    .btn:hover{background:#1a5212}
    .back{display:block;margin-top:20px;font-size:12px;color:#999;text-decoration:none}
    .back:hover{color:#216416}
  </style>
</head>
<body>
  <div class="card">
    <div class="icon">\ud83d\udd17</div>
    <h1>Conecta Google Search Console</h1>
    <p>Para ver el diagnóstico SEO necesitamos acceso de solo lectura a tu Search Console.</p>
    <a href="/auth/google" class="btn">Conectar con Google →</a>
    <a href="/" class="back">← Volver al panel principal</a>
  </div>
</body>
</html>`;
}

module.exports = { renderSeoPanel, renderConnectCard, renderSidebar };
