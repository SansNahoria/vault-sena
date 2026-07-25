// ============================================
// authRoutes.js
// Define las URLs relacionadas a autenticación y las conecta
// con las funciones del authController.
// ============================================

const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

router.post('/registro', authController.registro);
router.post('/login', authController.login);

module.exports = router;
