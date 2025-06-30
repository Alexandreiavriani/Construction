// models/Gallery.js
// ----------------
// Методы для работы с таблицей gallery.

// const db = require('../db'); // Ваш mysql2/promise пул

// const Gallery = {
//   // Подсчёт общего числа записей заданного типа ('photo' или 'video')
//   countByType: async (type) => {
//     const [rows] = await db.execute(
//       'SELECT COUNT(*) AS count FROM gallery WHERE type = ?',
//       [type]
//     );
//     return rows[0].count;
//   },

//   // Получить записи с пагинацией по type ('photo' или 'video')
//   findByTypeWithPagination: async (type, limit, offset) => {
//     const [rows] = await db.execute(
//       'SELECT id, filepath, title FROM gallery WHERE type = ? ORDER BY created_at DESC LIMIT ? OFFSET ?',
//       [type, limit, offset]
//     );
//     return rows;
//   },

//   // Получить один элемент по ID
//   findById: async (id) => {
//     const [rows] = await db.execute(
//       'SELECT * FROM gallery WHERE id = ?',
//       [id]
//     );
//     return rows.length ? rows[0] : null;
//   },

//   // Создать новую запись (photo или video)
//   create: async ({ type, filepath, title ,lang_original}) => {
//     const [result] = await db.execute(
//       'INSERT INTO gallery (type, filepath, title,lang_original) VALUES (?, ?, ?, ?)',
//       [type, filepath, title,lang_original]
//     );
//     return result.insertId;
//   },

  

//   // Обновить запись по ID
//   updateById: async ({ id, type, filepath, title ,lang_original}) => {
//     await db.execute(
//       'UPDATE gallery SET type = ?, filepath = ?, title = ?, lang_original = ? WHERE id = ?',
//       [type, filepath, title, lang_original, id]
//     );
//   },

//   // Удалить запись по ID
//   deleteById: async (id) => {
//     await db.execute(
//       'DELETE FROM gallery WHERE id = ?',
//       [id]
//     );
//   },

//   /**
//  * Вернуть все записи из таблицы gallery (без фильтрации).
//  * Применим сортировку по дате добавления (created_at DESC).
//  */
//   findAll: async () => {
//     const [rows] = await db.execute(
//       'SELECT id, type, filepath, title FROM gallery ORDER BY created_at DESC'
//     );
//     return rows;
//   }
// };


// module.exports = Gallery;


const db = require('../db'); // pg Pool

// Тест подключения к базе — сразу при загрузке модуля


const Gallery = {
  countByType: async (type) => {
    const { rows } = await db.query(
      'SELECT COUNT(*) AS count FROM gallery WHERE type = $1',
      [type]
    );
    return parseInt(rows[0].count, 10);
  },

  findByTypeWithPagination: async (type, limit, offset) => {
    const { rows } = await db.query(
      'SELECT id, filepath, title FROM gallery WHERE type = $1 ORDER BY created_at DESC LIMIT $2 OFFSET $3',
      [type, limit, offset]
    );
    return rows;
  },

  findById: async (id) => {
    const { rows } = await db.query(
      'SELECT * FROM gallery WHERE id = $1',
      [id]
    );
    return rows[0] || null;
  },

  create: async ({ type, filepath, title, lang_original }) => {
    const { rows } = await db.query(
      'INSERT INTO gallery (type, filepath, title, lang_original) VALUES ($1, $2, $3, $4) RETURNING id',
      [type, filepath, title, lang_original]
    );
    return rows[0].id;
  },

  updateById: async ({ id, type, filepath, title, lang_original }) => {
    await db.query(
      'UPDATE gallery SET type = $1, filepath = $2, title = $3, lang_original = $4 WHERE id = $5',
      [type, filepath, title, lang_original, id]
    );
  },

  deleteById: async (id) => {
    await db.query(
      'DELETE FROM gallery WHERE id = $1',
      [id]
    );
  },

  findAll: async () => {
    const { rows } = await db.query(
      'SELECT id, type, filepath, title FROM gallery ORDER BY created_at DESC'
    );
    return rows;
  }
};

module.exports = Gallery;
