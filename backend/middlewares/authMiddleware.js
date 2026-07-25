// ============================================
// authMiddleware.js
// Middleware = función que se ejecuta "en el camino" antes de llegar
// al controlador. Este middleware protege rutas: verifica que el usuario
// haya enviado un JWT válido en el header Authorization.
// ============================================

const jwt = require('jsonwebtoken');

function verificarToken(req, res, next) {
  // El token se espera en el header así: "Authorization: Bearer <token>"
  const authHeader = req.headers['authorization'];

  if (!authHeader) {
    return res.status(401).json({ error: 'No se envió token de autenticación' });
  }

  const token = authHeader.split(' ')[1]; // separa "Bearer" del token real

  if (!token) {
    return res.status(401).json({ error: 'Formato de token inválido' });
  }

  try {
    const datosDecodificados = jwt.verify(token, process.env.JWT_SECRET);
    // Guardamos los datos del usuario en req.usuario para usarlos
    // en los siguientes middlewares/controladores
    req.usuario = datosDecodificados; // { id, correo }
    next(); // continúa hacia el controlador
  } catch (error) {
    return res.status(403).json({ error: 'Token inválido o expirado' });
  }
}

module.exports = { verificarToken };
