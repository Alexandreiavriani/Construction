// models/vacancyModel.js
const db = require('../db'); // mysql2/promise pool

const Vacancy = {
  // Count all vacancies
  countAll: async () => {
    const [rows] = await db.execute(
      'SELECT COUNT(*) AS count FROM vacancies'
    );
    return rows[0].count;
  },

  // Find vacancies with pagination
  findWithPagination: async (limit, offset) => {
    const [rows] = await db.execute(
      `SELECT id, position, description, responsibilities, requirements, we_offer,location, job_type
       FROM vacancies
       ORDER BY created_at DESC
       LIMIT ? OFFSET ?`,
      [limit, offset]
    );
    return rows;
  },

  // Find all vacancies
  findAll: async () => {
    const [rows] = await db.execute(
      `SELECT id, position, description, responsibilities, requirements, we_offer,location, job_type
       FROM vacancies
       ORDER BY created_at DESC`
    );
    return rows;
  },

  // Find one vacancy by ID
  findById: async (id) => {
    const [rows] = await db.execute(
      'SELECT * FROM vacancies WHERE id = ?',
      [id]
    );
    return rows.length ? rows[0] : null;
  },

  // Create a new vacancy
  create: async ({ position, description, responsibilities, requirements, we_offer,location, job_type }) => {
    const [result] = await db.execute(
      `INSERT INTO vacancies (position, description, responsibilities, requirements, we_offer,location, job_type)
       VALUES (?, ?, ?, ?, ?,?,?)`,
      [
        position,
        description || null,
        responsibilities,
        requirements,
        we_offer,
        location, 
        job_type
      ]
    );
    return result.insertId;
  },

  // Update vacancy by ID
  updateById: async ({ id, position, description, responsibilities, requirements, we_offer,location, job_type }) => {
    await db.execute(
      `UPDATE vacancies SET
         position = ?,
         description = ?,
         responsibilities = ?,
         requirements = ?,
         we_offer = ?,
         location = ?,
         job_type = ?
       WHERE id = ?`,
      [position, description || null, responsibilities, requirements, we_offer,location, job_type,id]
    );
  },

  // Delete vacancy by ID
  deleteById: async (id) => {
    await db.execute(
      'DELETE FROM vacancies WHERE id = ?',
      [id]
    );
  }
};

module.exports = Vacancy;
