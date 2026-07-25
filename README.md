# VaultSENA — Gestor de contraseñas

Evidencia SENA: aplicación web full stack (Frontend HTML/CSS/JS + POO, Backend
Node.js/Express, MySQL + MongoDB, autenticación con JWT y bcrypt).

## 📁 Estructura del proyecto

```
vault-sena/
├── backend/          Node.js + Express + MySQL + MongoDB
├── frontend/          HTML + CSS + JS puro con clases (POO)
└── postman/           Colección de Postman para probar la API
```

## 🚀 Cómo correrlo en local

### 1. Base de datos MySQL
```bash
mysql -u root -p < backend/database/script.sql
```

### 2. MongoDB
Instálalo localmente o crea un cluster gratis en MongoDB Atlas (más fácil).

### 3. Backend
```bash
cd backend
cp .env.example .env
# Edita .env con tus credenciales reales de MySQL y tu URI de Mongo
npm install
npm start
```
Deberías ver en consola:
```
✅ Conectado a MySQL correctamente
✅ Conectado a MongoDB correctamente
🚀 Servidor corriendo en http://localhost:3000
```

### 4. Frontend
Abre `frontend/login.html` directamente en el navegador, o usa la extensión
"Live Server" de VSCode. Por defecto `frontend/js/config.js` apunta a
`http://localhost:3000/api`.

## 🧪 Etapa 12 — Pruebas con Postman

1. Abre Postman → **Import** → selecciona `postman/VaultSENA.postman_collection.json`.
2. La colección ya trae las 13 peticiones en orden lógico: health check, registro,
   login, perfil, categorías, y el CRUD completo de servicios (crear, listar,
   obtener uno, actualizar, **desbloquear/ver contraseña**, eliminar).
3. Ejecuta primero **"3. Auth - Login"**: la colección guarda el `token`
   automáticamente en una variable, así que las siguientes peticiones ya
   quedan autenticadas sin que tengas que copiar/pegar nada.
4. Al ejecutar **"7. Servicios - Crear (PIN)"**, el `id` del servicio creado
   se guarda automáticamente en la variable `servicio_id`, usada por las
   peticiones 9, 10, 11 y 12.

### Resultados esperados por método HTTP

| Método | Ejemplo | Código esperado | Qué revisar |
|---|---|---|---|
| GET | `/servicios` | 200 | Devuelve un arreglo (vacío `[]` si no hay servicios) |
| POST | `/servicios` | 201 | Devuelve `{ mensaje, id }` |
| PUT | `/servicios/:id` | 200 | Devuelve `{ mensaje }`; el campo actualizado cambia en el siguiente GET |
| DELETE | `/servicios/:id` | 200 | El servicio deja de aparecer en el siguiente GET |
| POST | `/servicios/:id/desbloquear` con PIN correcto | 200 | Devuelve `{ password: "..." }` en texto plano |
| POST | `/servicios/:id/desbloquear` con PIN incorrecto | 401 | Devuelve `{ error: "Verificación incorrecta" }` |
| Cualquiera sin token | — | 401 | `{ error: "No se envió token de autenticación" }` |

Después de probar, revisa la colección `logs` en MongoDB: cada acción
(`login`, `crear_servicio`, `ver_password`, etc.) debe aparecer registrada.

## 🌐 Despliegue en Vercel

Ver la guía completa que te compartió Claude en la conversación (resumen):

- El **frontend** se sube a Vercel tal cual (sitio estático).
- El **backend** (Express + conexiones persistentes a MySQL/Mongo) **no**
  corre bien en Vercel como función serverless para este tipo de proyecto
  académico — se recomienda desplegarlo en **Railway** o **Render**.
- MySQL en la nube: Railway, o servicios gratuitos como **Aiven** o **Clever
  Cloud**.
- MongoDB en la nube: **MongoDB Atlas** (capa gratuita M0).
- Una vez el backend esté desplegado, actualiza `frontend/js/config.js` con
  la URL real, y `backend/.env` → `FRONTEND_URL` con el dominio de Vercel.
