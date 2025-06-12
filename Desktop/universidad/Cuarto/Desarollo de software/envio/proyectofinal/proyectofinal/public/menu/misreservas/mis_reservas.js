console.log("Script mis_reservas.js cargado correctamente");

function cargarReservas() {
  const id_usuario = localStorage.getItem('id_usuario');

  if (!id_usuario) {
    alert('Usuario no autenticado. Redirigiendo al login...');
    window.location.href = '/';
    return;
  }

  console.log('Solicitando reservas para el id_usuario:', id_usuario);

  fetch(`/mis_reservas?id_usuario=${id_usuario}`)
    .then(response => {
      if (!response.ok) throw new Error('Error al obtener reservas');
      return response.json();
    })
    .then(reservas => {
      console.log('Reservas obtenidas:', reservas);

      const container = document.querySelector('.reservas-container');
      container.innerHTML = '<h2>Mis Reservas</h2>';

      if (reservas.length === 0) {
        container.innerHTML += '<p>No tienes reservas registradas.</p>';
        return;
      }

      reservas.forEach(reserva => {
        const card = document.createElement('div');
        card.className = 'reserva-card';
        card.innerHTML = `
          <div class="reserva-info">
            <p><strong>ID Reserva:</strong> ${reserva.id_reserva}</p>
            <p><strong>ID Aula:</strong> ${reserva.id_aula}</p>
            <p><strong>Fecha:</strong> ${reserva.fecha}</p>
            <p><strong>Hora Inicio:</strong> ${reserva.hora_inicio}</p>
            <p><strong>Hora Fin:</strong> ${reserva.hora_fin}</p>
          </div>
          <div class="reserva-actions">
            <button class="btn modificar">Modificar</button>
            <button class="btn cancelar">Cancelar</button>
          </div>`;
        container.appendChild(card);
      });
    })
    .catch(error => {
    console.error('Error al cargar las reservas:', error);
    alert('No se pudieron cargar las reservas');
    });
}

// ⚠️ Ejecutamos directamente
cargarReservas();
