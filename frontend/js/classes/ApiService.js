// ============================================================
// ApiService.js
// Clase que ENCAPSULA toda la comunicación con el backend.
// Es la única parte del frontend que sabe hacer fetch() —
// el resto del código nunca llama a fetch() directamente,
// siempre pasa por un objeto ApiService. Esto es Programación
// Orientada a Objetos: encapsulamiento (ocultar el detalle de
// "cómo" se hace la petición HTTP detrás de métodos con nombre).
// ============================================================

class ApiService {
  constructor(baseUrl) {
    this.baseUrl = baseUrl;
  }

  // Método privado (por convención, con _) que arma cualquier petición
  async _peticion(endpoint, options = {}) {
    const token = sessionStorage.getItem('token');

    const headers = {
      'Content-Type': 'application/json',
      ...(options.headers || {})
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const respuesta = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      headers
    });

    const datos = await respuesta.json().catch(() => ({}));

    if (!respuesta.ok) {
      throw new Error(datos.error || 'Ocurrió un error inesperado');
    }

    return datos;
  }

  // ---------- Autenticación ----------
  registrar(nombre, correo, password) {
    return this._peticion('/auth/registro', {
      method: 'POST',
      body: JSON.stringify({ nombre, correo, password })
    });
  }

  login(correo, password) {
    return this._peticion('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ correo, password })
    });
  }

  // ---------- Usuario / Perfil ----------
  obtenerPerfil() {
    return this._peticion('/usuarios/perfil');
  }

  actualizarPerfil(nombre, correo) {
    return this._peticion('/usuarios/perfil', {
      method: 'PUT',
      body: JSON.stringify({ nombre, correo })
    });
  }

  eliminarCuenta() {
    return this._peticion('/usuarios/perfil', { method: 'DELETE' });
  }

  // ---------- Categorías ----------
  listarCategorias() {
    return this._peticion('/categorias');
  }

  // ---------- Servicios (CRUD) ----------
  listarServicios() {
    return this._peticion('/servicios');
  }

  crearServicio(datos) {
    return this._peticion('/servicios', {
      method: 'POST',
      body: JSON.stringify(datos)
    });
  }

  actualizarServicio(id, datos) {
    return this._peticion(`/servicios/${id}`, {
      method: 'PUT',
      body: JSON.stringify(datos)
    });
  }

  eliminarServicio(id) {
    return this._peticion(`/servicios/${id}`, { method: 'DELETE' });
  }

  // Verifica el PIN o la pregunta y, si es correcto, devuelve { password }
  desbloquearServicio(id, { pin, respuesta }) {
    return this._peticion(`/servicios/${id}/desbloquear`, {
      method: 'POST',
      body: JSON.stringify({ pin, respuesta })
    });
  }
}

// Instancia única (patrón sencillo tipo "singleton"): toda la app
// comparte el mismo objeto ApiService, ya configurado con la URL base.
const apiService = new ApiService(API_URL);
