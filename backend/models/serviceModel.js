// ============================================
// serviceModel.js
// Consultas SQL de la tabla "servicios".
// IMPORTANTE: todas las consultas filtran por usuario_id,
// así garantizamos que un usuario JAMÁS pueda ver/editar/borrar
// servicios de otro usuario.
// ============================================

const { pool } = require('../config/mysql');

// Listar TODOS los servicios de un usuario (con el nombre de su categoría)
async function listarPorUsuario(usuarioId) {
  const [filas] = await pool.query(
    `SELECT s.id, s.nombre_servicio, s.usuario_servicio, s.correo_servicio,
            s.url, s.notas, s.metodo_desbloqueo, s.fecha_creacion,
            s.categoria_id, c.nombre AS categoria_nombre
     FROM servicios s
     JOIN categorias c ON s.categoria_id = c.id
     WHERE s.usuario_id = ?
     ORDER BY s.fecha_creacion DESC`,
    [usuarioId]
  );
  return filas;
}

// Obtener UN servicio específico, verificando que sea del usuario dueño
async function obtenerPorIdYUsuario(id, usuarioId) {
  const [filas] = await pool.query(
    'SELECT * FROM servicios WHERE id = ? AND usuario_id = ?',
    [id, usuarioId]
  );
  return filas[0]; // undefined si no existe o no le pertenece
}

// Crear un nuevo servicio
async function crearServicio(datos) {
  const {
    usuario_id, categoria_id, nombre_servicio, usuario_servicio,
    correo_servicio, password_servicio, url, notas,
    metodo_desbloqueo, pin, pregunta, respuesta
  } = datos;

  const [resultado] = await pool.query(
    `INSERT INTO servicios
      (usuario_id, categoria_id, nombre_servicio, usuario_servicio, correo_servicio,
       password_servicio, url, notas, metodo_desbloqueo, pin, pregunta, respuesta)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [usuario_id, categoria_id, nombre_servicio, usuario_servicio, correo_servicio,
     password_servicio, url, notas, metodo_desbloqueo, pin, pregunta, respuesta]
  );
  return resultado.insertId;
}

// Actualizar un servicio (solo si pertenece al usuario)
async function actualizarServicio(id, usuarioId, datos) {
  const {
    categoria_id, nombre_servicio, usuario_servicio,
    correo_servicio, password_servicio, url, notas,
    metodo_desbloqueo, pin, pregunta, respuesta
  } = datos;

  const [resultado] = await pool.query(
    `UPDATE servicios SET
       categoria_id = ?, nombre_servicio = ?, usuario_servicio = ?,
       correo_servicio = ?, password_servicio = ?, url = ?, notas = ?,
       metodo_desbloqueo = ?, pin = ?, pregunta = ?, respuesta = ?
     WHERE id = ? AND usuario_id = ?`,
    [categoria_id, nombre_servicio, usuario_servicio, correo_servicio,
     password_servicio, url, notas, metodo_desbloqueo, pin, pregunta, respuesta,
     id, usuarioId]
  );
  return resultado.affectedRows; // 0 si no existía o no era del usuario
}

// Eliminar un servicio (solo si pertenece al usuario)
async function eliminarServicio(id, usuarioId) {
  const [resultado] = await pool.query(
    'DELETE FROM servicios WHERE id = ? AND usuario_id = ?',
    [id, usuarioId]
  );
  return resultado.affectedRows;
}

module.exports = {
  listarPorUsuario,
  obtenerPorIdYUsuario,
  crearServicio,
  actualizarServicio,
  eliminarServicio
};
