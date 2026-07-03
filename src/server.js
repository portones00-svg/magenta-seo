require('dotenv').config();
const express = require('express');
const cron = require('node-cron');
const { publicarArticuloCompleto, publicarLote } = require('./pipeline');
const { testConexion } = require('./publisher');
const { KEYWORDS_PRIORITARIAS } = require('./generator');

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Historial en memoria (en producción usar MySQL)
const historial = [];

// ─── PANEL WEB ──────────────────────────────────────────────────────────────
app.get('/', (req, res) => {
  const filas = historial.slice(-20).reverse().map(h => `
    <tr style="border-bottom:1px solid #eee">
      <td style="padding:8px;font-size:13px">${h.fecha}</td>
      <td style="padding:8px;font-size:13px">${h.ok ? '✅' : '❌'}</td>
      <td style="padding:8px;font-size:13px"><a href="${h.canonical || '#'}" target="_blank" style="color:#216416">${h.title || h.error || '-'}</a></td>
      <td style="padding:8px;font-size:13px">${h.duracion || '-'}s</td>
    </tr>`).join('');

  res.send(`<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>Magenta SEO — Panel de Publicación</title>
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
    input,select,textarea{width:100%;padding:10px 14px;border:1px solid #ddd;border-radius:8px;font-size:14px;font-family:"Poppins",sans-serif;outline:none}
    input:focus,select:focus,textarea:focus{border-color:#216416}
    textarea{resize:vertical;min-height:80px}
    .btn{background:#216416;color:#fff;padding:12px 24px;border:none;border-radius:8px;font-size:14px;font-weight:600;cursor:pointer;width:100%;margin-top:16px;font-family:"Poppins",sans-serif}
    .btn:hover{background:#1a5212}
    .btn-secondary{background:#f5f5f5;color:#444;border:1px solid #ddd}
    .btn-secondary:hover{background:#e8e8e8}
    .grid2{display:grid;grid-template-columns:1fr 1fr;gap:16px}
    .status{padding:8px 14px;border-radius:6px;font-size:13px;margin-top:12px;display:none}
    .status.ok{background:#e1f5ee;color:#0f6e56}
    .status.error{background:#faece7;color:#993c1d}
    table{width:100%;border-collapse:collapse}
    th{text-align:left;padding:8px;font-size:12px;color:#999;font-weight:500;border-bottom:1px solid #eee}
    .tag{display:inline-block;background:#eef1ef;color:#216416;font-size:11px;padding:2px 8px;border-radius:99px;font-weight:500}
    @media(max-width:600px){.grid2{grid-template-columns:1fr}}
  </style>
</head>
<body>
<div class="container">
  <h1>🚀 Magenta SEO</h1>
  <p class="subtitle">Sistema automático de publicación — reparaciondeportones.cl</p>

  <div class="card">
    <h2>📝 Publicar artículo nuevo</h2>
    <form id="formPublicar">
      <label>Tema / Keyword principal</label>
      <input type="text" name="tema" placeholder="ej: reparación motor FAAC batiente Santiago" required>

      <div class="grid2">
        <div>
          <label>Marca (opcional)</label>
          <select name="marca">
            <option value="">— Sin marca específica —</option>
            <option value="faac">FAAC</option>
            <option value="nice">Nice</option>
            <option value="bft">BFT</option>
            <option value="centurion">Centurion</option>
            <option value="veloti">Veloti</option>
            <option value="ppa">PPA</option>
          </select>
        </div>
        <div>
          <label>Carpeta destino</label>
          <select name="carpeta">
            <option value="blog">blog/ (artículos generales)</option>
            <option value="faac">faac/ (artículos FAAC)</option>
            <option value="nice">nice/ (artículos Nice)</option>
            <option value="bft">bft/ (artículos BFT)</option>
            <option value="centurion">centurion/ (artículos Centurion)</option>
          </select>
        </div>
      </div>

      <button type="submit" class="btn">⚡ Generar y publicar ahora</button>
    </form>
    <div id="status" class="status"></div>
  </div>

  <div class="card">
    <h2>🎯 Keywords prioritarias (basado en Search Console)</h2>
    <div style="display:flex;flex-wrap:wrap;gap:8px;margin-bottom:16px">
      ${[
        'reparación motor FAAC batiente Santiago',
        'servicio técnico Nice Chile',
        'motor BFT batiente condominio',
        'reparación portón eléctrico Las Condes',
        'servicio técnico portones Concepción',
        'técnico portón eléctrico La Reina',
        'reparación portón automático Vitacura',
        'instalación motor portón Lo Barnechea',
        'servicio técnico portón Chicureo',
        'motor Centurion reparación Chile',
      ].map(kw => `<button onclick="usarKeyword('${kw}')" style="background:#eef1ef;border:1px solid #d0e8d0;color:#216416;padding:6px 12px;border-radius:6px;font-size:12px;cursor:pointer;font-family:Poppins,sans-serif">${kw}</button>`).join('')}
    </div>
  </div>

  <div class="card">
    <h2>📊 Historial de publicaciones</h2>
    ${historial.length === 0
      ? '<p style="color:#999;font-size:14px">Aún no hay publicaciones en esta sesión.</p>'
      : `<table><thead><tr><th>Fecha</th><th>Estado</th><th>Artículo</th><th>Tiempo</th></tr></thead><tbody>${filas}</tbody></table>`
    }
  </div>

  <div class="card">
    <h2>🔧 Estado del sistema</h2>
    <button onclick="testSftp()" class="btn btn-secondary">Probar conexión SFTP</button>
    <div id="sftp-status" class="status"></div>
  </div>
</div>

<script>
function usarKeyword(kw) {
  document.querySelector('input[name="tema"]').value = kw;
  document.querySelector('input[name="tema"]').focus();
}

document.getElementById('formPublicar').addEventListener('submit', async (e) => {
  e.preventDefault();
  const btn = e.target.querySelector('button');
  const status = document.getElementById('status');
  const data = Object.fromEntries(new FormData(e.target));

  btn.textContent = '⏳ Generando y publicando...';
  btn.disabled = true;
  status.style.display = 'none';

  try {
    const res = await fetch('/publicar', {
      method: 'POST',
      headers: {'Content-Type':'application/json'},
      body: JSON.stringify(data)
    });
    const result = await res.json();

    if (result.ok) {
      status.className = 'status ok';
      status.innerHTML = '✅ Publicado: <a href="' + result.canonical + '" target="_blank" style="color:#0f6e56">' + result.canonical + '</a> (' + result.duracion + 's)';
      setTimeout(() => location.reload(), 3000);
    } else {
      status.className = 'status error';
      status.textContent = '❌ Error: ' + result.error;
    }
  } catch (err) {
    status.className = 'status error';
    status.textContent = '❌ Error de conexión: ' + err.message;
  } finally {
    status.style.display = 'block';
    btn.textContent = '⚡ Generar y publicar ahora';
    btn.disabled = false;
  }
});

async function testSftp() {
  const el = document.getElementById('sftp-status');
  el.style.display = 'block';
  el.className = 'status ok';
  el.textContent = 'Probando conexión SFTP...';
  const res = await fetch('/test-sftp');
  const data = await res.json();
  el.className = data.ok ? 'status ok' : 'status error';
  el.textContent = data.ok ? '✅ Conexión SFTP OK' : '❌ Error SFTP: ' + data.error;
}
</script>
</body>
</html>`);
});

// ─── API ENDPOINTS ───────────────────────────────────────────────────────────
app.post('/publicar', async (req, res) => {
  const { tema, marca, carpeta = 'blog' } = req.body;
  if (!tema) return res.json({ ok: false, error: 'Falta el tema' });

  const resultado = await publicarArticuloCompleto({ tema, marca: marca || null, carpeta });

  historial.push({
    fecha: new Date().toLocaleString('es-CL'),
    ...resultado
  });

  res.json(resultado);
});

app.get('/test-sftp', async (req, res) => {
  const ok = await testConexion();
  res.json({ ok });
});

app.get('/health', (req, res) => res.json({ ok: true, uptime: process.uptime() }));

// ─── CRON DIARIO ─────────────────────────────────────────────────────────────
// Cada día a las 7am hora Chile (10am UTC)
cron.schedule('0 10 * * *', async () => {
  console.log('[CRON] Iniciando publicación diaria automática...');
  // Aquí puedes definir los artículos del día
  // Por ahora solo loga — se activa cuando definas el calendario
  console.log('[CRON] Sin artículos programados para hoy. Agrega temas en el panel.');
});

// ─── START ───────────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`[SERVER] Magenta SEO corriendo en puerto ${PORT}`);
  console.log(`[SERVER] Panel: http://localhost:${PORT}`);
});
