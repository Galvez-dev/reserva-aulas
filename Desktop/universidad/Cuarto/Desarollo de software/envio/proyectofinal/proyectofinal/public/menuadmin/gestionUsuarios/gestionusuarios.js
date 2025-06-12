function cargarGestionU() {
  const btnCrear = document.querySelector('.btn-crear');
  const tabla = document.querySelector('.tabla-usuarios tbody');
  const modal = document.getElementById('formularioEmergente');
  const form = document.getElementById('formCrearUsuario');
  const btnCancelar = form.querySelector('.btn-cancelar');

  function validarContrasena(contrasena) {
    // Mínimo 8 caracteres, al menos una mayúscula y un carácter especial
    const regex = /^(?=.*[A-Z])(?=.*[!@#$%^&*()_+{}\[\]:;<>,.?~\\/-]).{8,}$/;
    return regex.test(contrasena);
  }

  // Carga inicial de datos desde el servidor
  fetch('/api/usuarios')
    .then(res => {
      if (!res.ok) throw new Error('Error al cargar usuarios');
      return res.json();
    })
    .then(usuarios => {
      usuarios.forEach(usuario => agregarFila(usuario));
    })
    .catch(err => console.error(err));

  // Mostrar formulario emergente
  btnCrear.addEventListener('click', () => {
    form.reset();
    modal.classList.remove('oculto');
  });

  // Cancelar creación
  btnCancelar.addEventListener('click', () => {
    modal.classList.add('oculto');
  });

  // Crear usuario (enviar formulario)
  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const id_usuario = form.id_usuario.value.trim();
    const nombre = form.nombre.value.trim();
    const correo = form.correo.value.trim();
    const contrasena = form.contrasena.value.trim();
    const rol = form.rol.value.trim();
    const telefono = form.telefono.value.trim();

    // Validaciones
    if (!id_usuario || !rol || !correo || !nombre || !telefono || !contrasena) {
      alert("❌ Todos los campos son obligatorios.");
      return;
    }

    if (id_usuario.length < 9) {
      alert("❌ El ID de usuario debe tener un mínimo de 9 dígitos.");
      return;
    }

    if (telefono.length < 10) {
      alert("❌ El número celular debe tener un mínimo de 10 dígitos.");
      return;
    }

    if (!validarContrasena(contrasena)) {
      alert("❌ La contraseña debe tener al menos 8 caracteres, una mayúscula y un carácter especial.");
      return;
    }

    const nuevoUsuario = {
      id_usuario,
      nombre,
      correo,
      contrasena,
      rol,
      telefono
    };

    fetch('/api/registrar', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(nuevoUsuario)
    })
      .then(res => {
        if (!res.ok) throw new Error('Error al crear usuario');
        return res.text();
      })
      .then(() => {
        agregarFila({
          id: nuevoUsuario.id_usuario,
          nombre: nuevoUsuario.nombre,
          correo: nuevoUsuario.correo,
          contrasena: nuevoUsuario.contrasena,
          rol: nuevoUsuario.rol,
          telefono: nuevoUsuario.telefono
        });
        modal.classList.add('oculto');
      })
      .catch(err => {
        console.error(err);
        alert('No se pudo crear el usuario.');
      });
  });

  tabla.addEventListener('click', (e) => {
    const btn = e.target;
    const fila = btn.closest('tr');
    if (btn.classList.contains('btn-modificar')) editarFila(fila);
    if (btn.classList.contains('btn-guardar')) guardarFila(fila);
    if (btn.classList.contains('btn-cancelar')) cancelarEdicion(fila);
    if (btn.classList.contains('btn-eliminar')) eliminarFila(fila);
  });

  function agregarFila(u) {
    const tr = document.createElement('tr');
    tr.dataset.idUsuario = u.id;
    tr.innerHTML = `
      <td>${u.id}</td>
      <td>${u.nombre}</td>
      <td>${u.correo}</td>
      <td>${u.contrasena}</td>
      <td>${u.rol}</td>
      <td>${u.telefono}</td>
      <td>
        <button class="btn-modificar">Modificar</button>
        <button class="btn-eliminar">Eliminar</button>
      </td>`;
    tabla.appendChild(tr);
  }

  function editarFila(fila) {
    const celdas = fila.querySelectorAll('td');
    const valoresOriginales = Array.from(celdas).slice(0, -1).map(td => td.textContent.trim());

    fila.dataset.original = JSON.stringify(valoresOriginales);

    for (let i = 0; i < celdas.length - 1; i++) {
      const texto = valoresOriginales[i];
      celdas[i].innerHTML = `<input type="text" value="${texto}" />`;
    }

    celdas[celdas.length - 1].innerHTML = `
      <button class="btn-guardar">Guardar</button>
      <button class="btn-cancelar">Cancelar</button>`;
  }

  function guardarFila(fila) {
  const idOriginal = fila.dataset.idUsuario;
  const inputs = fila.querySelectorAll('input');
  const datos = Array.from(inputs).map(i => i.value.trim());

  const [id_usuario, nombre, correo, contrasena, rol, telefono] = datos;

  // Validaciones
  if (!id_usuario || !nombre || !correo || !contrasena || !rol || !telefono) {
    alert("❌ Todos los campos son obligatorios.");
    return;
  }

  if (id_usuario.length < 9) {
    alert("❌ El ID de usuario debe tener un mínimo de 9 dígitos.");
    return;
  }

  if (telefono.length < 10) {
    alert("❌ El número celular debe tener un mínimo de 10 dígitos.");
    return;
  }

  if (!validarContrasena(contrasena)) {
    alert("❌ La contraseña debe tener al menos 8 caracteres, una mayúscula y un carácter especial.");
    return;
  }

  fetch(`/api/usuarios/${idOriginal}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      id_usuario,
      nombre,
      correo,
      contrasena,
      rol,
      telefono
    })
  })
    .then(res => {
      if (!res.ok) throw new Error('Error al actualizar el usuario');
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

      fila.dataset.idUsuario = id_usuario;
    })
    .catch(err => {
      console.error(err);
      alert('No se pudo actualizar el usuario.');
    });
}


  function cancelarEdicion(fila) {
    const celdas = fila.querySelectorAll('td');
    const valoresOriginales = JSON.parse(fila.dataset.original);

    for (let i = 0; i < valoresOriginales.length; i++) {
      celdas[i].textContent = valoresOriginales[i];
    }

    celdas[celdas.length - 1].innerHTML = `
      <button class="btn-modificar">Modificar</button>
      <button class="btn-eliminar">Eliminar</button>`;
  }

  function eliminarFila(fila) {
    const id = fila.children[0].textContent;

    if (!confirm(`¿Estás seguro de eliminar al usuario con ID ${id}?`)) return;

    fetch(`/api/usuarios/${id}`, {
      method: 'DELETE'
    })
      .then(res => {
        if (!res.ok) throw new Error('Error al eliminar usuario');
        return res.json();
      })
      .then(() => {
        fila.remove();
      })
      .catch(err => {
        console.error(err);
        alert('No se pudo eliminar el usuario.');
      });
  }
}

cargarGestionU();
