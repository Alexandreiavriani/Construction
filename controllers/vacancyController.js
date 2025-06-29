// controllers/vacancyController.js
const Vacancy = require('../models/vacancyModel');

// ====================================================================
// 1) Public API: GET /vacancies?limit=...&offset=...
// ====================================================================
exports.getVacancies = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit, 10) || 10;
    const offset = parseInt(req.query.offset, 10) || 0;

    const totalItems = await Vacancy.countAll();
    const items = await Vacancy.findWithPagination(limit, offset);
    const totalPages = Math.ceil(totalItems / limit);
    const currentPage = Math.floor(offset / limit) + 1;

    res.json({
      items,
      pagination: { totalItems, totalPages, currentPage, pageSize: limit }
    });
  } catch (err) {
    console.error('vacancyController.getVacancies:', err);
    res.status(500).json({ message: 'Server error fetching vacancies' });
  }
};

// ====================================================================
// 2) Admin: GET one vacancy by ID (GET /admin/vacancies/:id)
// ====================================================================
exports.getVacancy = async (req, res) => {
  console.log('GET Vacancy Details ID:', req.params.id);
  console.log('BODY or PARAMS:', req.params);
  try {
    const id = parseInt(req.params.id, 10);
    const vacancy = await Vacancy.findById(id);
    if (vacancy) {
      return res.json(vacancy);
    } else {
      return res.status(404).json({ message: 'Vacancy not found' });
    }
  } catch (err) {
    console.error('vacancyController.getVacancy:', err);
    res.status(500).json({ message: 'Server error fetching vacancy' });
  }
};

// ====================================================================
// 3) Admin: Create new vacancy (POST /admin/vacancies)
// ====================================================================
exports.createVacancy = async (req, res) => {
  try {
    const { position, description, responsibilities, requirements, we_offer,location, job_type } = req.body;
    const insertId = await Vacancy.create({ position, description, responsibilities, requirements, we_offer,location, job_type });
    res.status(201).json({ id: insertId });
  } catch (err) {
    console.error('vacancyController.createVacancy:', err);
    res.status(500).json({ message: 'Server error creating vacancy' });
  }
};

// ====================================================================
// 4) Admin: Update existing vacancy (PUT /admin/vacancies/:id)
// ====================================================================
exports.updateVacancy = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const existing = await Vacancy.findById(id);
    if (!existing) {
      return res.status(404).json({ message: 'Vacancy not found' });
    }
    const { position, description, responsibilities, requirements, we_offer ,location, job_type} = req.body;
    await Vacancy.updateById({ id, position, description, responsibilities, requirements, we_offer, location, job_type });
    return res.json({ success: true });
  } catch (err) {
    console.error('vacancyController.updateVacancy:', err);
    res.status(500).json({ message: 'Server error updating vacancy' });
  }
};

// ====================================================================
// 5) Admin: Delete vacancy (DELETE /admin/vacancies/:id)
// ====================================================================
exports.deleteVacancy = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const existing = await Vacancy.findById(id);
    if (!existing) {
      return res.status(404).json({ message: 'Vacancy not found' });
    }
    await Vacancy.deleteById(id);
    return res.json({ success: true });
  } catch (err) {
    console.error('vacancyController.deleteVacancy:', err);
    res.status(500).json({ message: 'Server error deleting vacancy' });
  }
};

// ====================================================================
// 6) Admin: Get all vacancies without pagination (GET /admin/vacancies/all)
// ====================================================================
exports.getAllVacancies = async (req, res) => {
  try {
    const rows = await Vacancy.findAll();
    res.json(rows);
  } catch (err) {
    console.error('vacancyController.getAllVacancies:', err);
    res.status(500).json({ message: 'Server error fetching all vacancies' });
  }
};
