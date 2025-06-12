console.log(" SCRIPT INICIADO - reserva.js");

// Función principal de inicialización
function inicializarReserva() {
    console.log(" Inicializando reserva...");
    
    // Verificar sesión de usuario
    const userId = localStorage.getItem("id_usuario");
    console.log("👤 User ID:", userId);
    
    if (!userId) {
        alert("Debes iniciar sesión para reservar aulas.");
        window.location.href = "/";
        return;
    }

    // Configurar fecha y hora
    configurarFechaHora();
    
    // Configurar evento del botón
    configurarBotonBuscar();
}

// Configurar el botón de búsqueda
function configurarBotonBuscar() {
    const btnBuscar = document.getElementById("buscarAulas");
    
    if (btnBuscar) {
        // Remover eventos previos (por si acaso)
        btnBuscar.replaceWith(btnBuscar.cloneNode(true));
        const btnNuevo = document.getElementById("buscarAulas");
        
        btnNuevo.addEventListener("click", async function(e) {
            e.preventDefault();
            e.stopPropagation();
            await buscarAulasDisponibles();
        });
        
    } else {
        // Mostrar todos los elementos con ID
        const elementosConId = document.querySelectorAll('[id]');
        console.log("📋 Elementos disponibles:");
        elementosConId.forEach(el => console.log("  -", el.id));
    }
}

// Configurar fecha y hora por defecto
function configurarFechaHora() {
    console.log("Configurando fecha y hora...");
    
    const fechaInput = document.getElementById("fecha");
    const horaInicioInput = document.getElementById("horaInicio");
    const horaFinInput = document.getElementById("horaFin");

    if (!fechaInput || !horaInicioInput || !horaFinInput) {
        console.error("❌ Algunos inputs no encontrados");
        return;
    }

    const hoy = new Date();
    fechaInput.min = hoy.toISOString().split("T")[0];
    fechaInput.value = hoy.toISOString().split("T")[0];

    // Redondear minutos al siguiente múltiplo de 15
    let minutosRedondeados = Math.ceil(hoy.getMinutes() / 15) * 15;
    if (minutosRedondeados === 60) {
        hoy.setHours(hoy.getHours() + 1);
        minutosRedondeados = 0;
    }
    hoy.setMinutes(minutosRedondeados, 0, 0);

    const horaInicio = hoy.toTimeString().substring(0, 5);
    horaInicioInput.value = horaInicio;

    hoy.setHours(hoy.getHours() + 1);
    const horaFin = hoy.toTimeString().substring(0, 5);
    horaFinInput.value = horaFin;
    
    console.log("✅ Fecha y hora configuradas");
}

// Buscar aulas disponibles
async function buscarAulasDisponibles() {
    console.log("🔎 Iniciando búsqueda de aulas...");
    
    const fecha = document.getElementById("fecha").value;
    const hora_inicio = document.getElementById("horaInicio").value;
    const hora_fin = document.getElementById("horaFin").value;

    console.log(" Parámetros:", { fecha, hora_inicio, hora_fin });

    // Validaciones
    if (!fecha || !hora_inicio || !hora_fin) {
        mostrarAlerta("Por favor, completa todos los campos", "error");
        return;
    }

    if (hora_inicio >= hora_fin) {
        mostrarAlerta("La hora de inicio debe ser anterior a la hora de fin", "error");
        return;
    }

    mostrarCargando(true);

    try {
        console.log("📡 Enviando petición al servidor...");
        
        const res = await fetch("/api/aulas-disponibles", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ fecha, hora_inicio, hora_fin }),
        });

        console.log("📥 Respuesta recibida, status:", res.status);

        const text = await res.text();
        console.log("📄 Texto respuesta:", text);
        
        const data = JSON.parse(text);
        console.log("📊 Datos parseados:", data);

        if (!res.ok) {
            throw new Error(data.error || "Error al buscar aulas.");
        }

        mostrarAulas(data);
    } catch (err) {
        console.error("❌ Error:", err);
        mostrarAlerta("Error al buscar aulas: " + err.message, "error");
    } finally {
        mostrarCargando(false);
    }
}

// Mostrar aulas disponibles
function mostrarAulas(aulas) {
    console.log("🏢 Mostrando aulas:", aulas);
    
    // Buscar contenedores de múltiples maneras
    let container = document.getElementById("aulasContainer");
    let grid = document.getElementById("aulasGrid");
    
    console.log("🔍 Búsqueda inicial:");
    console.log("  container:", container);
    console.log("  grid:", grid);
    
    // Si no se encuentran, buscar por clase o crear dinámicamente
    if (!container || !grid) {
        console.log("⚠️ Contenedores no encontrados, buscando alternativas...");
        
        // Buscar por clase
        container = document.querySelector(".reservas-container");
        grid = document.querySelector(".aulas-grid");
        
        console.log("🔍 Búsqueda por clase:");
        console.log("  container:", container);
        console.log("  grid:", grid);
        
        // Si aún no existen, crearlos dinámicamente
        if (!container || !grid) {
            console.log("🔧 Creando contenedores dinámicamente...");
            
            // Crear contenedor principal
            container = document.createElement("div");
            container.id = "aulasContainer";
            container.className = "reservas-container";
            container.innerHTML = `
                <h2>Aulas Disponibles</h2>
                <div class="aulas-grid" id="aulasGrid"></div>
            `;
            
            // Agregar después del formulario
            const formContainer = document.querySelector(".form-container");
            if (formContainer) {
                formContainer.parentNode.insertBefore(container, formContainer.nextSibling);
            } else {
                document.body.appendChild(container);
            }
            
            // Obtener referencia al grid recién creado
            grid = document.getElementById("aulasGrid");
            console.log("✅ Contenedores creados dinámicamente");
        }
    }
    
    if (!container || !grid) {
        console.error("❌ No se pudieron crear/encontrar los contenedores");
        // Como último recurso, mostrar alert con los resultados
        alert(`Se encontraron ${aulas.length} aulas disponibles. Ver consola para detalles.`);
        return;
    }
    
    console.log("✅ Contenedores listos para usar");

    container.style.display = "block";
    grid.innerHTML = "";

    if (!aulas.length) {
        grid.innerHTML = "<p class='no-aulas'>No hay aulas disponibles para este horario.</p>";
        return;
    }

    aulas.forEach(aula => {
        const card = document.createElement("div");
        card.className = "aula-card disponible";
        card.innerHTML = `
            <h3>Aula ${aula.nombre || aula.id_aula}</h3>
            <p><strong>Tipo:</strong> ${aula.Tipo}</p>
            <p><strong>Capacidad:</strong> ${aula.capacidad}</p>
            <button class="btn-seleccionar" data-id="${aula.id_aula}" data-nombre="${aula.nombre || aula.id_aula}">
                Reservar
            </button>
        `;
        grid.appendChild(card);
    });

    // Configurar botones de reserva
    document.querySelectorAll(".btn-seleccionar").forEach(btn =>
        btn.addEventListener("click", () => {
            confirmarReserva(btn.dataset.id, btn.dataset.nombre);
        })
    );
    
    console.log(`✅ Se mostraron ${aulas.length} aulas`);
}

// Confirmar reserva
async function confirmarReserva(idAula, nombreAula) {
    console.log("📝 Confirmando reserva:", idAula, nombreAula);
    
    const fecha = document.getElementById("fecha").value;
    const horaInicio = document.getElementById("horaInicio").value;
    const horaFin = document.getElementById("horaFin").value;
    const userId = localStorage.getItem("id_usuario");

    const confirmar = confirm(`¿Confirmar reserva del Aula ${nombreAula} para el ${fecha} de ${horaInicio} a ${horaFin}?`);
    if (!confirmar) return;

    try {
        const res = await fetch("/api/reservas", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                id_aula: idAula,
                id_usuario: userId,
                fecha,
                hora_inicio: horaInicio,
                hora_fin: horaFin,
            }),
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Error al crear reserva");

        mostrarAlerta("¡Reserva realizada con éxito!", "success");
        setTimeout(() => buscarAulasDisponibles(), 1500);
    } catch (err) {
        console.error("❌ Error en reserva:", err);
        mostrarAlerta(err.message, "error");
    }
}

// Mostrar alerta
function mostrarAlerta(mensaje, tipo = "info") {
    console.log("⚠️ Alerta:", mensaje, tipo);
    
    const alerta = document.createElement("div");
    alerta.className = `alerta ${tipo}`;
    alerta.textContent = mensaje;
    alerta.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 20px;
        border-radius: 5px;
        color: white;
        font-weight: bold;
        z-index: 1000;
        ${tipo === 'success' ? 'background-color: #4CAF50;' : 
          tipo === 'error' ? 'background-color: #f44336;' : 
          'background-color: #2196F3;'}
    `;
    document.body.appendChild(alerta);
    setTimeout(() => alerta.remove(), 4000);
}

// Mostrar estado de carga
function mostrarCargando(mostrar) {
    const btn = document.getElementById("buscarAulas");
    if (!btn) return;

    btn.disabled = mostrar;
    btn.innerHTML = mostrar ? "🔄 Buscando..." : "🔍 Buscar Aulas Disponibles";
}

// INICIALIZACIÓN - Múltiples métodos para asegurar que funcione
console.log("📍 Estado del documento:", document.readyState);

if (document.readyState === "loading") {
    // DOM aún se está cargando
    document.addEventListener("DOMContentLoaded", inicializarReserva);
    console.log("⏳ Esperando DOMContentLoaded...");
} else {
    // DOM ya está cargado
    console.log("⚡ DOM ya cargado, ejecutando inmediatamente");
    inicializarReserva();
}

// Backup adicional
window.addEventListener("load", function() {
    console.log("🔄 Window load - verificando inicialización");
    const btnBuscar = document.getElementById("buscarAulas");
    if (btnBuscar && !btnBuscar.hasAttribute("data-initialized")) {
        console.log("🔧 Re-inicializando por seguridad...");
        configurarBotonBuscar();
        btnBuscar.setAttribute("data-initialized", "true");
    }
});