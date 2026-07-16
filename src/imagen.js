const axios = require('axios');
const path = require('path');
const { subirArchivo } = require('./publisher');

const SITE_URL = process.env.SITE_URL || 'https://www.reparaciondeportones.cl';

// Genera un prompt fotorrealista basado en el tema del artículo
function generarPromptImagen({ tema, marca }) {
  const contextos = [
    'technician repairing an automatic gate motor',
    'electric gate with automatic motor installed',
    'gate automation technician working on site',
    'sliding gate motor maintenance in progress',
    'automatic gate installation with tools',
  ];
  const contexto = contextos[Math.floor(Math.random() * contextos.length)];
  const marcaTexto = marca ? `, ${marca.toUpperCase()} brand equipment` : '';

  return `Professional photograph of a ${contexto}${marcaTexto} in Chile. ` +
    `Modern residential or commercial property, natural lighting, clean and professional look. ` +
    `Technician in work uniform, realistic setting. No text, no logos, no watermarks. ` +
    `High quality, sharp focus, photorealistic style.`;
}

async function generarImagenDalle(prompt) {
  const response = await axios.post(
    'https://api.openai.com/v1/images/generations',
    {
      model: 'dall-e-3',
      prompt,
      n: 1,
      size: '1792x1024',
      quality: 'standard',
      response_format: 'url',
    },
    {
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      timeout: 60000,
    }
  );

  return response.data.data[0].url;
}

async function descargarImagen(url) {
  const response = await axios.get(url, {
    responseType: 'arraybuffer',
    timeout: 30000,
  });
  return Buffer.from(response.data);
}

// Función principal — genera imagen y la sube a Bluehost
async function generarYSubirImagen({ tema, marca, slug }) {
  if (!process.env.OPENAI_API_KEY) {
    console.warn('[IMAGEN] Sin OPENAI_API_KEY — usando imagen de respaldo');
    return imagenRespaldo();
  }

  try {
    console.log('[IMAGEN] Generando con DALL-E 3...');
    const prompt = generarPromptImagen({ tema, marca });
    const urlTemporal = await generarImagenDalle(prompt);

    console.log('[IMAGEN] Descargando imagen generada...');
    const buffer = await descargarImagen(urlTemporal);

    // Subir a /images/blog/slug.jpg en Bluehost
    const rutaServidor = `images/blog/${slug}.jpg`;
    await subirArchivo(rutaServidor, buffer.toString('binary'));

    const urlFinal = `${SITE_URL}/${rutaServidor}`;
    console.log('[IMAGEN] Subida OK:', urlFinal);
    return urlFinal;

  } catch (err) {
    console.error('[IMAGEN] Error con DALL-E 3:', err.message);
    if (err.response && err.response.data) {
      console.error('[IMAGEN] Detalle del error de OpenAI:', JSON.stringify(err.response.data));
    }
    console.warn('[IMAGEN] Usando imagen de respaldo...');
    return imagenRespaldo();
  }
}

// Pool de imágenes de respaldo (las 17 de Soro) para cuando falle DALL-E
const SORO_BASE = 'https://afocirmbqdxnkyescnev.supabase.co/storage/v1/object/public/featured-images/1eb1b567-55bf-4b0c-8be4-c0d4eaffbb66/';
const RESPALDO_IMGS = [
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
];

let respaldoIdx = 0;
function imagenRespaldo() {
  const img = SORO_BASE + RESPALDO_IMGS[respaldoIdx % RESPALDO_IMGS.length];
  respaldoIdx++;
  return img;
}

module.exports = { generarYSubirImagen, imagenRespaldo };
