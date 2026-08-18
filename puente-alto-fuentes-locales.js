const { leerArchivo, subirArchivo } = require('./src/publisher');

(async () => {
  let html = await leerArchivo('a-domicilio-en-puente-alto.html');
  
  // 1. Eliminar el link de Google Fonts externo
  html = html.replace(/<link rel="preconnect" href="https:\/\/fonts\.googleapis\.com">/, '');
  html = html.replace(/<link rel="preconnect" href="https:\/\/fonts\.gstatic\.com" crossorigin>/, '');
  html = html.replace(/<link href="https:\/\/fonts\.googleapis\.com\/css2\?family=Poppins[^"]*" rel="stylesheet">/, '');
  
  // 2. Agregar @font-face con font-display: swap antes del </style>
  const fontFace = `
    @font-face {
      font-family: 'Poppins';
      font-style: normal;
      font-weight: 300;
      font-display: swap;
      src: url('fonts/poppins-300.woff2') format('woff2');
    }
    @font-face {
      font-family: 'Poppins';
      font-style: normal;
      font-weight: 400;
      font-display: swap;
      src: url('fonts/poppins-400.woff2') format('woff2');
    }
    @font-face {
      font-family: 'Poppins';
      font-style: normal;
      font-weight: 500;
      font-display: swap;
      src: url('fonts/poppins-500.woff2') format('woff2');
    }
    @font-face {
      font-family: 'Poppins';
      font-style: normal;
      font-weight: 600;
      font-display: swap;
      src: url('fonts/poppins-600.woff2') format('woff2');
    }
    @font-face {
      font-family: 'Poppins';
      font-style: normal;
      font-weight: 700;
      font-display: swap;
      src: url('fonts/poppins-700.woff2') format('woff2');
    }
  `;
  
  html = html.replace('</style>', fontFace + '\n</style>');
  
  await subirArchivo('a-domicilio-en-puente-alto.html', html);
  console.log('✅ Puente Alto actualizado con fuentes locales y font-display: swap');
})();
