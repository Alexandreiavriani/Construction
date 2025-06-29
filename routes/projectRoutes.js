// // routes/projects.js
// const express = require('express');
// const router = express.Router();
// const multer = require('multer');
// const path = require('path');
// const projectController = require('../controllers/projectController');

// // Multer для загрузки картинок
// const storage = multer.diskStorage({
//   destination: (req, file, cb) => cb(null, path.join(__dirname, '../uploads')),
//   filename: (req, file, cb) => {
//     const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
//     cb(null, unique + path.extname(file.originalname));
//   }
// });
// const upload = multer({ storage });

// // GET /projects
// router.get('/admin/projects', projectController.listProjects);

// // POST /projects/add
// router.post('/admin/projects/add', upload.single('image'), projectController.addProject);

// // PUT /projects/:id
// router.put('/admin/projects/:id', upload.single('image'), projectController.updateProject);

// // DELETE /projects/:id
// router.delete('/admin/projects/:id', projectController.deleteProject);


// router.get('/admin/projects/:id', projectController.getProjectById);

// module.exports = router;


// routes/projectRoutes.js
const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const projectController = require('../controllers/projectController');
const adminAuth = require('../middlewares/adminAuth'); // ваш middleware авторизации администратора

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
 * ПУБЛИЧНАЯ ЧАСТЬ
 * GET /projects         — список всех проектов, с опцией фильтра ?status=
 * GET /projects/:id     — детали одного проекта
 */
router.get('/api/projects', projectController.listProjectsPublic);
router.get('/api/projects/:id', projectController.getProjectByIdPublic);

/**
 * АДМИНСКАЯ ЧАСТЬ (под /admin)
 */
// Список (рендер шаблона или JSON для AJAX)
router.get('/admin/projects', adminAuth, projectController.listProjects);

// Добавление нового
router.post('/admin/projects/add', adminAuth, upload.single('image'), projectController.addProject);

// Получить один проект (для формы редактирования)
router.get('/admin/projects/:id', adminAuth, projectController.getProjectById);

// Обновление проекта
router.put('/admin/projects/:id', adminAuth, upload.single('image'), projectController.updateProject);

// Удаление проекта
router.delete('/admin/projects/:id', adminAuth, projectController.deleteProject);

module.exports = router;
