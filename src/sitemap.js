const { leerArchivo, subirArchivo } = require('./publisher');

const SITE_URL = process.env.SITE_URL || 'https://www.reparaciondeportones.cl';

async function actualizarSitemap(nuevoArticulo) {
  try {
    // Leer sitemap actual
    let sitemapActual = await leerArchivo('sitemap-blog.xml') || '';

    // Verificar si la URL ya existe
    const url = nuevoArticulo.canonical;
    if (sitemapActual.includes(url)) {
      console.log('[SITEMAP] URL ya existe, omitiendo:', url);
      return;
    }

    // Insertar nueva URL antes de </urlset>
    const nuevaUrl = `  <url>
    <loc>${url}</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>
</urlset>`;

    const sitemapActualizado = sitemapActual.replace('</urlset>', nuevaUrl);
    await subirArchivo('sitemap-blog.xml', sitemapActualizado);
    console.log('[SITEMAP] Actualizado con:', url);
  } catch (err) {
    console.error('[SITEMAP] Error:', err.message);
  }
}

async function actualizarIndiceBlog(articulos) {
  // articulos = array de { url, title, excerpt, image, isoDate, date }
  const CARD_CSS = `
    <style>
      .lista-blog{display:flex;flex-direction:column;gap:24px;max-width:800px;margin:0 auto}
      .lista-blog-card{display:flex;gap:20px;padding:20px;border:1px solid #e5e5e5;border-radius:12px;text-decoration:none;color:inherit;transition:box-shadow .2s,border-color .2s}
      .lista-blog-card:hover{box-shadow:0 4px 12px rgba(0,0,0,.08);border-color:#d0d0d0}
      .lista-blog-card-img{width:140px;height:100px;object-fit:cover;border-radius:8px;flex-shrink:0}
      .lista-blog-card-content{flex:1;min-width:0}
      .lista-blog-card-title{font-size:18px;font-weight:600;margin:0 0 8px;line-height:1.3;color:#1a1a1a;font-family:"Poppins",sans-serif}
      .lista-blog-card-excerpt{font-size:14px;color:#666;margin:0 0 12px;line-height:1.5;font-family:"Poppins",sans-serif}
      .lista-blog-card-date{font-size:12px;color:#999}
      @media(max-width:600px){.lista-blog-card{flex-direction:column;gap:12px}.lista-blog-card-img{width:100%;height:180px}}
    </style>`;

  const cards = articulos.sort((a, b) => new Date(b.isoDate) - new Date(a.isoDate))
    .map(a => `          <a href="../${a.url}" class="lista-blog-card" itemscope itemtype="https://schema.org/BlogPosting">
            <img class="lista-blog-card-img" src="${a.image}" alt="${a.title}" loading="lazy" itemprop="image">
            <div class="lista-blog-card-content">
              <h2 class="lista-blog-card-title" itemprop="headline">${a.title}</h2>
              <p class="lista-blog-card-excerpt" itemprop="description">${a.excerpt}</p>
              <time class="lista-blog-card-date" datetime="${a.isoDate}" itemprop="datePublished">${a.date}</time>
            </div>
          </a>`).join('\n');

  const html = `<!DOCTYPE html>
<html lang="es" data-bs-theme="auto">
  <head>
    <title>Blog - Reparación de Portones Eléctricos</title>
    <meta name="description" content="Blog de Reparación de Portones. Aprende sobre mantenimiento, fallas comunes y soluciones para portones eléctricos automáticos.">
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1">
    <link rel="icon" type="image/x-icon" href="../images/favicon.png">
    <link href="../css/bootstrap.css" rel="stylesheet">
    <link href="../css/style.css" rel="stylesheet">
    <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap" rel="stylesheet">
    <link rel="canonical" href="${SITE_URL}/blog/" />
${CARD_CSS}
  </head>
  <body>
    <header data-bs-theme="dark">
      <div class="navbar-wrapper"><div class="container">
        <nav class="menu navbar navbar-static-top"><div class="container">
          <div class="navbar-header">
            <a href="../index.html"><img src="../images/logo-positivo.svg" alt="Logotipo" width="200" height="73"></a>
          </div>
          <div id="navbar" class="fright navbar-collapse collapse">
            <ul class="nav navbar-nav">
              <li><a href="../index.html">Home</a></li>
              <li class="active"><a href="./">Blog</a></li>
              <li class="dropdown">
                <a href="#" class="dropdown-toggle" data-toggle="dropdown">Contáctanos <span class="caret"></span></a>
                <ul class="dropdown-menu">
                  <li><a href="#">+56930713507</a></li>
                </ul>
              </li>
            </ul>
          </div>
        </div></nav>
      </div></div>
    </header>
    <main>
      <div class="slider">
        <div class="container">
          <h1>Blog de Portones Automáticos</h1>
          <p class="subtituloslider">Consejos, guías y novedades sobre portones eléctricos.</p>
          <a href="tel:+56930713507" class="botonservicio">Llámanos</a>
        </div>
      </div>
      <div class="container" style="padding:40px 15px;">
        <section class="lista-blog" role="feed" aria-label="Artículos del blog">
${cards}
        </section>
      </div>
    </main>
    <a href="https://api.whatsapp.com/send?phone=56930713507" class="whatsapp" title="Whatsapp"></a>
    <script src="https://code.jquery.com/jquery-1.12.4.min.js"></script>
    <script src="../js/bootstrap.js"></script>
  </body>
</html>`;

  await subirArchivo('blog/index.html', html);
  console.log('[SITEMAP] Índice del blog actualizado con', articulos.length, 'artículos');
}

module.exports = { actualizarSitemap, actualizarIndiceBlog };
