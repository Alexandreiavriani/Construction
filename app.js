// const express = require('express');
// const path = require('path');
// const session = require('express-session');
// const dotenv = require('dotenv');

// const authRoutes    = require('./routes/authRoutes');
// const pdfRoutes     = require('./routes/pdfRoutes');
// const adminRoutes   = require('./routes/adminRoutes');
// const projectRoutes = require('./routes/projectRoutes');
// const contactRoutes = require('./routes/contactRoutes');
// const galleryRoutes = require('./routes/galleryRoutes');
// const adminAuth = require('./middlewares/adminAuth');

// dotenv.config();
// const app = express();

// app.use(express.urlencoded({ extended: true }));
// app.use(express.json());

// app.use(session({
//   name: 'admin.sid',
//   secret: process.env.SESSION_SECRET || 'super_secret_key',
//   resave: false,
//   saveUninitialized: false,
//   rolling: true, //  обновляет maxAge при каждом запросе
//   cookie: { maxAge: 1000 * 60 * 60 * 24 * 7, sameSite: 'lax', secure: false }
// }));

// // Логирование
// app.use((req, res, next) => {
//   console.log(`${req.method} ${req.url}`);
//   next();
// });

// // Другие роуты (auth, pdf, admin общего назначения и т.д.)
// app.use('/api', authRoutes);
// app.use(authRoutes);
// app.use(pdfRoutes);
// // app.use(adminRoutes);
// app.use('/', authRoutes);

// // === ПУБЛИЧНЫЙ РОУТ ГАЛЕРЕИ: до статики! ===
// app.use('/gallery', galleryRoutes);

// // === СТАТИЧЕСКИЕ ФАЙЛЫ ===
// app.use(express.static(path.join(__dirname, 'public')));
// app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// app.use(contactRoutes);

// // Админский роут галереи (для добавления/редактирования/удаления)
// app.use('/admin/gallery',adminAuth, galleryRoutes);

// // Проекты
// app.use(projectRoutes);

// // Главная
// app.get('/', (req, res) => res.redirect('/admin/projects'));

// // отдаём страницу логина без проверки
// app.get('/admin/login', (req, res) => {
//   res.sendFile(path.join(__dirname, 'public', 'admin', 'login.html'));
// });

// // все /admin/* теперь только для авторизованных
// app.use('/admin', adminAuth, adminRoutes);
// app.use(
//   '/admin',
//   adminAuth,
//   express.static(path.join(__dirname, 'public', 'admin'))
// );

// // Глобальный обработчик ошибок
// app.use((err, req, res, next) => {
//   console.error(err.stack);
//   res.status(500).send('Ошибка сервера');
// });

// const PORT = process.env.PORT || 3000;
// app.listen(PORT, () => console.log(`Сервер запущен: http://localhost:${PORT}`));


// File: app.js
const express = require('express');
const path    = require('path');
const session = require('express-session');
const dotenv  = require('dotenv');

dotenv.config();
const app = express();

const authRoutes    = require('./routes/authRoutes');
const pdfRoutes     = require('./routes/pdfRoutes');
const adminRoutes   = require('./routes/adminRoutes');
const projectRoutes = require('./routes/projectRoutes');
const contactRoutes = require('./routes/contactRoutes');
const galleryRoutes = require('./routes/galleryRoutes');
const vacancyRoutes = require('./routes/vacancyRoutes');
const adminAuth     = require('./middlewares/adminAuth');

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(session({
  name: 'admin.sid',
  secret: process.env.SESSION_SECRET || 'super_secret_key',
  resave: false,
  saveUninitialized: false,
  rolling: true, // обновляет maxAge при каждом запросе
  cookie: { maxAge: 1000 * 60 * 60 * 24 * 7, sameSite: 'lax', secure: false, httpOnly: true }
}));

// Логирование запросов
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

// --- ПУБЛИЧНАЯ СТАТИКА ---
app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// --- ПУБЛИЧНЫЕ МАРШРУТЫ ---

// Главная страница
app.get('/', (req, res) => {
  console.log('GET / обработан');
  res.render('index', { title: 'Главная' });
});

app.get('/index', (req, res) => {
  console.log('GET / обработан');
  res.render('index', { title: 'Главная' });
});

app.get('/who_we_are', (req, res) => {
  console.log('GET / обработан');
  res.render('who_we_are', { title: 'Главная' });
});

// Страницы проектов (спа)
app.get('/projects', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'projects.html'));
});
app.get('/projects/:id', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'projects.html'));
});

// --- АВТОРИЗАЦИЯ АДМИНА ---

// Страница логина без проверки сессии
app.get('/admin/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'admin', 'login.html'));
});

// Защита админских маршрутов (кроме /admin/login)
app.use('/admin', (req, res, next) => {
  if (req.path === '/login') return next();
  adminAuth(req, res, next);
});

// Статика админки (css, js, html)
app.use('/admin', express.static(path.join(__dirname, 'public', 'admin')));

// Дополнительные админские роуты
app.use('/admin', adminRoutes);
app.use('/admin/gallery', galleryRoutes);
app.use('/admin/vacancies', vacancyRoutes);

// --- ОСТАЛЬНЫЕ РОУТЫ ---

app.use(authRoutes);
app.use('/api', authRoutes);
app.use('/api/auth', authRoutes);

app.use(pdfRoutes);
app.use('/gallery', galleryRoutes);

app.use(contactRoutes);

app.use(projectRoutes);
app.use('/api', projectRoutes);

app.use('/vacancies', vacancyRoutes);

// --- ОБРАБОТКА ОШИБОК ---

// 404 - не найдено
app.use((req, res) => {
  res.status(404).send(`
    <html>
      <head><title>404</title></head>
      <body style="font-family: sans-serif; text-align: center; margin-top: 100px;">
        <h1>404 — There is no such page here</h1>
        <p><a href="/">Return to home</a></p>
      </body>
    </html>
  `);
});

// 500 - ошибка сервера
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Ошибка сервера');
});

// --- СТАРТ СЕРВЕРА ---
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Сервер запущен: http://localhost:${PORT}`);
});
