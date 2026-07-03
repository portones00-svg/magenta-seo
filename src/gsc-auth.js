const { google } = require('googleapis');
const fs = require('fs');

const TOKEN_FILE = '/tmp/gsc-tokens.json';

function getOAuthClient() {
  return new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI || 'https://magenta-seo-production.up.railway.app/auth/callback'
  );
}

function getAuthUrl() {
  const oauth2Client = getOAuthClient();
  return oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: ['https://www.googleapis.com/auth/webmasters.readonly'],
    prompt: 'consent'
  });
}

async function getTokensFromCode(code) {
  const oauth2Client = getOAuthClient();
  const { tokens } = await oauth2Client.getToken(code);
  fs.writeFileSync(TOKEN_FILE, JSON.stringify(tokens));
  return tokens;
}

function loadTokens() {
  try {
    if (fs.existsSync(TOKEN_FILE)) {
      return JSON.parse(fs.readFileSync(TOKEN_FILE, 'utf8'));
    }
  } catch(e) {}
  return null;
}

async function getAuthenticatedClient() {
  const tokens = loadTokens();
  if (!tokens) throw new Error('No hay tokens — autoriza primero en /auth/google');
  const oauth2Client = getOAuthClient();
  oauth2Client.setCredentials(tokens);
  // Refresh automático si expiró
  if (tokens.expiry_date && tokens.expiry_date < Date.now()) {
    const { credentials } = await oauth2Client.refreshAccessToken();
    fs.writeFileSync(TOKEN_FILE, JSON.stringify(credentials));
    oauth2Client.setCredentials(credentials);
  }
  return oauth2Client;
}

module.exports = { getAuthUrl, getTokensFromCode, getAuthenticatedClient, loadTokens };
