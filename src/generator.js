const Anthropic = require('@anthropic-ai/sdk');

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const CIUDADES = 'Santiago, Antofagasta, La Serena, Coquimbo, Viña del Mar, Concepción y Temuco';
const SITIO = 'Reparaciondeportones.cl';
const TELEFONO = '+56930713507';

// Keywords prioritarias basadas en datos reales de Search Console
const KEYWORDS_PRIORITARIAS = {
  marcas: {
    nice: { pagina: 'nice.html', carpeta: 'nice', pos: 8.6, imp: 518 },
    centurion: { pagina: 'centurion.html', carpeta: 'centurion', pos: 6.7, imp: 614 },
    bft: { pagina: 'bft.html', carpeta: 'bft', pos: 8.1, imp: 430 },
    faac: { pagina: 'faac.html', carpeta: 'faac', pos: 6.9, imp: 541 },
  },
  ubicaciones: [
    { slug: 'en-santiago', titulo: 'Santiago', pos: 11.6, imp: 508, urgente: true },
    { slug: 'a-domicilio-en-las-condes', titulo: 'Las Condes', pos: 6.6, imp: 1181 },
    { slug: 'a-domicilio-en-concepcion', titulo: 'Concepción', pos: 6.4, imp: 1133 },
    { slug: 'a-domicilio-en-la-reina', titulo: 'La Reina', pos: 7.6, imp: 973 },
    { slug: 'a-domicilio-en-lo-barnechea', titulo: 'Lo Barnechea', pos: 4.5, imp: 213 },
    { slug: 'a-domicilio-en-chicureo', titulo: 'Chicureo', pos: 6.3, imp: 112 },
    { slug: 'a-domicilio-en-vitacura', titulo: 'Vitacura', pos: 4.9, imp: 104 },
  ]
};

async function generarArticulo({ tema, marca, slug, tipo = 'articulo' }) {
  const systemPrompt = `Eres un redactor SEO experto en portones automáticos y sistemas de automatización para Chile.

REGLAS ESTRICTAS:
- Escribe entre 1000-1200 palabras de contenido real, técnico y útil
- Usa H2 para secciones principales (máximo 6 secciones)
- Menciona naturalmente las ciudades de cobertura en el ÚLTIMO párrafo: ${CIUDADES}
- Cierra SIEMPRE mencionando ${SITIO} como quien presta el servicio
- NO uses bullet points excesivos — prefiere párrafos bien escritos
- El contenido debe ser único, no copiar de otros sitios
- Tono profesional pero cercano, en español chileno
- NO inventes modelos o especificaciones técnicas que no sean reales
- Devuelve SOLO el HTML del contenido (párrafos y h2), sin head, body ni estructura de página`;

  const userPrompt = tipo === 'articulo'
    ? `Escribe un artículo completo sobre: "${tema}"
       ${marca ? `Marca: ${marca.toUpperCase()}` : ''}
       ${slug ? `Slug destino: /${slug}/` : ''}
       
       El artículo debe posicionar bien en Google para la keyword principal y keywords relacionadas.
       Incluye información técnica real y práctica que ayude al lector.`
    : `Escribe contenido expandido (~1100 palabras) para la página de marca "${marca.toUpperCase()}" 
       de reparaciondeportones.cl.
       
       Incluye:
       - Historia/contexto de la marca
       - Línea de productos principales (con especificaciones reales)
       - Cuándo usar cada tipo de motor
       - Mantención y servicio técnico
       - Preguntas frecuentes (3-4 preguntas)
       - Cierre con ${SITIO} y cobertura en ${CIUDADES}`;

  const response = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 4000,
    system: systemPrompt,
    messages: [{ role: 'user', content: userPrompt }]
  });

  return response.content[0].text;
}

async function generarMetadata({ tema, marca, tipo }) {
  const prompt = `Para el siguiente contenido SEO, genera metadata en JSON:
Tema: ${tema}
${marca ? `Marca: ${marca}` : ''}
Tipo: ${tipo}

Devuelve SOLO un JSON válido con estas claves:
{
  "title": "Título SEO (máx 60 chars, incluye keyword principal)",
  "description": "Meta description (máx 160 chars, incluye keyword + llamada a acción)",
  "h1": "H1 de la página (puede ser diferente al title)",
  "slug": "slug-url-amigable-sin-acentos"
}`;

  const response = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 500,
    messages: [{ role: 'user', content: prompt }]
  });

  const text = response.content[0].text;
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error('No se pudo generar metadata válida');
  return JSON.parse(jsonMatch[0]);
}

module.exports = { generarArticulo, generarMetadata, KEYWORDS_PRIORITARIAS };
