const db = require('../db'); // пул mysql2/promise

module.exports = {
  // Получить все проекты
  getAll: async () => {
    const [rows] = await db.execute(
      'SELECT id, title, description, image, status, created_at, updated_at FROM projects ORDER BY created_at DESC'
    );
    return rows;
  },

  // Получить проект по ID
  getById: async (id) => {
    const [rows] = await db.execute(
      'SELECT * FROM projects WHERE id = ?',
      [id]
    );
    return rows[0] || null;
  },

  // Вставить новый проект
  insert: async ({ title, description, image, status }) => {
    const [result] = await db.execute(
      'INSERT INTO projects (title, description, image, status) VALUES (?, ?, ?, ?)',
      [title, description, image, status]
    );
    return result.insertId;
  },

  // Обновить проект
  update: async (id, { title, description, image, status }) => {
    const fields = [];
    const values = [];

    if (title !== undefined) {
      fields.push('title = ?'); values.push(title);
    }
    if (description !== undefined) {
      fields.push('description = ?'); values.push(description);
    }
    if (image !== undefined) {
      fields.push('image = ?'); values.push(image);
    }
    if (status !== undefined) {
      fields.push('status = ?'); values.push(status);
    }
    if (fields.length === 0) {
      return;
    }

    values.push(id);
    const sql = `UPDATE projects SET ${fields.join(', ')} WHERE id = ?`;
    await db.execute(sql, values);
  },

  // Удалить проект
  delete: async (id) => {
    await db.execute(
      'DELETE FROM projects WHERE id = ?',
      [id]
    );
  }
};
