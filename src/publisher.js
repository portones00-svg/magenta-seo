const ftp = require('basic-ftp');
const path = require('path');

const FTP_CONFIG = {
  host: process.env.SFTP_HOST,
  user: process.env.SFTP_USER,
  password: process.env.SFTP_PASS,
  port: 21,
  secure: false,
};

// Ruta relativa desde el home del usuario FTP
// public_html es el directorio raíz del sitio
const ROOT = 'public_html';

async function subirArchivo(rutaRelativa, contenido) {
  const client = new ftp.Client();
  try {
    await client.access(FTP_CONFIG);
    const rutaCompleta = ROOT + '/' + rutaRelativa.replace(/^\//, '');
    const dir = path.dirname(rutaCompleta);
    const filename = path.basename(rutaCompleta);

    // ensureDir nos mueve al directorio automáticamente
    await client.ensureDir(dir);

    const { Readable } = require('stream');
    const stream = Readable.from([Buffer.from(contenido, 'utf8')]);
    await client.uploadFrom(stream, filename);

    console.log('[FTP] Subido OK:', rutaCompleta);
    return true;
  } catch (err) {
    console.error('[FTP] Error:', err.message);
    throw err;
  } finally {
    client.close();
  }
}

async function leerArchivo(rutaRelativa) {
  const client = new ftp.Client();
  try {
    await client.access(FTP_CONFIG);
    const rutaCompleta = ROOT + '/' + rutaRelativa.replace(/^\//, '');
    const dir = path.dirname(rutaCompleta);
    const filename = path.basename(rutaCompleta);

    await client.cd(dir);
    const chunks = [];
    const { Writable } = require('stream');
    const writable = new Writable({
      write(chunk, enc, cb) { chunks.push(chunk); cb(); }
    });
    await client.downloadTo(writable, filename);
    return Buffer.concat(chunks).toString('utf8');
  } catch (err) {
    console.error('[FTP] Error leyendo:', err.message);
    return null;
  } finally {
    client.close();
  }
}

async function publicarArticulo({ slug, carpeta, htmlContent }) {
  const ruta = carpeta
    ? `${carpeta}/${slug}/index.html`
    : `blog/${slug}/index.html`;
  await subirArchivo(ruta, htmlContent);
  console.log('[PUBLISHER] Publicado en /' + ruta);
  return [{ archivo: ruta, ok: true }];
}

async function testConexion() {
  const client = new ftp.Client();
  try {
    await client.access(FTP_CONFIG);
    const list = await client.list(ROOT);
    console.log('[FTP] Conexión OK. Archivos en public_html:', list.length);
    return true;
  } catch (err) {
    console.error('[FTP] Conexión fallida:', err.message);
    return false;
  } finally {
    client.close();
  }
}

module.exports = { subirArchivo, leerArchivo, publicarArticulo, testConexion };
