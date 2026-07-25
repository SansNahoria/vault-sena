// ============================================
// logger.js
// Función centralizada para guardar un registro de log.
// La usamos en los controladores cada vez que ocurre una acción importante.
// ============================================

const Log = require('../models/logModel');

async function registrarLog({ usuario_id, correo, accion, descripcion, ip }) {
  try {
    await Log.create({ usuario_id, correo, accion, descripcion, ip });
  } catch (error) {
    // Si falla el log, NO debe romper la aplicación principal,
    // solo lo mostramos en consola para depurar.
    console.error('⚠️ Error al guardar log:', error.message);
  }
}

module.exports = { registrarLog };
