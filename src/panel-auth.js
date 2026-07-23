function renderLoginPage(error) {
  return `<!doctype html>
<html lang="es">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Iniciar sesión — Magenta SEO</title>
  <style>
    body{font-family:'Poppins',Arial,sans-serif;background:#f5f5f5;display:flex;align-items:center;justify-content:center;min-height:100vh;margin:0}
    .box{background:#fff;padding:40px;border-radius:12px;box-shadow:0 4px 20px rgba(0,0,0,0.08);max-width:360px;width:100%;text-align:center}
    h1{font-size:20px;margin-bottom:8px;color:#111}
    p.sub{color:#666;font-size:13px;margin-bottom:28px}
    .btn-google{display:flex;align-items:center;justify-content:center;gap:10px;background:#fff;border:1px solid #ddd;border-radius:8px;padding:12px 20px;font-size:14px;font-weight:500;color:#333;text-decoration:none;cursor:pointer}
    .btn-google:hover{background:#f8f8f8}
    .error{background:#faece7;color:#993c1d;padding:10px 14px;border-radius:8px;font-size:13px;margin-bottom:20px}
  </style>
</head>
<body>
  <div class="box">
    <h1>🔧 Magenta SEO</h1>
    <p class="sub">Panel de administración</p>
    ${error ? `<div class="error">${error}</div>` : ''}
    <a href="/auth/google" class="btn-google">
      <svg width="18" height="18" viewBox="0 0 18 18"><path fill="#4285F4" d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84c-.21 1.13-.85 2.09-1.8 2.73v2.27h2.92c1.71-1.57 2.68-3.88 2.68-6.64z"/><path fill="#34A853" d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.92-2.27c-.81.54-1.84.86-3.04.86-2.34 0-4.32-1.58-5.03-3.7H.96v2.34C2.44 15.98 5.48 18 9 18z"/><path fill="#FBBC05" d="M3.97 10.71c-.18-.54-.28-1.11-.28-1.71s.1-1.17.28-1.71V4.95H.96C.35 6.17 0 7.55 0 9s.35 2.83.96 4.05l3.01-2.34z"/><path fill="#EA4335" d="M9 3.58c1.32 0 2.5.45 3.44 1.35l2.58-2.58C13.46.89 11.43 0 9 0 5.48 0 2.44 2.02.96 4.95l3.01 2.34C4.68 5.16 6.66 3.58 9 3.58z"/></svg>
      Continuar con Google
    </a>
  </div>
</body>
</html>`;
}

function requireAuth(rutasPublicas) {
  return (req, res, next) => {
    if (rutasPublicas.some(ruta => req.path === ruta || req.path.startsWith(ruta))) {
      return next();
    }
    if (req.session && req.session.autenticado) {
      return next();
    }
    res.redirect('/login');
  };
}

module.exports = { renderLoginPage, requireAuth };
