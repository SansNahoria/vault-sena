// ============================================================
// registro.js
// Maneja el envío del formulario de registro usando ApiService.
// ============================================================

document.getElementById('formRegistro').addEventListener('submit', async (evento) => {
  evento.preventDefault();

  const nombre = document.getElementById('nombre').value.trim();
  const correo = document.getElementById('correo').value.trim();
  const password = document.getElementById('password').value;
  const passwordConfirm = document.getElementById('passwordConfirm').value;

  UI.ocultarAlerta('alertError');
  UI.ocultarAlerta('errorConfirm');

  if (password !== passwordConfirm) {
    document.getElementById('errorConfirm').style.display = 'block';
    return;
  }

  try {
    // apiService.registrar() hace el POST a /api/auth/registro
    await apiService.registrar(nombre, correo, password);
    window.location.href = 'login.html?registrado=1';

  } catch (error) {
    UI.mostrarAlerta('alertError', error.message);
  }
});
