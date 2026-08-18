const { subirArchivo } = require('./src/publisher');
const fs = require('fs');

(async () => {
  const fuentes = [
    { local: 'fonts/poppins-300.woff2', remoto: 'fonts/poppins-300.woff2' },
    { local: 'fonts/poppins-400.woff2', remoto: 'fonts/poppins-400.woff2' },
    { local: 'fonts/poppins-500.woff2', remoto: 'fonts/poppins-500.woff2' },
    { local: 'fonts/poppins-600.woff2', remoto: 'fonts/poppins-600.woff2' },
    { local: 'fonts/poppins-700.woff2', remoto: 'fonts/poppins-700.woff2' },
  ];

  for (const fuente of fuentes) {
    const buffer = fs.readFileSync(fuente.local);
    await subirArchivo(fuente.remoto, buffer);
    console.log(`✅ Subido: ${fuente.remoto} (${buffer.length} bytes)`);
  }

  console.log('✅ Todas las fuentes subidas al hosting');
})();
