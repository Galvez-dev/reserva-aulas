const express = require('express');
const app = express();
const path = require('path');
const mysql = require('mysql2');

// Middleware para servir archivos estáticos desde /public
app.use(express.static(path.join(__dirname, 'public')));

// Middleware para parsear los datos en formato JSON
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Ruta principal que sirve index.html
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Iniciar servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor iniciado en http://localhost:${PORT}`);
});

// Configura tu conexión con MySQL (ajusta con tus datos)
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '', // Cambia esto por tu contraseña de MySQL
  database: 'Reservas' // Cambia por el nombre de tu base de datos
});

// Conectar a la base de datos
db.connect((err) => {
  if (err) {
    console.error('Error de conexión a la base de datos:', err);
  } else {
    console.log('Conectado a la base de datos MySQL');
  }
});

// Ruta para el login
app.post('/login', (req, res) => {
  const { correo, contrasena } = req.body;

  // Verifica que los campos no estén vacíos
  if (!correo || !contrasena) {
    return res.status(400).json({ message: 'Correo y contraseña son obligatorios' }); // Respuesta en JSON
  }

  const sql = 'SELECT * FROM usuarios WHERE correo = ? AND contrasena = ?';
  db.query(sql, [correo, contrasena], (err, results) => {
    if (err) {
      console.error('Error en la consulta:', err);
      return res.status(500).json({ message: 'Error del servidor' }); // Respuesta en JSON
    }

    if (results.length > 0) {
      // Usuario válido
      const id_usuario = results[0].id_usuario; // Asumimos que el id del usuario está en la base de datos
      return res.json({ id_usuario, message: 'Login exitoso' }); // Respuesta en formato JSON
    } else {
      // Usuario no encontrado o contraseña incorrecta
      return res.status(401).json({ message: 'Credenciales inválidas' }); // Respuesta en formato JSON
    }
  });
});
// Ruta para obtener las reservas del usuario
app.get('/mis_reservas', (req, res) => {
  const { id_usuario } = req.query;

  if (!id_usuario) {
      return res.status(400).json({ error: 'id_usuario es necesario' });
  }

  // Ejemplo de consulta a la base de datos
  db.query('SELECT * FROM reservas WHERE id_usuario = ?', [id_usuario], (err, results) => {
      if (err) {
          console.error('Error en la consulta:', err);
          return res.status(500).json({ error: 'Error al obtener reservas' });
      }

      if (results.length > 0) {
          return res.json(results); // Devuelve las reservas
      } else {
          return res.status(404).json({ message: 'No se encontraron reservas' });
      }
  });
});



// Ruta para obtener el perfil de un usuario
app.get('/perfil', (req, res) => {
  const { id_usuario } = req.query;

  console.log('Solicitando perfil para id_usuario:', id_usuario);

  if (!id_usuario) {
    return res.status(400).json({ error: 'ID de usuario no proporcionado' });
  }

  // Consulta para obtener los datos del perfil
  db.query(
    'SELECT id_usuario, nombre, telefono, correo, contrasena FROM usuarios WHERE id_usuario = ?',
    [id_usuario],
    (err, result) => {
      if (err) {
        console.error('Error al obtener perfil:', err);
        return res.status(500).json({ error: 'Error al obtener perfil' });
      }

      if (result.length === 0) {
        return res.status(404).json({ error: 'Usuario no encontrado' });
      }

      res.json(result[0]);  // Devuelve los datos del perfil
    }
  );
});

// Ruta para actualizar el perfil de un usuario
app.put('/perfil', (req, res) => {
  const { id_usuario, documento, nombre, telefono, correo, contrasena } = req.body;

  if (!id_usuario || !documento || !nombre || !telefono || !correo || !contrasena) {
    return res.status(400).json({ error: 'Faltan datos requeridos' });
  }

  // Consulta para actualizar los datos del perfil en la base de datos
  db.query(
    'UPDATE usuarios SET id_usuario = ?, nombre = ?, telefono = ?, correo = ?, contrasena = ? WHERE id_usuario = ?',
    [documento, nombre, telefono, correo, contrasena, id_usuario],  // No actualices el id_usuario
    (err, result) => {
      if (err) {
        console.error('Error al actualizar perfil:', err);
        return res.status(500).json({ error: 'Error al actualizar perfil' });
      }

      return res.json({ message: 'Perfil actualizado exitosamente' });
    }
  );
});

// Ruta para registrar usuario
app.post('/api/registrar', (req, res) => {
  const { id_usuario, rol, correo, nombre, telefono, contrasena } = req.body;

  if (!id_usuario || !nombre || !rol || !telefono || !correo || !contrasena) {
    return res.status(400).send('Todos los campos son obligatorios');
  }

  const sql = 'INSERT INTO usuarios (id_usuario, rol, correo, nombre, telefono, contrasena) VALUES (?, ?, ?, ?, ?, ?)';
  const valores = [id_usuario, rol, correo, nombre, telefono, contrasena];

  db.query(sql, valores, (err) => {
    if (err) {
      console.error('Error al registrar usuario:', err);
      return res.status(500).send('Error al registrar el usuario');
    }

    res.status(201).send('Usuario registrado correctamente');
  });
});

//ruta aula
app.get('/api/aulas', (req, res) => {
  db.query('SELECT * FROM aula', (err, results) => {
    if (err) {
      console.error('Error al obtener aulas:', err);
      return res.status(500).json({ error: 'Error al obtener aulas' });
    }
    res.json(results);
  });
});

//ruta reservar
app.post('/api/reservas', (req, res) => {
  const { id_aula, id_usuario, fecha, hora_inicio, hora_fin } = req.body;

  if (!id_aula || !id_usuario || !fecha || !hora_inicio || !hora_fin) {
    return res.status(400).json({ error: 'Todos los campos son obligatorios' });
  }

  // Verificar disponibilidad
  db.query('SELECT disponible FROM aula WHERE id_aula = ?', [id_aula], (err, result) => {
    if (err) {
      console.error('Error verificando disponibilidad:', err);
      return res.status(500).json({ error: 'Error al verificar disponibilidad' });
    }

    if (!result.length || result[0].disponible === 0) {
      return res.status(400).json({ error: 'El aula no está disponible' });
    }

    // Verificar solapamiento
    const sqlSolapamiento = `
      SELECT id_reserva FROM reservas 
      WHERE id_aula = ? AND fecha = ? 
      AND (
        (hora_inicio < ? AND hora_fin > ?) OR
        (hora_inicio < ? AND hora_fin > ?) OR
        (hora_inicio >= ? AND hora_fin <= ?)
      )`;
    
    db.query(sqlSolapamiento, [id_aula, fecha, hora_fin, hora_inicio, hora_inicio, hora_fin, hora_inicio, hora_fin], (err, solapadas) => {
      if (err) {
        console.error('Error verificando solapamiento:', err);
        return res.status(500).json({ error: 'Error al verificar solapamiento' });
      }

      if (solapadas.length > 0) {
        return res.status(400).json({ error: 'El aula ya está reservada en ese horario' });
      }

      // Insertar la reserva
      const sqlInsert = `
        INSERT INTO reservas (id_aula, id_usuario, fecha, hora_inicio, hora_fin) 
        VALUES (?, ?, ?, ?, ?)`;

      db.query(sqlInsert, [id_aula, id_usuario, fecha, hora_inicio, hora_fin], (err, result) => {
        if (err) {
          console.error('Error al insertar reserva:', err);
          return res.status(500).json({ error: 'Error al crear reserva' });
        }

        res.status(201).json({
          message: 'Reserva creada exitosamente',
          id_reserva: result.insertId
        });
      });
    });
  });
});