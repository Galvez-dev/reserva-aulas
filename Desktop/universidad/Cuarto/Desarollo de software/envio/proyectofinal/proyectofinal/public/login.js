const toggleBtn = document.querySelector('.toggle-btn');
const passwordField = document.getElementById('password');

// Toggle de visibilidad de la contraseña
toggleBtn.addEventListener('click', () => {
  const isPassword = passwordField.type === 'password';
  passwordField.type = isPassword ? 'text' : 'password';
  toggleBtn.textContent = isPassword ? '🙈' : '👁';
});

// Evento de click en el botón de login
document.querySelector('.btn').addEventListener('click', async () => {
  const correo = document.getElementById('email').value;
  const contrasena = document.getElementById('password').value;

  // Verifica que los campos no estén vacíos
  if (!correo || !contrasena) {
    alert('Por favor, ingrese correo y contraseña');
    return;
  }

  try {
    // Realiza la petición de login
    const response = await fetch('/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ correo, contrasena })
    });

    // Verifica si la respuesta fue exitosa
if (response.ok) {
  const data = await response.json(); // Parseamos la respuesta como JSON

  console.log('Respuesta del backend:', data); // <-- AGREGA ESTA LÍNEA

  // Almacena el id_usuario y el rol en localStorage
  localStorage.setItem('id_usuario', data.id_usuario);
  localStorage.setItem('rol', data.rol);

  // Verifica si los datos están guardados
  const idUsuario = localStorage.getItem('id_usuario');
  const rolUsuario = localStorage.getItem('rol');
  if (idUsuario && rolUsuario) {
    console.log('ID de usuario:', idUsuario);
    console.log('Rol del usuario:', rolUsuario);
  } else {
    console.log('Error al guardar datos en localStorage');
  }

  // Redirige según el rol
  if (data.rol === 'administrador') {
    window.location.href = '/menuadmin/menu.html';
  } else {
    window.location.href = '/menu/menu.html';
  }
    } else {
      // Si el login falla, muestra el mensaje de error
      const message = await response.json(); // Esperamos un objeto JSON
      alert(message.message || 'Correo o contraseña incorrectos');
    }
  } catch (error) {
    console.error('Error en la petición de login:', error);
    alert('Hubo un error en la conexión. Intenta de nuevo.');
  }
});

// Evento para redirigir al formulario de registro
document.addEventListener('DOMContentLoaded', () => {
  const btnRegister = document.querySelector('.btn-register'); 
  if (btnRegister) {
    btnRegister.addEventListener('click', () => {
      window.location.href = '/registro/index.html';
    });
  }
});
