// ============================================
// categoryRoutes.js
// Requiere estar logueado (verificarToken) porque es información
// que solo se usa dentro de la app, no es pública.
// ============================================

const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categoryController');
const { verificarToken } = require('../middlewares/authMiddleware');

router.get('/', verificarToken, categoryController.listar);

module.exports = router;
