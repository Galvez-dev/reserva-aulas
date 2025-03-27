require('dotenv').config();
const mysql = require('mysql2');

const connection = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT
});

// Conectar a la base de datos
connection.connect(error => {
    if (error) {
        console.error('Error al conectar a la base de datos:', error);
        return;
    }
    console.log('Conectado a la base de datos MySQL ');
});

module.exports = connection;
