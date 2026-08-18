const { subirArchivo } = require('./src/publisher');
const fs = require('fs');
const https = require('https');

const dominio = 'reparaciondeportones.cl';
const fontsDir = '/Users/macos/Desktop/Programacion/magenta-seo/fonts';

// Ver qué hay en /fonts/
function listarFonts() {
  return new Promise((resolve) => {
    https.get(`https://${dominio}/fonts/`, { timeout: 8000 }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve({ status: res.statusCode, body: data }));
    }).on('error', () => resolve({ status: 'ERR', body: '' }));
  });
}

// Verificar si un archivo existe
function check(url) {
  return new Promise((resolve) => {
    https.get(url, { timeout: 5000 }, (res) => {
      resolve(res.statusCode === 200);
    }).on('error', () => resolve(false));
  });
}

async function main() {
  console.log('📂 Revisando qué hay en /fonts/...\n');
  
  const listing = await listarFonts();
  console.log(`Status: ${listing.status}`);
  
  if (listing.body.includes('<title>Index of') || listing.body.includes('Directory Listing')) {
    console.log('✅ Directory listing activo\n');
    // Extraer archivos
    const matches = listing.body.match(/href="([^"]+\.(ttf|woff|woff2|eot))"/gi) || [];
    console.log('Archivos encontrados:');
    matches.forEach(m => console.log(`   ${m}`));
  } else {
    console.log('❌ No hay directory listing (o es una página 404 custom)\n');
  }
  
  // Subir fuentes Poppins a /fonts/
  const fonts = [
    'Poppins-Light.ttf',
    'Poppins-Regular.ttf',
    'Poppins-Medium.ttf',
    'Poppins-SemiBold.ttf',
    'Poppins-Bold.ttf',
    'Poppins-Italic.ttf'
  ];
  
  console.log('\n📤 SUBIENDO FUENTES A /fonts/...\n');
  
  for (const font of fonts) {
    const localPath = `${fontsDir}/${font}`;
    
    if (!fs.existsSync(localPath)) {
      console.log(`⚠️  No existe: ${localPath}`);
      continue;
    }
    
    try {
      console.log(`⬆️  ${font}...`);
      await subirArchivo(`fonts/${font}`, fs.readFileSync(localPath));
      
      // Verificar
      await new Promise(r => setTimeout(r, 1500));
      const url = `https://${dominio}/fonts/${font}`;
      const ok = await check(url);
      console.log(`   ${ok ? '✅' : '❌'} ${url}`);
      
    } catch (err) {
      console.log(`   ❌ Error: ${err.message}`);
    }
  }
  
  console.log('\n🎉 Proceso completado');
}

main();
