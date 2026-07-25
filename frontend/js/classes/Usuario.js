// ============================================================
// Usuario.js
// Representa al usuario dueño de la sesión. En vez de pasar por
// ahí un objeto "plano" ({nombre, correo, ...}), lo envolvemos en
// una clase que sabe calcular cosas derivadas (iniciales, primer
// nombre, fecha formateada), evitando repetir esa lógica en cada
// página que necesita mostrar datos del usuario.
// ============================================================

class Usuario {
  constructor({ id, nombre, correo, fecha_registro }) {
    this.id = id;
    this.nombre = nombre;
    this.correo = correo;
    this.fechaRegistro = fecha_registro ? new Date(fecha_registro) : null;
  }

  get primerNombre() {
    return this.nombre.split(' ')[0];
  }

  get iniciales() {
    return this.nombre
      .split(' ')
      .map((palabra) => palabra[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  }

  get fechaRegistroFormateada() {
    if (!this.fechaRegistro) return '—';
    return this.fechaRegistro.toLocaleDateString('es-CO', {
      day: 'numeric', month: 'long', year: 'numeric'
    });
  }
}
