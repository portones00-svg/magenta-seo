const SftpClient = require('ssh2-sftp-client');
const path = require('path');

const SFTP_CONFIG = {
  host: process.env.SFTP_HOST,
  port: parseInt(process.env.SFTP_PORT || '22'),
  username: process.env.SFTP_USER,
  password: process.env.SFTP_PASS,
};

const ROOT = process.env.SFTP_ROOT || '/home/reparac1/public_html';

async function subirArchivo(rutaRelativa, contenido) {
  const sftp = new SftpClient();
  try {
    await sftp.connect(SFTP_CONFIG);
    const rutaCompleta = path.join(ROOT, rutaRelativa);
    const dir = path.dirname(rutaCompleta);

    // Crear directorio si no existe
    await sftp.mkdir(dir, true).catch(() => {});

    // Subir el archivo
    await sftp.put(Buffer.from(contenido, 'utf8'), rutaCompleta);
    console.log(`[SFTP] Subido: ${rutaCompleta}`);
    return true;
  } catch (err) {
    console.error('[SFTP] Error:', err.message);
    throw err;
  } finally {
    await sftp.end();
  }
}

async function leerArchivo(rutaRelativa) {
  const sftp = new SftpClient();
  try {
    await sftp.connect(SFTP_CONFIG);
    const rutaCompleta = path.join(ROOT, rutaRelativa);
    const buffer = await sftp.get(rutaCompleta);
    return buffer.toString('utf8');
  } catch (err) {
    console.error('[SFTP] Error leyendo:', err.message);
    return null;
  } finally {
    await sftp.end();
  }
}

async function publicarArticulo({ slug, carpeta, htmlContent, actualizarBlog = true }) {
  const resultados = [];

  // 1. Subir el artículo
  const rutaArticulo = carpeta
    ? `${carpeta}/${slug}/index.html`
    : `blog/${slug}/index.html`;

  await subirArchivo(rutaArticulo, htmlContent);
  resultados.push({ archivo: rutaArticulo, ok: true });

  console.log(`[PUBLISHER] Artículo publicado en /${rutaArticulo}`);
  return resultados;
}

async function testConexion() {
  const sftp = new SftpClient();
  try {
    await sftp.connect(SFTP_CONFIG);
    const list = await sftp.list(ROOT);
    console.log('[SFTP] Conexión OK. Archivos en root:', list.length);
    await sftp.end();
    return true;
  } catch (err) {
    console.error('[SFTP] Conexión fallida:', err.message);
    return false;
  }
}

module.exports = { subirArchivo, leerArchivo, publicarArticulo, testConexion };
