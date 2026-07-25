// ============================================
// crypto.js
// Cifrado REVERSIBLE (AES-256-CBC) para las contraseñas de los servicios.
//
// ¿Por qué no usamos bcrypt aquí como con la contraseña de la cuenta?
// Porque bcrypt es IRREVERSIBLE (solo sirve para comparar, nunca para
// recuperar el texto original). Pero en este caso SÍ necesitamos poder
// mostrarle al usuario la contraseña de su servicio (ej: "ver mi
// contraseña de Netflix"), así que necesitamos poder des-cifrarla.
// ============================================

const crypto = require('crypto');
require('dotenv').config();

const ALGORITMO = 'aes-256-cbc';
const CLAVE = Buffer.from(process.env.ENCRYPTION_KEY); // debe tener 32 caracteres

function cifrar(textoPlano) {
  const iv = crypto.randomBytes(16); // vector de inicialización, distinto cada vez
  const cipher = crypto.createCipheriv(ALGORITMO, CLAVE, iv);
  let cifrado = cipher.update(textoPlano, 'utf8', 'hex');
  cifrado += cipher.final('hex');
  // Guardamos el IV junto con el texto cifrado (separados por ":")
  // porque se necesita el mismo IV para descifrar después
  return iv.toString('hex') + ':' + cifrado;
}

function descifrar(textoCifrado) {
  const [ivHex, datosHex] = textoCifrado.split(':');
  const iv = Buffer.from(ivHex, 'hex');
  const decipher = crypto.createDecipheriv(ALGORITMO, CLAVE, iv);
  let descifrado = decipher.update(datosHex, 'hex', 'utf8');
  descifrado += decipher.final('utf8');
  return descifrado;
}

module.exports = { cifrar, descifrar };
