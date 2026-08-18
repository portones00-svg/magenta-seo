const { leerArchivo, subirArchivo } = require('./src/publisher');
const { execSync } = require('child_process');
const fs = require('fs');

const imagenes = [
  'images/servicio1.jpg',
  'images/servicio2.jpg',
  'images/servicio3.jpg',
  'images/servicio4.jpg',
  'images/servicio5.jpg',
  'images/servicio6.jpg',
  'images/bg-comunas.jpg',
  'images/slider2.jpg'
];

(async () => {
  for (const img of imagenes) {
    try {
      const webp = img.replace('.jpg', '.webp');
      console.log(`🔄 ${img} → ${webp}`);
      
      // Descargar imagen
      const data = await leerArchivo(img);
      if (!data) {
        console.log(`  ❌ No se pudo leer ${img}`);
        continue;
      }
      
      // Guardar local
      fs.writeFileSync('/tmp/temp.jpg', data);
      
      // Convertir a WebP
      execSync('cwebp -q 85 /tmp/temp.jpg -o /tmp/temp.webp');
      
      // Subir WebP
      const webpData = fs.readFileSync('/tmp/temp.webp');
      await subirArchivo(webp, webpData);
      
      console.log(`  ✅ ${webp} subido`);
    } catch (err) {
      console.log(`  ❌ Error con ${img}:`, err.message);
    }
  }
  
  console.log('');
  console.log('🎉 Proceso completado');
})();
