// ============================================
// Conexión a MongoDB
// Usamos mongoose porque simplifica mucho el trabajo con MongoDB:
// nos permite definir "esquemas" (estructura esperada de los documentos)
// aunque MongoDB en sí no obliga a tener una estructura fija.
// ============================================

const mongoose = require('mongoose');
require('dotenv').config();

async function conectarMongo() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Conectado a MongoDB correctamente');
  } catch (error) {
    console.error('❌ Error al conectar a MongoDB:', error.message);
  }
}

module.exports = { conectarMongo };
