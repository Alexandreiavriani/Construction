// File: routes/authRoutes.js
const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');


router.post('/register', authController.register);
// Подтверждение email
router.get("/user/verify", authController.verifyEmail);

router.post('/admin/login', authController.adminLogin);
router.get('/admin/logout', authController.adminLogout);

router.post('/user/login', authController.userLogin);
router.get('/logout', authController.logout);
// 🆕 Новый маршрут для получения данных о пользователе
router.get('/user-info', authController.getUserInfo);

// 🆕 если авторизированный пользователь зашел в login,его перенаправят обратно в index
router.get("/api/check-auth", (req, res) => {
  if (req.session.userId) {
    return res.json({
      loggedIn: true,
      user: {
        id: req.session.userId,
        name: req.session.userName,
        email: req.session.userEmail
      }
    });
  }
  res.json({ loggedIn: false });
});

router.post("/forgot-password", authController.forgotPassword);

router.get('/user/logout', authController.logout);

// Маршрут для отправки email с ссылкой на сброс пароля
router.post("/user/forgot-password", authController.forgotPassword);

// Путь, куда отправляет reset_password.html форму
router.post("/user/reset-password", authController.resetPassword);

module.exports = router;