// File: routes/pdfRoutes.js
const express = require('express');
const router = express.Router();
const pdfController = require('../controllers/pdfController');
const adminAuth = require('../middlewares/adminAuth');
const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, path.join(__dirname, '../uploads')),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, Date.now() + ext);
  }
});
const upload = multer({ storage });

router.post('/admin/upload-pdf', adminAuth, upload.fields([{ name: 'image_path' }, { name: 'pdf_path' }]), pdfController.upload);
router.put('/admin/edit-pdf/:id', adminAuth, upload.fields([{ name: 'image_path' }, { name: 'pdf_path' }]), pdfController.edit);
router.delete('/admin/delete-pdf/:id', adminAuth, pdfController.delete);
router.get('/admin/pdf-list', adminAuth, pdfController.list);

module.exports = router;
