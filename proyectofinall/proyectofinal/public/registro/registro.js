document.addEventListener("DOMContentLoaded", () => {
    const form = document.querySelector("form");

    form.addEventListener("submit", async (e) => {
        e.preventDefault();

        const id_usuario = form.id_usuario.value.trim();
        const rol = form.rol.value;
        const correo = form.correo.value.trim();
        const nombre = form.nombre.value.trim();
        const telefono = form.telefono.value.trim();
        const contrasena = form.contrasena.value;

        
        if (!id_usuario || !rol || !correo || !nombre || !telefono || !contrasena) {
            alert("❌ Todos los campos son obligatorios.");
            return;
        }

        const datosRegistro = {
            id_usuario,
            rol,
            correo,
            nombre,
            telefono,
            contrasena
        };

        try {
            const respuesta = await fetch("/api/registrar", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(datosRegistro)
            });

            if (respuesta.ok) {
                alert("✅ Registro exitoso.");
                form.reset();
                window.location.href = "/index.html"; // Cambia la ruta si tu login está en otro lugar
            }
            else {
                const mensaje = await respuesta.text();
                alert("❌ Error al registrar: " + mensaje);
            }
        } catch (error) {
            console.error("Error de conexión:", error);
            alert("⚠️ No se pudo conectar al servidor.");
        }
    });
});
