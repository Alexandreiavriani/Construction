// File: routes/contactRoutes.js
const express = require('express');
const router = express.Router();

// Импортируем контроллер
const { sendContactForm } = require('../controllers/contactController');

// Здесь просто говорим: при POST на "/contact" вызывай контроллер
router.post('/contact', sendContactForm);

module.exports = router;
