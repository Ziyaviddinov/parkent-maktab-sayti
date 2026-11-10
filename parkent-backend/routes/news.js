const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const { readAll, writeAll, generateId } = require('../utils/db');
const upload = require('../middleware/upload');
const authMiddleware = require('../middleware/auth');

const MAX_IMAGES = 10;

// Yangi admin panel "images" maydonidan bir nechta rasm yuboradi.
// Eski versiyalar bilan moslik uchun yakka "image" maydoni ham qabul qilinadi.
const uploadFields = upload.fields([
  { name: 'images', maxCount: MAX_IMAGES },
  { name: 'image', maxCount: 1 },
]);

// multer xatolarini (hajm, tur, soni) tushunarli JSON ko'rinishida qaytaramiz
function handleUpload(req, res, next) {
  uploadFields(req, res, (err) => {
    if (!err) return next();

    let message = 'Rasm yuklashda xatolik yuz berdi';
    if (err.code === 'LIMIT_FILE_SIZE') {
      message = 'Har bir rasm hajmi 5MB dan oshmasligi kerak';
    } else if (err.code === 'LIMIT_UNEXPECTED_FILE' || err.code === 'LIMIT_FILE_COUNT') {
      message = `Bir yangilikka ko'pi bilan ${MAX_IMAGES} ta rasm yuklash mumkin`;
    } else if (err.message) {
      message = err.message;
    }
    return res.status(400).json({ error: message });
  });
}

// Yuklangan fayllarni (agar validatsiya o'tmasa) diskdan o'chirib tashlaymiz
function removeFiles(files) {
  (files || []).forEach((file) => {
    if (file && file.path && fs.existsSync(file.path)) {
      try {
        fs.unlinkSync(file.path);
      } catch (err) {
        console.error("Faylni o'chirishda xatolik:", err.message);
      }
    }
  });
}

// "/uploads/xxx.jpg" ko'rinishidagi yo'lni diskdagi haqiqiy faylga aylantiradi
function removePublicFile(publicPath) {
  if (!publicPath || typeof publicPath !== 'string') return;
  if (!publicPath.startsWith('/uploads/')) return;

  const uploadsDir = path.join(__dirname, '..', 'uploads');
  const filePath = path.join(__dirname, '..', publicPath);

  // Faqat uploads papkasi ichidagi fayllargina o'chiriladi (path traversal himoyasi)
  if (!filePath.startsWith(uploadsDir + path.sep)) return;

  if (fs.existsSync(filePath)) {
    try {
      fs.unlinkSync(filePath);
    } catch (err) {
      console.error("Eski rasmni o'chirishda xatolik:", err.message);
    }
  }
}

function getUploadedFiles(req) {
  const files = [];
  if (req.files) {
    if (Array.isArray(req.files.images)) files.push(...req.files.images);
    if (Array.isArray(req.files.image)) files.push(...req.files.image);
  }
  return files;
}

function toPublicPath(file) {
  return `/uploads/${file.filename}`;
}

// Eski yangiliklarda faqat "image" bo'ladi, yangilarida "gallery" massivi
function galleryOf(item) {
  if (item && Array.isArray(item.gallery) && item.gallery.length) return item.gallery.slice();
  if (item && item.image) return [item.image];
  return [];
}

// PUT so'rovida qaysi eski rasmlar qoldirilishini "keepImages" maydoni bildiradi
function parseKeepImages(raw) {
  if (raw === undefined || raw === null) return null; // maydon yuborilmagan - hammasini qoldiramiz
  if (Array.isArray(raw)) return raw.map(String);
  if (typeof raw === 'string') {
    const value = raw.trim();
    if (!value) return [];
    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed) ? parsed.map(String) : null;
    } catch (err) {
      return null;
    }
  }
  return null;
}

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

// POST /api/news - yangi yangilik qo'shish (bir nechta rasm bilan) - faqat login qilgan admin
router.post('/', authMiddleware, handleUpload, (req, res) => {
  const { title, text } = req.body;
  const files = getUploadedFiles(req);

  if (!title || !text) {
    removeFiles(files); // rasmlar yuklangan bo'lsa, xato holatda o'chirib tashlaymiz
    return res.status(400).json({ error: 'Sarlavha va matn kiritilishi shart' });
  }

  const gallery = files.map(toPublicPath);
  const news = readAll();
  const newItem = {
    id: generateId(),
    title,
    text,
    image: gallery[0] || null, // eski sahifalar bilan moslik uchun birinchi rasm
    gallery, // barcha rasmlar
    createdAt: new Date().toISOString(),
  };

  news.push(newItem);
  writeAll(news)
    .then(() => res.status(201).json({ success: true, news: newItem }))
    .catch((err) => {
      console.error(err);
      res.status(500).json({ error: 'Saqlashda xatolik yuz berdi' });
    });
});

// PUT /api/news/:id - yangilikni tahrirlash - faqat login qilgan admin
router.put('/:id', authMiddleware, handleUpload, (req, res) => {
  const news = readAll();
  const index = news.findIndex((n) => n.id === req.params.id);

  if (index === -1) {
    removeFiles(getUploadedFiles(req));
    return res.status(404).json({ error: 'Yangilik topilmadi' });
  }

  const { title, text, keepImages } = req.body;
  const old = news[index];
  const oldGallery = galleryOf(old);
  const keep = parseKeepImages(keepImages);

  // Qaysi eski rasmlar qoladi, qaysilari o'chiriladi
  const remained = keep ? oldGallery.filter((img) => keep.includes(img)) : oldGallery;
  oldGallery.filter((img) => !remained.includes(img)).forEach(removePublicFile);

  const addedFiles = getUploadedFiles(req);
  const room = Math.max(0, MAX_IMAGES - remained.length);
  const accepted = addedFiles.slice(0, room);
  removeFiles(addedFiles.slice(room)); // limitdan oshgan fayllarni darhol o'chiramiz

  const gallery = remained.concat(accepted.map(toPublicPath));

  news[index] = {
    ...old,
    title: title ?? old.title,
    text: text ?? old.text,
    image: gallery[0] || null,
    gallery,
    updatedAt: new Date().toISOString(),
  };

  writeAll(news)
    .then(() => res.json({ success: true, news: news[index] }))
    .catch((err) => {
      console.error(err);
      res.status(500).json({ error: 'Yangilashda xatolik yuz berdi' });
    });
});

// DELETE /api/news/:id - yangilikni o'chirish - faqat login qilgan admin
router.delete('/:id', authMiddleware, (req, res) => {
  const news = readAll();
  const index = news.findIndex((n) => n.id === req.params.id);

  if (index === -1) return res.status(404).json({ error: 'Yangilik topilmadi' });

  galleryOf(news[index]).forEach(removePublicFile);

  news.splice(index, 1);
  writeAll(news)
    .then(() => res.json({ success: true }))
    .catch((err) => {
      console.error(err);
      res.status(500).json({ error: "O'chirishda xatolik yuz berdi" });
    });
});

module.exports = router;
