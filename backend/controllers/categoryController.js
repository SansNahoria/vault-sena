// ============================================
// categoryController.js
// Solo expone un GET, porque las categorías son datos fijos
// que ya vienen precargados en la base de datos (script.sql).
// ============================================

const categoryModel = require('../models/categoryModel');

async function listar(req, res) {
  try {
    const categorias = await categoryModel.listarCategorias();
    res.json(categorias);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al listar las categorías' });
  }
}

module.exports = { listar };
