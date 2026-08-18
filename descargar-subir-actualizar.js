const { subirArchivo } = require('./src/publisher');
const fs = require('fs');
const https = require('https');

const dominio = 'reparaciondeportones.cl';
const fontsDir = '/Users/macos/Desktop/Programacion/magenta-seo/fonts';

const fonts = [
  'Poppins-Light.ttf',
  'Poppins-Regular.ttf',
  'Poppins-Medium.ttf',
  'Poppins-SemiBold.ttf',
  'Poppins-Bold.ttf',
  'Poppins-Italic.ttf'
];

function check(url) {
  return new Promise((resolve) => {
    https.get(url, { timeout: 5000 }, (res) => resolve(res.statusCode === 200))
         .on('error', () => resolve(false));
  });
}

async function main() {
  console.log('📤 SUBIENDO FUENTES Y ACTUALIZANDO HTML...\n');
  
  // 1. Subir fuentes
  for (const font of fonts) {
    const localPath = `${fontsDir}/${font}`;
    
    if (!fs.existsSync(localPath)) {
      console.log(`⚠️  No existe: ${font} - DESCÁRGALA PRIMERO`);
      continue;
    }
    
    try {
      await subirArchivo(`fonts/${font}`, fs.readFileSync(localPath));
      console.log(`✅ fonts/${font} subido`);
    } catch (err) {
      console.log(`❌ Error subiendo ${font}: ${err.message}`);
    }
  }
  
  // 2. Esperar y verificar
  console.log('\n⏳ Verificando fuentes en servidor...');
  await new Promise(r => setTimeout(r, 3000));
  
  for (const font of fonts) {
    const url = `https://${dominio}/fonts/${font}`;
    const ok = await check(url);
    console.log(`${ok ? '✅' : '❌'} ${url}`);
  }
  
  // 3. Actualizar HTML - quitar Google Fonts, poner locales
  console.log('\n📝 Actualizando HTML...');
  
  let html = fs.readFileSync('/Users/macos/Downloads/a-domicilio-en-puente-alto-ORIGINAL.html', 'utf8');
  
  // Eliminar links de Google Fonts
  html = html.replace(/<link rel="preconnect" href="https:\/\/fonts\.googleapis\.com">\n?/g, '');
  html = html.replace(/<link rel="preconnect" href="https:\/\/fonts\.gstatic\.com" crossorigin="">\n?/g, '');
  html = html.replace(/<link href="https:\/\/fonts\.googleapis\.com\/css2\?family=Poppins[^"]*" rel="stylesheet">\n?/g, '');
  
  // CSS de fuentes locales (inline, minificado)
  const fontCSS = `@font-face{font-family:'Poppins';font-style:normal;font-weight:300;font-display:swap;src:url(fonts/Poppins-Light.ttf)format('truetype')}@font-face{font-family:'Poppins';font-style:normal;font-weight:400;font-display:swap;src:url(fonts/Poppins-Regular.ttf)format('truetype')}@font-face{font-family:'Poppins';font-style:normal;font-weight:500;font-display:swap;src:url(fonts/Poppins-Medium.ttf)format('truetype')}@font-face{font-family:'Poppins';font-style:normal;font-weight:600;font-display:swap;src:url(fonts/Poppins-SemiBold.ttf)format('truetype')}@font-face{font-family:'Poppins';font-style:normal;font-weight:700;font-display:swap;src:url(fonts/Poppins-Bold.ttf)format('truetype')}@font-face{font-family:'Poppins';font-style:italic;font-weight:300;font-display:swap;src:url(fonts/Poppins-Italic.ttf)format('truetype')}@font-face{font-family:'Poppins';font-style:italic;font-weight:400;font-display:swap;src:url(fonts/Poppins-Italic.ttf)format('truetype')}@font-face{font-family:'Poppins';font-style:italic;font-weight:500;font-display:swap;src:url(fonts/Poppins-Italic.ttf)format('truetype')}@font-face{font-family:'Poppins';font-style:italic;font-weight:600;font-display:swap;src:url(fonts/Poppins-Italic.ttf)format('truetype')}@font-face{font-family:'Poppins';font-style:italic;font-weight:700;font-display:swap;src:url(fonts/Poppins-Italic.ttf)format('truetype')}`;
  
  // Insertar después de <meta charset="utf-8">
  html = html.replace('<meta charset="utf-8">', `<meta charset="utf-8">\n<style>${fontCSS}</style>`);
  
  // 4. Subir HTML actualizado
  await subirArchivo('a-domicilio-en-puente-alto.html', html);
  console.log('✅ a-domicilio-en-puente-alto.html actualizado con fuentes locales');
  
  // 5. Verificar final
  console.log('\n🔍 Verificación final...');
  const htmlOk = await check(`https://${dominio}/a-domicilio-en-puente-alto.html`);
  console.log(`${htmlOk ? '✅' : '❌'} HTML accesible`);
  
  const fontOk = await check(`https://${dominio}/fonts/Poppins-Regular.ttf`);
  console.log(`${fontOk ? '✅' : '❌'} Fuente Regular accesible`);
}

main().catch(console.error);
