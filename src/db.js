// db.js — conexion Postgres compartida (multi-cliente)
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL && process.env.DATABASE_URL.includes('railway') ? { rejectUnauthorized: false } : false
});

pool.on('error', (err) => {
  console.error('[DB] Error inesperado en el pool de conexiones:', err.message);
});

async function query(text, params) {
  return pool.query(text, params);
}

module.exports = { pool, query };
