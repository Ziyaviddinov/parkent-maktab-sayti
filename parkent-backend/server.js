require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Statik fayllarni ulash (yuklangan rasmlar uchun)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Health check - server ishlayotganini tekshirish uchun
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Parkent maktab backend ishlamoqda' });
});

// Routelar (keyingi bosqichlarda to'ldiriladi)
app.use('/api/contact', require('./routes/contact'));
app.use('/api/news', require('./routes/news'));
app.use('/api/content', require('./routes/content'));
app.use('/api/auth', require('./routes/auth'));

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Sahifa topilmadi' });
});

// Xatoliklarni ushlash
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Server xatoligi yuz berdi' });
});

app.listen(PORT, () => {
  console.log(`✅ Server http://localhost:${PORT} da ishlamoqda`);
});
