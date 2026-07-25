// ============================================================
// Servicio.js
// Representa un servicio guardado (Netflix, Gmail, etc.).
// Igual que la clase Usuario, agrupa datos + comportamientos
// relacionados (icono con las 2 primeras letras, texto a mostrar
// como "usuario", fecha formateada, etiqueta del método de
// desbloqueo) para no repetir esa lógica en cada archivo .js.
// ============================================================

class Servicio {
  constructor(datos) {
    this.id = datos.id;
    this.nombre = datos.nombre_servicio;
    this.usuario = datos.usuario_servicio;
    this.correo = datos.correo_servicio;
    this.categoriaId = datos.categoria_id;
    this.categoriaNombre = datos.categoria_nombre;
    this.url = datos.url;
    this.notas = datos.notas;
    this.metodoDesbloqueo = datos.metodo_desbloqueo; // 'pin' | 'pregunta'
    this.pregunta = datos.pregunta;
    this.fechaCreacion = datos.fecha_creacion ? new Date(datos.fecha_creacion) : null;
  }

  get iniciales() {
    return this.nombre.substring(0, 2);
  }

  get textoUsuario() {
    return this.usuario || this.correo || '-';
  }

  get etiquetaMetodo() {
    return this.metodoDesbloqueo === 'pin' ? 'PIN' : 'Pregunta';
  }

  get fechaFormateada() {
    return this.fechaCreacion ? this.fechaCreacion.toLocaleDateString('es-CO') : '-';
  }

  // Convierte una lista de objetos "planos" que devuelve la API
  // en una lista de instancias de esta clase.
  static desdeLista(listaPlano) {
    return listaPlano.map((item) => new Servicio(item));
  }
}
