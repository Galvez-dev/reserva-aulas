document.addEventListener('DOMContentLoaded', function () {
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
                    archivo = '/menu/perfil/perfil.html';
                    scriptAdicional = '/menu/perfil/perfil.js';
                    break;
                case 'Reservar Aula':
                    archivo = '/menu/reservas/reserva.html';
                    scriptAdicional = '/menu/reservas/reserva.js';
                    break;
                case 'Mis Reservas':
                    archivo = '/menu/misreservas/mis_reservas.html';
                    scriptAdicional = '/menu/misreservas/mis_reservas.js';
                    break;
                
                case 'Manual/Ayuda':
                    archivo = '/menu/ayuda/ayuda.html';
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
                            // Eliminar script previo si existe
                            const scriptPrevio = document.getElementById('script-dinamico');
                            if (scriptPrevio) scriptPrevio.remove();

                            // Agregar nuevo script
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
