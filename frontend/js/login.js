// ============================================================
// login.js
// Maneja el envío del formulario de inicio de sesión usando
// las clases ApiService y Auth.
// ============================================================

if (new URLSearchParams(window.location.search).get('registrado') === '1') {
  UI.mostrarAlerta('alertSuccess');
}

document.getElementById('formLogin').addEventListener('submit', async (evento) => {
  evento.preventDefault();

  const correo = document.getElementById('correo').value.trim();
  const password = document.getElementById('password').value;
  UI.ocultarAlerta('alertError');

  try {
    // apiService.login() hace el POST a /api/auth/login
    const datos = await apiService.login(correo, password);

    // Auth.guardarSesion() centraliza qué se guarda en sessionStorage
    Auth.guardarSesion(datos.token, datos.usuario);

    window.location.href = 'dashboard.html';

  } catch (error) {
    UI.mostrarAlerta('alertError', error.message);
  }
});
