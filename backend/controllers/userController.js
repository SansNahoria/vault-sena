// ============================================
// userController.js
// CRUD del propio perfil del usuario autenticado.
// El "Create" (POST) ya se hizo en authController.registro,
// por eso aquí solo va Read, Update y Delete.
// ============================================

const bcrypt = require('bcrypt');
const userModel = require('../models/userModel');
const { registrarLog } = require('../utils/logger');

// ------------------------------------------------
// GET /api/usuarios/perfil
// Obtiene los datos del usuario autenticado (según su token)
// ------------------------------------------------
async function obtenerPerfil(req, res) {
  try {
    const usuario = await userModel.buscarPorId(req.usuario.id);
    if (!usuario) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }
    res.json(usuario);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener el perfil' });
  }
}

// ------------------------------------------------
// PUT /api/usuarios/perfil
// Actualiza nombre y correo del usuario autenticado
// ------------------------------------------------
async function actualizarPerfil(req, res) {
  try {
    const { nombre, correo } = req.body;

    if (!nombre || !correo) {
      return res.status(400).json({ error: 'Nombre y correo son obligatorios' });
    }

    await userModel.actualizarUsuario(req.usuario.id, nombre, correo);

    await registrarLog({
      usuario_id: req.usuario.id,
      correo,
      accion: 'editar_perfil',
      descripcion: `Usuario actualizó su perfil (nombre: ${nombre})`,
      ip: req.ip
    });

    res.json({ mensaje: 'Perfil actualizado correctamente' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al actualizar el perfil' });
  }
}

// ------------------------------------------------
// DELETE /api/usuarios/perfil
// Elimina la cuenta del usuario autenticado
// (gracias a ON DELETE CASCADE en MySQL, sus servicios también se borran)
// ------------------------------------------------
async function eliminarPerfil(req, res) {
  try {
    await registrarLog({
      usuario_id: req.usuario.id,
      correo: req.usuario.correo,
      accion: 'eliminar_cuenta',
      descripcion: 'Usuario eliminó su cuenta',
      ip: req.ip
    });

    await userModel.eliminarUsuario(req.usuario.id);

    res.json({ mensaje: 'Cuenta eliminada correctamente' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al eliminar la cuenta' });
  }
}

module.exports = { obtenerPerfil, actualizarPerfil, eliminarPerfil };
