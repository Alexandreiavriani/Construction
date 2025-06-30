const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

(async () => {
  try {
    const { rows } = await pool.query('SELECT * FROM gallery');
    console.log('Галерея:', rows);
    process.exit();
  } catch (err) {
    console.error('Ошибка подключения:', err);
    process.exit(1);
  }
})();
