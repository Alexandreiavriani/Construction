// File: models/userModel.js
const pool = require('../db');
const bcrypt = require('bcrypt');


async function findUserByEmail(email) {
  const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
  return rows[0];
}

// async function createUser(firstName, lastName, email, password) {
//   const hashed = await bcrypt.hash(password, 10);
//   await pool.query(
//     'INSERT INTO users (first_name, last_name, email, password) VALUES (?, ?, ?, ?)',
//     [firstName, lastName, email, hashed]
//   );
// }

// module.exports = { findUserByEmail, createUser };

async function createUser(firstName, lastName, email, password, verifyToken) {
  // Хешируем пароль
  const hashed = await bcrypt.hash(password, 10);

  // Вставляем нового пользователя, сразу сохраняя токен
  const [result] = await pool.query(
    `INSERT INTO users
       (first_name, last_name, email, password, verify_token)
     VALUES (?, ?, ?, ?, ?)`,
    [firstName, lastName, email, hashed, verifyToken]
  );

  return {
    insertId: result.insertId,
    firstName,
    lastName,
    email,
    verifyToken,
  };
}

/**
 * Находит пользователя по verify_token.
 */
async function findUserByVerifyToken(token) {
  const [rows] = await pool.query(
    "SELECT * FROM users WHERE verify_token = ?",
    [token]
  );
  return rows[0]; // либо undefined
}

/**
 * Помечает email_verified = TRUE и сбрасывает verify_token.
 */
async function markEmailVerified(userId) {
  await pool.query(
    "UPDATE users SET email_verified = TRUE, verify_token = NULL WHERE id = ?",
    [userId]
  );
}

async function updatePasswordAndClearToken(userId, hashedPwd) {
  await pool.query(
    "UPDATE users SET password = ?, reset_token = NULL, reset_token_expires = NULL WHERE id = ?",
    [hashedPwd, userId]
  );
}


async function saveResetToken(userId, token) {
  // Устанавливаем время истечения через 1 час
  const expires = new Date(Date.now() + 60 * 60 * 1000);
  await pool.query(
    "UPDATE users SET reset_token = ?, reset_token_expires = ? WHERE id = ?",
    [token, expires, userId]
  );
}

// Найти пользователя по токену сброса пароля
async function findUserByResetToken(token) {
  const [rows] = await pool.query(
    'SELECT id, reset_token_expires FROM users WHERE reset_token = ?',
    [token]
  );
  return rows[0];
}

module.exports = {
  findUserByEmail,
  createUser,
  findUserByVerifyToken,
  markEmailVerified,
  saveResetToken,
  updatePasswordAndClearToken,
  findUserByResetToken
};

