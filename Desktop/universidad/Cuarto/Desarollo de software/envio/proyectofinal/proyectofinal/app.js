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
    return res.status(400).json({ message: 'Correo y contraseña son obligatorios' });
  }

  const sql = 'SELECT id_usuario, rol FROM usuarios WHERE correo = ? AND contrasena = ?';
  db.query(sql, [correo, contrasena], (err, results) => {
    if (err) {
      console.error('Error en la consulta:', err);
      return res.status(500).json({ message: 'Error del servidor' });
    }

    if (results.length > 0) {
      const { id_usuario, rol } = results[0];
      return res.json({ id_usuario, rol, message: 'Login exitoso' });
    } else {
      return res.status(401).json({ message: 'Credenciales inválidas' });
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

// Obtener aulas disponibles
app.post('/api/aulas-disponibles', (req, res) => {
  console.log("Solicitud recibida para aulas disponibles", req.body);
  
  const { fecha, hora_inicio, hora_fin } = req.body;

  if (!fecha || !hora_inicio || !hora_fin) {
    console.log("Faltan parámetros", { fecha, hora_inicio, hora_fin });
    return res.status(400).json({ error: "Faltan datos requeridos" });
  }

  const queryOcupadas = `
    SELECT id_aula FROM reservas
    WHERE fecha = ?
    AND (
      (hora_inicio < ? AND hora_fin > ?) OR
      (hora_inicio >= ? AND hora_inicio < ?)
    )
  `;

  console.log("Buscando aulas ocupadas...");
  db.query(queryOcupadas, [fecha, hora_fin, hora_inicio, hora_inicio, hora_fin], (err, ocupadas) => {
    if (err) {
      console.error("Error en consulta de aulas ocupadas:", err);
      return res.status(500).json({ error: "Error en la base de datos" });
    }

    console.log("Aulas ocupadas encontradas:", ocupadas);
    const idsOcupadas = ocupadas.map(r => r.id_aula);
    
    let queryDisponibles = 'SELECT * FROM aula';
    let params = [];

    if (idsOcupadas.length > 0) {
      const placeholders = idsOcupadas.map(() => '?').join(',');
      queryDisponibles += ` WHERE id_aula NOT IN (${placeholders})`;
      params = idsOcupadas;
    }

    console.log("Query para aulas disponibles:", queryDisponibles);
    console.log("Parámetros:", params);

    db.query(queryDisponibles, params, (err, disponibles) => {
      if (err) {
        console.error("Error al obtener aulas disponibles:", err);
        return res.status(500).json({ error: "Error al consultar aulas" });
      }

      console.log("Aulas disponibles encontradas:", disponibles);
      res.json(disponibles);
    });
  });
});

// Crear reserva
app.post('/api/reservas', (req, res) => {
  const { id_aula, id_usuario, fecha, hora_inicio, hora_fin } = req.body;

  // Validación básica
  if (!id_aula || !id_usuario || !fecha || !hora_inicio || !hora_fin) {
    return res.status(400).json({ error: 'Todos los campos son obligatorios' });
  }

  // Consulta para verificar solapamiento de horarios
  const sqlSolapamiento = `
    SELECT id_reserva FROM reservas 
    WHERE id_aula = ? AND fecha = ? 
    AND NOT (hora_fin <= ? OR hora_inicio >= ?)
  `;

  db.query(sqlSolapamiento, [id_aula, fecha, hora_inicio, hora_fin], (err, solapadas) => {
    if (err) {
      console.error('Error al verificar solapamiento:', err);
      return res.status(500).json({ error: 'Error al verificar solapamiento' });
    }

    if (solapadas.length > 0) {
      return res.status(409).json({ error: 'El aula ya está reservada en ese horario' });
    }

    // Insertar nueva reserva
    const sqlInsert = `
      INSERT INTO reservas (id_aula, id_usuario, fecha, hora_inicio, hora_fin) 
      VALUES (?, ?, ?, ?, ?)
    `;

    db.query(sqlInsert, [id_aula, id_usuario, fecha, hora_inicio, hora_fin], (err, result) => {
      if (err) {
        console.error('Error al crear reserva:', err);
        return res.status(500).json({ error: 'Error al crear reserva' });
      }

      res.status(201).json({
        message: 'Reserva creada exitosamente',
        id_reserva: result.insertId
      });
    });
  });
});


// Obtener reservas por usuario
app.get('/mis_reservas', (req, res) => {
  const { id_usuario } = req.query;

  if (!id_usuario) return res.status(400).json({ error: 'id_usuario es necesario' });

  db.query('SELECT * FROM reservas WHERE id_usuario = ?', [id_usuario], (err, results) => {
    if (err) return res.status(500).json({ error: 'Error al obtener reservas' });

    if (results.length === 0) {
      return res.status(404).json({ message: 'No se encontraron reservas' });
    }

    res.json(results);
  });
});
// Ruta para obtener todos los usuarios
app.get('/api/usuarios', (req, res) => {
  db.query('SELECT id_usuario AS id, nombre, correo, contrasena, rol, telefono FROM usuarios', (err, results) => {
    if (err) {
      console.error('Error al obtener usuarios:', err);
      return res.status(500).json({ error: 'Error del servidor' });
    }
    res.json(results);
  });
});
// Eliminar usuario por ID
app.delete('/api/usuarios/:id', (req, res) => {
  const id = req.params.id;

  db.query('DELETE FROM usuarios WHERE id_usuario = ?', [id], (err, result) => {
    if (err) {
      console.error('Error al eliminar usuario:', err);
      return res.status(500).json({ error: 'Error del servidor' });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    res.json({ mensaje: 'Usuario eliminado correctamente' });
  });
});
// Obtener todas las aulas
app.get('/api/aulas', (req, res) => {
  db.query('SELECT * FROM aula', (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});
app.post('/api/aulas', (req, res) => {
  const { id_aula, Tipo, capacidad, disponible } = req.body;

  const sql = 'INSERT INTO aula (id_aula, Tipo, capacidad, disponible) VALUES (?, ?, ?, ?)';
  db.query(sql, [id_aula, Tipo, capacidad, disponible], (err, result) => {
    if (err) {
      console.error('Error al insertar aula:', err);
      return res.status(500).json({ error: 'Error al crear aula' });
    }
    res.status(201).json({ message: 'Aula creada correctamente' });
  });
});


// Actualizar aula
app.put('/api/aulas/:id', (req, res) => {
  const { id } = req.params;
  const { Tipo, capacidad, disponible } = req.body;

  db.query(
    'UPDATE aula SET Tipo = ?, capacidad = ?, disponible = ? WHERE id_aula = ?',
    [Tipo, capacidad, disponible, id],
    (err, result) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ mensaje: 'Aula actualizada' });
    }
  );
});

// Eliminar aula
app.delete('/api/aulas/:id', (req, res) => {
  const { id } = req.params;

  db.query('DELETE FROM aula WHERE id_aula = ?', [id], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ mensaje: 'Aula eliminada' });
  });
});

// Actualizar usuario por ID
app.put('/api/usuarios/:id', (req, res) => {
  const { id } = req.params; // ID original (el que ya está en la base de datos)
  const { id_usuario, rol, correo, nombre, telefono, contrasena } = req.body;

  // Validación básica
  if (!id_usuario || !rol || !correo || !nombre || !telefono || !contrasena) {
    return res.status(400).json({ error: 'Todos los campos son obligatorios' });
  }

  const sql = `
    UPDATE usuarios
    SET id_usuario = ?, rol = ?, correo = ?, nombre = ?, telefono = ?, contrasena = ?
    WHERE id_usuario = ?
  `;

  db.query(
    sql,
    [id_usuario, rol, correo, nombre, telefono, contrasena, id],
    (err, result) => {
      if (err) {
        console.error('Error al actualizar el usuario:', err);
        return res.status(500).json({ error: 'Error al actualizar el usuario' });
      }

      res.json({ message: 'Usuario actualizado correctamente' });
    }
  );
});
// Obtener todas las reservas (con nombres de usuario y aula)
app.get('/api/reservas', (req, res) => {
  const sql = `
    SELECT 
      r.id_reserva,
      r.id_aula,
      a.Tipo AS nombre_aula,
      r.fecha,
      r.hora_inicio,
      r.hora_fin,
      r.id_usuario,
      u.nombre AS nombre_usuario
    FROM reservas r
    JOIN aula a ON r.id_aula = a.id_aula
    JOIN usuarios u ON r.id_usuario = u.id_usuario
    ORDER BY r.fecha DESC, r.hora_inicio ASC
  `;

  db.query(sql, (err, results) => {
    if (err) {
      console.error('Error al obtener reservas:', err);
      return res.status(500).json({ error: 'Error al obtener reservas' });
    }
    res.json(results);
  });
});
// Crear reserva
app.post('/api/reservas', (req, res) => {
  const { id_aula, id_usuario, fecha, hora_inicio, hora_fin } = req.body;

  console.log('Creando reserva con datos:', { id_aula, id_usuario, fecha, hora_inicio, hora_fin });

  // Validación básica
  if (!id_aula || !id_usuario || !fecha || !hora_inicio || !hora_fin) {
    return res.status(400).json({ error: 'Todos los campos son obligatorios' });
  }

  // Consulta para verificar solapamiento de horarios
  const sqlSolapamiento = `
    SELECT id_reserva FROM reservas 
    WHERE id_aula = ? AND fecha = ? 
    AND NOT (hora_fin <= ? OR hora_inicio >= ?)
  `;

  db.query(sqlSolapamiento, [id_aula, fecha, hora_inicio, hora_fin], (err, solapadas) => {
    if (err) {
      console.error('Error al verificar solapamiento:', err);
      return res.status(500).json({ error: 'Error al verificar solapamiento' });
    }

    if (solapadas.length > 0) {
      return res.status(409).json({ error: 'El aula ya está reservada en ese horario' });
    }

    // Insertar nueva reserva
    const sqlInsert = `
      INSERT INTO reservas (id_aula, id_usuario, fecha, hora_inicio, hora_fin) 
      VALUES (?, ?, ?, ?, ?)
    `;

    db.query(sqlInsert, [id_aula, id_usuario, fecha, hora_inicio, hora_fin], (err, result) => {
      if (err) {
        console.error('Error al crear reserva:', err);
        return res.status(500).json({ error: 'Error al crear reserva' });
      }

      // Devolver la reserva creada con información completa
      const sqlSelect = `
        SELECT 
          r.id_reserva,
          r.id_aula,
          a.Tipo AS nombre_aula,
          r.fecha,
          r.hora_inicio,
          r.hora_fin,
          r.id_usuario,
          u.nombre AS nombre_usuario
        FROM reservas r
        JOIN aula a ON r.id_aula = a.id_aula
        JOIN usuarios u ON r.id_usuario = u.id_usuario
        WHERE r.id_reserva = ?
      `;

      db.query(sqlSelect, [result.insertId], (err, reservaCompleta) => {
        if (err) {
          console.error('Error al obtener reserva creada:', err);
          return res.status(201).json({
            message: 'Reserva creada exitosamente',
            id_reserva: result.insertId
          });
        }

        res.status(201).json({
          message: 'Reserva creada exitosamente',
          ...reservaCompleta[0]
        });
      });
    });
  });
});

// Actualizar una reserva existente
app.put('/api/reservas/:id', (req, res) => {
  const { id } = req.params;
  const { id_aula, fecha, hora_inicio, hora_fin, id_usuario } = req.body;

  if (!id_aula || !fecha || !hora_inicio || !hora_fin || !id_usuario) {
    return res.status(400).json({ error: 'Todos los campos son obligatorios' });
  }

  const sql = `
    UPDATE reservas 
    SET id_aula = ?, fecha = ?, hora_inicio = ?, hora_fin = ?, id_usuario = ?
    WHERE id_reserva = ?
  `;

  db.query(sql, [id_aula, fecha, hora_inicio, hora_fin, id_usuario, id], (err) => {
    if (err) {
      console.error('Error al actualizar la reserva:', err);
      return res.status(500).json({ error: 'Error al actualizar la reserva' });
    }

    res.json({ message: 'Reserva actualizada correctamente' });
  });
});

// Eliminar una reserva
// Eliminar reserva por ID
app.delete('/api/reservas/:id', (req, res) => {
  const id = req.params.id;

  db.query('DELETE FROM reservas WHERE id_reserva = ?', [id], (err, result) => {
    if (err) {
      console.error('Error al cancelar reserva:', err);
      return res.status(500).json({ error: 'Error del servidor al cancelar reserva' });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Reserva no encontrada' });
    }

    res.json({ message: 'Reserva cancelada correctamente' });
  });
});

// Eliminar reserva por ID
app.delete('/api/reservas/:id_reserva', (req, res) => {
  const { id_reserva } = req.params;

  db.query('DELETE FROM reservas WHERE id_reserva = ?', [id_reserva], (err, result) => {
    if (err) {
      console.error('Error al cancelar reserva:', err);
      return res.status(500).json({ error: 'Error al cancelar reserva' });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Reserva no encontrada' });
    }

    res.json({ message: 'Reserva cancelada correctamente' });
  });
});
