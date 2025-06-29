// controllers/admin/projectController.js
const path = require('path');
const projectModel = require('../models/projectModel');

// GET /admin/projects
exports.listProjects = async (req, res) => {
  try {
    const projects = await projectModel.getAll();

    if (req.xhr || req.headers.accept.includes('application/json')) {
      return res.json(projects);
    }

    res.sendFile(path.join(__dirname, '..', 'public', 'admin', 'projects.html'));
  } catch (err) {
    console.error('Ошибка при получении проектов:', err);
    res.status(500).send('Ошибка при получении проектов');
  }
};

// POST /admin/projects
exports.addProject = async (req, res) => {
  try {
    const { title, description, status } = req.body;
    const image = req.file ? `/uploads/${req.file.filename}` : null;

    await projectModel.insert({ title, description, image, status });
    res.redirect('/admin/projects');
  } catch (err) {
    console.error('Ошибка при добавлении проекта:', err);
    res.status(500).send('Ошибка при добавлении проекта');
  }
};

// PUT /admin/projects/:id
exports.updateProject = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, status } = req.body;
    const image = req.file ? `/uploads/${req.file.filename}` : undefined;

    await projectModel.update(id, { title, description, status, image });
    res.json({ success: true });
  } catch (err) {
    console.error('Ошибка при обновлении проекта:', err);
    res.status(500).json({ success: false });
  }
};


// GET /admin/projects/:id
exports.getProjectById = async (req, res) => {
  try {
    const { id } = req.params;
    const project = await projectModel.getById(id);

    if (!project) {
      return res.status(404).json({ error: 'Проект не найден' });
    }

    res.json(project);
  } catch (err) {
    console.error('Ошибка при получении проекта по ID:', err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
};



// DELETE /admin/projects/:id
exports.deleteProject = async (req, res) => {
  try {
    const { id } = req.params;
    await projectModel.delete(id);
    res.json({ success: true });
  } catch (err) {
    console.error('Ошибка при удалении проекта:', err);
    res.status(500).json({ success: false });
  }
};




// GET /projects?status=active|completed
exports.listProjectsPublic = async (req, res) => {
  try {
    const { status } = req.query;
    let projects = await projectModel.getAll();

    // фильтрация по статусу (если указан)
    if (status) {
      projects = projects.filter(p => p.status === status);
    }

    res.json(projects);
  } catch (err) {
    console.error('Ошибка при получении публичных проектов:', err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
};

// GET /projects/:id
exports.getProjectByIdPublic = async (req, res) => {
  try {
    const { id } = req.params;
    const project = await projectModel.getById(id);

    if (!project) {
      return res.status(404).json({ error: 'Проект не найден' });
    }

    res.json(project);
  } catch (err) {
    console.error('Ошибка при получении проекта по ID (public):', err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
};