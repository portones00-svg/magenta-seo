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
    const bufferFinal = Buffer.isBuffer(contenido) ? contenido : Buffer.from(contenido, 'utf8');
    const stream = Readable.from([bufferFinal]);
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

// Agrega un articulo recien publicado a la lista de blog/index.html, en el lugar correcto
async function agregarABlogIndex(item) {
  try {
    let html = await leerArchivo('blog/index.html');
    if (!html) {
      console.error('[BLOG-INDEX] No se pudo leer blog/index.html, no se agrego la tarjeta');
      return false;
    }

    const url = new URL(item.canonical);
    const rutaRelativa = url.pathname; // ej: /blog/mi-slug/
    const hrefEnListado = '..' + rutaRelativa;

    // Evitar duplicados si ya esta agregado
    if (html.includes(hrefEnListado)) {
      console.log('[BLOG-INDEX] Ya estaba en la lista, no se duplica:', hrefEnListado);
      return true;
    }

    const fecha = new Date(item.publicadoEn || new Date());
    const meses = ['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre'];
    // Usar metodos UTC para evitar que la zona horaria local corra la fecha un dia
    const fechaFormateada = fecha.getUTCDate() + ' de ' + meses[fecha.getUTCMonth()] + ' de ' + fecha.getUTCFullYear();
    const titulo = item.meta.h1 || item.meta.title;
    const descripcion = item.meta.description || '';

    const tarjetaHtml = `          <a href="${hrefEnListado}" class="lista-blog-card" itemscope itemtype="https://schema.org/BlogPosting">
            <img class="lista-blog-card-img" src="${item.imagen}" alt="${titulo}" loading="lazy" itemprop="image">
            <div class="lista-blog-card-content">
              <h2 class="lista-blog-card-title" itemprop="headline">${titulo}</h2>
              <p class="lista-blog-card-excerpt" itemprop="description">${descripcion}</p>
              <time class="lista-blog-card-date" datetime="${fecha.toISOString()}" itemprop="datePublished">${fechaFormateada}</time>
            </div>
          </a>
`;

    // Insertar justo antes de la primera tarjeta REAL existente (por su clase especifica, no cualquier <a href>)
    const primeraTarjeta = html.indexOf('class="lista-blog-card"');
    if (primeraTarjeta === -1) {
      console.error('[BLOG-INDEX] No se encontro ninguna tarjeta existente, no se agrego (para no dejar el HTML roto)');
      return false;
    }
    const inicioTagA = html.lastIndexOf('<a href="', primeraTarjeta);

    const nuevoHtml = html.substring(0, inicioTagA) + tarjetaHtml + html.substring(inicioTagA);
    await subirArchivo('blog/index.html', nuevoHtml);
    console.log('[BLOG-INDEX] ✅ Agregado:', hrefEnListado);
    return true;
  } catch (err) {
    console.error('[BLOG-INDEX] Error:', err.message);
    return false;
  }
}

module.exports = { subirArchivo, leerArchivo, publicarArticulo, testConexion, agregarABlogIndex };
