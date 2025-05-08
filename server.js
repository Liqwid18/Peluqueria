
const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

const db = new sqlite3.Database('./db.sqlite');

db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS reservas (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre TEXT,
    telefono TEXT,
    fecha TEXT,
    hora TEXT
  )`);
});

app.get('/api/reservas', (req, res) => {
  db.all(`SELECT * FROM reservas`, (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

app.post('/api/reservas', (req, res) => {
  const { nombre, telefono, fecha, hora } = req.body;
  db.get(`SELECT * FROM reservas WHERE fecha = ? AND hora = ?`, [fecha, hora], (err, row) => {
    if (row) {
      return res.status(409).json({ error: 'Hora ya reservada' });
    }
    db.run(`INSERT INTO reservas (nombre, telefono, fecha, hora) VALUES (?, ?, ?, ?)`,
      [nombre, telefono, fecha, hora], function (err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ success: true, id: this.lastID });
      });
  });
});

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
