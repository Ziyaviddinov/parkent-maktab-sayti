const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const { readAll, writeAll, generateId } = require('../utils/db');
const upload = require('../middleware/upload');
const authMiddleware = require('../middleware/auth');

// GET /api/news - barcha yangiliklarni olish (eng yangisi birinchi)
router.get('/', (req, res) => {
  const news = readAll().sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  res.json({ news });
});

// GET /api/news/:id - bitta yangilikni olish
router.get('/:id', (req, res) => {
  const news = readAll();
  const item = news.find((n) => n.id === req.params.id);
  if (!item) return res.status(404).json({ error: 'Yangilik topilmadi' });
  res.json({ news: item });
});

// POST /api/news - yangi yangilik qo'shish (rasm bilan birga) - faqat login qilgan admin
router.post('/', authMiddleware, upload.single('image'), (req, res) => {
  const { title, text } = req.body;

  if (!title || !text) {
    if (req.file) fs.unlinkSync(req.file.path); // rasm yuklangan bo'lsa, xato holatda o'chirib tashlaymiz
    return res.status(400).json({ error: 'Sarlavha va matn kiritilishi shart' });
  }

  const news = readAll();
  const newItem = {
    id: generateId(),
    title,
    text,
    image: req.file ? `/uploads/${req.file.filename}` : null,
    createdAt: new Date().toISOString(),
  };

  news.push(newItem);
  writeAll(news)
    .then(() => res.status(201).json({ success: true, news: newItem }))
    .catch((err) => {
      console.error(err);
      res.status(500).json({ error: "Saqlashda xatolik yuz berdi" });
    });
});

// PUT /api/news/:id - yangilikni tahrirlash - faqat login qilgan admin
router.put('/:id', authMiddleware, upload.single('image'), (req, res) => {
  const news = readAll();
  const index = news.findIndex((n) => n.id === req.params.id);

  if (index === -1) {
    if (req.file) fs.unlinkSync(req.file.path);
    return res.status(404).json({ error: 'Yangilik topilmadi' });
  }

  const { title, text } = req.body;
  const old = news[index];

  if (req.file && old.image) {
    const oldPath = path.join(__dirname, '..', old.image);
    if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
  }

  news[index] = {
    ...old,
    title: title ?? old.title,
    text: text ?? old.text,
    image: req.file ? `/uploads/${req.file.filename}` : old.image,
    updatedAt: new Date().toISOString(),
  };

  writeAll(news)
    .then(() => res.json({ success: true, news: news[index] }))
    .catch((err) => {
      console.error(err);
      res.status(500).json({ error: "Yangilashda xatolik yuz berdi" });
    });
});

// DELETE /api/news/:id - yangilikni o'chirish - faqat login qilgan admin
router.delete('/:id', authMiddleware, (req, res) => {
  const news = readAll();
  const index = news.findIndex((n) => n.id === req.params.id);

  if (index === -1) return res.status(404).json({ error: 'Yangilik topilmadi' });

  const item = news[index];
  const allImages = item.gallery && item.gallery.length ? item.gallery : (item.image ? [item.image] : []);
  for (const img of allImages) {
    const imgPath = path.join(__dirname, '..', img);
    if (fs.existsSync(imgPath)) fs.unlinkSync(imgPath);
  }

  news.splice(index, 1);
  writeAll(news)
    .then(() => res.json({ success: true }))
    .catch((err) => {
      console.error(err);
      res.status(500).json({ error: "O'chirishda xatolik yuz berdi" });
    });
});

module.exports = router;
