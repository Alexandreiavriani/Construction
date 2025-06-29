// File: models/pdfModel.js
const pool = require('../db');

async function uploadPDF({ title, description, price, imagePath, pdfPath }) {
  const sql = `INSERT INTO pdf_files (title, description, price, image_path, pdf_path) VALUES (?, ?, ?, ?, ?)`;
  await pool.query(sql, [title, description, price, imagePath, pdfPath]);
}

async function updatePDF(id, fields) {
  const cols = Object.keys(fields).map(key => `${key} = ?`).join(', ');
  const vals = [...Object.values(fields), id];
  await pool.query(`UPDATE pdf_files SET ${cols} WHERE id = ?`, vals);
}

async function deletePDF(id) {
  await pool.query('DELETE FROM pdf_files WHERE id = ?', [id]);
}

async function getAllPDFs() {
  const [rows] = await pool.query('SELECT * FROM pdf_files');
  return rows;
}

module.exports = { uploadPDF, updatePDF, deletePDF, getAllPDFs };