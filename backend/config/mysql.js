// ============================================
// Conexión a MySQL
// Usamos un "pool" de conexiones en lugar de una sola conexión,
// porque el pool reutiliza conexiones automáticamente y es
// más eficiente cuando hay varias peticiones al mismo tiempo.
// ============================================

const mysql = require('mysql2/promise'); // versión con promesas (permite usar async/await)
require('dotenv').config();

const pool = mysql.createPool({
  host: process.env.MYSQL_HOST,
  port: process.env.MYSQL_PORT || 3306,
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DATABASE,
  waitForConnections: true,
  connectionLimit: 10, // máximo de conexiones simultáneas
  queueLimit: 0,
  ssl: {
    rejectUnauthorized: false
  }
});

// Función para probar que la conexión funciona al iniciar el servidor
async function probarConexionMySQL() {
  try {
    const conexion = await pool.getConnection();
    console.log('✅ Conectado a MySQL correctamente');
    conexion.release(); // devolvemos la conexión al pool
  } catch (error) {
    console.error('❌ Error al conectar a MySQL:', error.message);
  }
}

module.exports = { pool, probarConexionMySQL };