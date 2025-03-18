const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
const app = express();
const port = 3000;

app.use(bodyParser.json());
app.use(cors()); // Configurar CORS

// Servir archivos estáticos
app.use(express.static(path.join(__dirname)));

// Conectar a la base de datos SQLite
const db = new sqlite3.Database(path.join(__dirname, 'historial.db'), (err) => {
    if (err) {
        console.error(err.message);
    }
    console.log('Conectado a la base de datos SQLite.');

    // Crear la tabla `historial` si no existe
    db.run(`CREATE TABLE IF NOT EXISTS historial (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        ciudad TEXT,
        temperatura REAL,
        humedad INTEGER,
        viento REAL,
        fecha_hora TEXT
    )`, (err) => {
        if (err) {
            console.error('Error al crear la tabla `historial`:', err.message);
        } else {
            console.log('Tabla `historial` creada o ya existente.');
        }
    });
});

// Ruta para guardar el historial
app.post('/guardar-historial', (req, res) => {
    const { ciudad, temperatura, humedad, viento, fecha_hora } = req.body;
    const sql = `INSERT INTO historial (ciudad, temperatura, humedad, viento, fecha_hora)
                 VALUES (?, ?, ?, ?, ?)`;
    db.run(sql, [ciudad, temperatura, humedad, viento, fecha_hora], function(err) {
        if (err) {
            return console.error(err.message);
        }
        res.send('Historial guardado');
    });
});

// Ruta para obtener el historial
app.get('/obtener-historial', (req, res) => {
    const sql = `SELECT * FROM historial ORDER BY fecha_hora DESC`;
    db.all(sql, [], (err, rows) => {
        if (err) {
            throw err;
        }
        res.json(rows);
    });
});

// Iniciar el servidor
app.listen(port, () => {
    console.log(`Servidor escuchando en http://localhost:${port}`);
});
    