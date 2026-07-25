// ============================================
// authController.js
// Contiene la lógica de: registro de usuario y login.
// ============================================

const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const userModel = require('../models/userModel');
const { registrarLog } = require('../utils/logger');

const SALT_ROUNDS = 10; // "costo" del hash de bcrypt (10 es un valor estándar seguro)

// ------------------------------------------------
// POST /api/auth/registro
// ------------------------------------------------
async function registro(req, res) {
  try {
    const { nombre, correo, password } = req.body;

    // Validación básica de campos obligatorios
    if (!nombre || !correo || !password) {
      return res.status(400).json({ error: 'Nombre, correo y contraseña son obligatorios' });
    }

    // Verificar que el correo no esté ya registrado
    const usuarioExistente = await userModel.buscarPorCorreo(correo);
    if (usuarioExistente) {
      return res.status(409).json({ error: 'Ese correo ya está registrado' });
    }

    // Cifrar la contraseña con bcrypt ANTES de guardarla
    // bcrypt genera un hash irreversible: nunca se puede "desencriptar",
    // solo se puede comparar con bcrypt.compare()
    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

    const nuevoId = await userModel.crearUsuario(nombre, correo, passwordHash);

    // Guardar log del registro en MongoDB
    await registrarLog({
      usuario_id: nuevoId,
      correo,
      accion: 'registro',
      descripcion: `Usuario ${nombre} se registró correctamente`,
      ip: req.ip
    });

    res.status(201).json({ mensaje: 'Usuario registrado con éxito', id: nuevoId });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error en el servidor al registrar usuario' });
  }
}

// ------------------------------------------------
// POST /api/auth/login
// ------------------------------------------------
async function login(req, res) {
  try {
    const { correo, password } = req.body;

    if (!correo || !password) {
      return res.status(400).json({ error: 'Correo y contraseña son obligatorios' });
    }

    const usuario = await userModel.buscarPorCorreo(correo);
    if (!usuario) {
      return res.status(401).json({ error: 'Correo o contraseña incorrectos' });
    }

    // Comparar la contraseña ingresada con el hash guardado
    const passwordValida = await bcrypt.compare(password, usuario.password_hash);
    if (!passwordValida) {
      return res.status(401).json({ error: 'Correo o contraseña incorrectos' });
    }

    // Generar el token JWT
    // El "payload" (datos dentro del token) solo lleva id y correo,
    // NUNCA se debe meter información sensible como la contraseña.
    const token = jwt.sign(
      { id: usuario.id, correo: usuario.correo },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    await registrarLog({
      usuario_id: usuario.id,
      correo: usuario.correo,
      accion: 'login',
      descripcion: `Usuario ${usuario.nombre} inició sesión`,
      ip: req.ip
    });

    res.json({
      mensaje: 'Login exitoso',
      token,
      usuario: { id: usuario.id, nombre: usuario.nombre, correo: usuario.correo }
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error en el servidor al iniciar sesión' });
  }
}

module.exports = { registro, login };
