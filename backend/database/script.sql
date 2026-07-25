-- ============================================
--  VAULT SENA - Script de base de datos MySQL
--  Evidencia: Gestor de contraseñas
-- ============================================

-- 1. Crear la base de datos
CREATE DATABASE IF NOT EXISTS vault_sena
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE vault_sena;

-- ============================================
-- 2. Tabla: usuarios
-- Guarda las cuentas de las personas que usan la app
-- ============================================
CREATE TABLE usuarios (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  correo VARCHAR(150) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL, -- contraseña cifrada con bcrypt
  fecha_registro DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- 3. Tabla: categorias
-- Clasifica los servicios (Streaming, Bancos, Juegos, etc.)
-- ============================================
CREATE TABLE categorias (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(50) NOT NULL UNIQUE
);

-- Datos iniciales para que el estudiante no tenga que crearlos a mano
INSERT INTO categorias (nombre) VALUES
  ('Streaming'),
  ('Redes Sociales'),
  ('Correo'),
  ('Bancos'),
  ('Juegos'),
  ('Trabajo/Estudio'),
  ('Otro');

-- ============================================
-- 4. Tabla: servicios
-- Cada fila es una cuenta guardada por un usuario
-- ============================================
CREATE TABLE servicios (
  id INT AUTO_INCREMENT PRIMARY KEY,

  -- Relaciones (llaves foráneas)
  usuario_id INT NOT NULL,
  categoria_id INT NOT NULL,

  -- Datos del servicio guardado
  nombre_servicio VARCHAR(100) NOT NULL,     -- Ej: "Netflix"
  usuario_servicio VARCHAR(100),             -- usuario/nick en ese servicio
  correo_servicio VARCHAR(150),              -- correo asociado
  password_servicio VARCHAR(255) NOT NULL,   -- contraseña cifrada (reversible)
  url VARCHAR(255),                          -- link al servicio
  notas TEXT,                                -- notas libres

  -- Método de desbloqueo para ver la contraseña
  metodo_desbloqueo ENUM('pin', 'pregunta') NOT NULL,
  pin VARCHAR(255),          -- PIN de 4 dígitos (se guarda hasheado)
  pregunta VARCHAR(255),     -- pregunta personal (texto plano, ej: "¿Nombre de tu mascota?")
  respuesta VARCHAR(255),    -- respuesta (se guarda hasheada)

  fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP,

  -- Llaves foráneas
  CONSTRAINT fk_servicio_usuario
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
    ON DELETE CASCADE,

  CONSTRAINT fk_servicio_categoria
    FOREIGN KEY (categoria_id) REFERENCES categorias(id)
    ON DELETE RESTRICT
);

-- ============================================
-- Notas sobre las decisiones de diseño:
--
-- ON DELETE CASCADE en usuario_id:
--   Si se elimina un usuario, se eliminan automáticamente
--   todos sus servicios guardados (tiene sentido: no deben
--   quedar servicios "huérfanos" sin dueño).
--
-- ON DELETE RESTRICT en categoria_id:
--   No se puede eliminar una categoría si todavía hay
--   servicios usándola (evita dejar servicios sin categoría).
-- ============================================
