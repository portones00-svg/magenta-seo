require('dotenv').config();
const express = require('express');
const cron = require('node-cron');
const { publicarArticuloCompleto } = require('./pipeline');
const { generarArticulo, generarMetadata } = require('./generator');
const { generarYSubirImagen } = require('./imagen');
const { buildArticlePage, buildDate } = require('./builder');
const { publicarArticulo } = require('./publisher');
const { actualizarSitemap } = require('./sitemap');
const { testConexion } = require('./publisher');

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const SITE_URL = process.env.SITE_URL || 'https://www.reparaciondeportones.cl';

// Historial y borradores en memoria
const historial = [];
const borradores = {};

// ─── PANEL PRINCIPAL ─────────────────────────────────────────────────────────
app.get('/', (req, res) => {
  const filas = historial.slice(-20).reverse().map(h => `
    <tr>
      <td>${h.fecha}</td>
      <td>${h.ok ? '✅' : '❌'}</td>
      <td><a href="${h.canonical || '#'}" target="_blank" style="color:#216416">${h.title || h.error || '-'}</a></td>
      <td>${h.duracion || '-'}s</td>
    </tr>`).join('');

  res.send(`<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>Magenta SEO</title>
  <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600&display=swap" rel="stylesheet">
  <style>
    *{box-sizing:border-box;margin:0;padding:0}
    body{font-family:"Poppins",sans-serif;background:#f5f5f5;color:#1a1a1a;padding:24px}
    .container{max-width:900px;margin:0 auto}
    h1{font-size:22px;font-weight:600;margin-bottom:4px;color:#216416}
    .subtitle{font-size:14px;color:#666;margin-bottom:32px}
    .card{background:#fff;border-radius:12px;border:1px solid #e5e5e5;padding:24px;margin-bottom:24px}
    .card h2{font-size:16px;font-weight:600;margin-bottom:16px;color:#1a1a1a}
    label{font-size:13px;color:#666;display:block;margin-bottom:4px;margin-top:12px}
    input,select{width:100%;padding:10px 14px;border:1px solid #ddd;border-radius:8px;font-size:14px;font-family:"Poppins",sans-serif;outline:none}
    input:focus,select:focus{border-color:#216416}
    .btn{background:#216416;color:#fff;padding:12px 24px;border:none;border-radius:8px;font-size:14px;font-weight:600;cursor:pointer;width:100%;margin-top:16px;font-family:"Poppins",sans-serif}
    .btn:hover{background:#1a5212}
    .btn:disabled{opacity:0.5;cursor:not-allowed}
    .grid2{display:grid;grid-template-columns:1fr 1fr;gap:16px}
    .status{padding:10px 14px;border-radius:6px;font-size:13px;margin-top:12px;display:none}
    .status.ok{background:#e1f5ee;color:#0f6e56}
    .status.error{background:#faece7;color:#993c1d}
    .status.info{background:#e6f1fb;color:#185fa5}
    .chips{display:flex;flex-wrap:wrap;gap:8px;margin-bottom:16px}
    .chip{background:#eef1ef;border:1px solid #d0e8d0;color:#216416;padding:6px 12px;border-radius:6px;font-size:12px;cursor:pointer;border:none;font-family:Poppins,sans-serif}
    .chip:hover{background:#d0e8d0}
    table{width:100%;border-collapse:collapse;font-size:13px}
    th{text-align:left;padding:8px;color:#999;font-weight:500;border-bottom:1px solid #eee;font-size:12px}
    td{padding:8px;border-bottom:1px solid #eee}
    .steps{margin-top:12px;display:none}
    .step{font-size:12px;font-family:monospace;padding:4px 0;color:#666}
    .step.active{color:#216416;font-weight:600}
    .step.done{color:#0f6e56}
    .step.error{color:#993c1d}
    .progress{height:4px;background:#e5e5e5;border-radius:2px;margin:12px 0;overflow:hidden;display:none}
    .progress-fill{height:100%;background:#216416;border-radius:2px;transition:width 0.5s}
  </style>
</head>
<body>
<div class="container">
  <h1>🚀 Magenta SEO</h1>
  <p class="subtitle">Sistema automático de publicación — reparaciondeportones.cl</p>

  <div class="card">
    <h2>📝 Generar artículo nuevo</h2>
    <div class="chips">
      ${['servicio técnico Nice Chile','motor BFT batiente condominio','reparación portón Las Condes',
         'técnico portón La Reina','portón automático Vitacura','instalación motor Lo Barnechea',
         'servicio técnico portones Concepción','motor Centurion reparación Chile',
         'técnico portón Chicureo','reparación portón Santiago'].map(kw =>
        `<button class="chip" onclick="document.getElementById('tema').value='${kw}'">${kw}</button>`
      ).join('')}
    </div>
    <label>Tema / Keyword principal</label>
    <input type="text" id="tema" placeholder="ej: reparación motor FAAC batiente Santiago">
    <div class="grid2" style="margin-top:12px">
      <div>
        <label>Marca</label>
        <select id="marca">
          <option value="">— Sin marca —</option>
          <option value="nice">Nice</option>
          <option value="bft">BFT</option>
          <option value="centurion">Centurion</option>
          <option value="faac">FAAC</option>
          <option value="ppa">PPA</option>
        </select>
      </div>
      <div>
        <label>Carpeta destino</label>
        <select id="carpeta">
          <option value="blog">blog/ — general</option>
          <option value="nice">nice/</option>
          <option value="bft">bft/</option>
          <option value="centurion">centurion/</option>
          <option value="faac">faac/</option>
        </select>
      </div>
    </div>
    <button class="btn" id="btnGenerar" onclick="generarPreview()">⚡ Generar vista previa</button>
    <div class="progress" id="progress"><div class="progress-fill" id="progressFill" style="width:0%"></div></div>
    <div class="steps" id="steps">
      <div class="step" id="s1">⏳ [1/3] Generando metadata...</div>
      <div class="step" id="s2">⏳ [2/3] Claude escribiendo artículo...</div>
      <div class="step" id="s3">⏳ [3/3] DALL-E generando imagen...</div>
    </div>
    <div class="status" id="status"></div>
  </div>

  <div class="card" id="previewCard" style="display:none">
    <h2>👁️ Vista previa — revisa antes de publicar</h2>
    <div id="previewMeta" style="background:#f9f9f9;border-radius:8px;padding:16px;margin-bottom:16px;font-size:13px"></div>
    <img id="previewImg" src="" style="width:100%;max-height:300px;object-fit:cover;border-radius:8px;margin-bottom:16px">
    <div id="previewContent" style="font-size:15px;line-height:1.7;color:#1a1a1a;max-height:400px;overflow-y:auto;border:1px solid #eee;border-radius:8px;padding:16px"></div>
    <div class="grid2" style="margin-top:16px">
      <button class="btn" style="background:#216416" onclick="publicarBorrador()">✅ Publicar en el sitio</button>
      <button class="btn" style="background:#f5f5f5;color:#444;border:1px solid #ddd" onclick="descartarBorrador()">❌ Descartar</button>
    </div>
    <div class="status" id="statusPublicar"></div>
  </div>

  <div class="card">
    <h2>📊 Historial</h2>
    ${historial.length === 0
      ? '<p style="color:#999;font-size:14px">Sin publicaciones aún.</p>'
      : `<table><thead><tr><th>Fecha</th><th>Estado</th><th>Artículo</th><th>Tiempo</th></tr></thead><tbody>${filas}</tbody></table>`}
  </div>

  <div class="card">
    <h2>🔧 Estado del sistema</h2>
    <button class="btn" style="background:#f5f5f5;color:#444;border:1px solid #ddd;margin-top:0" onclick="testSftp()">Probar conexión SFTP</button>
    <div class="status" id="sftpStatus"></div>
  </div>
</div>

<script>
let borradorId = null;

async function generarPreview() {
  const tema = document.getElementById('tema').value.trim();
  if (!tema) { alert('Escribe un tema primero'); return; }

  const btn = document.getElementById('btnGenerar');
  const progress = document.getElementById('progress');
  const steps = document.getElementById('steps');
  const status = document.getElementById('status');

  btn.disabled = true;
  btn.textContent = '⏳ Generando...';
  progress.style.display = 'block';
  steps.style.display = 'block';
  status.style.display = 'none';
  document.getElementById('previewCard').style.display = 'none';

  setStep('s1', 'active'); setProgress(15);

  try {
    const res = await fetch('/preview', {
      method: 'POST',
      headers: {'Content-Type':'application/json'},
      body: JSON.stringify({
        tema,
        marca: document.getElementById('marca').value,
        carpeta: document.getElementById('carpeta').value
      })
    });

    setStep('s1', 'done'); setStep('s2', 'active'); setProgress(50);
    await delay(500);
    setStep('s2', 'done'); setStep('s3', 'active'); setProgress(85);
    await delay(500);

    const data = await res.json();

    if (data.ok) {
      setStep('s3', 'done'); setProgress(100);
      borradorId = data.id;

      document.getElementById('previewMeta').innerHTML =
        '<strong>Title:</strong> ' + data.title + '<br>' +
        '<strong>URL:</strong> <a href="' + data.canonical + '" style="color:#216416">' + data.canonical + '</a><br>' +
        '<strong>Meta description:</strong> ' + data.description;

      document.getElementById('previewImg').src = data.imagen;
      document.getElementById('previewContent').innerHTML = data.contenido;
      document.getElementById('previewCard').style.display = 'block';
      document.getElementById('previewCard').scrollIntoView({behavior:'smooth'});
    } else {
      setStep('s3', 'error');
      showStatus('status', 'error', '❌ Error: ' + data.error);
    }
  } catch(err) {
    showStatus('status', 'error', '❌ Error: ' + err.message);
  } finally {
    btn.disabled = false;
    btn.textContent = '⚡ Generar vista previa';
  }
}

async function publicarBorrador() {
  if (!borradorId) return;
  const btn = event.target;
  btn.disabled = true;
  btn.textContent = '⏳ Publicando...';
  showStatus('statusPublicar', 'info', '⏳ Subiendo a Bluehost...');

  const res = await fetch('/publicar-borrador', {
    method: 'POST',
    headers: {'Content-Type':'application/json'},
    body: JSON.stringify({ id: borradorId })
  });
  const data = await res.json();

  if (data.ok) {
    showStatus('statusPublicar', 'ok', '✅ Publicado: <a href="' + data.canonical + '" target="_blank" style="color:#0f6e56">' + data.canonical + '</a>');
    setTimeout(() => location.reload(), 3000);
  } else {
    showStatus('statusPublicar', 'error', '❌ Error: ' + data.error);
    btn.disabled = false;
    btn.textContent = '✅ Publicar en el sitio';
  }
}

function descartarBorrador() {
  borradorId = null;
  document.getElementById('previewCard').style.display = 'none';
  document.getElementById('tema').value = '';
  document.getElementById('steps').style.display = 'none';
  document.getElementById('progress').style.display = 'none';
}

async function testSftp() {
  showStatus('sftpStatus', 'info', 'Probando...');
  const res = await fetch('/test-sftp');
  const data = await res.json();
  showStatus('sftpStatus', data.ok ? 'ok' : 'error', data.ok ? '✅ SFTP OK' : '❌ Error: ' + data.error);
}

function setStep(id, state) {
  const el = document.getElementById(id);
  const icons = {active:'⚡', done:'✅', error:'❌'};
  el.className = 'step ' + state;
  el.textContent = el.textContent.replace(/^[^\s]+/, icons[state] || '⏳');
}

function setProgress(pct) {
  document.getElementById('progressFill').style.width = pct + '%';
}

function showStatus(id, type, html) {
  const el = document.getElementById(id);
  el.className = 'status ' + type;
  el.innerHTML = html;
  el.style.display = 'block';
}

function delay(ms) { return new Promise(r => setTimeout(r, ms)); }
</script>
</body>
</html>`);
});

// ─── ENDPOINT PREVIEW ────────────────────────────────────────────────────────
app.post('/preview', async (req, res) => {
  const { tema, marca, carpeta = 'blog' } = req.body;
  if (!tema) return res.json({ ok: false, error: 'Falta el tema' });

  try {
    const meta = await generarMetadata({ tema, marca, tipo: 'articulo' });
    const contenido = await generarArticulo({ tema, marca, slug: meta.slug });
    const { isoDate, dateStr } = buildDate(0);
    const canonical = SITE_URL + '/' + carpeta + '/' + meta.slug + '/';
    const imagen = await generarYSubirImagen({ tema, marca, slug: meta.slug });

    const id = Date.now().toString();
    borradores[id] = { meta, contenido, isoDate, dateStr, canonical, imagen, carpeta, marca, tema };

    res.json({
      ok: true, id,
      title: meta.h1 || meta.title,
      description: meta.description,
      canonical, imagen, contenido,
      slug: meta.slug
    });
  } catch(err) {
    console.error('[PREVIEW]', err.message);
    res.json({ ok: false, error: err.message });
  }
});

// ─── ENDPOINT PUBLICAR BORRADOR ───────────────────────────────────────────────
app.post('/publicar-borrador', async (req, res) => {
  const { id } = req.body;
  const borrador = borradores[id];
  if (!borrador) return res.json({ ok: false, error: 'Borrador no encontrado' });

  try {
    const inicio = Date.now();
    const { meta, contenido, isoDate, dateStr, canonical, imagen, carpeta, marca } = borrador;

    const htmlCompleto = buildArticlePage({
      title: meta.h1 || meta.title,
      description: meta.description,
      canonical, isoDate, dateStr, image: imagen, content: contenido,
      marca: marca || null,
      backUrl: '../../blog/',
      backLabel: 'Volver al blog',
      relacionados: []
    });

    await publicarArticulo({ slug: meta.slug, carpeta, htmlContent: htmlCompleto });
    await actualizarSitemap({ canonical });

    const duracion = ((Date.now() - inicio) / 1000).toFixed(1);
    const resultado = { ok: true, canonical, title: meta.title, duracion };

    historial.push({ fecha: new Date().toLocaleString('es-CL'), ...resultado });
    delete borradores[id];

    res.json(resultado);
  } catch(err) {
    console.error('[PUBLICAR]', err.message);
    res.json({ ok: false, error: err.message });
  }
});

// ─── ENDPOINTS UTILITARIOS ───────────────────────────────────────────────────
app.get('/test-sftp', async (req, res) => {
  const ok = await testConexion();
  res.json({ ok });
});

app.get('/health', (req, res) => res.json({ ok: true, uptime: process.uptime() }));

// ─── CRON DIARIO 7AM CHILE ───────────────────────────────────────────────────
cron.schedule('0 10 * * *', () => {
  console.log('[CRON] Revisión diaria — sin artículos programados');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log('[SERVER] Magenta SEO en puerto', PORT);
});
