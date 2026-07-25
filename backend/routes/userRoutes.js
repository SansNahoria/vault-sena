// ============================================
// userRoutes.js
// Todas estas rutas requieren estar autenticado (verificarToken),
// porque un usuario solo puede ver/editar/eliminar SU PROPIO perfil.
// ============================================

const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { verificarToken } = require('../middlewares/authMiddleware');

router.get('/perfil', verificarToken, userController.obtenerPerfil);
router.put('/perfil', verificarToken, userController.actualizarPerfil);
router.delete('/perfil', verificarToken, userController.eliminarPerfil);

module.exports = router;
