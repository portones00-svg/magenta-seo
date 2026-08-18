const { subirArchivo } = require('./src/publisher');
const fs = require('fs');

(async () => {
  try {
    // Leer el HTML ORIGINAL (sin tocar)
    const html = fs.readFileSync('/Users/macos/Downloads/a-domicilio-en-puente-alto-ORIGINAL.html', 'utf8');
    
    // Verificar que tiene Google Fonts
    const tieneGoogleFonts = html.includes('fonts.googleapis.com');
    
    if (!tieneGoogleFonts) {
      console.log('⚠️  El original no tiene Google Fonts, revisando...');
      return;
    }
    
    // Subir el original tal cual
    await subirArchivo('a-domicilio-en-puente-alto.html', html);
    
    console.log('✅ HTML restaurado con Google Fonts originales');
    console.log('🔗 https://reparaciondeportones.cl/a-domicilio-en-puente-alto.html');
    
  } catch (err) {
    console.log('❌ Error:', err.message);
  }
})();
