const ftp = require('basic-ftp');
const path = require('path');

const FTP_CONFIG = {
  host: process.env.SFTP_HOST,
  user: process.env.SFTP_USER,
  password: process.env.SFTP_PASS,
  port: 21,
  secure: false,
};

const ROOT = process.env.SFTP_ROOT || '/home/reparac1/public_html';

async function subirArchivo(rutaRelativa, contenido) {
  const client = new ftp.Client();
  try {
    await client.access(FTP_CONFIG);
    const rutaCompleta = path.join(ROOT, rutaRelativa);
    const dir = path.dirname(rutaCompleta);
    await client.ensureDir(dir);
    await client.cd(dir);
    const { Readable } = require('stream');
    const stream = Readable.from([Buffer.from(contenido, 'utf8')]);
    await client.uploadFrom(stream, path.basename(rutaCompleta));
    console.log('[FTP] Subido:', rutaCompleta);
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
    const rutaCompleta = path.join(ROOT, rutaRelativa);
    const chunks = [];
    const { Writable } = require('stream');
    const writable = new Writable({
      write(chunk, enc, cb) { chunks.push(chunk); cb(); }
    });
    await client.downloadTo(writable, rutaCompleta);
    return Buffer.concat(chunks).toString('utf8');
  } catch (err) {
    console.error('[FTP] Error leyendo:', err.message);
    return null;
  } finally {
    client.close();
  }
}

async function publicarArticulo({ slug, carpeta, htmlContent }) {
  const ruta = carpeta ? `${carpeta}/${slug}/index.html` : `blog/${slug}/index.html`;
  await subirArchivo(ruta, htmlContent);
  console.log('[PUBLISHER] Publicado en /' + ruta);
  return [{ archivo: ruta, ok: true }];
}

async function testConexion() {
  const client = new ftp.Client();
  try {
    await client.access(FTP_CONFIG);
    const list = await client.list(ROOT);
    console.log('[FTP] Conexión OK. Archivos:', list.length);
    return true;
  } catch (err) {
    console.error('[FTP] Conexión fallida:', err.message);
    return false;
  } finally {
    client.close();
  }
}

module.exports = { subirArchivo, leerArchivo, publicarArticulo, testConexion };
