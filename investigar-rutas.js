const https = require('https');

const dominio = 'reparaciondeportones.cl';

// Rutas posibles donde podrían estar las fuentes
const rutasFuentes = [
  // fonts/ (plural)
  '/fonts/Poppins-Regular.ttf',
  '/fonts/Poppins-Medium.ttf',
  '/fonts/Poppins-SemiBold.ttf',
  '/fonts/Poppins-Bold.ttf',
  '/fonts/Poppins-Light.ttf',
  '/fonts/Poppins-Italic.ttf',
  // font/ (singular)
  '/font/Poppins-Regular.ttf',
  '/font/Poppins-Medium.ttf',
  '/font/Poppins-SemiBold.ttf',
  '/font/Poppins-Bold.ttf',
  '/font/Poppins-Light.ttf',
  '/font/Poppins-Italic.ttf',
  // public/
  '/public/fonts/Poppins-Regular.ttf',
  '/public/font/Poppins-Regular.ttf',
  // public_html/
  '/public_html/fonts/Poppins-Regular.ttf',
  '/public_html/font/Poppins-Regular.ttf',
  // assets/
  '/assets/fonts/Poppins-Regular.ttf',
  '/assets/font/Poppins-Regular.ttf',
  // css/
  '/css/fonts/Poppins-Regular.ttf',
  // webfonts/
  '/webfonts/Poppins-Regular.ttf',
  // root
  '/Poppins-Regular.ttf'
];

function checkURL(url) {
  return new Promise((resolve) => {
    const req = https.get(url, { timeout: 5000 }, (res) => {
      const size = parseInt(res.headers['content-length']) || 0;
      resolve({ 
        url: url.replace(`https://${dominio}`, ''), 
        status: res.statusCode, 
        size: size,
        type: res.headers['content-type'] || 'unknown'
      });
    });
    req.on('error', () => resolve({ url: url.replace(`https://${dominio}`, ''), status: 'ERROR', size: 0 }));
    req.on('timeout', () => { req.destroy(); resolve({ url: url.replace(`https://${dominio}`, ''), status: 'TIMEOUT', size: 0 }); });
  });
}

function fetchHTML() {
  return new Promise((resolve) => {
    https.get(`https://${dominio}/a-domicilio-en-puente-alto.html`, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(data));
    }).on('error', () => resolve(''));
  });
}

async function main() {
  console.log('🔍 INVESTIGANDO RUTAS DE FUENTES\n');
  
  // 1. Verificar rutas directas
  console.log('=== PRUEBA DE RUTAS DIRECTAS ===\n');
  
  const promesas = rutasFuentes.map(r => checkURL(`https://${dominio}${r}`));
  const resultados = await Promise.all(promesas);
  
  const encontrados = resultados.filter(r => r.status === 200);
  const noEncontrados = resultados.filter(r => r.status !== 200);
  
  if (encontrados.length > 0) {
    console.log('✅ FUENTES ENCONTRADAS:\n');
    encontrados.forEach(r => {
      const kb = (r.size / 1024).toFixed(1);
      console.log(`   📄 ${r.url}`);
      console.log(`      Status: ${r.status} | Tamaño: ${kb} KB | Tipo: ${r.type}\n`);
    });
  } else {
    console.log('❌ Ninguna fuente encontrada en rutas estándar\n');
  }
  
  // 2. Revisar HTML para ver qué rutas intenta cargar
  console.log('=== ANÁLISIS DEL HTML ===\n');
  
  const html = await fetchHTML();
  
  if (!html) {
    console.log('❌ No se pudo obtener el HTML');
    return;
  }
  
  // Buscar referencias a fuentes
  const fontMatches = html.match(/url\([^)]*\.(ttf|woff|woff2|eot)[^)]*\)/gi) || [];
  const googleFontLink = html.match(/fonts\.googleapis\.com[^"]*/);
  const fontFaceMatches = html.match(/@font-face[^}]+}/gi) || [];
  
  console.log(`HTML cargado: ${html.length} bytes\n`);
  
  if (googleFontLink) {
    console.log('⚠️  AÚN USA GOOGLE FONTS:');
    console.log(`   ${googleFontLink[0]}\n`);
  }
  
  if (fontMatches.length > 0) {
    console.log('🔗 RUTAS DE FUENTES ENCONTRADAS EN CSS:');
    fontMatches.forEach((m, i) => {
      console.log(`   ${i + 1}. ${m}`);
    });
    console.log('');
  }
  
  if (fontFaceMatches.length > 0) {
    console.log(`📝 @font-face declarations: ${fontFaceMatches.length}\n`);
    fontFaceMatches.slice(0, 3).forEach((f, i) => {
      console.log(`   #${i + 1}: ${f.substring(0, 100)}...`);
    });
  }
  
  // 3. Buscar archivos .ttf mencionados en cualquier parte
  const allTTF = html.match(/[^"'\s]+\.ttf[^"'\s]*/g) || [];
  if (allTTF.length > 0) {
    console.log('\n📦 TODAS LAS REFERENCIAS A .TTF:');
    [...new Set(allTTF)].forEach(t => console.log(`   ${t}`));
  }
  
  // 4. Resumen
  console.log('\n' + '='.repeat(50));
  console.log('📊 RESUMEN:');
  console.log(`   Fuentes encontradas en servidor: ${encontrados.length}`);
  console.log(`   Referencias en HTML: ${fontMatches.length + allTTF.length}`);
  
  if (encontrados.length === 0 && fontMatches.length === 0) {
    console.log('\n🔴 CONCLUSIÓN: Las fuentes NO están subidas o el HTML no las referencia');
    console.log('   Solución: Subir fuentes a fonts/ y actualizar el HTML');
  } else if (encontrados.length > 0) {
    const rutaBase = encontrados[0].url.replace('/Poppins-Regular.ttf', '').replace('/Poppins-Medium.ttf', '');
    console.log(`\n✅ CONCLUSIÓN: Las fuentes están en: ${rutaBase}`);
    console.log('   Actualiza el HTML para usar esta ruta');
  }
}

main();
