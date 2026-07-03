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
              </tr>
            </thead>
            <tbody id="tablaPagBody">
              <tr><td colspan="6" class="loading">Cargando páginas…</td></tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- ═══════════════ VISTA: ESTRATEGIA ══════════════ -->
    <div id="view-estrategia" class="view" style="display:none">
      <div class="card-title" style="margin-bottom:4px">Estrategia del mes</div>
      <div class="sub">Define qué keywords priorizar para armar el plan de contenido</div>

      <div id="planGuardadoBox"></div>

      <div class="card">
        <div class="step-dots">
          <div class="step-dot active" data-dot="1"></div>
          <div class="step-dot" data-dot="2"></div>
          <div class="step-dot" data-dot="3"></div>
        </div>

        <!-- Paso 1: elegir keywords -->
        <div class="step active" id="step-1">
          <div class="card-title">Paso 1 — ¿Qué keywords quieres priorizar este mes?</div>
          <div class="sub">Sugeridas automáticamente desde el diagnóstico (quick wins y rescatables primero)</div>
          <div id="kwPickList"><div class="loading">Cargando sugerencias…</div></div>
          <div style="margin-top:16px;display:flex;justify-content:flex-end">
            <button class="btn btn-primary" id="btnStep1Next">Siguiente →</button>
          </div>
        </div>

        <!-- Paso 2: volumen y ciudades -->
        <div class="step" id="step-2">
          <div class="card-title">Paso 2 — Volumen y cobertura</div>
          <div style="margin-bottom:16px">
            <label style="font-size:13px;font-weight:500;display:block;margin-bottom:6px">¿Cuántos artículos quieres publicar este mes?</label>
            <select id="volumenMes" style="width:200px">
              <option value="15">15 artículos (día por medio)</option>
              <option value="20">20 artículos</option>
              <option value="30" selected>30 artículos (diario)</option>
            </select>
          </div>
          <div>
            <label style="font-size:13px;font-weight:500;display:block;margin-bottom:6px">¿Qué ciudades priorizar?</label>
            <div id="ciudadesPick"></div>
          </div>
          <div style="margin-top:16px;display:flex;justify-content:space-between">
            <button class="btn btn-secondary" id="btnStep2Back">← Atrás</button>
            <button class="btn btn-primary" id="btnStep2Next">Siguiente →</button>
          </div>
        </div>

        <!-- Paso 3: resumen y guardar -->
        <div class="step" id="step-3">
          <div class="card-title">Paso 3 — Confirmar plan del mes</div>
          <div id="planResumenFinal"></div>
          <div style="margin-top:16px;display:flex;justify-content:space-between">
            <button class="btn btn-secondary" id="btnStep3Back">← Atrás</button>
            <button class="btn btn-primary" id="btnGuardarPlan">Guardar plan del mes</button>
          </div>
          <div id="estrategiaStatus" class="status-bar"></div>
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
      fetch('/seo/data?dias=' + diasParam).then(r => r.json()),
      fetch('/seo/keywords?dias=' + diasParam).then(r => r.json())
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
      const comp = await fetch('/seo/comparativa').then(r => r.json());
      if (comp.ok) {
        const campo = 'delta' + rango;
        comp.data.forEach(r => { deltaMap[r.keyword] = r[campo]; });
      }
    } else {
      const desdeA = document.getElementById('fechaDesdeA').value;
      const desdeB = document.getElementById('fechaDesdeB').value;
      if (desdeA && desdeB) {
        const hoy = new Date().toISOString().split('T')[0];
        const comp = await fetch(\`/seo/comparativa-custom?desdeA=\${desdeA}&hastaA=\${hoy}&desdeB=\${desdeB}&hastaB=\${hoy}\`).then(r => r.json());
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

async function cargarPaginas() {
  window.__pagCargado = true;
  document.getElementById('tablaPagBody').innerHTML = '<tr><td colspan="6" class="loading">Cargando páginas…</td></tr>';
  try {
    const dias = document.getElementById('rangoComparar').value;
    const diasParam = (dias !== 'custom') ? dias : '28';
    const res = await fetch('/seo/paginas?dias=' + diasParam).then(r => r.json());
    if (res.ok) {
      pagData = res.data.map(r => {
        const ctrActual = r.ctr / 100;
        const potencial = Math.max(0, Math.round(r.impresiones * (0.28 - ctrActual)));
        return { ...r, potencial };
      });
      renderTablaPag();
    } else {
      document.getElementById('tablaPagBody').innerHTML = '<tr><td colspan="6" class="empty">' + (res.error || 'Error cargando datos') + '</td></tr>';
    }
  } catch(e) {
    document.getElementById('tablaPagBody').innerHTML = '<tr><td colspan="6" class="empty">Error: ' + e.message + '</td></tr>';
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
    document.getElementById('tablaPagBody').innerHTML = '<tr><td colspan="6" class="empty">Sin resultados</td></tr>';
    return;
  }
  document.getElementById('tablaPagBody').innerHTML = filtrado.map((r, i) => {
    let posBadge = 'badge-bad';
    if (r.posicion <= 3) posBadge = 'badge-ok';
    else if (r.posicion <= 10) posBadge = 'badge-warn';
    const potHtml = r.potencial > 0 ? \`<span class="delta-up">+\${r.potencial} clics/mes</span>\` : '<span class="delta-flat">—</span>';
    return \`<tr style="cursor:pointer" data-idx="\${i}">
      <td>\${r.pagina}</td>
      <td><span class="badge \${posBadge}">\${r.posicion}</span></td>
      <td>\${r.clics}</td>
      <td>\${r.impresiones}</td>
      <td>\${r.ctr}%</td>
      <td>\${potHtml}</td>
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
    const res = await fetch('/seo/pagina-keywords?url=' + encodeURIComponent(urlCompleta) + '&dias=' + diasParam).then(r => r.json());
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

// ─── ESTRATEGIA ────────────────────────────────────────────────────────
const CIUDADES = ['Las Condes','Vitacura','La Reina','Lo Barnechea','Chicureo','Antofagasta','Concepción','Temuco','Viña del Mar','La Serena'];
let planState = { keywords: [], volumen: 30, ciudades: [] };

async function cargarEstrategia() {
  window.__estrategiaCargada = true;

  const existente = await fetch('/seo/estrategia').then(r => r.json()).catch(() => null);
  if (existente && existente.ok && existente.data) {
    const p = existente.data;
    document.getElementById('planGuardadoBox').innerHTML = \`
      <div class="plan-summary">
        <h3>📌 Ya tienes un plan guardado (actualizado \${new Date(p.actualizadoEn).toLocaleDateString('es-CL')})</h3>
        <div>\${(p.keywords||[]).map(k => \`<span class="chip">\${k}</span>\`).join('')}</div>
        <div style="margin-top:8px;font-size:12px;color:#666">\${p.volumen} artículos/mes · Ciudades: \${(p.ciudades||[]).join(', ') || 'ninguna'}</div>
      </div>\`;
  }

  try {
    const kwRes = await fetch('/seo/keywords').then(r => r.json());
    const diagRes = await fetch('/seo/data').then(r => r.json());
    if (!kwRes.ok) throw new Error(kwRes.error);

    const oportunidad = kwRes.data.filter(r => r.posicion > 3 && r.posicion <= 15 && r.impresiones > 20)
      .sort((a,b) => b.impresiones - a.impresiones).slice(0, 20);

    document.getElementById('kwPickList').innerHTML = oportunidad.map(r => \`
      <label class="kw-pick" data-kw="\${r.keyword}">
        <input type="checkbox" value="\${r.keyword}">
        <div class="kw-info">
          <div class="kw-name">\${r.keyword}</div>
          <div class="kw-meta">Posición \${r.posicion} · \${r.impresiones} impresiones</div>
        </div>
      </label>\`).join('') || '<div class="empty">No hay suficientes datos aún</div>';

    document.querySelectorAll('.kw-pick').forEach(el => {
      el.addEventListener('click', (e) => {
        if (e.target.tagName !== 'INPUT') el.querySelector('input').checked = !el.querySelector('input').checked;
        el.classList.toggle('selected', el.querySelector('input').checked);
      });
    });

    document.getElementById('ciudadesPick').innerHTML = CIUDADES.map(c => \`
      <label class="kw-pick" style="display:inline-flex;width:auto;margin-right:8px" data-ciudad="\${c}">
        <input type="checkbox" value="\${c}"> <span style="font-size:13px">\${c}</span>
      </label>\`).join('');
    document.querySelectorAll('[data-ciudad]').forEach(el => {
      el.addEventListener('click', (e) => {
        if (e.target.tagName !== 'INPUT') el.querySelector('input').checked = !el.querySelector('input').checked;
        el.classList.toggle('selected', el.querySelector('input').checked);
      });
    });
  } catch(e) {
    document.getElementById('kwPickList').innerHTML = '<div class="empty">Error: ' + e.message + '</div>';
  }
}

function irAPaso(n) {
  document.querySelectorAll('.step').forEach(s => s.classList.remove('active'));
  document.getElementById('step-' + n).classList.add('active');
  document.querySelectorAll('.step-dot').forEach((d,i) => {
    d.classList.toggle('active', i === n-1);
    d.classList.toggle('done', i < n-1);
  });
}

document.getElementById('btnStep1Next').addEventListener('click', () => {
  planState.keywords = [...document.querySelectorAll('#kwPickList input:checked')].map(i => i.value);
  irAPaso(2);
});
document.getElementById('btnStep2Back').addEventListener('click', () => irAPaso(1));
document.getElementById('btnStep2Next').addEventListener('click', () => {
  planState.volumen = document.getElementById('volumenMes').value;
  planState.ciudades = [...document.querySelectorAll('#ciudadesPick input:checked')].map(i => i.value);
  document.getElementById('planResumenFinal').innerHTML = \`
    <div class="plan-summary">
      <h3>Keywords priorizadas (\${planState.keywords.length})</h3>
      <div>\${planState.keywords.map(k => \`<span class="chip">\${k}</span>\`).join('') || '<span style="color:#999;font-size:13px">Ninguna seleccionada</span>'}</div>
      <h3 style="margin-top:14px">Volumen</h3>
      <div style="font-size:13px">\${planState.volumen} artículos este mes</div>
      <h3 style="margin-top:14px">Ciudades</h3>
      <div>\${planState.ciudades.map(c => \`<span class="chip">\${c}</span>\`).join('') || '<span style="color:#999;font-size:13px">Ninguna seleccionada</span>'}</div>
    </div>\`;
  irAPaso(3);
});
document.getElementById('btnStep3Back').addEventListener('click', () => irAPaso(2));

document.getElementById('btnGuardarPlan').addEventListener('click', async () => {
  const statusEl = document.getElementById('estrategiaStatus');
  try {
    const res = await fetch('/seo/estrategia', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(planState)
    }).then(r => r.json());
    if (res.ok) {
      statusEl.className = 'status-bar status-ok';
      statusEl.style.display = 'block';
      statusEl.textContent = '✅ Plan guardado. Ya puedes usarlo para armar el calendario de julio.';
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
