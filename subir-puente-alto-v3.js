const { subirArchivo } = require('./src/publisher');
const fs = require('fs');

(async () => {
  try {
    const html = fs.readFileSync('/Users/macos/Downloads/a-domicilio-en-puente-alto-ORIGINAL.html', 'utf8');
    await subirArchivo('a-domicilio-en-puente-alto.html', html);
    console.log('✅ a-domicilio-en-puente-alto.html subido correctamente - VERSIÓN CON CSS INLINE');
  } catch (err) {
    console.log('❌ Error:', err.message);
  }
})();
