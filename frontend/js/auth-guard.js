// ============================================================
// auth-guard.js
// Se incluye en las páginas protegidas (dashboard, servicios, perfil).
// Usa la clase Auth para proteger la página y manejar el logout.
// ============================================================

Auth.protegerPagina();

document.addEventListener('DOMContentLoaded', () => {
  const btnLogout = document.getElementById('btnLogout');
  if (btnLogout) {
    btnLogout.addEventListener('click', (evento) => {
      evento.preventDefault();
      Auth.cerrarSesion();
    });
  }
});
