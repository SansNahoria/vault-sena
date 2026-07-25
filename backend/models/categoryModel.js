// ============================================
// categoryModel.js
// Consulta simple: solo necesitamos LEER las categorías
// para llenar el <select> del formulario de servicios en el frontend.
// (Las categorías ya vienen precargadas por script.sql)
// ============================================

const { pool } = require('../config/mysql');

async function listarCategorias() {
  const [filas] = await pool.query('SELECT id, nombre FROM categorias ORDER BY nombre ASC');
  return filas;
}

module.exports = { listarCategorias };
