// ============================================
// logModel.js
// Define el "esquema" (estructura esperada) de los documentos
// que se guardan en la colección "logs" de MongoDB.
// ============================================

const mongoose = require('mongoose');

const logSchema = new mongoose.Schema({
  usuario_id: { type: Number, required: true },
  correo: { type: String, required: true },
  accion: {
    type: String,
    required: true,
    enum: ['registro', 'login', 'crear_servicio', 'editar_servicio', 'eliminar_servicio', 'editar_perfil', 'eliminar_cuenta', 'ver_password']
  },
  descripcion: { type: String, required: true },
  fecha: { type: Date, default: Date.now },
  ip: { type: String }
});

// mongoose creará automáticamente la colección "logs" (en plural, por convención)
const Log = mongoose.model('Log', logSchema);

module.exports = Log;
