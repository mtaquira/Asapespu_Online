require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mysql = require('mysql2/promise');

const app = express();

// Middleware para CORS manual
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.header('Access-Control-Max-Age', '3600');
  
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  
  next();
});

// CORS con cors package
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: false,
}));

app.use(express.json());

// DB Connection Pool
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
});

// ============ ROUTES ============

// Health check endpoint (no DB access)
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
});

app.get('/', (req, res) => {
  res.send('API running');
});

// Get items by asociado
app.get('/api/items', async (req, res) => {
  const asociado = req.query.asociado;
  try {
    if (asociado) {
      const [asociadoRows] = await pool.query('SELECT * FROM ec_asociado WHERE asociado = ?', [asociado]);
      const [cuotasRows] = await pool.query('SELECT * FROM cob_proyeccion_cuotas WHERE estado = "P" and asociado = ?', [asociado]);
      return res.json({ asociado: asociadoRows, cuotas: cuotasRows });
    }

    const [asociadoRows] = await pool.query('SELECT * FROM ec_asociado LIMIT 10');
    res.json({ asociado: asociadoRows, cuotas: [] });
  } catch (err) {
    console.error('Error in /api/items:', err);
    res.status(500).json({ error: 'DB error', message: err.message });
  }
});

// Search asociados by name
app.get('/api/asociados', async (req, res) => {
  const query = (req.query.q || '').toString().trim();
  console.log('GET /api/asociados q=', query);
  try {
    if (!query) {
      return res.json([]);
    }

    const terms = query.split(/\s+/).filter(Boolean);
    const params = [query];
    let sql = 'SELECT * FROM ec_asociado WHERE asociado = ?';

    if (terms.length) {
      const termConditions = terms.map(() => 'LOWER(nombre_fin) LIKE LOWER(?)').join(' AND ');
      sql += ` OR (${termConditions})`;
      params.push(...terms.map((term) => `%${term}%`));
    }

    sql += ' LIMIT 50';
    const [rows] = await pool.query(sql, params);

    res.json(rows);
  } catch (err) {
    console.error('Error in /api/asociados:', err);
    res.status(500).json({ error: 'DB error', message: err.message });
  }
});

// Debug endpoint
app.get('/api/debug', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM ec_asociado LIMIT 1');
    res.json({ success: true, data: rows[0] || {} });
  } catch (err) {
    console.error('Error in /api/debug:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// ============ START SERVER ============
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`API listening on port ${port}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`Database: ${process.env.DB_HOST || 'not configured'}`);
});
