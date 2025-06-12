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
      if (!container) {
        console.error("No se encontró el contenedor '.reservas-container'");
        return;
      }

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
            <button class="btn modificar" disabled>Modificar</button>
            <button class="btn cancelar" data-id="${reserva.id_reserva}">Cancelar</button>
          </div>
        `;
        container.appendChild(card);
      });

      // Agregar listeners a los botones "Cancelar"
      const botonesCancelar = document.querySelectorAll('.btn.cancelar');
      if (botonesCancelar.length === 0) {
        console.warn("No se encontraron botones con clase '.btn cancelar'");
      }

      botonesCancelar.forEach(btn => {
        btn.addEventListener('click', function () {
          const idReserva = this.getAttribute('data-id');
          console.log(`Botón cancelar clickeado. ID Reserva: ${idReserva}`);

          const confirmar = confirm(`¿Estás seguro de que deseas cancelar la reserva ${idReserva}?`);
          if (!confirmar) return;

          fetch(`/api/reservas/${idReserva}`, {
            method: 'DELETE'
          })
            .then(response => {
              if (!response.ok) throw new Error('Error al cancelar la reserva');
              return response.json();
            })
            .then(data => {
              alert(data.message || 'Reserva cancelada correctamente');
              cargarReservas(); // Recargar lista
            })
            .catch(error => {
              console.error('Error al cancelar reserva:', error);
              alert('No se pudo cancelar la reserva');
            });
        });
      });
    })
    .catch(error => {
      console.error('Error al cargar las reservas:', error);
      alert('No se pudieron cargar las reservas');
    });
}

// Esperamos a que el DOM esté listo
document.addEventListener('DOMContentLoaded', cargarReservas);
