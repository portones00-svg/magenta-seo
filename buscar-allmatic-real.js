const ftp = require('basic-ftp');

(async () => {
  const client = new ftp.Client();
  try {
    await client.access({
      host: process.env.SFTP_HOST,
      user: process.env.SFTP_USER,
      password: process.env.SFTP_PASS,
      port: 21,
      secure: false,
    });
    const list = await client.list('public_html');
    const encontrados = list.filter(item => item.name.toLowerCase().includes('allmatic'));
    console.log('Coincidencias con "allmatic" en public_html:', encontrados.length);
    encontrados.forEach(e => console.log(' -', e.name, '| tipo:', e.type === 1 ? 'archivo' : e.type === 2 ? 'carpeta' : 'otro'));

    // Tambien buscar algo parecido a "portones-automaticos" que pudiera relacionarse
    const parecidos = list.filter(item => item.name.toLowerCase().includes('automatic'));
    console.log('');
    console.log('Coincidencias con "automatic":', parecidos.length);
    parecidos.forEach(e => console.log(' -', e.name));
  } catch(err) {
    console.error('Error:', err.message);
  } finally {
    client.close();
  }
})();
