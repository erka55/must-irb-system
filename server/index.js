const express = require('express');
const cors = require('cors');
const db = require('./db');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Routes холболтууд
app.use('/api/auth', require('./routes/auth'));
app.use('/api/applications', require('./routes/applications'));

// Баазын холболт ба серверийн ажиллагаа шалгах
app.get('/api/health', async (req, res) => {
  try {
    const result = await db.query('SELECT NOW()');
    res.json({
      status: 'OK',
      message: 'MUST IRB Backend Сервер амжилттай ажиллаж байна.',
      dbTime: result.rows[0].now,
    });
  } catch (err) {
    console.error('Баазын холболтын алдаа:', err);
    res.status(500).json({ error: 'PostgreSQL баазартай холбогдож чадсангүй.' });
  }
});

app.listen(PORT, () => {
  console.log(`Backend сервер http://localhost:${PORT} порт дээр ажиллаж байна.`);
});
