// ============================================
// serviceRoutes.js
// CRUD completo de servicios. Todas las rutas requieren JWT válido.
// ============================================

const express = require('express');
const router = express.Router();
const serviceController = require('../controllers/serviceController');
const { verificarToken } = require('../middlewares/authMiddleware');

router.get('/', verificarToken, serviceController.listar);
router.get('/:id', verificarToken, serviceController.obtenerUno);
router.post('/', verificarToken, serviceController.crear);
router.put('/:id', verificarToken, serviceController.actualizar);
router.delete('/:id', verificarToken, serviceController.eliminar);
router.post('/:id/desbloquear', verificarToken, serviceController.desbloquear);

module.exports = router;
