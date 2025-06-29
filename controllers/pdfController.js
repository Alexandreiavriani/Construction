// File: controllers/pdfController.js
const pdfModel = require('../models/pdfModel');
const fs = require('fs');
const path = require('path');

exports.upload = async (req, res) => {
  try {
    const { title, description = '', price = 0 } = req.body;
    const imagePath = req.files['image_path'][0].filename;
    const pdfPath = req.files['pdf_path'][0].filename;
    await pdfModel.uploadPDF({ title, description, price, imagePath, pdfPath });
    res.sendStatus(200);
  } catch (err) {
    console.error(err);
    res.status(500).send('Ошибка при сохранении');
  }
};

exports.edit = async (req, res) => {
  try {
    const id = req.params.id;
    const fields = {};
    ['title','description','price'].forEach(f => {
      if (req.body[f]) fields[f] = req.body[f];
    });
    if (req.files.image_path) fields.image_path = req.files.image_path[0].filename;
    if (req.files.pdf_path) fields.pdf_path = req.files.pdf_path[0].filename;
    await pdfModel.updatePDF(id, fields);
    res.sendStatus(200);
  } catch (err) {
    console.error(err);
    res.status(500).send('Ошибка сервера');
  }
};

exports.delete = async (req, res) => {
  try {
    const id = req.params.id;
    const rows = await pdfModel.getAllPDFs();
    const file = rows.find(r => r.id == id);
    if (file) {
      fs.unlinkSync(path.join('uploads', file.image_path));
      fs.unlinkSync(path.join('uploads', file.pdf_path));
    }
    await pdfModel.deletePDF(id);
    res.sendStatus(200);
  } catch (err) {
    console.error(err);
    res.status(500).send('Ошибка сервера');
  }
};

exports.list = async (req, res) => {
  try {
    const list = await pdfModel.getAllPDFs();
    res.json(list);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
};