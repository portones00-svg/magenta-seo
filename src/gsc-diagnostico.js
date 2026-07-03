const { google } = require('googleapis');
const { getAuthenticatedClient } = require('./gsc-auth');

const SITE_URL = 'https://www.reparaciondeportones.cl/';

// Keywords que queremos monitorear (basadas en análisis previo de Search Console)
const KEYWORDS_OBJETIVO = [
  // Core keywords — alta prioridad
  'reparacion de portones electricos',
  'reparacion porton electrico',
  'tecnico porton electrico',
  'arreglo porton electrico',
  'mantencion porton electrico',
  'servicio tecnico porton electrico',
  // Marcas
  'faac chile',
  'motor faac',
  'motores faac',
  'servicio tecnico faac chile',
  'nice chile',
  'motores nice',
  'bft chile',
  'motor centurion',
  // Ubicaciones
  'portones las condes',
  'tecnico porton las condes',
  'reparacion porton vitacura',
  'tecnico porton la reina',
  'instalacion motor porton lo barnechea',
  'porton automatico chicureo',
  'portones antofagasta',
  'portones concepcion',
  // Long tail
  'porton automatico no abre que revisar',
  'falla motor porton automatico',
  'sensor de porton no funciona',
  'reparacion urgente portones',
  'instalacion portones automaticos',
];

async function getDiagnostico(dias = 28) {
  const auth = await getAuthenticatedClient();
  const searchconsole = google.webmasters({ version: 'v3', auth });

  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - dias);

  const formatDate = d => d.toISOString().split('T')[0];

  // 1. Datos generales del sitio
  const [generalRes, queryRes, pageRes] = await Promise.all([
    searchconsole.searchanalytics.query({
      siteUrl: SITE_URL,
      requestBody: {
        startDate: formatDate(startDate),
        endDate: formatDate(endDate),
        dimensions: ['date'],
        rowLimit: 90
      }
    }),
    searchconsole.searchanalytics.query({
      siteUrl: SITE_URL,
      requestBody: {
        startDate: formatDate(startDate),
        endDate: formatDate(endDate),
        dimensions: ['query'],
        rowLimit: 100
      }
    }),
    searchconsole.searchanalytics.query({
      siteUrl: SITE_URL,
      requestBody: {
        startDate: formatDate(startDate),
        endDate: formatDate(endDate),
        dimensions: ['page'],
        rowLimit: 50
      }
    })
  ]);

  const queries = queryRes.data.rows || [];
  const pages = pageRes.data.rows || [];
  const dailyData = generalRes.data.rows || [];

  // 2. Métricas generales
  const totalClics = queries.reduce((s, r) => s + r.clicks, 0);
  const totalImpresiones = queries.reduce((s, r) => s + r.impressions, 0);
  const posPromedio = queries.length > 0
    ? (queries.reduce((s, r) => s + r.position * r.impressions, 0) / totalImpresiones).toFixed(1)
    : 0;

  // 3. Clasificar keywords por oportunidad
  const ganadas = queries.filter(r => r.position <= 3).sort((a,b) => b.impressions - a.impressions);
  const oportunidad = queries.filter(r => r.position > 3 && r.position <= 10).sort((a,b) => b.impressions - a.impressions);
  const rescatar = queries.filter(r => r.position > 10 && r.position <= 20).sort((a,b) => b.impressions - a.impressions);

  // 4. Keywords objetivo — ver su posición actual
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

  // 5. Páginas top y de oportunidad
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

  // 6. Tendencia semanal (últimas 4 semanas)
  const semanas = [];
  for (let i = 0; i < 4; i++) {
    const semStart = new Date();
    semStart.setDate(semStart.getDate() - (i+1)*7);
    const semEnd = new Date();
    semEnd.setDate(semEnd.getDate() - i*7);
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

  // 7. Recomendaciones automáticas
  const recomendaciones = [];

  // Keywords en posición 4-8 con muchas impresiones = oportunidad inmediata
  const quickWins = oportunidad.filter(r => r.position <= 8 && r.impressions > 100);
  quickWins.slice(0,3).forEach(r => {
    recomendaciones.push({
      tipo: 'quick_win',
      prioridad: 'alta',
      keyword: r.keys[0],
      posicion: r.position.toFixed(1),
      accion: `Publicar artículo específico para "${r.keys[0]}" — posición ${r.position.toFixed(1)} con ${r.impressions} impresiones`
    });
  });

  // Keywords en posición 10-15 = segunda página, rescatables
  const segunda = rescatar.filter(r => r.position <= 15 && r.impressions > 50);
  segunda.slice(0,3).forEach(r => {
    recomendaciones.push({
      tipo: 'rescatar',
      prioridad: 'media',
      keyword: r.keys[0],
      posicion: r.position.toFixed(1),
      accion: `Optimizar página existente para "${r.keys[0]}" — está en posición ${r.position.toFixed(1)}, a un paso de primera página`
    });
  });

  return {
    resumen: { totalClics, totalImpresiones, posPromedio, dias },
    ganadas: ganadas.slice(0, 10),
    oportunidad: oportunidad.slice(0, 15),
    rescatar: rescatar.slice(0, 10),
    kwMonitor,
    paginasTop,
    semanas,
    recomendaciones,
    generadoEn: new Date().toISOString()
  };
}

module.exports = { getDiagnostico, KEYWORDS_OBJETIVO };
