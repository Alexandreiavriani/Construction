const express = require('express');
const router = express.Router();
const adminAuth = require('../middlewares/adminAuth');
const vacancyController = require('../controllers/vacancyController');
const multer = require('multer');            // ⬅️ вот это добавь
const upload = multer();   
/**
 * 1) Public API
 *    GET /vacancies?limit=...&offset=...
 */
router.get('/', vacancyController.getVacancies);

router.get('/:id/details', vacancyController.getVacancy);
/**
 * 2) Admin: Get all vacancies (no pagination)
 *    GET /admin/vacancies/all
 */
router.get('/all', adminAuth, vacancyController.getAllVacancies);

/**
 * 3) Admin: Get one vacancy by ID
 *    GET /admin/vacancies/:id
 */
router.get('/:id', adminAuth, vacancyController.getVacancy);

/**
 * 4) Admin: Create new vacancy
 *    POST /admin/vacancies
 */
router.post('/', adminAuth, upload.none(), vacancyController.createVacancy);

/**
 * 5) Admin: Update existing vacancy
 *    PUT /admin/vacancies/:id
 */
router.put('/:id', adminAuth, vacancyController.updateVacancy);

/**
 * 6) Admin: Delete vacancy
 *    DELETE /admin/vacancies/:id
 */
router.delete('/:id', adminAuth, vacancyController.deleteVacancy);

module.exports = router;// controllers/vacancyController.js