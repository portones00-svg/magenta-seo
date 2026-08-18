const { subirArchivo } = require('./src/publisher');
const fs = require('fs');

(async () => {
  // 1. Leer backup original (diseño correcto, 1,814 palabras)
  let html = fs.readFileSync('puente-alto-backup-original.html', 'utf8');
  
  // 2. Leer CSS completos
  const bootstrapCss = fs.readFileSync('bootstrap-original.css', 'utf8');
  const styleCss = fs.readFileSync('style-original.css', 'utf8');
  
  // 3. NUEVO HEAD con TODO el CSS inline + Schema + OG + favicon
  const nuevoHead = `<!doctype html>
<html lang="es">
  <head>
    <title>Reparación y Mantención de Portones Eléctricos en Puente Alto</title>
    <meta name="description" content="Explora la importancia de la reparación y mantención de portones eléctricos en diversas calles de Santiago, incluyendo Puente Alto, y su impacto en la seguridad.">
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1">
    <meta name="author" content="">
    
    <link rel="icon" type="image/x-icon" href="images/favicon.png">
    
    <!-- Preconnect Google Fonts -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Poppins:ital,wght@0,300;0,400;0,500;0,600;0,700;1,300;1,400;1,500;1,600;1,700&display=swap" rel="stylesheet">
    
    <!-- CSS Completo Inline -->
    <style>
${bootstrapCss}
${styleCss}
    </style>
    
    <!-- Open Graph -->
    <meta property="og:title" content="Reparación de Portones Eléctricos en Puente Alto">
    <meta property="og:description" content="Servicio técnico especializado en reparación y mantención de portones eléctricos en Puente Alto.">
    <meta property="og:image" content="https://reparaciondeportones.cl/images/slider2.jpg">
    <meta property="og:url" content="https://reparaciondeportones.cl/a-domicilio-en-puente-alto.html">
    <meta property="og:type" content="website">
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="Reparación de Portones Eléctricos en Puente Alto">
    <meta name="twitter:description" content="Servicio técnico especializado en reparación y mantención de portones eléctricos.">
    <meta name="twitter:image" content="https://reparaciondeportones.cl/images/slider2.jpg">
    
    <!-- Schema.org -->
    <script type="application/ld+json">
    {
      "@context": "https://schema.org",
      "@type": "LocalBusiness",
      "name": "Reparación de Portones.cl",
      "description": "Servicio técnico especializado en reparación y mantención de portones eléctricos en Puente Alto",
      "url": "https://reparaciondeportones.cl/a-domicilio-en-puente-alto.html",
      "telephone": "+56930713507",
      "address": {
        "@type": "PostalAddress",
        "addressLocality": "Puente Alto",
        "addressRegion": "RM",
        "addressCountry": "CL"
      },
      "serviceArea": {
        "@type": "City",
        "name": "Puente Alto"
      },
      "image": "https://reparaciondeportones.cl/images/slider2.jpg"
    }
    </script>
  </head>`;
  
  // 4. Reemplazar head
  html = html.replace(/<!doctype html>[\s\S]*?<\/head>/i, nuevoHead);
  
  // 5. Eliminar links CSS externos (ya están inline)
  html = html.replace('<link href="css/bootstrap.css" rel="stylesheet">', '');
  html = html.replace('<link href="css/style.css" rel="stylesheet">', '');
  
  // 6. Eliminar scripts sincrónicos del head
  html = html.replace(/<script src="https:\/\/code\.jquery\.com\/jquery-1\.12\.4\.min\.js"[\s\S]*?<\/script>/, '');
  html = html.replace(/<script src="js\/bootstrap\.js"><\/script>/, '');
  
  // 7. Eliminar tracking sincrónico del head
  html = html.replace(/<!-- Google Tag Manager -->[\s\S]*?<!-- End Google Tag Manager -->/, '');
  html = html.replace(/<script async src="https:\/\/www\.googletagmanager\.com\/gtag\/js\?id=UA-113418977-1"><\/script>/, '');
  html = html.replace(/<script>[\s\S]*?gtag\('config', 'UA-113418977-1'\);[\s\S]*?<\/script>/, '');
  html = html.replace(/<!-- Facebook Pixel Code -->[\s\S]*?<!-- End Facebook Pixel Code -->/, '');
  
  // 8. Agregar scripts defer + lazy tracking antes de </body>
  const scriptsFinal = `
    <script defer src="https://code.jquery.com/jquery-1.12.4.min.js" integrity="sha384-nvAa0+6Qg9clwYCGGPpDQLVpLNn0fRaROjHqs13t4Ggj3Ez50XnGQqc/r8MhnRDZ" crossorigin="anonymous"></script>
    <script defer src="js/bootstrap.js"></script>
    
    <script>
      (function() {
        var loaded = false;
        function loadTracking() {
          if (loaded) return;
          loaded = true;
          var gtm = document.createElement('script');
          gtm.async = true;
          gtm.src = 'https://www.googletagmanager.com/gtm.js?id=GTM-N3SDL8C';
          document.head.appendChild(gtm);
          var ga = document.createElement('script');
          ga.async = true;
          ga.src = 'https://www.googletagmanager.com/gtag/js?id=UA-113418977-1';
          document.head.appendChild(ga);
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', 'UA-113418977-1');
          var fb = document.createElement('script');
          fb.async = true;
          fb.src = 'https://connect.facebook.net/en_US/fbevents.js';
          document.head.appendChild(fb);
          fb.onload = function() {
            fbq('init', '422112350987438');
            fbq('track', 'PageView');
          };
        }
        window.addEventListener('scroll', loadTracking, {once: true, passive: true});
        window.addEventListener('click', loadTracking, {once: true, passive: true});
        window.addEventListener('touchstart', loadTracking, {once: true, passive: true});
        setTimeout(loadTracking, 5000);
      })();
    </script>
  </body>`;
  
  html = html.replace('</body>', scriptsFinal);
  
  // 9. Subir
  await subirArchivo('a-domicilio-en-puente-alto.html', html);
  console.log('✅ Puente Alto definitivo subido');
})();
