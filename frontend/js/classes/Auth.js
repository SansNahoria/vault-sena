// ============================================================
// Auth.js
// Clase responsable de TODO lo relacionado a la sesión:
// guardar el token, leerlo, saber si hay sesión activa, y cerrarla.
// Antes esta lógica estaba repartida en varios archivos (login.js,
// auth-guard.js, perfil.js); ahora vive en un solo lugar.
// ============================================================

class Auth {
  // Guarda el token y los datos del usuario tras un login exitoso
  static guardarSesion(token, usuario) {
    sessionStorage.setItem('token', token);
    sessionStorage.setItem('usuario', JSON.stringify(usuario));
    sessionStorage.setItem('loginTime', new Date().toISOString());
  }

  static obtenerToken() {
    return sessionStorage.getItem('token');
  }

  static haySesionActiva() {
    return !!this.obtenerToken();
  }

  static obtenerFechaLogin() {
    const valor = sessionStorage.getItem('loginTime');
    return valor ? new Date(valor) : null;
  }

  static cerrarSesion() {
    sessionStorage.clear();
    window.location.href = 'login.html';
  }

  // Protege una página: si no hay sesión, redirige al login.
  // Se llama al inicio de cada página interna (dashboard, servicios, perfil).
  static protegerPagina() {
    if (!this.haySesionActiva()) {
      window.location.href = 'login.html';
    }
  }
}
