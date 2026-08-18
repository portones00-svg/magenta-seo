const { subirArchivo } = require('./src/publisher');
const fs = require('fs');

(async () => {
  try {
    const html = fs.readFileSync('/Users/macos/Desktop/reparacion-opt/a-domicilio-en-puente-alto-ORIGINAL-COMPLETO.html', 'utf8');
    await subirArchivo('a-domicilio-en-puente-alto.html', html);
    console.log('✅ Página restaurada al estado original');
  } catch (err) {
    console.log('❌ Error:', err.message);
  }
})();
