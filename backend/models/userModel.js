// ============================================
// userModel.js
// Aquí viven TODAS las consultas SQL relacionadas a la tabla "usuarios".
// Separar el SQL en un "modelo" facilita mantener el código ordenado:
// los controladores no escriben SQL directamente, solo llaman a estas funciones.
// ============================================

const { pool } = require('../config/mysql');

// Buscar un usuario por su correo (usado en login y en registro para validar duplicados)
async function buscarPorCorreo(correo) {
  const [filas] = await pool.query('SELECT * FROM usuarios WHERE correo = ?', [correo]);
  return filas[0]; // devuelve undefined si no existe
}

// Buscar un usuario por su id (usado para el perfil)
async function buscarPorId(id) {
  const [filas] = await pool.query(
    'SELECT id, nombre, correo, fecha_registro FROM usuarios WHERE id = ?',
    [id]
  );
  return filas[0];
}

// Crear un nuevo usuario
async function crearUsuario(nombre, correo, passwordHash) {
  const [resultado] = await pool.query(
    'INSERT INTO usuarios (nombre, correo, password_hash) VALUES (?, ?, ?)',
    [nombre, correo, passwordHash]
  );
  return resultado.insertId; // id autogenerado del nuevo usuario
}

// Actualizar nombre y/o correo del usuario (perfil)
async function actualizarUsuario(id, nombre, correo) {
  await pool.query(
    'UPDATE usuarios SET nombre = ?, correo = ? WHERE id = ?',
    [nombre, correo, id]
  );
}

// Eliminar cuenta de usuario
async function eliminarUsuario(id) {
  await pool.query('DELETE FROM usuarios WHERE id = ?', [id]);
}

module.exports = {
  buscarPorCorreo,
  buscarPorId,
  crearUsuario,
  actualizarUsuario,
  eliminarUsuario
};
