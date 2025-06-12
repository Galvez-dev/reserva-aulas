document.addEventListener('DOMContentLoaded', function () {
    const id_usuario = localStorage.getItem('id_usuario');
    if (id_usuario) {
        fetch(`/perfil?id_usuario=${id_usuario}`)
            .then(response => response.json())
            .then(data => {
                if (!data.error) {
                    // Actualizar el nombre en el menú
                    const spanNombre = document.getElementById('nombreUsuario');
                    spanNombre.textContent = data.nombre;
                } else {
                    console.error('Error al obtener perfil:', data.error);
                }
            })
            .catch(err => console.error('Error en fetch perfil:', err));
    }
    
    
    const enlaces = document.querySelectorAll('.menu a');
    const contenido = document.querySelector('.content');

    enlaces.forEach(enlace => {
        enlace.addEventListener('click', function (e) {
            e.preventDefault();
            const texto = this.textContent.trim();

            let archivo = '';
            let scriptAdicional = '';

            switch (texto) {
                case 'Mi Perfil':
                    archivo = '/menuadmin/perfil/perfil.html';
                    scriptAdicional = '/menuadmin/perfil/perfil.js';
                    break;
                case 'Reservar Aula':
                    archivo = '/menuadmin/reservas/reserva.html';
                    scriptAdicional = '/menu/reservas/reserva.js';
                    break;
                case 'Mis Reservas':
                    archivo = '/menuadmin/misreservas/mis_reservas.html';
                    scriptAdicional = '/menu/misreservas/mis_reservas.js';
                    break;
                case 'Gestión de Usuarios':
                    archivo = '/menuadmin/gestionUsuarios/gestionusuarios.html';
                    scriptAdicional = '/menuadmin/gestionUsuarios/gestionusuarios.js';
            

                    break;
                case 'Gestión de Reservas':
                    archivo = '/menuadmin/gestionReservas/gestionReservas.html';
                    scriptAdicional = '/menuadmin/gestionReservas/gestionReservas.js';
                    break;
                case 'Gestión de Aulas':
                    archivo = '/menuadmin/gestionAulas/gestionaulas.html';
                    scriptAdicional = '/menuadmin/gestionAulas/gestionAulas.js';
                    break;
                case 'Manual/Ayuda':
                    archivo = '/menuadmin/ayuda/ayuda.html';
                    scriptAdicional = '';
                    break;
                case 'Cerrar Sesion':
                    window.location.href = '/public/index.html';
                    return;
            }

            if (archivo !== '') {
                fetch(archivo)
                    .then(response => response.text())
                    .then(html => {
                        contenido.innerHTML = html;

                        if (scriptAdicional) {
                            const scriptPrevio = document.getElementById('script-dinamico');
                            if (scriptPrevio) scriptPrevio.remove();

                            const script = document.createElement('script');
                            script.src = scriptAdicional;
                            script.id = 'script-dinamico';
                            script.type = 'text/javascript';
                            document.body.appendChild(script);
                        }
                    })
                    .catch(error => {
                        contenido.innerHTML = `<p>Error al cargar el contenido: ${error}</p>`;
                    });
            }
        });
    });
});
