
function cargarGestionR() {
const btnCrear = document.querySelector('.btn-crear');
const tabla = document.querySelector('#tablaReservas');
const modal = document.getElementById('modalReserva');
const form = document.getElementById('formReserva');
const btnCancelar = form.querySelector('.btn-cancel');

// Cargar reservas al inicio
fetch('/api/reservas')
  .then(res => {
    if (!res.ok) throw new Error('Error al cargar reservas');
    return res.json();
  })
  .then(reservas => reservas.forEach(reserva => agregarFila(reserva)))
  .catch(err => console.error(err));

tabla.addEventListener('click', (e) => {
  const btn = e.target;
  const fila = btn.closest('tr');
  if (btn.classList.contains('btn-modificar')) editarFila(fila);
  if (btn.classList.contains('btn-guardar')) guardarFila(fila);
  if (btn.classList.contains('btn-cancelar')) cancelarEdicion(fila);
  if (btn.classList.contains('btn-eliminar')) eliminarFila(fila);
});

function agregarFila(r) {
  const tr = document.createElement('tr');

  tr.dataset.idReserva = r.id_reserva;
  tr.dataset.idAula = r.id_aula;
  tr.dataset.idUsuario = r.id_usuario;

  tr.innerHTML = `
    <td>${r.id_reserva}</td>
    <td>${r.nombre_aula || r.id_aula}</td>
    <td>${r.fecha}</td>
    <td>${r.hora_inicio}</td>
    <td>${r.hora_fin}</td>
    <td>${r.nombre_usuario || r.id_usuario}</td>
    <td>
      <button class="btn-modificar">Modificar</button>
      <button class="btn-eliminar">Eliminar</button>
    </td>`;
  tabla.appendChild(tr);
}

function editarFila(fila) {
  const celdas = fila.querySelectorAll('td');
  const originales = Array.from(celdas).slice(0, -1).map(td => td.textContent.trim());
  fila.dataset.original = JSON.stringify(originales);

  for (let i = 1; i < 6; i++) {
    celdas[i].innerHTML = `<input type="text" value="${originales[i]}" />`;
  }

  const acciones = celdas[6];
  acciones.innerHTML = `
    <button class="btn-guardar">Guardar</button>
    <button class="btn-cancelar">Cancelar</button>
  `;
}

function guardarFila(fila) {
  const id = fila.dataset.idReserva;
  const inputs = fila.querySelectorAll('input');
  const datos = Array.from(inputs).map(i => i.value.trim());

  fetch(`/api/reservas/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      id_aula: fila.dataset.idAula,
      fecha: datos[1],
      hora_inicio: datos[2],
      hora_fin: datos[3],
      id_usuario: fila.dataset.idUsuario
    })
  })
    .then(res => {
      if (!res.ok) throw new Error('Error al actualizar');
      return res.json();
    })
    .then(() => {
      inputs.forEach((input, idx) => {
        const td = input.parentElement;
        td.textContent = datos[idx];
      });

      const acciones = fila.querySelector('td:last-child');
      acciones.innerHTML = `
        <button class="btn-modificar">Modificar</button>
        <button class="btn-eliminar">Eliminar</button>
      `;
    })
    .catch(err => {
      console.error(err);
      alert('No se pudo actualizar la reserva.');
    });
}

function cancelarEdicion(fila) {
  const celdas = fila.querySelectorAll('td');
  const originales = JSON.parse(fila.dataset.original);

  for (let i = 1; i < 6; i++) {
    celdas[i].textContent = originales[i];
  }

  const acciones = celdas[6];
  acciones.innerHTML = `
    <button class="btn-modificar">Modificar</button>
    <button class="btn-eliminar">Eliminar</button>
  `;
}

function eliminarFila(fila) {
  const id = fila.querySelector('td').textContent;

  if (!confirm(`¿Eliminar reserva con ID ${id}?`)) return;

  fetch(`/api/reservas/${id}`, { method: 'DELETE' })
    .then(res => {
      if (!res.ok) throw new Error('Error al eliminar');
      return res.json();
    })
    .then(() => {
      if (fila && fila.parentNode && fila.tagName === 'TR') {
        fila.parentNode.removeChild(fila);
      }
    })
    .catch(err => {
      console.error(err);
      alert('No se pudo eliminar la reserva.');
    });
}

// Mostrar formulario para crear reserva
btnCrear.addEventListener('click', () => {
  form.reset();
  cargarOpcionesAulas();
  cargarOpcionesUsuarios();
  modal.classList.remove('oculto');
});

// Cancelar y cerrar modal
btnCancelar.addEventListener('click', () => {
  modal.classList.add('oculto');
});

// Cerrar modal con X
document.querySelector('.close').addEventListener('click', () => {
  modal.classList.add('oculto');
});

// Enviar formulario
form.addEventListener('submit', (e) => {
  e.preventDefault();

  const nuevaReserva = {
    id_aula: form.aula.value,
    fecha: form.fecha.value,
    hora_inicio: form.horaInicio.value,
    hora_fin: form.horaFin.value,
    id_usuario: form.usuario.value
  };

  fetch('/api/reservas', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(nuevaReserva)
  })
    .then(res => {
      if (!res.ok) throw new Error('Error al crear reserva');
      return res.json();
    })
    .then(reservaCreada => {
      // Recargar toda la tabla para obtener los datos completos
      location.reload();
    })
    .catch(err => {
      console.error(err);
      alert('No se pudo crear la reserva.');
    });
});

// Cargar opciones de aulas en el select
function cargarOpcionesAulas() {
  console.log('Cargando aulas...');
  fetch('/api/aulas')
    .then(res => {
      console.log('Respuesta aulas:', res.status);
      if (!res.ok) {
        console.error('Error en la respuesta:', res.statusText);
        throw new Error(`Error HTTP: ${res.status}`);
      }
      return res.json();
    })
    .then(aulas => {
      console.log('Aulas recibidas:', aulas);
      const select = form.aula;
      select.innerHTML = '<option value="">Seleccionar aula...</option>';
      
      if (aulas && aulas.length > 0) {
        aulas.forEach(aula => {
          const option = document.createElement('option');
          option.value = aula.id_aula;
          option.textContent = aula.nombre || `Aula ${aula.id_aula}`;
          select.appendChild(option);
        });
      } else {
        console.warn('No se encontraron aulas');
        const option = document.createElement('option');
        option.value = "";
        option.textContent = "No hay aulas disponibles";
        select.appendChild(option);
      }
    })
    .catch(err => {
      console.error('Error al cargar aulas:', err);
      const select = form.aula;
      select.innerHTML = '<option value="">Error al cargar aulas</option>';
      alert('Error al cargar la lista de aulas. Por favor, intente nuevamente.');
    });
}

// Cargar opciones de usuarios en el select
function cargarOpcionesUsuarios() {
  console.log('Cargando usuarios...');
  fetch('/api/usuarios')
    .then(res => {
      console.log('Respuesta usuarios:', res.status);
      if (!res.ok) throw new Error(`Error HTTP: ${res.status}`);
      return res.json();
    })
    .then(usuarios => {
      console.log('Usuarios recibidos:', usuarios);
      const select = form.usuario;
      select.innerHTML = '<option value="">Seleccionar usuario...</option>';
      
      if (usuarios && usuarios.length > 0) {
        usuarios.forEach(usuario => {
          const option = document.createElement('option');
          option.value = usuario.id || usuario.id_usuario;
          option.textContent = usuario.nombre || `Usuario ${usuario.id || usuario.id_usuario}`;
          select.appendChild(option);
        });
      } else {
        console.warn('No se encontraron usuarios');
        const option = document.createElement('option');
        option.value = "";
        option.textContent = "No hay usuarios disponibles";
        select.appendChild(option);
      }
    })
    .catch(err => {
      console.error('Error al cargar usuarios:', err);
      const select = form.usuario;
      select.innerHTML = '<option value="">Error al cargar usuarios</option>';
    });
}
}
cargarGestionR();