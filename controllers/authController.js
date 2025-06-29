// File: controllers/authController.js
const userModel = require('../models/userModel');
const bcrypt = require('bcrypt');
const crypto = require("crypto");
const nodemailer = require("nodemailer");

//  Настройка nodemailer (SMTP). Задайте свои значения в .env.

console.log('EMAIL_USER =', process.env.EMAIL_USER);
console.log('EMAIL_PASS =', process.env.EMAIL_PASS);

const transporter = nodemailer.createTransport({
  service: "gmail",    // например, "smtp.gmail.com" для Gmail
  port: 587,                   // 587 (STARTTLS) или 465 (SSL)
  secure: false,               // true, если порт 465
  auth: {
    user: process.env.EMAIL_USER, // EMAIL_USER в .env
    pass: process.env.EMAIL_PASS, // EMAIL_PASS в .env
  },
});

// Проверяем соединение сразу после создания транспорта
transporter.verify(function(error, success) {
  if (error) {
    console.error("SMTP-верификация НЕ прошла. Ошибка:", error);
  } else {
    console.log("SMTP-верификация прошла успешно. Готовы отправлять письма.");
  }
});

// exports.register = async (req, res) => {
//   try {
//     const { first_name, last_name, email, password} = req.body;
//     const exists = await userModel.findUserByEmail(email);
//     if (exists) return res.send('Email уже зарегистрирован');
//     await userModel.createUser(first_name, last_name, email, password);
//     res.redirect('/login.html');
//   } catch (err) {
//     console.error(err);
//     res.status(500).send('Ошибка сервера');
//   }
// };


exports.register = async (req, res) => {
  
    const { first_name, last_name, email, password , confirm_password } = req.body;
    

    if (!first_name) {
      return res.status(400).json({ field: "firstName", message: "Enter first name" });
    }

    if (!last_name) {
      return res.status(400).json({ field: "lastName", message: "Enter first name" });
    }

    if (!email) {
      return res.status(400).json({ field: "email", message: "Enter email" });
    }

    if (!password) {
      return res.status(400).json({ field: "password", message: "Enter password" });
    }

    if (!confirm_password) {
      return res.status(400).json({ field: "confirm", message: "Enter password" });
    }

    if (password !== confirm_password) {
        return res.status(400).json({ field: "confirm", message: "The passwords do not match"});
    }

    const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRe.test(email)) {
      return res.status(400).json({ field: "email", message: "Incorrect email" });
    }

     // 4) Проверяем длину пароля
    if (password.length < 6) {
      return res.status(400).json({ field: "password", message: "Minimum 6 symbols" });
    }

    // 1) Проверяем, нет ли уже пользователя с таким email
    const exists = await userModel.findUserByEmail(email);
    if (exists) {
      return res
        .status(400)
        .json({ field: "email", message: "Email already registered" });
    }



    // 2) Генерируем токен для верификации (32 байта → 64-символьная hex-строка)
    const verifyToken = crypto.randomBytes(32).toString("hex");

    // 3) Создаём пользователя с этим токеном (email_verified = FALSE по умолчанию)
    await userModel.createUser(first_name, last_name, email, password, verifyToken);

    // 4) Формируем ссылку для подтверждения
    const verificationUrl = `${req.protocol}://${req.get("host")}/user/verify?token=${verifyToken}`;

    // 5) Отправляем письмо пользователю
    const mailOptions = {
      from: `"Construction" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Confirm your email on Construction",
      html: `
        <h2>Hello, ${first_name}!</h2>
        <p>Thank you for registering on our website. Please follow the link below to confirm your email.:</p>
        <p><a href="${verificationUrl}">Confirm email</a></p>
        <p>If you have not registered on our site, simply ignore this letter.</p>
        <hr>
        <p>Yours faithfully,<br>Construction</p>
      `,
    };
try {
    await transporter.sendMail(mailOptions);

    // 6) Оповещаем клиента, что письмо отправлено
   return res.redirect(`/verify_notice.html?email=${encodeURIComponent(email)}`);
  } catch (mailErr) {
    console.error("Ошибка при отправке письма подтверждения:", mailErr);
    return res.status(500).send("Регистрация выполнена, но не удалось отправить письмо подтверждения. Попробуйте позже.");
  }
};




exports.verifyEmail = async (req, res) => {
  const token = req.query.token;
  if (!token) {
    return res.status(400).send("Invalid confirmation link.");
  }

  try {
    // Ищем пользователя по этому токену
    const user = await userModel.findUserByVerifyToken(token);
    if (!user) {
      return res.status(400).send("Ссылка недействительна или уже использована.");
    }

    // Помечаем email_verified = TRUE и обнуляем verify_token
    await userModel.markEmailVerified(user.id);

    // Перенаправляем или отправляем текст
    // return res.send("Email успешно подтверждён! Теперь вы можете войти.");
    // return res.redirect(`/login.html?verified=1`);

    return res.send(`
  <script>
    // Отметим, что email подтверждён
    localStorage.setItem("email_verified", "true");
    
    // Через 1.5 секунды редиректим на login.html
    setTimeout(() => {
      window.location.href = "/login.html?verified=1";
    }, 1500);
  </script>
  <p style="font-family: sans-serif; text-align: center; margin-top: 50px;">
    Email confirmed! Redirecting to login page...
  </p>
`);
  } catch (err) {
    console.error("Ошибка при подтверждении email:", err);
    return res.status(500).send("Ошибка сервера при подтверждении email.");
  }
};



exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    // 1) Проверяем, есть ли пользователь с таким email
    const user = await userModel.findUserByEmail(email);

    if (!email) {
      return res.status(400).json({ error: "Enter email" });
    }

    const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRe.test(email)) {
      return res.status(400).json({ error: "Incorrect email" });
    }

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // 2) Генерируем токен сброса
    const resetToken = crypto.randomBytes(32).toString("hex");
    // Сохраняем токен + время истечения (1 час) в БД
    await userModel.saveResetToken(user.id, resetToken);

    // 3) Формируем ссылку для сброса пароля
    // Предполагаем, что у тебя есть страница reset_password.html, которая принимает токен в query
    const resetURL = `${req.protocol}://${req.get("host")}/reset_password.html?token=${resetToken}`;

    // 4) Отправляем письмо
    const mailOptions = {
      from: `"MyApp Support" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Password Reset Request",
      html: `
        <h3>Hello ${user.first_name},</h3>
        <p>You requested a password reset. Click the link below to set a new password:</p>
        <p><a href="${resetURL}">Reset your password</a></p>
        <p>If you did not request this, please ignore this email.</p>
      `,
    };
    await transporter.sendMail(mailOptions);

    // 5) Отвечаем клиенту
    return res.json({ message: "Recovery email sent successfully." });
  } catch (err) {
    console.error("Error in forgotPassword:", err);
    return res.status(500).json({ error: "Server error. Please try again later." });
  }
};


exports.resetPassword = async (req, res) => {
  try {
    const { token, password } = req.body;
    // 1) Найдём пользователя с таким токеном и проверим срок годности
    console.log("resetPassword: получен токен =", token);    // Лог токена
    console.log("resetPassword: новый пароль =", password);  // Лог пароля (или длины, чтобы не коммитить реальный)
    

    if (!password) {
      return res.status(400).json({ error: "Enter Password" });
    }

    if (password.length < 6) {
        return res.status(400).json({ error :"Password must be at least 6 characters"});

    }

   

    const user = await userModel.findUserByResetToken(token);
    if (!user) {
      return res.status(400).json({ error: "Invalid or expired token." });
    }
    if (new Date() > new Date(user.reset_token_expires)) {
      return res.status(400).json({ error: "Token has expired. Request a new one." });
    }

    // 2) Хешируем новый пароль и сохраняем его, обнуляем reset_token
    const hashedPwd = await bcrypt.hash(password, 10);
    await userModel.updatePasswordAndClearToken(user.id, hashedPwd);

    // 3) Ответ
    res.json({ message: "Password successfully reset." });
  } catch (err) {
    console.error("Error in resetPassword:", err);
    res.status(500).json({ error: "Server error." });
  }
};





exports.adminLogin = (req, res) => {
  const { username, password_admin } = req.body;
  const creds = { username: process.env.ADMIN_USERNAME, password_admin: process.env.ADMIN_PASSWORD };
  if (username === creds.username && password_admin === creds.password_admin) {
    req.session.isAdmin = true;
    return res.sendStatus(200);
  }
  res.sendStatus(401);
};







exports.userLogin = async (req, res) => {

  try {
     
    const { email, password } = req.body;
    const user = await userModel.findUserByEmail(email);

    if (!email) {
      // Вернём 400 Bad Request — клиент покажет "Server error", 
      // потому что ваш JS обрабатывает всё, что не 200/401, как "Server error"
      return res.status(400).json({ error: "Enter Email" });
    }
    if (!password) {
      return res.status(400).json({ error: "Enter Password" });
    }

    // 2) Базовая проверка формата email (client уже проверял, но на всякий случай)
    const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRe.test(email)) {
      return res.status(400).json({ error: "Incorrect email format" });
    }

    // 3) Проверка минимальной длины пароля (client тоже делал)
    if (password.length < 6) {
      return res.status(400).json({ error: "Minimum 6-character password" });
    }



    if (!user) {
      // возвращаем только статус и JSON-ошибку
      return res.status(401).json({ error: 'Incorrect email or password'});
    }

      // Если email_verified = FALSE → запрещаем вход
    if (!user.email_verified) {
      return res.status(403).json({ error: "Please confirm your email first" });
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(401).json({ error: 'Incorrect email or password' });
    }
    // Успешный логин
    req.session.userId = user.id;
    req.session.userName = user.first_name;
    req.session.userEmail = user.email;
    // отдаём клиенту чистый 200 с JSON
    res.json({ message: 'success' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};



exports.getUserInfo = (req, res) => {
  if (req.session.userId) {
    res.json({
      id: req.session.userId,
      name: req.session.userName,
      email:req.session.userEmail
    });
  } else {
    res.status(401).json({ error: 'Not authenticated' });
  }
};

// exports.logout = (req, res) => {
//   req.session.destroy(err => {
//     if (err) console.error(err);
//     res.clearCookie('admin.sid');
    
//     if (req.headers.referer && req.headers.referer.includes('/admin')) {
//       return res.redirect('/admin/login.html');
//     }

//     res.redirect('/');
//   });
// };

exports.logout = (req, res) => {
  if (req.session) {
    // Удаляем только данные обычного пользователя
    delete req.session.userId;
    delete req.session.username; // если используешь

    // НЕ удаляем isAdmin, чтобы не выходить из админки
  }

  res.clearCookie('admin.sid'); // можно оставить, если используешь одну куку и она не ломает админа

  // Перенаправляем на нужную страницу
  if (req.headers.referer && req.headers.referer.includes('/admin')) {
    return res.redirect('/admin/login.html');
  }

  res.redirect('/');
};

exports.adminLogout = (req, res) => {
  if (req.session) {
    // удаляем только флаг isAdmin
    delete req.session.isAdmin;
  }
  // чистим куку админской сессии
  res.clearCookie('admin.sid');
  // редиректим обратно на форму логина в админке
  res.redirect('/admin/login.html');
};

