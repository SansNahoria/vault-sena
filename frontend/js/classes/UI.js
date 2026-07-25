// ============================================================
// UI.js
// Funciones de interfaz que se repiten en varias pantallas:
// mostrar/ocultar alertas y abrir/cerrar modales. Agruparlas en
// una clase evita copiar el mismo código en cada archivo .js.
// ============================================================

class UI {
  static mostrarAlerta(idElemento, mensaje = null, milisegundos = null) {
    const elemento = document.getElementById(idElemento);
    if (!elemento) return;
    if (mensaje !== null) elemento.textContent = mensaje;
    elemento.style.display = 'block';

    if (milisegundos) {
      setTimeout(() => { elemento.style.display = 'none'; }, milisegundos);
    }
  }

  static ocultarAlerta(idElemento) {
    const elemento = document.getElementById(idElemento);
    if (elemento) elemento.style.display = 'none';
  }

  static abrirModal(idModal) {
    document.getElementById(idModal).classList.add('open');
  }

  static cerrarModal(idModal) {
    document.getElementById(idModal).classList.remove('open');
  }

  // Conecta todos los botones [data-close-modal] de la página,
  // sin importar a qué modal pertenezcan.
  static conectarCierreDeModales() {
    document.querySelectorAll('[data-close-modal]').forEach((el) => {
      el.addEventListener('click', () => UI.cerrarModal(el.dataset.closeModal));
    });
  }
}
