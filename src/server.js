require('dotenv').config();
const express = require('express');
const cron = require('node-cron');
const { generarArticulo, generarMetadata } = require('./generator');
const { generarYSubirImagen } = require('./imagen');
const { buildArticlePage, buildDate } = require('./builder');
const { publicarArticulo, leerArchivo, subirArchivo, agregarABlogIndex } = require('./publisher');
const { registrarAplicado, fueAplicadoRecientemente } = require('./titulos-aplicados');
const { actualizarSitemap } = require('./sitemap');
const { testConexion } = require('./publisher');
const {
  agregarACola, obtenerCola, obtenerItemPorId,
  actualizarItem, eliminarItem, obtenerItemsParaHoy,
  obtenerCalendarioMes, guardarCola
} = require('./scheduler');

const session = require('express-session');
const { renderLoginPage, requireAuth } = require('./panel-auth');

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(session({
  secret: process.env.SESSION_SECRET || 'cambia-esto-en-produccion',
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 30 * 24 * 60 * 60 * 1000 } // 30 dias
}));

// Rutas publicas que NO requieren estar logueado
const RUTAS_PUBLICAS = ['/login', '/auth/google', '/auth/callback', '/health', '/agente-seo', '/privacidad', '/terminos', '/soporte', '/terminos-datos'];
app.use(requireAuth(RUTAS_PUBLICAS));


app.get('/privacidad', (req, res) => {
  res.sendFile(require('path').join(__dirname, '../public/privacidad.html'));
});
app.get('/terminos', (req, res) => {
  res.sendFile(require('path').join(__dirname, '../public/terminos.html'));
});
app.get('/soporte', (req, res) => {
  res.sendFile(require('path').join(__dirname, '../public/soporte.html'));
});


app.get('/agente-seo', (req, res) => {
  res.sendFile(require('path').join(__dirname, 'landing.html'));
});

app.get('/login', (req, res) => {
  res.send(renderLoginPage(req.query.error));
});

app.get('/logout', (req, res) => {
  req.session.destroy(() => {
    res.redirect('/login');
  });
});

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
  const verTodo = req.query.verTodo === '1';
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
  <title>_AgenteSEO — Calendario</title>
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

    .sidebar-toggle{display:none}
    .sr-only{position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0}
    @media (max-width:768px){
      .layout{flex-direction:column}
      .sidebar{width:100%;height:auto;position:relative;top:auto;flex-direction:column;padding:0;overflow:visible}
      .sidebar-top{display:flex;align-items:center;justify-content:space-between;padding:10px 16px;width:100%}
      .sidebar-top h1{padding:0;font-size:15px}
      .sidebar-toggle{display:block;background:none;border:none;font-size:22px;line-height:1;cursor:pointer;color:#216416;padding:4px 8px}
      .sidebar-nav{display:none;flex-direction:column;width:100%;border-top:1px solid #eee}
      .sidebar.mobile-open .sidebar-nav{display:flex}
      .nav-item{padding:12px 16px;border-left:none;border-bottom:1px solid #f0f0f0;white-space:nowrap}
      .nav-item.active{border-left-color:transparent}
      .main{padding:16px;max-width:100%}
      .grid3{grid-template-columns:1fr}
      .grid2{grid-template-columns:1fr}
      .filters-row{flex-direction:column;align-items:stretch}
      .filters-row input,.filters-row select{width:100%;margin-left:0!important}
      input[style*="width"],select[style*="width"]{width:100%!important}
      .card{padding:14px;overflow-x:auto}
      table{min-width:560px}
      .cal-nav{flex-wrap:wrap;gap:8px}
      .cal-title{font-size:14px}
      .modal-box{padding:16px;width:94%}
    }
  </style>
</head>
<body>
<div class="layout">
  ${renderSidebar('calendario')}
  <div class="main">
<div class="container">
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1844.001526 294.947999" style="height:28px;width:auto;display:block" role="img" aria-label="_AgenteSEO">
<g transform="translate(-2.000000,296.820045) scale(0.100000,-0.100000)" fill="#1a1a1a" stroke="none">
<path d="M13280 2960 c-132 -17 -302 -77 -401 -141 -138 -90 -233 -209 -281
-354 -31 -95 -32 -290 -1 -377 66 -188 216 -317 480 -411 39 -14 154 -46 256
-72 288 -71 379 -105 446 -168 89 -85 82 -210 -19 -301 -75 -67 -170 -96 -320
-96 -241 0 -381 86 -430 265 l-17 60 -230 3 c-176 2 -233 -1 -241 -10 -14 -18
1 -156 27 -238 108 -342 497 -535 1011 -500 123 8 139 10 230 32 140 33 265
98 361 186 130 120 190 261 191 447 1 133 -12 194 -63 301 -93 196 -275 306
-669 404 -341 85 -389 102 -458 164 -100 90 -91 204 23 304 69 60 162 87 300
86 144 -1 206 -24 286 -103 45 -46 58 -67 73 -119 l17 -62 232 2 232 3 3 40
c9 105 -67 295 -159 398 -122 137 -302 223 -534 257 -79 11 -262 11 -345 0z
m425 -34 c251 -54 432 -183 532 -379 28 -56 63 -185 63 -234 l0 -33 -215 0
c-164 0 -216 3 -219 13 -2 6 -9 32 -16 56 -17 65 -93 140 -183 182 -69 32 -77
33 -192 34 -140 0 -217 -21 -306 -83 -92 -64 -133 -178 -95 -265 41 -95 157
-154 451 -227 264 -66 352 -93 439 -137 184 -92 301 -229 341 -398 19 -78 19
-245 0 -315 -55 -206 -216 -371 -436 -444 -223 -73 -575 -77 -814 -7 -91 27
-218 90 -275 137 -136 113 -226 282 -237 447 l-6 77 222 0 c213 0 221 -1 221
-20 0 -42 45 -136 86 -180 84 -89 199 -130 371 -130 164 0 281 38 360 116 46
46 63 91 63 166 0 153 -126 233 -500 319 -204 46 -364 101 -460 156 -209 121
-304 277 -304 498 0 107 17 181 61 270 106 212 349 360 653 399 67 8 325 -4
395 -18z"/>
<path d="M17185 2961 c-257 -42 -479 -161 -630 -338 -128 -150 -208 -318 -250
-526 -21 -105 -25 -152 -25 -298 0 -230 18 -338 87 -514 124 -317 380 -548
698 -631 123 -32 359 -44 483 -25 449 71 758 360 871 816 77 312 44 675 -85
944 -84 177 -196 307 -350 408 -176 115 -337 162 -584 168 -91 2 -187 0 -215
-4z m426 -35 c468 -93 770 -460 821 -999 35 -376 -79 -746 -305 -984 -190
-200 -449 -303 -757 -303 -294 1 -526 85 -713 260 -99 93 -165 181 -226 305
-102 207 -126 317 -126 590 0 221 13 308 67 463 95 272 302 504 538 603 73 31
208 68 290 80 80 11 323 3 411 -15z"/>
<path d="M17285 2540 c-233 -32 -426 -216 -490 -465 -58 -226 -31 -555 60
-735 29 -56 111 -154 161 -190 113 -84 205 -113 354 -113 129 1 199 20 306 84
125 75 232 236 271 404 26 115 26 438 -1 545 -68 278 -266 456 -526 473 -41 3
-102 2 -135 -3z m240 -34 c105 -28 219 -103 278 -183 96 -131 135 -259 144
-473 11 -275 -39 -457 -171 -614 -50 -60 -151 -127 -234 -155 -76 -26 -259
-29 -335 -6 -188 57 -322 209 -389 440 -21 72 -23 100 -22 285 0 197 1 208 28
290 73 220 210 365 394 415 63 17 244 18 307 1z"/>
<path d="M2984 2932 l-101 -3 -42 -112 c-53 -139 -69 -183 -121 -327 -23 -63
-50 -137 -60 -165 -19 -49 -117 -321 -190 -525 -21 -58 -61 -168 -90 -245 -28
-77 -86 -232 -127 -345 -41 -113 -91 -248 -110 -300 -48 -129 -84 -243 -78
-248 8 -8 451 -15 488 -8 33 6 37 11 55 69 38 118 134 392 145 412 5 11 15 23
21 27 6 4 187 8 402 8 343 0 393 -2 405 -16 7 -8 39 -93 72 -187 32 -95 69
-201 81 -237 18 -50 28 -66 47 -71 37 -11 487 -10 493 0 9 13 -73 252 -306
901 -38 107 -92 257 -119 333 -125 350 -153 427 -179 502 -16 44 -51 143 -78
220 -28 77 -63 176 -78 220 -15 44 -34 86 -43 93 -16 13 -141 14 -487 4z m209
-574 c47 -127 257 -783 253 -793 -8 -21 -518 -22 -534 -2 -8 10 21 110 116
393 71 208 131 387 135 397 7 20 23 22 30 5z"/>
<path d="M14541 2930 c-18 -10 -16 -2261 2 -2272 7 -4 359 -8 783 -8 683 0
773 2 784 15 10 12 12 57 7 196 -4 99 -9 184 -12 189 -4 6 -205 10 -524 10
-389 0 -520 3 -529 12 -14 14 -17 503 -3 512 4 3 215 6 468 6 253 1 470 4 482
7 21 5 21 9 21 204 l0 199 -478 0 c-358 0 -481 3 -490 12 -17 17 -17 479 0
496 9 9 141 12 534 12 504 0 522 1 527 19 10 39 -4 385 -16 393 -15 10 -1540
8 -1556 -2z m1497 -19 l52 -1 0 -185 0 -185 -516 0 c-336 0 -522 -4 -535 -10
-18 -10 -19 -24 -19 -265 0 -251 0 -254 22 -269 20 -14 83 -16 490 -16 l468 0
0 -180 0 -180 -62 0 c-35 0 -240 0 -455 0 -324 0 -399 -2 -428 -14 l-35 -15 0
-260 c0 -257 0 -260 22 -275 20 -14 87 -16 535 -16 l513 0 0 -185 0 -185 -767
2 -768 3 -3 1117 -2 1118 182 2 c171 3 1189 2 1306 -1z"/>
<path d="M9933 2773 c-23 -4 -23 -6 -23 -191 0 -103 -5 -194 -10 -202 -7 -11
-37 -16 -122 -20 l-113 -5 0 -175 0 -175 115 -5 115 -5 7 -65 c4 -36 4 -229 1
-430 -7 -432 0 -516 53 -627 52 -109 124 -166 270 -215 61 -20 88 -23 224 -22
110 0 172 5 213 16 33 9 60 18 62 20 2 2 -10 81 -28 175 l-31 171 -90 -5 c-84
-5 -94 -3 -126 19 -71 48 -70 43 -70 519 0 352 2 429 14 438 9 7 63 12 147 13
74 0 142 5 152 10 15 8 17 27 17 178 l0 170 -154 0 c-113 0 -157 3 -163 13 -4
6 -10 100 -13 207 l-5 195 -210 1 c-115 1 -220 -1 -232 -3z"/>
<path d="M4895 2380 c-141 -20 -251 -77 -361 -185 -113 -111 -179 -234 -221
-407 -28 -114 -25 -443 5 -556 93 -357 362 -556 726 -539 81 3 127 11 171 27
107 41 156 79 253 194 39 46 44 24 41 -161 -4 -160 -5 -171 -32 -225 -55 -112
-139 -160 -291 -166 -188 -8 -311 44 -401 171 l-20 29 -202 -67 c-148 -48
-203 -71 -203 -82 0 -30 62 -123 119 -180 63 -63 195 -139 291 -168 155 -46
437 -61 606 -31 312 55 515 215 591 466 15 49 17 152 20 958 l4 902 -236 0
-235 0 0 -109 c0 -119 -10 -142 -42 -100 -95 122 -159 172 -265 208 -69 23
-229 34 -318 21z m412 -411 c105 -50 170 -148 198 -293 52 -269 -47 -527 -228
-595 -122 -45 -269 -21 -361 60 -178 157 -182 592 -8 762 114 110 259 134 399
66z"/>
<path d="M6890 2384 c-149 -16 -238 -43 -358 -110 -80 -44 -212 -174 -261
-258 -179 -303 -171 -794 18 -1063 103 -147 263 -256 446 -305 110 -29 379
-32 505 -5 265 57 456 217 521 435 16 54 12 57 -79 66 -151 14 -259 26 -294
32 -35 5 -38 4 -57 -33 -30 -60 -96 -120 -159 -144 -46 -18 -77 -23 -162 -22
-91 0 -112 3 -162 26 -75 33 -123 71 -157 121 -42 60 -73 154 -69 207 l3 44
584 3 583 2 -5 183 c-4 154 -9 195 -29 268 -98 338 -359 536 -728 552 -58 3
-121 3 -140 1z m264 -393 c78 -38 137 -101 166 -177 27 -74 27 -112 -2 -119
-13 -3 -171 -4 -353 -3 l-330 3 1 40 c2 88 94 214 191 260 60 29 92 34 180 31
68 -2 92 -8 147 -35z"/>
<path d="M8880 2384 c-199 -32 -337 -115 -415 -249 -15 -25 -32 -44 -39 -42
-7 2 -12 49 -14 136 l-3 131 -232 -2 -232 -3 -3 -846 -2 -847 22 -6 c13 -3
118 -6 234 -6 163 0 214 3 222 13 8 9 12 181 14 548 3 533 3 534 26 585 29 64
102 136 167 166 41 19 67 23 145 23 86 0 100 -3 149 -30 66 -37 112 -89 137
-158 18 -48 19 -89 21 -592 l2 -540 88 -6 c117 -9 357 -11 377 -3 14 6 16 65
16 564 0 559 -5 656 -37 770 -52 184 -180 313 -361 366 -74 21 -230 37 -282
28z"/>
<path d="M11485 2381 c-305 -40 -535 -216 -650 -499 -71 -176 -84 -458 -30
-666 39 -149 100 -260 200 -362 153 -156 363 -234 632 -234 341 0 599 132 714
364 22 45 41 98 42 117 l2 34 -60 6 c-33 4 -112 12 -175 18 -63 6 -129 14
-147 17 -29 6 -33 3 -53 -35 -30 -60 -93 -117 -158 -143 -47 -18 -76 -22 -162
-22 -96 1 -111 3 -172 31 -76 36 -143 97 -175 164 -30 61 -55 180 -41 196 8
10 135 13 590 13 l580 0 -5 178 c-6 204 -23 287 -87 417 -96 197 -267 331
-485 384 -91 23 -271 33 -360 22z m286 -383 c31 -14 74 -42 96 -61 52 -48 97
-137 97 -196 l1 -46 -350 0 -350 0 -3 26 c-9 77 90 221 184 268 68 34 99 40
189 37 61 -2 94 -8 136 -28z"/>
<path d="M33 703 c-10 -3 -13 -48 -13 -174 l0 -169 763 2 762 3 0 170 0 170
-750 2 c-412 1 -756 -1 -762 -4z m1497 -170 l0 -153 -745 0 -745 0 0 150 0
149 133 3 c72 2 408 3 744 3 l613 0 0 -152z"/>
</g>
<g transform="translate(-4.000000,294.665214) scale(0.100000,-0.100000)" fill="#e8791a" stroke="none">
<path d="M13310 2944 c-304 -39 -547 -187 -653 -399 -44 -89 -61 -163 -61
-270 0 -221 95 -377 304 -498 96 -55 256 -110 460 -156 374 -86 500 -166 500
-319 0 -75 -17 -120 -63 -166 -79 -78 -196 -116 -360 -116 -172 0 -287 41
-371 130 -41 44 -86 138 -86 180 0 19 -8 20 -221 20 l-222 0 6 -77 c3 -43 13
-100 22 -128 93 -276 305 -436 650 -490 122 -20 376 -19 489 1 321 56 533 226
601 484 19 70 19 237 0 315 -40 169 -157 306 -341 398 -87 44 -175 71 -439
137 -294 73 -410 132 -451 227 -38 87 3 201 95 265 89 62 166 83 306 83 115
-1 123 -2 192 -34 90 -42 166 -117 183 -182 7 -24 14 -50 16 -56 3 -10 55 -13
219 -13 l215 0 0 33 c0 49 -35 178 -63 234 -100 196 -281 325 -532 379 -70 14
-328 26 -395 18z"/>
<path d="M17200 2941 c-82 -12 -217 -49 -290 -80 -236 -99 -443 -331 -538
-603 -54 -155 -67 -242 -67 -463 0 -273 24 -383 126 -590 182 -368 509 -564
939 -565 308 0 567 103 757 303 176 186 274 421 304 729 30 301 -43 618 -194
842 -143 214 -366 360 -626 412 -88 18 -331 26 -411 15z m362 -426 c150 -51
261 -149 326 -287 65 -136 77 -203 77 -428 0 -229 -14 -309 -76 -437 -71 -144
-181 -243 -337 -301 -57 -21 -85 -25 -182 -25 -149 0 -241 29 -354 113 -50 36
-132 134 -161 190 -70 138 -104 363 -86 562 13 141 31 211 80 313 126 266 435
396 713 300z"/>
<path d="M14732 2912 l-182 -2 2 -1118 3 -1117 768 -3 767 -2 0 185 0 185
-513 0 c-448 0 -515 2 -535 16 -22 15 -22 18 -22 275 l0 260 35 15 c29 12 104
14 428 14 215 0 420 0 455 0 l62 0 0 180 0 180 -468 0 c-407 0 -470 2 -490 16
-22 15 -22 18 -22 269 0 241 1 255 19 265 13 6 199 10 535 10 l516 0 0 185 0
185 -52 1 c-117 3 -1135 4 -1306 1z"/>
<path d="M173 682 l-133 -3 0 -149 0 -150 745 0 745 0 0 153 0 152 -613 0
c-336 0 -672 -1 -744 -3z"/>
</g>
</svg>
  <h1 class="sr-only">_AgenteSEO</h1>
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
    <div id="colaContainer">${renderCola(año, mes, verTodo)}${verTodo ? '<p style="font-size:12px;margin-top:8px"><a href="?año='+año+'&mes='+mes+'" style="color:#216416">← Ver solo este mes</a></p>' : ''}</div>
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
    <img class="preview-img" id="modalImg" onerror="if(this.src) { console.error('[IMG] Fallo al cargar:', this.src); this.style.display='none'; document.getElementById('modalImgError').style.display='block'; }">
    <div id="modalImgError" style="display:none;padding:12px;background:#faece7;color:#993c1d;border-radius:8px;font-size:12px;margin-bottom:12px">⚠️ La imagen no cargó — revisa la consola del navegador para ver el link exacto que falló.</div>
    <div class="preview-content" id="modalContent"></div>
    <div class="grid2" style="margin-bottom:8px">
      <button class="btn btn-secondary" id="btnRegenerarItem" onclick="regenerarItemActual()">🔄 Regenerar</button>
      <button class="btn btn-secondary" id="btnPublicarAhora" onclick="publicarAhoraActual()">🚀 Publicar ahora</button>
    </div>
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

<div class="modal" id="modalConfirmar" style="z-index:200">
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

<script>
let itemActualId = null;

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
      body: JSON.stringify({ tema, marca, carpeta, fechaProgramada: fecha, esCustom: !!temaCustom })
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

function verPreview(id, btnEl) {
  itemActualId = id;
  if (btnEl) { btnEl.disabled = true; }

  // Abrir el modal enseguida mostrando estado de carga, sin esperar la respuesta completa
  document.getElementById('modalTitle').textContent = 'Generando artículo...';
  document.getElementById('modalMeta').innerHTML = '';
  document.getElementById('modalImg').removeAttribute('src');
  document.getElementById('modalContent').innerHTML = '<p class="loading">⏳ Creando artículo con IA (texto + imagen). Puede tardar 1-2 minutos, esto se actualiza solo, no cierres esta ventana...</p>';
  document.getElementById('modalPreview').classList.add('open');

  consultarItemHastaListo(id, btnEl);
}

function consultarItemHastaListo(id, btnEl) {
  fetch('/item/' + id).then(r => r.json()).then(data => {
    if (itemActualId !== id) return; // el usuario ya abrio otro item, ignorar esta respuesta vieja
    if (!data.ok) {
      document.getElementById('modalContent').innerHTML = '<p class="empty">❌ Error: ' + (data.error || 'desconocido') + '</p>';
      if (btnEl) btnEl.disabled = false;
      return;
    }
    const item = data.item;

    if (item.errorGeneracion) {
      document.getElementById('modalContent').innerHTML = '<p class="empty">❌ Error generando: ' + item.errorGeneracion + '</p>';
      if (btnEl) btnEl.disabled = false;
      return;
    }

    if (!item.contenido) {
      // Todavia no hay ni texto, seguir esperando
      setTimeout(() => consultarItemHastaListo(id, btnEl), 3000);
      return;
    }

    // Ya hay texto - mostrarlo aunque la imagen no este lista todavia
    document.getElementById('modalTitle').textContent = item.tema;
    document.getElementById('modalMeta').innerHTML =
      '<strong>Title:</strong> ' + (item.meta?.title || '-') + '<br>' +
      '<strong>URL:</strong> ' + (item.canonical || '-') + '<br>' +
      '<strong>Fecha:</strong> ' + item.fechaProgramada + '<br>' +
      '<strong>Estado:</strong> ' + item.estado;
    document.getElementById('modalContent').innerHTML = item.contenido;

    if (item.imagenLista || item.imagen) {
      if (item.imagen) {
        document.getElementById('modalImg').src = item.imagen + (item.imagen.includes('?') ? '&' : '?') + 't=' + Date.now();
      } else {
        document.getElementById('modalImg').removeAttribute('src');
      }
      if (btnEl) btnEl.disabled = false;
    } else if (item.generando) {
      document.getElementById('modalImg').removeAttribute('src');
      // Seguir consultando solo para la imagen
      setTimeout(() => consultarItemHastaListo(id, btnEl), 3000);
    } else {
      if (btnEl) btnEl.disabled = false;
    }
  }).catch(err => {
    document.getElementById('modalContent').innerHTML = '<p class="empty">❌ Error de conexión: ' + err.message + '</p>';
    if (btnEl) btnEl.disabled = false;
  });
}

async function publicarAhoraActual() {
  if (!itemActualId) return;
  const confirmado = await confirmarAccion('¿Publicar este artículo ahora mismo, sin esperar el cron automático? Se sube directo a tu sitio en vivo.', 'Publicar ahora');
  if (!confirmado) return;

  const btn = document.getElementById('btnPublicarAhora');
  btn.disabled = true;
  btn.textContent = '⏳ Publicando...';
  try {
    const res = await fetch('/item/' + itemActualId + '/publicar-ahora', { method: 'POST' }).then(r => r.json());
    if (res.ok) {
      showStatus('statusModal', 'ok', '✅ Publicado: ' + res.canonical);
      setTimeout(() => { cerrarModal(); location.reload(); }, 2000);
    } else {
      showStatus('statusModal', 'error', '❌ Error: ' + res.error);
    }
  } catch(e) {
    showStatus('statusModal', 'error', '❌ Error: ' + e.message);
  } finally {
    btn.disabled = false;
    btn.textContent = '🚀 Publicar ahora';
  }
}

async function regenerarItemActual() {
  if (!itemActualId) return;
  const confirmado = await confirmarAccion('¿Regenerar este artículo completo (texto e imagen)? Se reemplaza lo actual.', 'Regenerar artículo');
  if (!confirmado) return;
  const btn = document.getElementById('btnRegenerarItem');
  btn.disabled = true;
  btn.textContent = '⏳ Regenerando (puede tardar ~30-40 seg)...';
  try {
    const res = await fetch('/item/' + itemActualId + '/regenerar', { method: 'POST' }).then(r => r.json());
    if (res.ok) {
      verPreview(itemActualId);
    } else {
      alert('Error: ' + res.error);
    }
  } catch(e) {
    alert('Error: ' + e.message);
  } finally {
    btn.disabled = false;
    btn.textContent = '🔄 Regenerar (texto + imagen)';
  }
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
          '<button class="btn btn-primary" onclick="verPreview(\\'' + data.item.id + '\\', this);cerrarModalDia()">Ver / editar</button>' +
          '<button class="btn btn-danger" onclick="fetch(\\'/descartar/' + data.item.id + '\\',{method:\\'DELETE\\'}).then(()=>location.reload())">Eliminar</button>' +
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
function renderCola(año, mes, verTodo) {
  const prefijoMes = año && mes ? `${año}-${String(mes).padStart(2,'0')}` : null;
  let cola = obtenerCola().sort((a,b) => (a.fechaProgramada||'').localeCompare(b.fechaProgramada||''));
  if (prefijoMes && !verTodo) {
    cola = cola.filter(i => (i.fechaProgramada || '').startsWith(prefijoMes));
  }
  if (!cola.length) {
    return verTodo
      ? '<p style="font-size:13px;color:#999">La cola está vacía. Genera artículos arriba para llenarla.</p>'
      : '<p style="font-size:13px;color:#999">No hay artículos programados este mes. <a href="?año=' + año + '&mes=' + mes + '&verTodo=1" style="color:#216416">Ver historial completo</a></p>';
  }

  return `<table>
    <thead><tr><th>Fecha</th><th>Tema</th><th>Estado</th><th>Acciones</th></tr></thead>
    <tbody>${cola.map(i => `
      <tr>
        <td style="font-size:12px;white-space:nowrap">${i.fechaProgramada||'Sin fecha'}</td>
        <td style="font-size:12px">${i.tema}</td>
        <td><span class="badge ${i.estado==='publicado'?'badge-ok':i.estado==='aprobado'?'badge-aprov':'badge-pend'}">${i.estado}</span></td>
        <td>
          <button onclick="verPreview('${i.id}', this)" style="font-size:11px;padding:4px 10px;border:1px solid #ddd;border-radius:4px;cursor:pointer;background:#fff">👁️ Ver</button>
          ${i.estado==='publicado'&&i.canonical?`<a href="${i.canonical}" target="_blank" style="font-size:11px;padding:4px 10px;border:1px solid #a9d9c3;border-radius:4px;cursor:pointer;background:#e1f5ee;color:#0f6e56;margin-left:4px;text-decoration:none;display:inline-block">🔗 Ver publicado</a>`:''}
          ${i.estado!=='publicado'?`<button onclick="fetch('/descartar/${i.id}',{method:'DELETE'}).then(()=>location.reload())" style="font-size:11px;padding:4px 10px;border:1px solid #f5c4b3;border-radius:4px;cursor:pointer;background:#faece7;color:#993c1d;margin-left:4px">🗑️</button>`:''}
        </td>
      </tr>`).join('')}
    </tbody>
  </table>`;
}

// ─── ENDPOINTS ────────────────────────────────────────────────────────────────

// Generar artículo y agregar a la cola
app.post('/generar-para-cola', async (req, res) => {
  let { tema, marca, carpeta = 'blog', fechaProgramada, esCustom } = req.body;
  if (!tema) return res.json({ ok: false, error: 'Falta el tema' });

  try {
    // Si el tema vino escrito a mano (no elegido del listado fijo), lo refinamos con Claude
    // antes de generar el articulo - solo se llama aqui, nunca al cargar la pagina.
    if (esCustom) {
      const msgRefinar = await anthropicClient.messages.create({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 200,
        system: 'Eres un experto en SEO para una empresa chilena de reparacion e instalacion de portones electricos. Recibes una idea corta de un usuario y la conviertes en un tema de articulo bien formado, en el estilo "reparacion porton electrico [comuna]" o "servicio tecnico [marca/tema] [contexto]". No inventes datos del negocio que no te den. Responde SOLO con el tema final, sin comillas ni explicacion.',
        messages: [{ role: 'user', content: 'Idea del usuario: ' + tema }]
      });
      const temaRefinado = msgRefinar.content[0].text.trim();
      if (temaRefinado) tema = temaRefinado;
    }

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
// Fuerza regenerar meta, contenido e imagen de un item, sin importar si ya tenia contenido
// Publica manualmente un item ahora mismo (sin esperar el cron de las 10am) - para pruebas
app.post('/item/:id/publicar-ahora', async (req, res) => {
  try {
    const item = obtenerItemPorId(req.params.id);
    if (!item) return res.json({ ok: false, error: 'No encontrado' });
    if (!item.meta || !item.contenido) return res.json({ ok: false, error: 'Este item aun no tiene contenido generado. Dale Ver o Regenerar primero.' });

    console.log('[PUBLICAR-MANUAL] Publicando:', item.tema);
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
    const itemPublicado = actualizarItem(item.id, { estado: 'publicado', publicadoEn: new Date().toISOString() });
    await agregarABlogIndex(itemPublicado);

    historial.push({
      fecha: new Date().toLocaleString('es-CL'),
      ok: true, canonical: item.canonical, title: item.meta.title, duracion: '-'
    });

    console.log('[PUBLICAR-MANUAL] ✅ Publicado:', item.canonical);
    res.json({ ok: true, canonical: item.canonical });
  } catch(err) {
    console.error('[PUBLICAR-MANUAL] Error:', err.message);
    res.json({ ok: false, error: err.message });
  }
});

app.post('/item/:id/regenerar', async (req, res) => {
  try {
    const item = obtenerItemPorId(req.params.id);
    if (!item) return res.json({ ok: false, error: 'No encontrado' });

    console.log('[REGENERAR] Forzando regeneracion:', item.tema);
    const meta = await generarMetadata({ tema: item.tema, marca: item.marca, tipo: 'articulo' });
    const contenido = await generarArticulo({ tema: item.tema, marca: item.marca, slug: meta.slug, enlazarA: item.enlazarA });
    const { isoDate, dateStr } = buildDate(0);
    const canonical = SITE_URL + '/' + item.carpeta + '/' + meta.slug + '/';
    const imagen = await generarYSubirImagen({ tema: item.tema, marca: item.marca, slug: meta.slug });

    const itemActualizado = actualizarItem(item.id, { meta, contenido, isoDate, dateStr, canonical, imagen });
    res.json({ ok: true, item: itemActualizado });
  } catch(err) {
    console.error('[REGENERAR] Error:', err.message);
    res.json({ ok: false, error: err.message });
  }
});

async function generarContenidoEnSegundoPlano(item) {
  try {
    console.log('[VER-PREVIEW-BG] Generando texto:', item.tema);
    const meta = await generarMetadata({ tema: item.tema, marca: item.marca, tipo: 'articulo' });
    const contenido = await generarArticulo({ tema: item.tema, marca: item.marca, slug: meta.slug, enlazarA: item.enlazarA });
    const { isoDate, dateStr } = buildDate(0);
    const canonical = SITE_URL + '/' + item.carpeta + '/' + meta.slug + '/';

    // Guardar el texto apenas esta listo, para que se pueda mostrar sin esperar la imagen
    actualizarItem(item.id, { meta, contenido, isoDate, dateStr, canonical, imagenLista: false });
    console.log('[VER-PREVIEW-BG] \u2705 Texto listo, generando imagen:', item.tema);

    const imagen = await generarYSubirImagen({ tema: item.tema, marca: item.marca, slug: meta.slug });
    actualizarItem(item.id, { imagen, imagenLista: true, generando: false, estado: 'generado' });
    console.log('[VER-PREVIEW-BG] \u2705 Imagen lista:', item.tema);
  } catch(err) {
    console.error('[VER-PREVIEW-BG] Error:', err.message);
    actualizarItem(item.id, { generando: false, errorGeneracion: err.message });
  }
}

app.get('/item/:id', async (req, res) => {
  let item = obtenerItemPorId(req.params.id);
  if (!item) return res.json({ ok: false, error: 'No encontrado' });

  // Si es un item automatico de Estrategia y aun no tiene contenido ni esta ya generando, lanzarlo en segundo plano
  if (item.estado === 'pendiente_auto' && !item.contenido && !item.generando) {
    item = actualizarItem(item.id, { generando: true, errorGeneracion: null });
    generarContenidoEnSegundoPlano(item); // sin await, corre en segundo plano
  }

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
cron.schedule('0 9 * * *', async () => {
  console.log('[CRON-AUTO] Generando articulos automaticos de Estrategia para hoy...');
  const hoyAuto = new Date().toISOString().split('T')[0];
  const colaAuto = obtenerCola();
  const pendientesAuto = colaAuto.filter(i => i.fechaProgramada === hoyAuto && (i.estado === 'pendiente_auto' || i.estado === 'generado' || (i.estado === 'aprobado' && !i.contenido)));

  if (!pendientesAuto.length) {
    console.log('[CRON-AUTO] Sin articulos automaticos pendientes para hoy');
  }

  for (const item of pendientesAuto) {
    try {
      if (item.contenido && item.meta) {
        console.log('[CRON-AUTO] Ya estaba generado (revisado antes con Ver), solo aprobando:', item.tema);
        actualizarItem(item.id, { estado: 'aprobado' });
      } else {
        console.log('[CRON-AUTO] Generando:', item.tema);
        const meta = await generarMetadata({ tema: item.tema, marca: item.marca, tipo: 'articulo' });
        const contenido = await generarArticulo({ tema: item.tema, marca: item.marca, slug: meta.slug, enlazarA: item.enlazarA });
        const { isoDate, dateStr } = buildDate(0);
        const canonical = SITE_URL + '/' + item.carpeta + '/' + meta.slug + '/';
        const imagen = await generarYSubirImagen({ tema: item.tema, marca: item.marca, slug: meta.slug });
        actualizarItem(item.id, { meta, contenido, isoDate, dateStr, canonical, imagen, estado: 'aprobado' });
      }
      console.log('[CRON-AUTO] \u2705 Aprobado, listo para publicar a las 10am:', item.tema);
    } catch(err) {
      console.error('[CRON-AUTO] \u274c Error generando', item.tema, ':', err.message);
      actualizarItem(item.id, { estado: 'error', errorMsg: err.message });
    }
  }
});

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
      const itemPublicadoManual = actualizarItem(item.id, { estado: 'publicado', publicadoEn: new Date().toISOString() });
      await agregarABlogIndex(itemPublicadoManual);

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
const { getAuthUrl, getTokensFromCode, loadTokens, verificarIdentidad } = require('./gsc-auth');
const { getDiagnostico, getTodasLasKeywords, getComparativaHistorica, getComparativaCustom, getTodasLasPaginas, getKeywordsDePagina } = require('./gsc-diagnostico');
const AnthropicSDK = require('@anthropic-ai/sdk');
const anthropicClient = new AnthropicSDK({ apiKey: process.env.ANTHROPIC_API_KEY });
const { cargarPlan, guardarPlan, cargarHistorial, guardarEnHistorial, eliminarDeHistorial, limpiarPlan, actualizarEntradaHistorial } = require('./estrategia');
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
    const tokens = await getTokensFromCode(code);

    // Verificar identidad con el id_token que vino en la misma respuesta
    if (tokens.id_token) {
      const identidad = await verificarIdentidad(tokens.id_token);
      const emailPermitido = process.env.ADMIN_EMAIL;

      if (emailPermitido && identidad.email !== emailPermitido) {
        return res.redirect('/login?error=' + encodeURIComponent('Esta cuenta no tiene acceso a este panel.'));
      }

      req.session.autenticado = true;
      req.session.email = identidad.email;
      req.session.nombre = identidad.nombre;
    }

    res.redirect('/seo');
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
  <title>Terminos y condiciones de datos — _AgenteSEO</title>
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

async function extraerPrioridades(textoLibre, comunasConPagina) {
  if (!textoLibre || !textoLibre.trim()) return [];
  try {
    const comunasTexto = (comunasConPagina && comunasConPagina.length > 0) ? JSON.stringify(comunasConPagina) : '[]';
    const msg = await anthropicClient.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 800,
      system: 'Analizas un texto en español (con posibles errores de tipeo) escrito por el dueño de una empresa chilena de reparación e instalación de portones eléctricos, donde describe qué contenido quiere priorizar este mes. Extrae una lista de TEMAS DE ARTÍCULO completos y listos para usar - no solo nombres de lugares. Reglas: (1) Si menciona una comuna o ciudad SIN pagina comercial propia todavia, genera el tema "reparación portón eléctrico [Comuna]" con la ortografía corregida (ej "lo barnechea" -> "Lo Barnechea"). (2) Si menciona una comuna que SI aparece en esta lista de comunas que YA tienen pagina comercial propia (' + comunasTexto + '), el articulo nuevo NO debe repetir esa misma frase generica (competiria por la misma keyword que su propia pagina) - dale un angulo de blog distinto y especifico que enlace de vuelta a esa pagina como refuerzo, por ejemplo un problema comun, una guia rapida, o un caso de uso puntual para esa comuna. (3) Si menciona un pedido mas especifico y completo (un servicio, una industria, una capacidad tecnica real del negocio como un inspector certificado, un tipo de ensayo, portones industriales, portones para mineria, etc), escribe el tema capturando ese detalle real tal como el usuario lo describio - NO lo descartes ni lo conviertas en generico, y NO inventes datos que el usuario no dio. (4) Si pide varios articulos de un mismo tema (ej "3 articulos de portones industriales"), genera esa cantidad de temas relacionados pero con angulos distintos. Ignora solo relleno conversacional sin contenido real (ej "quiero que", "ademas"). Responde SOLO con un array JSON de strings, cada uno un tema de articulo completo, sin markdown ni explicacion. Si no detectas ningun pedido real, responde [].',
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

async function generarTemasDinamicos(cantidad, temasYaUsados, paginasExistentes) {
  if (cantidad <= 0) return [];
  const comunasConPagina = paginasExistentes
    .filter(p => /^\/?(a-domicilio-en-|en-)/.test(p))
    .map(p => p.replace(/^\//, '').replace(/\.html$/, '').replace(/^a-domicilio-en-|^en-/, ''));

  const prompt = 'Genera ' + cantidad + ' temas nuevos de articulos de blog para reparaciondeportones.cl (empresa chilena de reparacion, instalacion y mantencion de portones electricos, barreras vehiculares y cercos electricos).\n' +
    'Sigue este mismo estilo de patrones ya usados (varia el patron, no lo copies literal): "reparacion porton electrico [comuna]", "servicio tecnico portones [comuna]", "motor [marca] [tipo] [contexto]", "instalacion motor [marca] [contexto]".\n' +
    'NUNCA repitas literalmente ninguno de estos temas ya usados: ' + JSON.stringify(Array.from(temasYaUsados).slice(0, 60)) + '\n' +
    'IMPORTANTE - cobertura real: la empresa SOLO opera y da servicio en Santiago (Region Metropolitana), Antofagasta, La Serena, Coquimbo, Viña del Mar, Concepcion y Temuco. NUNCA generes temas sobre comunas o ciudades fuera de estas zonas (por ejemplo, nunca Iquique, Valdivia, Punta Arenas, Arica, Puerto Montt, Rancagua, Talca, Chillan, u otras ciudades donde no se opera) - inventar cobertura ahi seria enganoso para un cliente real que lea el articulo.\n' +
    'Dentro de esas zonas, prioriza comunas que NO aparezcan en esta lista de comunas que ya tienen pagina propia: ' + JSON.stringify(comunasConPagina) + '\n' +
    'Marcas conocidas en el mercado chileno que puedes usar: FAAC, BFT, Nice, Centurion, Rossi, PPA, SEA.\n' +
    'Responde SOLO con un array JSON, sin markdown: [{"tema": "...", "marca": "nice|bft|centurion|", "carpeta": "blog|nice|bft|centurion"}]';

  const msg = await anthropicClient.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 2000,
    system: 'Eres un experto en SEO y content marketing para una empresa chilena de portones electricos. Generas temas de articulos realistas, variados y utiles, sin inventar datos falsos del negocio.',
    messages: [{ role: 'user', content: prompt }]
  });
  const texto = msg.content[0].text.trim().replace(/```json|```/g, '').trim();
  return JSON.parse(texto);
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

  // extraerPrioridades ya devuelve temas de articulo completos y listos para usar
  // (no solo nombres de lugares) - se usan tal cual, sin agregarles prefijo.
  const prioritarios = [];
  const yaUsados = new Set();
  prioridades.forEach(prio => {
    const prioTexto = prio.trim();
    if (!prioTexto) return;
    prioritarios.push({ tema: prioTexto, marca: '', carpeta: 'blog' });
    yaUsados.add(prioTexto);
  });

  // Nunca repetir literalmente un tema ya usado en cualquier ciclo anterior (evita contenido duplicado).
  const temasYaUsadosHistorico = new Set(obtenerCola().map(item => item.tema));
  const todosLosUsados = new Set([...temasYaUsadosHistorico, ...yaUsados]);

  // El resto del plan se genera con IA en el momento, considerando lo que ya existe - no hay lista fija.
  const META_ARTICULOS_MES = 30;
  const faltantes = Math.max(0, META_ARTICULOS_MES - prioritarios.length);
  const resto = await generarTemasDinamicos(faltantes, todosLosUsados, paginas.map(p => p.pagina));
  const listaTemas = [...prioritarios, ...resto];

  // Arreglos rapidos: paginas que YA rankean bien (posicion <= 6) pero con
  // CTR muy por debajo de lo esperado - se arreglan con titulo/meta, no con articulos nuevos
  const arreglosRapidos = comerciales
    .filter(p => p.posicion <= 6 && p.potencial >= 20 && !fueAplicadoRecientemente(p.pagina))
    .slice(0, 8)
    .map(p => ({ pagina: p.pagina, posicion: p.posicion, ctr: p.ctr, potencial: p.potencial }));

  const articulos = listaTemas.map((item, idx) => {
    const temaNorm = normalizarTexto(item.tema);
    const palabras = temaNorm.split(' ').filter(w => w.length > 3);

    let mejor = null;

    // Override manual: temas de industria/mineria deben enlazar siempre a la pagina
    // comercial dedicada, aunque esa pagina no tenga datos de Search Console todavia
    // (por eso no aparece en "comerciales", que solo incluye paginas con impresiones reales)
    if (/\bindustrial(es)?\b|\bminer(i|í)a\b|\bminero(s)?\b|\bempresa(s)?\b/.test(temaNorm)) {
      const paginaIndustrial = paginas.find(p => p.pagina === '/portones-industriales.html');
      mejor = paginaIndustrial
        ? { pagina: paginaIndustrial.pagina, potencial: Math.max(0, Math.round(paginaIndustrial.impresiones * (0.28 - paginaIndustrial.ctr / 100))) }
        : { pagina: '/portones-industriales.html', potencial: 0 };
    }

    if (!mejor) {
      for (const p of comerciales) {
        const paginaNorm = normalizarTexto(p.pagina);
        if (palabras.some(w => paginaNorm.includes(w))) {
          if (!mejor || p.potencial > mejor.potencial) mejor = p;
        }
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

async function obtenerTituloMetaActual(urlCompleta) {
  const res = await fetch(urlCompleta);
  const html = await res.text();
  const tituloMatch = html.match(/<title>([^<]*)<\/title>/i);
  const metaMatch = html.match(/<meta\s+name=["\']description["\']\s+content=["\']([^"\']*)["\']/i);
  return {
    titulo: tituloMatch ? tituloMatch[1].trim() : '(no encontrado)',
    meta: metaMatch ? metaMatch[1].trim() : '(no encontrado)',
  };
}

async function sugerirMejoraTituloMeta(pagina, posicion, ctrActual) {
  const base = (process.env.SITE_URL || 'https://www.reparaciondeportones.cl').replace(/\/+$/, '');
  const urlCompleta = base + pagina;
  const actual = await obtenerTituloMetaActual(urlCompleta);

  const HECHOS_NEGOCIO = 'NUNCA menciones el costo de la visita tecnica de NINGUNA forma - ni que es gratis, ni que tiene costo, ni que "varia segun distancia", ni ningun detalle de precio. Simplemente NO toques ese tema para nada en el titulo ni en la meta description, omitelo por completo como si no existiera. No inventes garantias, plazos, promociones ni ningun otro dato comercial que no se te entregue explicitamente aqui.';

  const msg = await anthropicClient.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 500,
    system: 'Eres un experto en SEO para una empresa de reparacion e instalacion de portones electricos en Chile. Te dan el titulo y meta description actuales de una pagina, su posicion en Google y su CTR actual. Propon un titulo (maximo 60 caracteres) y meta description (maximo 155 caracteres) mejorados que generen mas clics, manteniendo la keyword principal, en espanol chileno, tono profesional pero cercano. HECHOS DEL NEGOCIO QUE DEBES RESPETAR SIEMPRE: ' + HECHOS_NEGOCIO + ' Responde SOLO con JSON, sin markdown: {"tituloSugerido": "...", "metaSugerida": "...", "razon": "explicacion breve de 1-2 frases"}',
    messages: [{ role: 'user', content: 'Pagina: ' + pagina + '\nTitulo actual: ' + actual.titulo + '\nMeta actual: ' + actual.meta + '\nPosicion en Google: ' + posicion + '\nCTR actual: ' + ctrActual + '%' }]
  });
  const texto = msg.content[0].text.trim().replace(/```json|```/g, '').trim();
  const sugerencia = JSON.parse(texto);
  return { actual, sugerencia };
}

// Propone mejora de titulo/meta SIN aplicarla al sitio - solo para revisar
app.post('/seo/sugerir-titulo', async (req, res) => {
  try {
    const { pagina, posicion, ctr } = req.body;
    if (!pagina) return res.json({ ok: false, error: 'Falta el parametro pagina' });
    const resultado = await sugerirMejoraTituloMeta(pagina, posicion, ctr);
    res.json({ ok: true, data: resultado });
  } catch (err) {
    res.json({ ok: false, error: err.message });
  }
});

// Aplica un titulo/meta nuevo a una pagina real via FTP (requiere aprobacion manual del usuario)
// Ruta de una sola vez para marcar manualmente una pagina que ya se arreglo antes de que existiera este registro
app.post('/seo/registrar-aplicado-manual', (req, res) => {
  const { pagina } = req.body;
  if (!pagina) return res.json({ ok: false, error: 'Falta pagina' });
  registrarAplicado(pagina);
  res.json({ ok: true, pagina });
});

// Ruta de una sola vez: repara items de Estrategia que quedaron mal etiquetados por el bug de id duplicado
// Ruta de una sola vez: reasigna un id unico de verdad a cada item de la cola (arregla colisiones viejas)
app.post('/seo/reparar-ids-duplicados', (req, res) => {
  try {
    const cola = obtenerCola();
    let cambiados = 0;
    const idsUsados = new Set();
    const colaArreglada = cola.map((item, idx) => {
      if (idsUsados.has(item.id)) {
        const nuevoId = Date.now().toString() + '-' + idx + '-' + Math.random().toString(36).slice(2, 8);
        idsUsados.add(nuevoId);
        cambiados++;
        return { ...item, id: nuevoId };
      }
      idsUsados.add(item.id);
      return item;
    });
    guardarCola(colaArreglada);
    res.json({ ok: true, cambiados, total: cola.length });
  } catch(err) {
    res.json({ ok: false, error: err.message });
  }
});

app.post('/seo/reparar-cola-estrategia', (req, res) => {
  try {
    const cola = obtenerCola();
    let arreglados = 0;
    const colaArreglada = cola.map(item => {
      if (item.estado === 'pendiente' && item.hasOwnProperty('enlazarA') && !item.contenido) {
        arreglados++;
        return { ...item, estado: 'pendiente_auto' };
      }
      return item;
    });
    guardarCola(colaArreglada);
    res.json({ ok: true, arreglados });
  } catch(err) {
    res.json({ ok: false, error: err.message });
  }
});

app.post('/seo/aplicar-titulo', async (req, res) => {
  try {
    const { pagina, tituloNuevo, metaNueva } = req.body;
    if (!pagina || !tituloNuevo || !metaNueva) {
      return res.json({ ok: false, error: 'Faltan datos (pagina, tituloNuevo, metaNueva)' });
    }

    // Algunas URLs que reporta Search Console no incluyen .html (por reescritura de URL del hosting),
    // pero el archivo real en el servidor si lo tiene. Intentamos ambas rutas.
    let rutaReal = pagina;
    let html = await leerArchivo(rutaReal);
    if (!html && !pagina.endsWith('.html') && !pagina.endsWith('/')) {
      rutaReal = pagina + '.html';
      html = await leerArchivo(rutaReal);
    }
    if (!html) throw new Error('No se pudo leer el archivo desde el servidor (FTP), ni como "' + pagina + '" ni como "' + pagina + '.html"');

    let htmlNuevo = html.replace(/<title>[^<]*<\/title>/i, '<title>' + tituloNuevo + '</title>');
    const regexMeta = /(<meta\s+name=["']description["']\s+content=)["'][^"']*["']/i;
    if (regexMeta.test(htmlNuevo)) {
      htmlNuevo = htmlNuevo.replace(regexMeta, '$1"' + metaNueva + '"');
    } else {
      throw new Error('No se encontro la meta description en la pagina, no se aplico nada');
    }

    await subirArchivo(rutaReal, htmlNuevo);
    registrarAplicado(pagina);
    res.json({ ok: true, pagina: rutaReal });
  } catch (err) {
    console.error('[APLICAR-TITULO] Error:', err.message);
    res.json({ ok: false, error: err.message });
  }
});

// Genera el plan del mes automaticamente (con prioridades opcionales del usuario)
// Extrae un nombre legible de la ruta de una pagina, ej "a-domicilio-en-la-florida.html" -> "La Florida"
function nombreLegibleDePagina(pagina) {
  let slug = pagina.replace(/^\//, '').replace(/\.html$/, '');
  slug = slug.replace(/^a-domicilio-en-/, '').replace(/^en-/, '');
  return slug.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
}

// Paginas que ya mejoraron y quedaron cerca (posicion 4-6) - empujarlas a posicion 1
// es mas rentable que atacar temas nuevos desde cero
async function generarPrioridadesAutomaticas() {
  const paginas = await getTodasLasPaginas(28);
  const cercaDelTop = paginas
    .filter(p => p.posicion >= 4 && p.posicion <= 6 && clasificarIntencionServer(p.pagina) === 'comercial')
    .map(p => {
      const ctrActual = p.ctr / 100;
      const potencial = Math.max(0, Math.round(p.impresiones * (0.28 - ctrActual)));
      return { ...p, potencial };
    })
    .sort((a, b) => b.potencial - a.potencial)
    .slice(0, 5);
  return cercaDelTop.map(p => 'reparación portón eléctrico ' + nombreLegibleDePagina(p.pagina));
}

app.post('/seo/plan-automatico', async (req, res) => {
  try {
    const textoLibre = typeof req.body.texto === 'string' ? req.body.texto : '';
    const prioridadesManual = Array.isArray(req.body.prioridades) ? req.body.prioridades : [];

    const paginasActuales = await getTodasLasPaginas(90);
    const comunasConPaginaTexto = paginasActuales
      .filter(p => /^\/?(a-domicilio-en-|en-)/.test(p.pagina))
      .map(p => p.pagina.replace(/^\//, '').replace(/\.html$/, '').replace(/^a-domicilio-en-|^en-/, ''));

    const prioridadesExtraidas = textoLibre ? await extraerPrioridades(textoLibre, comunasConPaginaTexto) : [];
    const prioridadesEscritas = prioridadesExtraidas.length > 0 ? prioridadesExtraidas : prioridadesManual;

    // Prioridad automatica: paginas en posicion 4-6 que hay que empujar a posicion 1,
    // combinadas con lo que el usuario haya escrito a mano en la cajita
    const prioridadesAuto = await generarPrioridadesAutomaticas();
    const prioridades = [...new Set([...prioridadesEscritas, ...prioridadesAuto])];

    const plan = await generarPlanAutomatico(prioridades);
    res.json({ ok: true, data: plan, prioridadesAuto });
  } catch (err) {
    res.json({ ok: false, error: err.message });
  }
});

// Calcula la tasa de crecimiento real del ciclo activo (sin cerrarlo), para que la
// vista previa del plan use la misma logica de proyeccion que despues se aplica al guardar
app.get('/seo/estrategia/proyeccion-real', async (req, res) => {
  try {
    const historial = cargarHistorial();
    const cicloAbierto = [...historial].reverse().find(h => !h.cerrado);
    if (!cicloAbierto) return res.json({ ok: true, tasaDiariaReal: null });

    const resultado = await calcularAuditoria(cicloAbierto);
    const tasaDiariaReal = (resultado.deltaClicsTotal > 0 && resultado.diasTranscurridos > 0)
      ? resultado.deltaClicsTotal / resultado.diasTranscurridos
      : null;
    res.json({ ok: true, tasaDiariaReal });
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

app.post('/seo/estrategia', async (req, res) => {
  try {
    // Antes de crear el ciclo nuevo, cerramos (congelamos) el ciclo anterior que siga abierto,
    // para que su auditoria deje de recalcularse contra la fecha de hoy
    const historialPrevio = cargarHistorial();
    const cicloAbierto = [...historialPrevio].reverse().find(h => !h.cerrado);
    let tasaDiariaReal = null;
    if (cicloAbierto) {
      const resultadoFinal = await calcularAuditoria(cicloAbierto);
      actualizarEntradaHistorial(cicloAbierto.id, {
        cerrado: true,
        fechaCierre: new Date().toISOString(),
        resultadoFinal,
      });
      // Si el ciclo que se cierra tuvo un crecimiento real medible, usamos esa tasa
      // (clics ganados por dia) para proyectar el ciclo nuevo, en vez del modelo fijo.
      if (resultadoFinal.deltaClicsTotal > 0 && resultadoFinal.diasTranscurridos > 0) {
        tasaDiariaReal = resultadoFinal.deltaClicsTotal / resultadoFinal.diasTranscurridos;
      }
    }

    const historialId = Date.now().toString();
    const data = guardarPlan({ ...req.body, historialId });

    // Snapshot para el historial - linea base real de las paginas objetivo
    const items = req.body.items || [];
    const arreglos = req.body.arreglos || [];
    const paginasUnicas = {};
    items.forEach(item => {
      if (item.enlazarA && !paginasUnicas[item.enlazarA]) paginasUnicas[item.enlazarA] = true;
    });
    arreglos.forEach(a => { if (a.pagina) paginasUnicas[a.pagina] = true; });

    const todasPaginas = await getTodasLasPaginas(28);
    const paginasBase = Object.keys(paginasUnicas).map(pagina => {
      const encontrada = todasPaginas.find(p => p.pagina === pagina);
      return {
        pagina,
        posicionBase: encontrada ? encontrada.posicion : null,
        clicsBase: encontrada ? encontrada.clics : 0,
        impresionesBase: encontrada ? encontrada.impresiones : 0,
      };
    });

    const diagActual = await getDiagnostico(28);
    const totalClicsBase = diagActual.resumen.totalClics;

    // Snapshot completo del sitio (todas las paginas + todas las keywords) para poder
    // comparar el ciclo completo contra hoy, no solo las paginas que este plan toco
    const todasKeywords = await getTodasLasKeywords(28);

    guardarEnHistorial({
      id: historialId,
      fechaGuardado: new Date().toISOString(),
      articulosCount: items.length,
      totalClicsBase,
      proyeccion30: tasaDiariaReal ? Math.round(tasaDiariaReal * 30) : Math.round(totalClicsBase * 0.08),
      proyeccion60: tasaDiariaReal ? Math.round(tasaDiariaReal * 60) : Math.round(totalClicsBase * 0.20),
      proyeccion90: tasaDiariaReal ? Math.round(tasaDiariaReal * 90) : Math.round(totalClicsBase * 0.35),
      paginasBase,
      snapshotCompleto: {
        paginas: todasPaginas,
        keywords: todasKeywords,
      },
    });

    // Empujar cada articulo del plan a la cola como pendiente automatico (sin generar contenido aun)
    items.forEach(item => {
      agregarACola({
        tema: item.tema,
        marca: item.marca || '',
        carpeta: item.carpeta || 'blog',
        fechaProgramada: item.fecha,
        enlazarA: item.enlazarA || null,
        estado: 'pendiente_auto',
      });
    });

    res.json({ ok: true, data });
  } catch(err) {
    res.json({ ok: false, error: err.message });
  }
});

// Elimina una estrategia guardada del historial
app.delete('/seo/estrategia/historial/:id', (req, res) => {
  try {
    const ok = eliminarDeHistorial(req.params.id);
    const planActual = cargarPlan();
    if (planActual && planActual.historialId === req.params.id) {
      limpiarPlan();
    }
    res.json({ ok });
  } catch(err) {
    res.json({ ok: false, error: err.message });
  }
});

// Lista de estrategias guardadas (mas reciente primero)
app.get('/seo/estrategia/historial', (req, res) => {
  try {
    const historial = cargarHistorial();
    res.json({ ok: true, data: historial.slice().reverse() });
  } catch(err) {
    res.json({ ok: false, error: err.message });
  }
});

// Comparativa proyectado vs real de una estrategia guardada
// Calcula la auditoria (proyectado vs real) de una entrada del historial, en el momento en que se llama.
// Se usa tanto para ver el resultado EN VIVO de un ciclo activo, como para CONGELAR el resultado
// de un ciclo que se esta cerrando (se guarda ese resultado y no se vuelve a recalcular despues).
async function calcularAuditoria(entrada) {
  const fechaReferencia = entrada.fechaCierre ? new Date(entrada.fechaCierre) : new Date();
  const diasTranscurridos = Math.floor((fechaReferencia.getTime() - new Date(entrada.fechaGuardado).getTime()) / (1000*60*60*24));

  const diagActual = await getDiagnostico(28);
  const totalClicsActual = diagActual.resumen.totalClics;
  const deltaClicsTotal = totalClicsActual - (entrada.totalClicsBase || 0);

  const todasPaginas = await getTodasLasPaginas(28);

  let comparativaCompleta = null;
  if (entrada.snapshotCompleto && entrada.snapshotCompleto.paginas) {
    comparativaCompleta = entrada.snapshotCompleto.paginas.map(base => {
      const actual = todasPaginas.find(p => p.pagina === base.pagina);
      return {
        pagina: base.pagina,
        posicionBase: base.posicion,
        posicionActual: actual ? actual.posicion : null,
        clicsBase: base.clics,
        clicsActual: actual ? actual.clics : 0,
      };
    });
  }

  const comparativa = entrada.paginasBase.map(base => {
    const actual = todasPaginas.find(p => p.pagina === base.pagina);
    return {
      pagina: base.pagina,
      posicionBase: base.posicionBase,
      posicionActual: actual ? actual.posicion : null,
      clicsBase: base.clicsBase,
      clicsActual: actual ? actual.clics : 0,
    };
  });

  let proyeccionRelevante = entrada.proyeccion30;
  let hito = 30;
  if (diasTranscurridos >= 90) { proyeccionRelevante = entrada.proyeccion90; hito = 90; }
  else if (diasTranscurridos >= 60) { proyeccionRelevante = entrada.proyeccion60; hito = 60; }

  const cumplimiento = proyeccionRelevante > 0 ? Math.round((deltaClicsTotal / proyeccionRelevante) * 100) : null;

  const fuenteResumen = comparativaCompleta || comparativa;
  let paginasMejoraronClics = 0;
  let paginasMejoraronPosicion = 0;
  let paginasConDatos = 0;
  for (const p of fuenteResumen) {
    if (p.posicionActual !== null) {
      paginasConDatos++;
      if (p.clicsActual > p.clicsBase) paginasMejoraronClics++;
      if (p.posicionActual < p.posicionBase) paginasMejoraronPosicion++;
    }
  }
  const resumen = {
    totalPaginas: fuenteResumen.length,
    paginasConDatos,
    paginasMejoraronClics,
    paginasMejoraronPosicion,
    esSitioCompleto: !!comparativaCompleta,
  };

  return {
    fechaGuardado: entrada.fechaGuardado,
    diasTranscurridos,
    hito,
    totalClicsBase: entrada.totalClicsBase,
    totalClicsActual,
    deltaClicsTotal,
    proyeccion30: entrada.proyeccion30,
    proyeccion60: entrada.proyeccion60,
    proyeccion90: entrada.proyeccion90,
    cumplimiento,
    resumen,
    comparativa,
  };
}

app.get('/seo/estrategia/auditoria/:id', async (req, res) => {
  try {
    const historial = cargarHistorial();
    const entrada = historial.find(h => h.id === req.params.id);
    if (!entrada) return res.json({ ok: false, error: 'No se encontro esa estrategia guardada' });

    // Si el ciclo ya esta cerrado, devolvemos el resultado que quedo congelado al momento de cerrar
    // (no se vuelve a calcular con la fecha de hoy)
    if (entrada.cerrado && entrada.resultadoFinal) {
      return res.json({ ok: true, data: { ...entrada.resultadoFinal, cerrado: true, fechaCierre: entrada.fechaCierre } });
    }

    const data = await calcularAuditoria(entrada);
    res.json({ ok: true, data: { ...data, cerrado: false } });
  } catch(err) {
    res.json({ ok: false, error: err.message });
  }
});
