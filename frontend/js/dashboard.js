// ============================================================
// dashboard.js
// Usa ApiService + las clases Usuario/Servicio para pintar
// el saludo, las estadísticas y la tabla de servicios recientes.
// ============================================================

document.addEventListener('DOMContentLoaded', async () => {
  try {
    const perfilPlano = await apiService.obtenerPerfil();
    const usuario = new Usuario(perfilPlano);
    document.getElementById('saludo').textContent = `Hola, ${usuario.primerNombre} 👋`;

    const serviciosPlano = await apiService.listarServicios();
    const servicios = Servicio.desdeLista(serviciosPlano);

    // --- Estadística: total de servicios ---
    document.getElementById('statTotal').textContent = servicios.length;

    // --- Estadística: categoría más usada ---
    const conteoPorCategoria = {};
    servicios.forEach((s) => {
      conteoPorCategoria[s.categoriaNombre] = (conteoPorCategoria[s.categoriaNombre] || 0) + 1;
    });
    const categorias = Object.entries(conteoPorCategoria).sort((a, b) => b[1] - a[1]);
    document.getElementById('statCategoria').textContent = categorias.length ? categorias[0][0] : '—';

    // --- Estadística: último acceso ---
    const fechaLogin = Auth.obtenerFechaLogin();
    document.getElementById('statUltimoAcceso').textContent = fechaLogin
      ? fechaLogin.toLocaleString('es-CO', { dateStyle: 'medium', timeStyle: 'short' })
      : '—';

    // --- Tabla: 3 servicios más recientes ---
    renderizarRecientes(servicios.slice(0, 3));

  } catch (error) {
    console.error('Error cargando el dashboard:', error);
  }
});

function renderizarRecientes(servicios) {
  const tbody = document.getElementById('tablaRecientes');
  tbody.innerHTML = '';

  if (servicios.length === 0) {
    tbody.innerHTML = `
      <tr><td colspan="4" style="text-align:center; color: var(--text-secondary); padding: 24px;">
        Aún no has guardado ningún servicio.
      </td></tr>`;
    return;
  }

  servicios.forEach((s) => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>
        <div class="service-name-cell">
          <div class="service-icon">${s.iniciales}</div>
          <span>${s.nombre}</span>
        </div>
      </td>
      <td><span class="badge">${s.categoriaNombre}</span></td>
      <td><span class="password-mask">••••••••</span></td>
      <td>${s.fechaFormateada}</td>
    `;
    tbody.appendChild(tr);
  });
}
