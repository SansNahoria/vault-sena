// ============================================
// serviceController.js
// CRUD completo de servicios guardados por el usuario.
//
// Manejo de datos sensibles:
// - password_servicio -> se CIFRA (reversible) con AES, porque luego
//   hay que poder mostrársela al usuario.
// - pin y respuesta -> se HASHEAN (irreversible) con bcrypt, porque
//   solo necesitamos COMPARARLOS para verificar, nunca mostrarlos.
// ============================================

const bcrypt = require('bcrypt');
const serviceModel = require('../models/serviceModel');
const { cifrar, descifrar } = require('../utils/crypto');
const { registrarLog } = require('../utils/logger');

const SALT_ROUNDS = 10;

// ------------------------------------------------
// GET /api/servicios
// Lista todos los servicios del usuario autenticado.
// NO incluye la contraseña real (se mantiene oculta).
// ------------------------------------------------
async function listar(req, res) {
  try {
    const servicios = await serviceModel.listarPorUsuario(req.usuario.id);
    res.json(servicios);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al listar los servicios' });
  }
}

// ------------------------------------------------
// GET /api/servicios/:id
// Obtiene un servicio específico (sin mostrar la contraseña real).
// ------------------------------------------------
async function obtenerUno(req, res) {
  try {
    const servicio = await serviceModel.obtenerPorIdYUsuario(req.params.id, req.usuario.id);
    if (!servicio) {
      return res.status(404).json({ error: 'Servicio no encontrado' });
    }
    // Ocultamos los datos sensibles en esta respuesta general
    delete servicio.password_servicio;
    delete servicio.pin;
    delete servicio.respuesta;
    res.json(servicio);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener el servicio' });
  }
}

// ------------------------------------------------
// POST /api/servicios
// Crea un nuevo servicio para el usuario autenticado
// ------------------------------------------------
async function crear(req, res) {
  try {
    const {
      categoria_id, nombre_servicio, usuario_servicio, correo_servicio,
      password_servicio, url, notas, metodo_desbloqueo, pin, pregunta, respuesta
    } = req.body;

    // Validaciones básicas
    if (!nombre_servicio || !password_servicio || !categoria_id || !metodo_desbloqueo) {
      return res.status(400).json({ error: 'Faltan campos obligatorios' });
    }
    if (metodo_desbloqueo === 'pin' && (!pin || pin.length !== 4)) {
      return res.status(400).json({ error: 'El PIN debe tener exactamente 4 dígitos' });
    }
    if (metodo_desbloqueo === 'pregunta' && (!pregunta || !respuesta)) {
      return res.status(400).json({ error: 'Debe indicar pregunta y respuesta' });
    }

    const datos = {
      usuario_id: req.usuario.id,
      categoria_id,
      nombre_servicio,
      usuario_servicio: usuario_servicio || null,
      correo_servicio: correo_servicio || null,
      password_servicio: cifrar(password_servicio), // cifrado reversible
      url: url || null,
      notas: notas || null,
      metodo_desbloqueo,
      pin: pin ? await bcrypt.hash(pin, SALT_ROUNDS) : null,
      pregunta: pregunta || null,
      respuesta: respuesta ? await bcrypt.hash(respuesta.toLowerCase().trim(), SALT_ROUNDS) : null
    };

    const nuevoId = await serviceModel.crearServicio(datos);

    await registrarLog({
      usuario_id: req.usuario.id,
      correo: req.usuario.correo,
      accion: 'crear_servicio',
      descripcion: `Se guardó el servicio "${nombre_servicio}"`,
      ip: req.ip
    });

    res.status(201).json({ mensaje: 'Servicio guardado correctamente', id: nuevoId });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al crear el servicio' });
  }
}

// ------------------------------------------------
// PUT /api/servicios/:id
// Actualiza un servicio existente (debe pertenecer al usuario)
// ------------------------------------------------
async function actualizar(req, res) {
  try {
    const { id } = req.params;

    // Verificar que el servicio exista y sea del usuario autenticado
    const existente = await serviceModel.obtenerPorIdYUsuario(id, req.usuario.id);
    if (!existente) {
      return res.status(404).json({ error: 'Servicio no encontrado' });
    }

    const {
      categoria_id, nombre_servicio, usuario_servicio, correo_servicio,
      password_servicio, url, notas, metodo_desbloqueo, pin, pregunta, respuesta
    } = req.body;

    const datos = {
      categoria_id: categoria_id || existente.categoria_id,
      nombre_servicio: nombre_servicio || existente.nombre_servicio,
      usuario_servicio: usuario_servicio ?? existente.usuario_servicio,
      correo_servicio: correo_servicio ?? existente.correo_servicio,
      // Si mandan una nueva contraseña la ciframos; si no, mantenemos la anterior
      password_servicio: password_servicio ? cifrar(password_servicio) : existente.password_servicio,
      url: url ?? existente.url,
      notas: notas ?? existente.notas,
      metodo_desbloqueo: metodo_desbloqueo || existente.metodo_desbloqueo,
      pin: pin ? await bcrypt.hash(pin, SALT_ROUNDS) : existente.pin,
      pregunta: pregunta ?? existente.pregunta,
      respuesta: respuesta ? await bcrypt.hash(respuesta.toLowerCase().trim(), SALT_ROUNDS) : existente.respuesta
    };

    await serviceModel.actualizarServicio(id, req.usuario.id, datos);

    await registrarLog({
      usuario_id: req.usuario.id,
      correo: req.usuario.correo,
      accion: 'editar_servicio',
      descripcion: `Se editó el servicio "${datos.nombre_servicio}"`,
      ip: req.ip
    });

    res.json({ mensaje: 'Servicio actualizado correctamente' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al actualizar el servicio' });
  }
}

// ------------------------------------------------
// DELETE /api/servicios/:id
// Elimina un servicio (debe pertenecer al usuario)
// ------------------------------------------------
async function eliminar(req, res) {
  try {
    const { id } = req.params;
    const existente = await serviceModel.obtenerPorIdYUsuario(id, req.usuario.id);
    if (!existente) {
      return res.status(404).json({ error: 'Servicio no encontrado' });
    }

    await serviceModel.eliminarServicio(id, req.usuario.id);

    await registrarLog({
      usuario_id: req.usuario.id,
      correo: req.usuario.correo,
      accion: 'eliminar_servicio',
      descripcion: `Se eliminó el servicio "${existente.nombre_servicio}"`,
      ip: req.ip
    });

    res.json({ mensaje: 'Servicio eliminado correctamente' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al eliminar el servicio' });
  }
}

// ------------------------------------------------
// POST /api/servicios/:id/desbloquear
// Verifica el PIN o la respuesta a la pregunta personal.
// Si es correcto, devuelve la contraseña real (descifrada).
// Este es el "método sencillo de verificación" de la Etapa 11.
// ------------------------------------------------
async function desbloquear(req, res) {
  try {
    const { id } = req.params;
    const { pin, respuesta } = req.body;

    // Traemos el servicio completo (incluye los campos sensibles)
    const servicio = await serviceModel.obtenerPorIdYUsuario(id, req.usuario.id);
    if (!servicio) {
      return res.status(404).json({ error: 'Servicio no encontrado' });
    }

    let esCorrecto = false;

    if (servicio.metodo_desbloqueo === 'pin') {
      if (!pin) {
        return res.status(400).json({ error: 'Debe enviar el PIN' });
      }
      // Comparamos el PIN ingresado con el hash guardado (bcrypt)
      esCorrecto = await bcrypt.compare(pin, servicio.pin);
    } else if (servicio.metodo_desbloqueo === 'pregunta') {
      if (!respuesta) {
        return res.status(400).json({ error: 'Debe enviar la respuesta' });
      }
      // Normalizamos igual que cuando se guardó (minúsculas, sin espacios extra)
      esCorrecto = await bcrypt.compare(respuesta.toLowerCase().trim(), servicio.respuesta);
    }

    if (!esCorrecto) {
      // No damos pistas de cuál dato falló, para no facilitar adivinar
      return res.status(401).json({ error: 'Verificación incorrecta' });
    }

    // Solo si pasó la verificación, descifra y muestra la contraseña real
    const passwordReal = descifrar(servicio.password_servicio);

    await registrarLog({
      usuario_id: req.usuario.id,
      correo: req.usuario.correo,
      accion: 'ver_password',
      descripcion: `Se visualizó la contraseña del servicio "${servicio.nombre_servicio}"`,
      ip: req.ip
    });

    res.json({ password: passwordReal });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al verificar el desbloqueo' });
  }
}

module.exports = { listar, obtenerUno, crear, actualizar, eliminar, desbloquear };
