const https = require('https');

const dominio = 'reparaciondeportones.cl';

// Lista masiva de rutas posibles donde podrían estar las fuentes
const rutas = [
  // Tu public_html (donde subiste antes)
  '/public_html/fonts/Poppins-Regular.ttf',
  '/public_html/font/Poppins-Regular.ttf',
  '/public_html/Poppins-Regular.ttf',
  
  // Raíz del dominio
  '/Poppins-Regular.ttf',
  '/fonts/Poppins-Regular.ttf',
  '/font/Poppins-Regular.ttf',
  
  // Carpetas comunes de hosting
  '/public/fonts/Poppins-Regular.ttf',
  '/public/font/Poppins-Regular.ttf',
  '/www/fonts/Poppins-Regular.ttf',
  '/www/font/Poppins-Regular.ttf',
  '/html/fonts/Poppins-Regular.ttf',
  '/html/font/Poppins-Regular.ttf',
  
  // Subcarpetas de tu proyecto
  '/magenta-seo/fonts/Poppins-Regular.ttf',
  '/magenta-seo/font/Poppins-Regular.ttf',
  '/reparaciondeportones/fonts/Poppins-Regular.ttf',
  '/reparaciondeportones/font/Poppins-Regular.ttf',
  
  // Rutas relativas al HTML actual
  '/a-domicilio-en-puente-alto/fonts/Poppins-Regular.ttf',
  '/a-domicilio-en-puente-alto/font/Poppins-Regular.ttf',
  
  // Otras variantes
  '/assets/fonts/Poppins-Regular.ttf',
  '/assets/font/Poppins-Regular.ttf',
  '/css/fonts/Poppins-Regular.ttf',
  '/css/font/Poppins-Regular.ttf',
  '/styles/fonts/Poppins-Regular.ttf',
  '/styles/font/Poppins-Regular.ttf',
  '/webfonts/Poppins-Regular.ttf',
  '/webfont/Poppins-Regular.ttf',
  '/fonts/poppins/Poppins-Regular.ttf',
  '/font/poppins/Poppins-Regular.ttf',
  '/uploads/fonts/Poppins-Regular.ttf',
  '/uploads/font/Poppins-Regular.ttf',
  '/media/fonts/Poppins-Regular.ttf',
  '/media/font/Poppins-Regular.ttf',
  '/resources/fonts/Poppins-Regular.ttf',
  '/resources/font/Poppins-Regular.ttf',
  '/static/fonts/Poppins-Regular.ttf',
  '/static/font/Poppins-Regular.ttf',
  '/dist/fonts/Poppins-Regular.ttf',
  '/dist/font/Poppins-Regular.ttf',
  '/build/fonts/Poppins-Regular.ttf',
  '/build/font/Poppins-Regular.ttf',
  
  // Con guiones bajos
  '/public_html/fonts/Poppins_Regular.ttf',
  '/public_html/font/Poppins_Regular.ttf',
  
  // En minúsculas
  '/public_html/fonts/poppins-regular.ttf',
  '/public_html/font/poppins-regular.ttf',
  
  // Carpeta images (a veces se mezcla)
  '/images/fonts/Poppins-Regular.ttf',
  '/images/font/Poppins-Regular.ttf',
];

function check(url) {
  return new Promise((resolve) => {
    const req = https.get(url, { timeout: 8000 }, (res) => {
      const size = parseInt(res.headers['content-length']) || 0;
      const type = res.headers['content-type'] || 'unknown';
      resolve({ url: url.replace(`https://${dominio}`, ''), status: res.statusCode, size, type });
    });
    req.on('error', () => resolve({ url: url.replace(`https://${dominio}`, ''), status: 'ERR', size: 0, type: '' }));
    req.on('timeout', () => { req.destroy(); resolve({ url: url.replace(`https://${dominio}`, ''), status: 'TMO', size: 0, type: '' }); });
  });
}

async function main() {
  console.log('🔍 BUSCANDO FUENTES EN EL HOSTING...\n');
  console.log(`Dominio: ${dominio}`);
  console.log(`Rutas a probar: ${rutas.length}\n`);
  
  const promesas = rutas.map(r => check(`https://${dominio}${r}`));
  const resultados = await Promise.all(promesas);
  
  const ok = resultados.filter(r => r.status === 200);
  const otros = resultados.filter(r => r.status !== 200 && r.status !== 'ERR' && r.status !== 'TMO');
  
  if (ok.length > 0) {
    console.log(`✅ ENCONTRADAS (${ok.length}):\n`);
    ok.forEach(r => {
      const kb = (r.size / 1024).toFixed(1);
      console.log(`   📄 ${r.url}`);
      console.log(`      Status: ${r.status} | ${kb} KB | ${r.type}\n`);
    });
    
    // Extraer la ruta base
    const rutaEjemplo = ok[0].url;
    const base = rutaEjemplo.substring(0, rutaEjemplo.lastIndexOf('/'));
    console.log(`🎯 RUTA BASE DETECTADA: ${base}/`);
    
  } else {
    console.log('❌ NINGUNA FUENTE ENCONTRADA EN EL SERVIDOR\n');
    console.log('   Posibles causas:');
    console.log('   1. Las fuentes NO se subieron correctamente');
    console.log('   2. Están en una ruta no estándar');
    console.log('   3. El FTP las subió a otra carpeta\n');
    
    if (otros.length > 0) {
      console.log('   Respuestas del servidor (no 200):');
      otros.slice(0, 10).forEach(r => {
        console.log(`   ${r.status} → ${r.url}`);
      });
    }
  }
  
  // También verificar si existe carpeta fonts/ con index o listing
  console.log('\n🔍 Verificando si hay directory listing en fonts/...');
  const dirCheck = await check(`https://${dominio}/fonts/`);
  console.log(`   /fonts/ → ${dirCheck.status}`);
  
  const dirCheck2 = await check(`https://${dominio}/font/`);
  console.log(`   /font/ → ${dirCheck2.status}`);
  
  const dirCheck3 = await check(`https://${dominio}/public_html/fonts/`);
  console.log(`   /public_html/fonts/ → ${dirCheck3.status}`);
}

main();
