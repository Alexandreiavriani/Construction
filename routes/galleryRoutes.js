// routes/galleryRoutes.js
// -----------------------
// В этом единственном файле объединены публичные и административные маршруты.
// Для админ-части используется middleware `adminAuth`, который у вас уже настроен.

const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const adminAuth = require('../middlewares/adminAuth'); // ваш middleware авторизации администратора
const galleryController = require('../controllers/galleryController');

// Multer для загрузки картинок
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, path.join(__dirname, '../uploads')),
  filename: (req, file, cb) => {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, unique + path.extname(file.originalname));
  }
});
const upload = multer({ storage });

/**
 * 1) Публичная часть
 *    GET  /gallery?type=photo&page=1&limit=9
 */
// 1) Публичная галерея
router.get('/', galleryController.getGallery);

// 2.5) Админ: Получить все элементы
router.get('/all', adminAuth, galleryController.getAllItems);

// 3) Админ: Получить один элемент
router.get('/:id', adminAuth, galleryController.getItem);

// 4) Админ: Загрузка нового
router.post('/upload', adminAuth, upload.single('file'), galleryController.uploadItem);

// 5) Обновление
router.put('/:id', adminAuth, upload.single('file'), galleryController.updateItem);

// 6) Удаление
router.delete('/:id', adminAuth, galleryController.deleteItem);

module.exports = router;


