const he = require('he');

const SITE_URL = process.env.SITE_URL || 'https://www.reparaciondeportones.cl';
const GTM_ID = 'GTM-N3SDL8C';
const FB_PIXEL = '422112350987438';
const SORO_IMGS = 'https://afocirmbqdxnkyescnev.supabase.co/storage/v1/object/public/featured-images/1eb1b567-55bf-4b0c-8be4-c0d4eaffbb66/';

// Pool de imágenes disponibles (rotación automática)
const IMAGENES = [
  '46935f35-c3c1-4e22-8846-13a05bf407a0.webp',
  'dea375a1-f0cf-441a-af2d-9a839bb542ef.webp',
  '416d8ce2-365f-4c47-87e0-aab0810d2b09.webp',
  'b2c5d007-ab2a-4c6e-ac7f-71e4a101a954.webp',
  'e65abfad-9d49-4dc8-aa80-a9db7dad993e.webp',
  '6b6242e3-fc94-4de3-aa5a-f014720f0c91.webp',
  'a4247fc0-d77c-4368-a8af-4a8c15403161.webp',
  '85cd5fe1-c41e-493d-ab26-595cb9b4884a.webp',
  '4361b6cb-1e5b-4485-a442-b497d85fca9d.webp',
  '0b194fe1-0ed6-4302-a4d0-11d8599e40c7.webp',
  '64c1848c-40c8-40ef-b05e-06f0dff4e394.webp',
  '9dbfaa17-48ad-4b15-baa7-a46499fdff05.webp',
  'ffa5055f-46fa-4b69-ac60-f3ba5affd735.webp',
  '5a5ed75b-6db3-4dae-8a68-7bf0e158e59e.webp',
  '4a2945a3-4a9a-4bb2-ada5-6280be10e45e.webp',
];

let imgIndex = 0;
function nextImage() {
  const img = SORO_IMGS + IMAGENES[imgIndex % IMAGENES.length];
  imgIndex++;
  return img;
}

const TRACKING = `
    <script>(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
    new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
    j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
    'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
    })(window,document,'script','dataLayer','${GTM_ID}');</script>
    <script>
    !function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?
    n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;
    n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;
    t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,
    document,'script','https://connect.facebook.net/en_US/fbevents.js');
    fbq('init','${FB_PIXEL}');fbq('track','PageView');
    </script>
    <noscript><img height="1" width="1" style="display:none"
    src="https://www.facebook.com/tr?id=${FB_PIXEL}&ev=PageView&noscript=1"/></noscript>`;

const GTM_NOSCRIPT = `    <noscript><iframe src="https://www.googletagmanager.com/ns.html?id=${GTM_ID}"
    height="0" width="0" style="display:none;visibility:hidden"></iframe></noscript>`;

function buildHeader(depth = 2) {
  const prefix = '../'.repeat(depth);
  return `    <header data-bs-theme="dark">
      <div class="navbar-wrapper">
        <div class="container">
          <nav class="menu navbar navbar-static-top">
            <div class="container">
              <div class="navbar-header">
                <a href="${prefix}index.html"><img src="${prefix}images/logo-positivo.svg" alt="Logotipo" width="200" height="73"></a>
                <button type="button" class="navbar-toggle collapsed" data-toggle="collapse" data-target="#navbar">
                  <span class="sr-only">Toggle navigation</span>
                  <span class="icon-bar"></span><span class="icon-bar"></span><span class="icon-bar"></span>
                </button>
                <a class="navbar-brand" href="#"><img src="${prefix}images/logo-positivo.svg" alt="Logotipo"></a>
              </div>
              <div id="navbar" class="fright navbar-collapse collapse">
                <ul class="nav navbar-nav">
                  <li><a href="${prefix}index.html">Home</a></li>
                  <li><a href="#">Quienes Somos</a></li>
                  <li><a href="#">Servicios</a></li>
                  <li class="active"><a href="${prefix}blog/">Blog</a></li>
                  <li class="dropdown">
                    <a href="#" class="dropdown-toggle" data-toggle="dropdown">Contáctanos <span class="caret"></span></a>
                    <ul class="dropdown-menu">
                      <li><a href="#">+56930713507</a></li>
                      <li><a href="#">+56920115900</a></li>
                      <li><a href="#">+56992987074</a></li>
                    </ul>
                  </li>
                </ul>
              </div>
            </div>
          </nav>
        </div>
      </div>
    </header>`;
}

function buildFooter(depth = 2) {
  const prefix = '../'.repeat(depth);
  return `      <footer>
        <div class="container">
          <div class="row">
            <div class="col-md-6">
              <img src="${prefix}images/logo-positivo.svg" alt="Logo Footer" width="330" height="120">
              <p>"En Reparación de Portones.cl, parte de <a class="verde" href="https://magentaelectric.cl/" target="_blank">Magenta Electric</a>, ofrecemos soluciones rápidas y eficientes en Antofagasta, La Serena, Coquimbo, Viña del Mar, Santiago, Concepción y Temuco."</p>
              <ul class="listadofooter">
                <li>+56930713507</li><li>+56920115900</li><li>+56992987074</li>
              </ul>
            </div>
            <div class="col-md-6">
              <div class="footertitle">Ponte en contacto con nosotros</div>
              <a class="verde btnito" href="mailto:ventas@reparaciondeportones.cl">ventas@reparaciondeportones.cl</a>
              <div class="footertitle">Ubicación</div>
              <p>Santiago, RM CL</p>
              <div class="footertitle">Horas</div>
              <ul class="horas">
                <li>Lunes 9:00 am – 22:00 horas</li>
                <li>Martes 9:00 am – 22:00 horas</li>
                <li>Miércoles 9:00 am – 22:00 horas</li>
                <li>Jueves 9:00 am – 22:00 horas</li>
                <li>Viernes 9:00 am – 22:00 horas</li>
                <li>Sábado 9:00 am – 6:00 pm</li>
                <li>Domingo 9:00 am – 12:00 p.m.</li>
              </ul>
            </div>
          </div>
        </div>
      </footer>`;
}

const ARTICLE_CSS = `
    <style>
      .articulo-blog{max-width:800px;margin:0 auto;color:#1a1a1a;font-family:"Poppins",sans-serif}
      .articulo-blog-meta{font-size:14px;color:#666;margin-bottom:24px}
      .articulo-blog-imagen{width:100%;max-height:400px;object-fit:cover;border-radius:12px;margin-bottom:24px}
      .articulo-blog-volver{display:inline-flex;align-items:center;gap:6px;border:1px solid #e5e5e5;color:#666;font-size:14px;padding:8px 16px;border-radius:6px;text-decoration:none;margin-bottom:24px}
      .articulo-blog-contenido{font-size:16px;line-height:1.7;color:#1a1a1a;font-family:"Poppins",sans-serif}
      .articulo-blog-contenido h2{margin-top:32px;margin-bottom:16px;font-size:24px;font-weight:600;line-height:1.3;color:#1a1a1a}
      .articulo-blog-contenido p{margin:0 0 16px 0}
      .articulo-blog-contenido a{color:#216416;text-decoration:underline}
      .marca-tag{display:inline-block;background:#eef1ef;color:#216416;font-size:13px;font-weight:600;text-transform:uppercase;letter-spacing:.5px;padding:4px 12px;border-radius:4px;margin-bottom:16px}
      .relacionados{margin-top:48px;padding-top:32px;border-top:1px solid #e5e5e5}
      .relacionados h3{font-size:18px;margin-bottom:16px;font-family:"Poppins",sans-serif}
      .relacionados ul{list-style:none;padding:0;margin:0}
      .relacionados li{margin-bottom:10px}
      .relacionados a{font-size:15px;color:#216416}
    </style>`;

function buildArticlePage({ title, description, canonical, isoDate, dateStr, image, content, marca, backUrl, backLabel, relacionados = [] }) {
  const img = image || nextImage();
  const depth = canonical.replace(process.env.SITE_URL || '', '').split('/').filter(Boolean).length;

  const jsonLd = JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: title,
    description,
    datePublished: isoDate,
    image: img,
    mainEntityOfPage: canonical,
    url: canonical,
    publisher: {
      '@type': 'Organization',
      name: 'Reparaciondeportones.cl',
      logo: { '@type': 'ImageObject', url: SITE_URL + '/images/logo-positivo.svg' }
    }
  });

  const relacionadosHtml = relacionados.length ? `
          <aside class="relacionados">
            <h3>Artículos relacionados</h3>
            <ul>${relacionados.map(r => `<li><a href="${r.url}">${r.title}</a></li>`).join('')}</ul>
          </aside>` : '';

  return `<!DOCTYPE html>
<html lang="es" data-bs-theme="auto">
  <head>
    <title>${title} | Reparaciondeportones.cl</title>
    <meta name="description" content="${description}">
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1">
    <link rel="icon" type="image/x-icon" href="${'../'.repeat(depth)}images/favicon.png">
    <link href="${'../'.repeat(depth)}css/bootstrap.css" rel="stylesheet">
    <link href="${'../'.repeat(depth)}css/style.css" rel="stylesheet">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap" rel="stylesheet">
${TRACKING}
    <link rel="canonical" href="${canonical}" />
    <meta property="og:title" content="${title}" />
    <meta property="og:description" content="${description}" />
    <meta property="og:type" content="article" />
    <meta property="og:url" content="${canonical}" />
    <meta property="og:image" content="${img}" />
    <script type="application/ld+json">${jsonLd}</script>
${ARTICLE_CSS}
  </head>
  <body>
${GTM_NOSCRIPT}
${buildHeader(depth)}
    <main>
      <div class="container" style="padding:40px 15px;">
        <article class="articulo-blog" itemscope itemtype="https://schema.org/BlogPosting">
          <a href="${backUrl || '../'}" class="articulo-blog-volver">&larr; ${backLabel || 'Volver al blog'}</a>
          <header>
            ${marca ? `<div class="marca-tag">${marca.toUpperCase()}</div>` : ''}
            <h1 itemprop="headline">${title}</h1>
            <time class="articulo-blog-meta" datetime="${isoDate}" itemprop="datePublished">${dateStr}</time>
          </header>
          <img class="articulo-blog-imagen" src="${img}" alt="${title}" itemprop="image">
          <div class="articulo-blog-contenido" itemprop="articleBody">
${content}
          </div>
${relacionadosHtml}
        </article>
      </div>
${buildFooter(depth)}
    </main>
    <a href="https://api.whatsapp.com/send?phone=56930713507&text=Hola%20Servicio%20T%C3%A9cnico%20de%20Portones%2C%20necesito%20de%20sus%20servicios" class="whatsapp" title="Whatsapp"></a>
    <script src="https://code.jquery.com/jquery-1.12.4.min.js"></script>
    <script src="${'../'.repeat(depth)}js/bootstrap.js"></script>
  </body>
</html>`;
}

function buildDate(daysAgo = 0) {
  const MESES = ['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre'];
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  return {
    isoDate: d.toISOString(),
    dateStr: `${d.getDate()} de ${MESES[d.getMonth()]} de ${d.getFullYear()}`
  };
}

module.exports = { buildArticlePage, buildDate, nextImage, SITE_URL };
