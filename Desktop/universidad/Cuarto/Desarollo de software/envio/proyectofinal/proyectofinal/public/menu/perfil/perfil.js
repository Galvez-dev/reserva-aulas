console.log("Script perfil.js cargado correctamente");

function cargarPerfil() {
  const id_usuario = localStorage.getItem('id_usuario');

  if (!id_usuario) {
    alert("Usuario no autenticado. Redirigiendo al login...");
    window.location.href = "/";  // Redirigir al login si no hay id_usuario
    return;
  }

  console.log("Solicitando perfil para el id_usuario:", id_usuario);

  fetch(`/perfil?id_usuario=${id_usuario}`)  // Solicitar los datos del perfil al backend
    .then(response => {
      if (!response.ok) throw new Error("Error al obtener datos del perfil");
      return response.json();
    })
    .then(data => {
      console.log("Perfil obtenido:", data);

      // Asignar el id_usuario al campo documento
      document.getElementById("documento").value = data.id_usuario || "";  // Asegúrate de asignar el id_usuario
      document.getElementById("documento").disabled = true;  // Hacer el campo de documento no editable
      document.getElementById("nombre").value = data.nombre || "";
      document.getElementById("telefono").value = data.telefono || "";
      document.getElementById("correo").value = data.correo || "";
      document.getElementById("contrasena").value = data.contrasena || "";
    })
    .catch(error => {
      console.error("Error al cargar el perfil:", error);
      alert("No se pudo cargar el perfil");
    });

  const form = document.querySelector(".profile-form");
  if (form) {
    form.addEventListener("submit", guardarPerfil);  // Escuchar el evento de submit para guardar cambios
  }
}

function guardarPerfil(e) {
  e.preventDefault();

  const id_usuario = localStorage.getItem('id_usuario');
  if (!id_usuario) {
    alert("Usuario no autenticado");
    return;
  }

  const datos = {
    id_usuario,
    documento: document.getElementById("documento").value,  // Usamos el id_usuario en el campo documento
    nombre: document.getElementById("nombre").value,
    telefono: document.getElementById("telefono").value,
    correo: document.getElementById("correo").value,
    contrasena: document.getElementById("contrasena").value,
  };

  console.log("Enviando datos actualizados:", datos);

  fetch('/perfil', {  // Enviar los datos al backend para actualizar el perfil
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(datos),
  })
    .then(response => {
      if (!response.ok) throw new Error("Error al guardar el perfil");
      return response.json();
    })
    .then(resp => {
      console.log("Respuesta del servidor:", resp);
      alert("Perfil actualizado correctamente");
    })
    .catch(error => {
      console.error("Error al guardar el perfil:", error);
      alert("Hubo un problema al guardar los cambios");
    });
}

// Ejecutamos cargarPerfil al cargar la página
cargarPerfil();
