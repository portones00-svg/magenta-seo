const { listarArchivos } = require('./src/publisher');
const fs = require('fs');

(async () => {
  try {
    // Verificar en diferentes rutas posibles
    const rutas = [
      'fonts/',
      'public/fonts/',
      'public_html/fonts/',
      'font/',
      'public/font/',
      'public_html/font/'
    ];
    
    console.log('🔍 Buscando fuentes en el servidor...\n');
    
    for (const ruta of rutas) {
      try {
        const archivos = await listarArchivos(ruta);
        if (archivos && archivos.length > 0) {
          console.log(`✅ ${ruta} - ${archivos.length} archivo(s):`);
          archivos.forEach(f => console.log(`   📄 ${f}`));
        } else {
          console.log(`❌ ${ruta} - vacía o no existe`);
        }
      } catch (err) {
        console.log(`❌ ${ruta} - error: ${err.message}`);
      }
    }
    
    // También verificar la página subida
    console.log('\n📄 Verificando HTML subido...');
    const htmlPath = 'a-domicilio-en-puente-alto.html';
    try {
      const existe = await listarArchivos('.');
      if (existe.includes(htmlPath)) {
        console.log(`✅ ${htmlPath} encontrado en raíz`);
      }
    } catch (e) {
      console.log('No se pudo verificar HTML');
    }
    
  } catch (err) {
    console.log('❌ Error general:', err.message);
  }
})();
