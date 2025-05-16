console.log("Script reserva.js cargado correctamente");

inicializarReserva();

function inicializarReserva() {
    const userId = localStorage.getItem("id_usuario");

    if (!userId) {
        alert("Debe iniciar sesión para reservar");
        window.location.href = "/";
        return;
    }

    cargarAulas();

    const formReserva = document.getElementById("reservaForm");
    if (formReserva) {
        formReserva.addEventListener("submit", handleSubmitReserva);

        const fechaInput = document.getElementById("fecha");
        if (fechaInput) {
            const hoy = new Date().toISOString().split("T")[0];
            fechaInput.min = hoy;
            fechaInput.value = hoy;
        }
    }
}

async function cargarAulas() {
    try {
        const response = await fetch("/api/aulas");
        if (!response.ok) throw new Error("Error al obtener aulas");

        const aulas = await response.json();
        mostrarAulas(aulas);
    } catch (error) {
        console.error("Error:", error);
        mostrarAlerta("Error al cargar aulas", "error");
    }
}

function mostrarAulas(aulas) {
    const container = document.querySelector(".reservas-container");
    if (!container) return;

    container.innerHTML = "<h2>Aulas Disponibles</h2>";

    if (aulas.length === 0) {
        container.innerHTML += "<p>No hay aulas registradas</p>";
        return;
    }

    const grid = document.createElement("div");
    grid.className = "aulas-grid";

    aulas.forEach((aula) => {
        const card = document.createElement("div");
        card.className = `aula-card ${aula.disponible ? "disponible" : "no-disponible"}`;
        card.innerHTML = `
            <h3>Aula ${aula.id_aula}</h3>
            <p><strong>Tipo:</strong> ${aula.Tipo}</p>
            <p><strong>Capacidad:</strong> ${aula.capacidad}</p>
            <p><strong>Estado:</strong> ${aula.disponible ? "Disponible" : "No disponible"}</p>
            ${aula.disponible ? `<button class="btn-seleccionar" data-id="${aula.id}">Seleccionar</button>` : ""}
        `;
        grid.appendChild(card);
    });

    container.appendChild(grid);

    document.querySelectorAll(".btn-seleccionar").forEach((btn) => {
        btn.addEventListener("click", () => {
            document.getElementById("aula").value = btn.dataset.id;
        });
    });
}

async function handleSubmitReserva(e) {
    e.preventDefault();

    const form = e.target;
    const userId = localStorage.getItem("id_usuario");

    if (!userId) {
        mostrarAlerta("Debe iniciar sesión para reservar", "error");
        return;
    }

    const id_aula = form.aula.value;
    const fecha = form.fecha.value;
    const hora_inicio = form.horaInicio.value;
    const hora_fin = form.horaFin.value;

    if (!id_aula || !fecha || !hora_inicio || !hora_fin) {
        mostrarAlerta("Todos los campos son obligatorios", "error");
        return;
    }

    if (hora_fin <= hora_inicio) {
        mostrarAlerta("La hora final debe ser posterior a la hora inicial", "error");
        return;
    }

    const datos = {
        id_aula,
        id_usuario: userId,
        fecha,
        hora_inicio,
        hora_fin,
    };

    console.log("Enviando reserva:", datos);

    try {
        const response = await fetch("/api/reservas", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(datos),
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || "Error al crear reserva");
        }

        mostrarAlerta("Reserva creada exitosamente", "success");
        form.reset();
        cargarAulas();
    } catch (error) {
        console.error("Error:", error);
        mostrarAlerta(error.message, "error");
    }
}

function mostrarAlerta(mensaje, tipo) {
    const alerta = document.createElement("div");
    alerta.className = `alerta ${tipo}`;
    alerta.textContent = mensaje;
    document.body.appendChild(alerta);
    setTimeout(() => {
        alerta.remove();
    }, 5000);
}
