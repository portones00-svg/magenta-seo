const { getAuthenticatedClient } = require('./gsc-auth');
const { google } = require('googleapis');

const SITE_URL = (process.env.SITE_URL || 'https://www.reparaciondeportones.cl').replace(/\/+$/, '') + '/';

const KEYWORDS_OBJETIVO = [
  'reparacion porton electrico','tecnico porton electrico','arreglo porton electrico',
  'servicio tecnico porton electrico','mantencion porton electrico',
  'reparacion de portones electricos','bft chile','motor centurion',
  'porton automatico chicureo','porton automatico no abre que revisar',
  'falla motor porton automatico','instalacion portones automaticos',
  'motores nice','sensor de porton no funciona','faac chile','motor faac',
  'motores faac','servicio tecnico faac chile','nice chile','portones las condes',
  'tecnico porton las condes','reparacion porton vitacura','tecnico porton la reina',
  'instalacion motor porton lo barnechea','portones antofagasta','portones concepcion',
  'reparacion urgente portones',
];

function formatDate(d) { return d.toISOString().split('T')[0]; }

function restarDias(dias) {
  const d = new Date();
  d.setDate(d.getDate() - dias);
  return d;
}

function esQueryValida(q) {
  if (!q) return false;
  if (q.length > 80) return false;
  if (/^i am a /i.test(q)) return false;
  if (/my (main )?(motivations|pain points|job seniority)/i.test(q)) return false;
  return true;
}

async function queryKeywords(startDate, endDate, rowLimit = 25000) {
  const auth = await getAuthenticatedClient();
  const searchconsole = google.webmasters({ version: 'v3', auth });
  const res = await searchconsole.searchanalytics.query({
    siteUrl: SITE_URL,
    requestBody: {
      startDate: formatDate(startDate),
      endDate: formatDate(endDate),
      dimensions: ['query'],
      rowLimit
    }
  });
  const rows = res.data.rows || [];
  return rows.filter(r => esQueryValida(r.keys[0]));
}

// ─── Diagnóstico general (dashboard resumen) ──────────────────────────────
async function getDiagnostico(dias = 28) {
  const auth = await getAuthenticatedClient();
  const searchconsole = google.webmasters({ version: 'v3', auth });

  const endDate = new Date();
  const startDate = restarDias(dias);

  const [generalRes, queryRes, pageRes] = await Promise.all([
    searchconsole.searchanalytics.query({
      siteUrl: SITE_URL,
      requestBody: { startDate: formatDate(startDate), endDate: formatDate(endDate), dimensions: ['date'], rowLimit: 90 }
    }),
    searchconsole.searchanalytics.query({
      siteUrl: SITE_URL,
      requestBody: { startDate: formatDate(startDate), endDate: formatDate(endDate), dimensions: ['query'], rowLimit: 25000 }
    }),
    searchconsole.searchanalytics.query({
      siteUrl: SITE_URL,
      requestBody: { startDate: formatDate(startDate), endDate: formatDate(endDate), dimensions: ['page'], rowLimit: 50 }
    })
  ]);

  const queries = (queryRes.data.rows || []).filter(r => esQueryValida(r.keys[0]));
  const pages = pageRes.data.rows || [];
  const dailyData = generalRes.data.rows || [];

  const totalClics = queries.reduce((s, r) => s + r.clicks, 0);
  const totalImpresiones = queries.reduce((s, r) => s + r.impressions, 0);
  const posPromedio = totalImpresiones > 0
    ? (queries.reduce((s, r) => s + r.position * r.impressions, 0) / totalImpresiones).toFixed(1)
    : 0;

  const ganadas = queries.filter(r => r.position <= 3).sort((a,b) => b.impressions - a.impressions);
  const oportunidad = queries.filter(r => r.position > 3 && r.position <= 10).sort((a,b) => b.impressions - a.impressions);
  const rescatar = queries.filter(r => r.position > 10 && r.position <= 20).sort((a,b) => b.impressions - a.impressions);

  const kwMonitor = KEYWORDS_OBJETIVO.map(kw => {
    const found = queries.find(r => r.keys[0].toLowerCase().includes(kw.toLowerCase()) ||
                                    kw.toLowerCase().includes(r.keys[0].toLowerCase()));
    return {
      keyword: kw,
      clics: found?.clicks || 0,
      impresiones: found?.impressions || 0,
      posicion: found ? parseFloat(found.position.toFixed(1)) : null,
      ctr: found ? parseFloat((found.ctr * 100).toFixed(1)) : 0,
    };
  }).sort((a,b) => (b.impresiones - a.impresiones));

  const paginasTop = pages
    .sort((a,b) => b.clicks - a.clicks)
    .slice(0, 15)
    .map(p => ({
      url: p.keys[0].replace(SITE_URL, '/'),
      clics: p.clicks,
      impresiones: p.impressions,
      posicion: parseFloat(p.position.toFixed(1)),
      ctr: parseFloat((p.ctr * 100).toFixed(1))
    }));

  const semanas = [];
  for (let i = 0; i < 4; i++) {
    const semStart = new Date(); semStart.setDate(semStart.getDate() - (i+1)*7);
    const semEnd = new Date(); semEnd.setDate(semEnd.getDate() - i*7);
    const datos = dailyData.filter(r => {
      const d = new Date(r.keys[0]);
      return d >= semStart && d < semEnd;
    });
    semanas.unshift({
      semana: `S${4-i}`,
      clics: datos.reduce((s,r) => s + r.clicks, 0),
      impresiones: datos.reduce((s,r) => s + r.impressions, 0),
    });
  }

  const recomendaciones = [];
  oportunidad.filter(r => r.position <= 8 && r.impressions > 100).slice(0,3).forEach(r => {
    recomendaciones.push({
      tipo: 'quick_win', prioridad: 'alta', keyword: r.keys[0], posicion: r.position.toFixed(1),
      accion: `Publicar artículo específico para "${r.keys[0]}" — posición ${r.position.toFixed(1)} con ${r.impressions} impresiones`
    });
  });
  rescatar.filter(r => r.position <= 15 && r.impressions > 50).slice(0,3).forEach(r => {
    recomendaciones.push({
      tipo: 'rescatar', prioridad: 'media', keyword: r.keys[0], posicion: r.position.toFixed(1),
      accion: `Optimizar página existente para "${r.keys[0]}" — está en posición ${r.position.toFixed(1)}, a un paso de primera página`
    });
  });

  return {
    resumen: { totalClics, totalImpresiones, posPromedio, dias },
    ganadas: ganadas.slice(0, 10),
    oportunidad: oportunidad.slice(0, 15),
    rescatar: rescatar.slice(0, 10),
    kwMonitor, paginasTop, semanas, recomendaciones,
    generadoEn: new Date().toISOString()
  };
}

// ─── TODAS las keywords, sin recortar (para el panel de Diagnóstico) ─────
async function getTodasLasKeywords(dias = 28) {
  const endDate = new Date();
  const startDate = restarDias(dias);
  const queries = await queryKeywords(startDate, endDate);
  return queries.map(r => ({
    keyword: r.keys[0],
    clics: r.clicks,
    impresiones: r.impressions,
    ctr: parseFloat((r.ctr * 100).toFixed(2)),
    posicion: parseFloat(r.position.toFixed(1)),
  })).sort((a,b) => b.impresiones - a.impresiones);
}

// ─── Comparativa vs 30/60/90 días (ventanas de 7 días para reducir ruido) ─
async function getComparativaHistorica() {
  const hoy = new Date();
  const ventana = async (finOffset, inicioOffset) => {
    const fin = restarDias(finOffset);
    const inicio = restarDias(inicioOffset);
    return queryKeywords(inicio, fin);
  };

  const [actual, hace30, hace60, hace90] = await Promise.all([
    ventana(0, 7),
    ventana(30, 37),
    ventana(60, 67),
    ventana(90, 97),
  ]);

  const mapa = {};
  const indexar = (rows, campo) => {
    rows.forEach(r => {
      const kw = r.keys[0];
      if (!mapa[kw]) mapa[kw] = { keyword: kw };
      mapa[kw][campo] = parseFloat(r.position.toFixed(1));
    });
  };

  indexar(actual, 'posActual');
  indexar(hace30, 'pos30');
  indexar(hace60, 'pos60');
  indexar(hace90, 'pos90');

  return Object.values(mapa)
    .filter(r => r.posActual !== undefined)
    .map(r => ({
      ...r,
      delta30: r.pos30 !== undefined ? parseFloat((r.pos30 - r.posActual).toFixed(1)) : null,
      delta60: r.pos60 !== undefined ? parseFloat((r.pos60 - r.posActual).toFixed(1)) : null,
      delta90: r.pos90 !== undefined ? parseFloat((r.pos90 - r.posActual).toFixed(1)) : null,
    }))
    .sort((a,b) => a.posActual - b.posActual);
}

// ─── Comparativa custom entre dos rangos de fecha elegidos por el usuario ─
async function getComparativaCustom(desdeA, hastaA, desdeB, hastaB) {
  const [rowsA, rowsB] = await Promise.all([
    queryKeywords(new Date(desdeA), new Date(hastaA)),
    queryKeywords(new Date(desdeB), new Date(hastaB)),
  ]);

  const mapa = {};
  rowsA.forEach(r => {
    mapa[r.keys[0]] = { keyword: r.keys[0], posA: parseFloat(r.position.toFixed(1)), clicsA: r.clicks, impA: r.impressions };
  });
  rowsB.forEach(r => {
    if (!mapa[r.keys[0]]) mapa[r.keys[0]] = { keyword: r.keys[0] };
    mapa[r.keys[0]].posB = parseFloat(r.position.toFixed(1));
    mapa[r.keys[0]].clicsB = r.clicks;
    mapa[r.keys[0]].impB = r.impressions;
  });

  return Object.values(mapa)
    .map(r => ({
      ...r,
      delta: (r.posA !== undefined && r.posB !== undefined) ? parseFloat((r.posB - r.posA).toFixed(1)) : null
    }))
    .sort((a,b) => (a.posA ?? 999) - (b.posA ?? 999));
}

module.exports = {
  getDiagnostico, getTodasLasKeywords, getComparativaHistorica,
  getComparativaCustom, KEYWORDS_OBJETIVO
};
