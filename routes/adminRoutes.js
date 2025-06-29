// File: routes/adminRoutes.js
const express = require('express');
const router = express.Router();
const path = require('path');
const adminAuth = require('../middlewares/adminAuth');
const authController = require('../controllers/authController');

router.get('/admin', adminAuth, (req, res) => {
  res.sendFile(path.join(__dirname, '../public/admin/index.html'));
});



module.exports = router;
