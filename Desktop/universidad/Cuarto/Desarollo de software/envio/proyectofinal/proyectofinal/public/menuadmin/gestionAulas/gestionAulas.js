function cargarGestionA() {
const btnCrear = document.querySelector('.btn-crear');
const tabla = document.querySelector('#tablaAulas');
const modal = document.getElementById('formularioEmergente');
const form = document.getElementById('formCrearAula');
const btnCancelar = form.querySelector('.btn-cancelar');

// Cargar aulas existentes
fetch('/api/aulas')
  .then(res => {
    if (!res.ok) throw new Error('No se pudo cargar aulas');
    return res.json();
  })
  .then(data => {
    data.forEach(aula => agregarFila(aula));
  })
  .catch(err => console.error(err));

// Delegación de eventos para botones en la tabla
tabla.addEventListener('click', (e) => {
  const btn = e.target;
  const fila = btn.closest('tr');
  if (btn.classList.contains('btn-modificar')) editarFila(fila);
  if (btn.classList.contains('btn-guardar')) guardarFila(fila);
  if (btn.classList.contains('btn-cancelar')) cancelarEdicion(fila);
  if (btn.classList.contains('btn-eliminar')) eliminarFila(fila);
});

// Agregar una fila a la tabla
function agregarFila(a) {
  const tr = document.createElement('tr');
  tr.innerHTML = `
    <td>${a.id_aula}</td>
    <td>${a.Tipo}</td>
    <td>${a.capacidad}</td>
    <td>${parseInt(a.disponible) === 1 ? 'Sí' : 'No'}</td>
    <td>
      <button class="btn-modificar">Modificar</button>
      <button class="btn-eliminar">Eliminar</button>
    </td>`;
  tabla.appendChild(tr);
}

// Habilitar edición de fila
function editarFila(fila) {
  const celdas = fila.querySelectorAll('td');
  const valores = Array.from(celdas).slice(0, -1).map(td => td.textContent.trim());
  fila.dataset.original = JSON.stringify(valores);

  // Tipo y capacidad como inputs
  for (let i = 1; i <= 2; i++) {
    celdas[i].innerHTML = `<input type="text" value="${valores[i]}" />`;
  }

  // Disponible como select
  const disponibleActual = valores[3].toLowerCase() === 'sí' ? '1' : '0';
  celdas[3].innerHTML = `
    <select>
      <option value="1" ${disponibleActual === '1' ? 'selected' : ''}>Sí</option>
      <option value="0" ${disponibleActual === '0' ? 'selected' : ''}>No</option>
    </select>
  `;

  // Botones
  celdas[4].innerHTML = `
    <button class="btn-guardar">Guardar</button>
    <button class="btn-cancelar">Cancelar</button>
  `;
}

// Guardar cambios en la fila
function guardarFila(fila) {
  const id = fila.children[0].textContent;
  const tipo = fila.children[1].querySelector('input').value.trim();
  const capacidad = parseInt(fila.children[2].querySelector('input').value.trim());
  const disponible = parseInt(fila.children[3].querySelector('select').value);

  const datos = { Tipo: tipo, capacidad, disponible };

  fetch(`/api/aulas/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(datos)
  })
    .then(res => res.json())
    .then(() => {
      fila.children[1].textContent = tipo;
      fila.children[2].textContent = capacidad;
      fila.children[3].textContent = disponible === 1 ? 'Sí' : 'No';
      fila.children[4].innerHTML = `
        <button class="btn-modificar">Modificar</button>
        <button class="btn-eliminar">Eliminar</button>
      `;
    })
    .catch(err => {
      console.error(err);
      alert('Error al guardar cambios');
    });
}

// Cancelar edición y restaurar valores originales
function cancelarEdicion(fila) {
  const valores = JSON.parse(fila.dataset.original);
  for (let i = 1; i <= 3; i++) {
    fila.children[i].textContent = valores[i];
  }
  fila.children[4].innerHTML = `
    <button class="btn-modificar">Modificar</button>
    <button class="btn-eliminar">Eliminar</button>
  `;
}

// Eliminar una fila
function eliminarFila(fila) {
  const id = fila.children[0].textContent;
  if (!confirm(`¿Eliminar el aula con ID ${id}?`)) return;

  fetch(`/api/aulas/${id}`, { method: 'DELETE' })
    .then(res => res.json())
    .then(() => fila.remove())
    .catch(err => {
      console.error(err);
      alert('No se pudo eliminar el aula');
    });
}

// Mostrar el formulario emergente
btnCrear.addEventListener('click', () => {
  form.reset();
  modal.classList.remove('oculto');
});

// Ocultar el formulario emergente
btnCancelar.addEventListener('click', (e) => {
  e.preventDefault();
  modal.classList.add('oculto');
});

// Enviar formulario para crear aula
form.addEventListener('submit', (e) => {
  e.preventDefault();

  const nuevaAula = {
    id_aula: form.id_aula.value.trim(),
    Tipo: form.Tipo.value.trim(),
    capacidad: parseInt(form.capacidad.value.trim()),
    disponible: parseInt(form.disponible.value)
  };

  fetch('/api/aulas', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(nuevaAula)
  })
    .then(res => {
      if (!res.ok) throw new Error('Error al crear aula');
      return res.json();
    })
    .then(data => {
      agregarFila(nuevaAula); // O `data` si tu backend devuelve el aula creado
      modal.classList.add('oculto');
    })
    .catch(err => {
      console.error(err);
      alert('No se pudo crear el aula');
    });
});
}
cargarGestionA();