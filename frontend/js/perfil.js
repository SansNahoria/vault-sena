// ============================================================
// perfil.js
// Pantalla de perfil, usando ApiService + la clase Usuario.
// ============================================================

document.addEventListener('DOMContentLoaded', cargarPerfil);

async function cargarPerfil() {
  try {
    const perfilPlano = await apiService.obtenerPerfil();
    const usuario = new Usuario(perfilPlano);

    document.getElementById('nombre').value = usuario.nombre;
    document.getElementById('correo').value = usuario.correo;
    document.getElementById('perfilNombre').textContent = usuario.nombre;
    document.getElementById('perfilCorreoTexto').textContent = usuario.correo;
    document.getElementById('avatarIniciales').textContent = usuario.iniciales;
    document.getElementById('fechaRegistro').value = usuario.fechaRegistroFormateada;

  } catch (error) {
    console.error('Error al cargar el perfil:', error);
  }
}

// ------------------------------------------------
// ACTUALIZAR PERFIL (PUT /api/usuarios/perfil)
// ------------------------------------------------
document.getElementById('formPerfil').addEventListener('submit', async (evento) => {
  evento.preventDefault();

  const nombre = document.getElementById('nombre').value.trim();
  const correo = document.getElementById('correo').value.trim();

  try {
    await apiService.actualizarPerfil(nombre, correo);
    UI.mostrarAlerta('alertPerfilExito', null, 3000);
    cargarPerfil();

  } catch (error) {
    alert('Error al actualizar el perfil: ' + error.message);
  }
});

// ------------------------------------------------
// Cambiar contraseña
// NOTA: la evidencia no exige un endpoint separado para esto (el CRUD de
// usuarios pedido es sobre nombre/correo), así que lo dejamos preparado
// en la interfaz pero informamos que no está conectado a un endpoint real.
// ------------------------------------------------
document.getElementById('formPassword').addEventListener('submit', (evento) => {
  evento.preventDefault();
  alert('Esta evidencia no incluye un endpoint específico para cambiar la contraseña. Se puede agregar como una mejora adicional al backend.');
});

// ------------------------------------------------
// ELIMINAR CUENTA (DELETE /api/usuarios/perfil)
// ------------------------------------------------
document.getElementById('btnEliminarCuenta').addEventListener('click', async () => {
  const confirmar = confirm('¿Seguro que deseas eliminar tu cuenta? Se borrarán también todos tus servicios guardados. Esta acción no se puede deshacer.');
  if (!confirmar) return;

  try {
    await apiService.eliminarCuenta();
    Auth.cerrarSesion();
  } catch (error) {
    alert('Error al eliminar la cuenta: ' + error.message);
  }
});
