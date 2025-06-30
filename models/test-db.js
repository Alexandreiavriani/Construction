const db = require('../db'); // pg Pool

// Тест подключения к базе — сразу при загрузке модуля
(async () => {
  try {
    const res = await db.query('SELECT NOW()');
    console.log('PostgreSQL connected, time:', res.rows[0].now);
  } catch (err) {
    console.error('PostgreSQL connection error:', err);
  }
})();