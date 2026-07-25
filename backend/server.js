// ============================================
// SERVER.JS - Punto de entrada del backend
// ============================================

const express = require('express');
const cors = require('cors');
require('dotenv').config();

const { probarConexionMySQL } = require('./config/mysql');
const { conectarMongo } = require('./config/mongo');

// Rutas
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const serviceRoutes = require('./routes/serviceRoutes');
const categoryRoutes = require('./routes/categoryRoutes');

const app = express();

// ------------------------------
// Middlewares globales
// ------------------------------
// CORS: en desarrollo permitimos cualquier origen (localhost).
// En producción, FRONTEND_URL debe apuntar al dominio real de Vercel
// (ej: https://vault-sena.vercel.app), para que solo ESE sitio
// pueda llamar a la API.
const origenesPermitidos = process.env.FRONTEND_URL
  ? process.env.FRONTEND_URL.split(',')
  : true; // true = permite cualquier origen (solo recomendado en desarrollo)

app.use(cors({ origin: origenesPermitidos }));
app.use(express.json()); // permite leer JSON en el body de las peticiones (req.body)

// ------------------------------
// Rutas de la API
// ------------------------------
app.use('/api/auth', authRoutes);
app.use('/api/usuarios', userRoutes);
app.use('/api/servicios', serviceRoutes);
app.use('/api/categorias', categoryRoutes);

// Ruta de prueba simple, para verificar que el servidor está vivo
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', mensaje: 'Servidor VaultSENA funcionando correctamente' });
});

// ------------------------------
// Manejo de rutas no encontradas
// ------------------------------
app.use((req, res) => {
  res.status(404).json({ error: 'Ruta no encontrada' });
});

// ------------------------------
// Iniciar el servidor
// ------------------------------
const PORT = process.env.PORT || 3000;

async function iniciarServidor() {
  await probarConexionMySQL();
  await conectarMongo();

  app.listen(PORT, () => {
    console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
  });
}

iniciarServidor();
