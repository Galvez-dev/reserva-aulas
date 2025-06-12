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
      const data = await response.json(); // Ahora podemos parsear la respuesta como JSON

      // Almacena el id_usuario en localStorage
      localStorage.setItem('id_usuario', data.id_usuario);
      // Verificar si el id_usuario está guardado en localStorage
      const idUsuario = localStorage.getItem('id_usuario');
      if (idUsuario) {
        console.log('ID de usuario guardado:', idUsuario);
      } else {
        console.log('No se encontró el id_usuario en el localStorage');
      }

      // Redirige al menú principal
      window.location.href = '/menu/menu.html';
    } else {
      // Si el login falla, muestra el mensaje de error
      const message = await response.json(); // Ahora esperamos un objeto JSON
      alert(message.message || 'Correo o contraseña incorrectos');
    }
  } catch (error) {
    console.error('Error en la petición de login:', error);
    alert('Hubo un error en la conexión. Intenta de nuevo.');
  }
});
document.addEventListener('DOMContentLoaded', () => {
  // Usamos querySelector para seleccionar por clase
  const btnRegister = document.querySelector('.btn-register'); 
  
  if (btnRegister) {  // Verifica que el botón exista
    btnRegister.addEventListener('click', () => {
      // Redirige al formulario de registro
      window.location.href = '/registro/index.html';  // Asegúrate de que la ruta sea correcta
    });
  }
});

