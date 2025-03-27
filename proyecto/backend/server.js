require('dotenv').config();
const express = require('express');
const cors = require('cors');
const db = require('./db'); // Importamos la conexión a MySQL

const app = express();

app.use(cors());
app.use(express.json());

// Ruta de prueba para comprobar que el servidor funciona
app.get('/', (req, res) => {
    res.send('¡Servidor funcionando correctamente! 🚀');
});

// Ruta de prueba con la base de datos
app.get('/test-db', (req, res) => {
    db.query('SELECT 1 + 1 AS resultado', (err, result) => {
        if (err) {
            res.status(500).send('Error en la base de datos');
            return;
        }
        res.send('Conexión a la base de datos funcionando 🚀');
    });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});

app.post('/login', (req, res) => {
    const { email, password } = req.body;

    // Consulta en MySQL para verificar usuario
    const sql = 'SELECT * FROM usuarios WHERE email = ? AND password = ?';
    db.query(sql, [email, password], (err, result) => {
        if (err) {
            return res.status(500).json({ error: 'Error en la base de datos' });
        }

        if (result.length > 0) {
            res.json({ success: true, message: 'Login exitoso' });
        } else {
            res.status(401).json({ success: false, message: 'Credenciales incorrectas' });
        }
    });
});


