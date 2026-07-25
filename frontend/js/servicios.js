// ============================================================
// servicios.js
// Conecta la pantalla "Mis servicios" con TODA la API de servicios,
// usando las clases ApiService, Servicio y UI:
//   GET    /api/servicios              -> listar
//   POST   /api/servicios              -> crear
//   PUT    /api/servicios/:id          -> editar
//   DELETE /api/servicios/:id          -> eliminar
//   GET    /api/categorias             -> llenar los <select>
//   POST   /api/servicios/:id/desbloquear -> verificar PIN/pregunta y ver la contraseña
// ============================================================

let listaServicios = [];   // instancias de Servicio, última lista traída del backend
let categorias = [];       // [{id, nombre}] traídas de la API
let servicioEditandoId = null;
let servicioDesbloqueandoId = null;

document.addEventListener('DOMContentLoaded', async () => {
  await cargarCategorias();
  await cargarServicios();
  configurarModalServicio();
  configurarBusquedaYFiltro();
  configurarModalDesbloqueo();
});

// ------------------------------------------------
// CATEGORÍAS (GET /api/categorias)
// Llenamos los dos <select> (formulario y filtro) con datos reales
// de la base de datos, en vez de tenerlos "hardcodeados" en el HTML.
// ------------------------------------------------
async function cargarCategorias() {
  try {
    categorias = await apiService.listarCategorias();

    const selectFormulario = document.getElementById('categoriaServicio');
    const selectFiltro = document.getElementById('filtroCategoria');

    categorias.forEach((cat) => {
      const optionForm = document.createElement('option');
      optionForm.value = cat.id;
      optionForm.textContent = cat.nombre;
      selectFormulario.appendChild(optionForm);

      const optionFiltro = document.createElement('option');
      optionFiltro.value = cat.id;
      optionFiltro.textContent = cat.nombre;
      selectFiltro.appendChild(optionFiltro);
    });
  } catch (error) {
    console.error('Error al cargar categorías:', error);
  }
}

// ------------------------------------------------
// LISTAR (GET /api/servicios)
// ------------------------------------------------
async function cargarServicios() {
  try {
    const datosPlano = await apiService.listarServicios();
    listaServicios = Servicio.desdeLista(datosPlano);
    renderizarTabla(listaServicios);
  } catch (error) {
    alert('Error al cargar los servicios: ' + error.message);
  }
}

function renderizarTabla(servicios) {
  const tbody = document.getElementById('tablaServicios');
  const estadoVacio = document.getElementById('estadoVacio');
  tbody.innerHTML = '';

  if (servicios.length === 0) {
    estadoVacio.classList.remove('hidden');
    return;
  }
  estadoVacio.classList.add('hidden');

  servicios.forEach((s) => {
    const tr = document.createElement('tr');
    tr.dataset.id = s.id;
    tr.innerHTML = `
      <td>
        <div class="service-name-cell">
          <div class="service-icon">${s.iniciales}</div>
          <span>${s.nombre}</span>
        </div>
      </td>
      <td>${s.textoUsuario}</td>
      <td><span class="badge">${s.categoriaNombre}</span></td>
      <td>
        <span class="password-mask">••••••••</span>
        <button class="icon-btn" title="Ver contraseña" data-action="ver">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7z"/><circle cx="12" cy="12" r="3"/></svg>
        </button>
      </td>
      <td><span class="badge">${s.etiquetaMetodo}</span></td>
      <td>
        <div class="row-actions">
          <button class="icon-btn" title="Editar" data-action="editar">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 013 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
          </button>
          <button class="icon-btn" title="Eliminar" data-action="eliminar">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18"/><path d="M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2m3 0l-1 14a2 2 0 01-2 2H7a2 2 0 01-2-2L4 6"/></svg>
          </button>
        </div>
      </td>
    `;
    tbody.appendChild(tr);
  });

  tbody.querySelectorAll('[data-action="editar"]').forEach((btn) => {
    btn.addEventListener('click', (e) => abrirModalEdicion(e.target.closest('tr').dataset.id));
  });
  tbody.querySelectorAll('[data-action="eliminar"]').forEach((btn) => {
    btn.addEventListener('click', (e) => eliminarServicio(e.target.closest('tr').dataset.id));
  });
  tbody.querySelectorAll('[data-action="ver"]').forEach((btn) => {
    btn.addEventListener('click', (e) => abrirModalDesbloqueo(e.target.closest('tr').dataset.id));
  });
}

// ------------------------------------------------
// BUSCADOR Y FILTRO (sobre los datos ya cargados en memoria)
// ------------------------------------------------
function configurarBusquedaYFiltro() {
  document.getElementById('buscador').addEventListener('input', aplicarFiltros);
  document.getElementById('filtroCategoria').addEventListener('change', aplicarFiltros);
}

function aplicarFiltros() {
  const texto = document.getElementById('buscador').value.toLowerCase().trim();
  const categoriaId = document.getElementById('filtroCategoria').value;

  const filtrados = listaServicios.filter((s) => {
    const coincideTexto = s.nombre.toLowerCase().includes(texto);
    const coincideCategoria = !categoriaId || String(s.categoriaId) === categoriaId;
    return coincideTexto && coincideCategoria;
  });

  renderizarTabla(filtrados);
}

// ------------------------------------------------
// MODAL: CREAR / EDITAR
// ------------------------------------------------
function configurarModalServicio() {
  document.getElementById('btnNuevoServicio').addEventListener('click', abrirModalNuevo);
  const btnVacio = document.getElementById('btnNuevoServicioVacio');
  if (btnVacio) btnVacio.addEventListener('click', abrirModalNuevo);

  UI.conectarCierreDeModales();

  document.querySelectorAll('.radio-option').forEach((opcion) => {
    opcion.addEventListener('click', () => {
      document.querySelectorAll('.radio-option').forEach((o) => o.classList.remove('selected'));
      opcion.classList.add('selected');

      const metodo = opcion.dataset.metodo;
      document.getElementById('grupoPin').classList.toggle('hidden', metodo !== 'pin');
      document.getElementById('grupoPregunta').classList.toggle('hidden', metodo !== 'pregunta');
      document.getElementById('grupoRespuesta').classList.toggle('hidden', metodo !== 'pregunta');
    });
  });

  document.getElementById('formServicio').addEventListener('submit', guardarServicio);
}

function abrirModalNuevo() {
  servicioEditandoId = null;
  document.getElementById('modalServicioTitulo').textContent = 'Nuevo servicio';
  document.getElementById('formServicio').reset();
  document.getElementById('passwordServicio').required = true;

  document.querySelectorAll('.radio-option').forEach((o) => o.classList.remove('selected'));
  document.querySelector('.radio-option[data-metodo="pin"]').classList.add('selected');
  document.getElementById('grupoPin').classList.remove('hidden');
  document.getElementById('grupoPregunta').classList.add('hidden');
  document.getElementById('grupoRespuesta').classList.add('hidden');

  UI.abrirModal('modalServicio');
}

function abrirModalEdicion(id) {
  const servicio = listaServicios.find((s) => String(s.id) === String(id));
  if (!servicio) return;

  servicioEditandoId = id;
  document.getElementById('modalServicioTitulo').textContent = 'Editar servicio';
  document.getElementById('formServicio').reset();

  document.getElementById('nombreServicio').value = servicio.nombre;
  document.getElementById('usuarioServicio').value = servicio.usuario || '';
  document.getElementById('categoriaServicio').value = servicio.categoriaId;
  document.getElementById('correoServicio').value = servicio.correo || '';
  document.getElementById('urlServicio').value = servicio.url || '';
  document.getElementById('notasServicio').value = servicio.notas || '';

  document.getElementById('passwordServicio').required = false;
  document.getElementById('passwordServicio').placeholder = 'Dejar en blanco para no cambiarla';

  const metodo = servicio.metodoDesbloqueo;
  document.querySelectorAll('.radio-option').forEach((o) => o.classList.remove('selected'));
  document.querySelector(`.radio-option[data-metodo="${metodo}"]`).classList.add('selected');
  document.getElementById('grupoPin').classList.toggle('hidden', metodo !== 'pin');
  document.getElementById('grupoPregunta').classList.toggle('hidden', metodo !== 'pregunta');
  document.getElementById('grupoRespuesta').classList.toggle('hidden', metodo !== 'pregunta');
  if (metodo === 'pregunta') {
    document.getElementById('preguntaServicio').value = servicio.pregunta || '';
  }

  UI.abrirModal('modalServicio');
}

async function guardarServicio(evento) {
  evento.preventDefault();

  const metodoSeleccionado = document.querySelector('.radio-option.selected').dataset.metodo;

  const payload = {
    nombre_servicio: document.getElementById('nombreServicio').value.trim(),
    usuario_servicio: document.getElementById('usuarioServicio').value.trim() || null,
    categoria_id: Number(document.getElementById('categoriaServicio').value),
    correo_servicio: document.getElementById('correoServicio').value.trim() || null,
    url: document.getElementById('urlServicio').value.trim() || null,
    notas: document.getElementById('notasServicio').value.trim() || null,
    metodo_desbloqueo: metodoSeleccionado
  };

  const password = document.getElementById('passwordServicio').value;
  if (password) payload.password_servicio = password;

  if (metodoSeleccionado === 'pin') {
    payload.pin = document.getElementById('pinServicio').value;
  } else {
    payload.pregunta = document.getElementById('preguntaServicio').value.trim();
    payload.respuesta = document.getElementById('respuestaServicio').value.trim();
  }

  try {
    if (servicioEditandoId) {
      await apiService.actualizarServicio(servicioEditandoId, payload);
    } else {
      await apiService.crearServicio(payload);
    }

    UI.cerrarModal('modalServicio');
    cargarServicios();

  } catch (error) {
    alert('Error al guardar el servicio: ' + error.message);
  }
}

// ------------------------------------------------
// ELIMINAR (DELETE /api/servicios/:id)
// ------------------------------------------------
async function eliminarServicio(id) {
  const servicio = listaServicios.find((s) => String(s.id) === String(id));
  const confirmar = confirm(`¿Eliminar el servicio "${servicio?.nombre}"? Esta acción no se puede deshacer.`);
  if (!confirmar) return;

  try {
    await apiService.eliminarServicio(id);
    cargarServicios();
  } catch (error) {
    alert('Error al eliminar el servicio: ' + error.message);
  }
}

// ------------------------------------------------
// MODAL: DESBLOQUEO (Etapa 11)
// Verifica el PIN o la respuesta contra el backend
// (POST /api/servicios/:id/desbloquear) y, si es correcto,
// muestra la contraseña real que llega ya descifrada.
// ------------------------------------------------
function configurarModalDesbloqueo() {
  document.getElementById('btnVerificar').addEventListener('click', verificarDesbloqueo);
}

function abrirModalDesbloqueo(id) {
  const servicio = listaServicios.find((s) => String(s.id) === String(id));
  if (!servicio) return;

  servicioDesbloqueandoId = id;

  document.getElementById('passwordRevelada').classList.add('hidden');
  document.getElementById('passwordRevelada').textContent = '';
  UI.ocultarAlerta('alertDesbloqueo');

  const esPin = servicio.metodoDesbloqueo === 'pin';
  document.getElementById('pinInputsGroup').classList.toggle('hidden', !esPin);
  document.getElementById('respuestaInputGroup').classList.toggle('hidden', esPin);

  if (esPin) {
    document.getElementById('textoDesbloqueo').textContent = 'Ingresa el PIN de este servicio para ver la contraseña';
    document.querySelectorAll('#pinInputsGroup input').forEach((input) => (input.value = ''));
  } else {
    document.getElementById('textoDesbloqueo').textContent = servicio.pregunta || 'Responde tu pregunta personal';
    document.getElementById('respuestaDesbloqueo').value = '';
  }

  UI.abrirModal('modalDesbloqueo');
}

async function verificarDesbloqueo() {
  const servicio = listaServicios.find((s) => String(s.id) === String(servicioDesbloqueandoId));
  if (!servicio) return;

  UI.ocultarAlerta('alertDesbloqueo');

  let datosVerificacion = {};
  if (servicio.metodoDesbloqueo === 'pin') {
    const pin = Array.from(document.querySelectorAll('#pinInputsGroup input'))
      .map((input) => input.value)
      .join('');
    if (pin.length !== 4) {
      UI.mostrarAlerta('alertDesbloqueo', 'Ingresa los 4 dígitos del PIN');
      return;
    }
    datosVerificacion = { pin };
  } else {
    const respuesta = document.getElementById('respuestaDesbloqueo').value.trim();
    if (!respuesta) {
      UI.mostrarAlerta('alertDesbloqueo', 'Escribe tu respuesta');
      return;
    }
    datosVerificacion = { respuesta };
  }

  try {
    // Petición real al backend: solo si el PIN/respuesta es correcto
    // devuelve la contraseña ya descifrada.
    const resultado = await apiService.desbloquearServicio(servicioDesbloqueandoId, datosVerificacion);

    const divPassword = document.getElementById('passwordRevelada');
    divPassword.textContent = resultado.password;
    divPassword.classList.remove('hidden');

  } catch (error) {
    UI.mostrarAlerta('alertDesbloqueo', error.message);
  }
}
