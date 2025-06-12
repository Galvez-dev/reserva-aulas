document.addEventListener("DOMContentLoaded", () => {
    const form = document.querySelector("form");
// Validar que la contraseña tenga al menos 8 caracteres, una mayúscula y un carácter especial
    function validarContrasena(contrasena) {
    const regex = /^(?=.*[A-Z])(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,}$/;
    return regex.test(contrasena);
}
    form.addEventListener("submit", async (e) => {
        e.preventDefault();

        const id_usuario = form.id_usuario.value.trim();
        const rol = form.rol.value;
        const correo = form.correo.value.trim();
        const nombre = form.nombre.value.trim();
        const telefono = form.telefono.value.trim();
        const contrasena = form.contrasena.value;
        if (!validarContrasena(contrasena)) {
            alert("❌ La contraseña debe tener al menos 8 caracteres, una mayúscula y un carácter especial.");
            return;
        }
        if (!id_usuario || !rol || !correo || !nombre || !telefono || !contrasena) {
            alert("❌ Todos los campos son obligatorios.");
            return;
        }

        // Validar longitud mínima de id_usuario (9 dígitos)
        if (id_usuario.length < 9) {
            alert("❌ El ID de usuario debe tener un mínimo de 9 dígitos.");
            return;
        }

        // Validar longitud mínima de teléfono (10 dígitos)
        if (telefono.length < 10) {
            alert("❌ El número celular debe tener un mínimo de 10 dígitos.");
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
