const express = require('express');
const fs = require('fs');
const path = require('path');
const router = express.Router();

const authMiddleware = require('../middleware/auth');
const upload = require('../middleware/upload');
const { readContent, writeContent, makeId, DEFAULT_CONTENT } = require('../utils/content');

// Qaysi bo'limlar tahrirlanadi va ularning maydonlari
const COLLECTIONS = {
  teachers: ['name', 'subject', 'group', 'category', 'specialty', 'education', 'phone', 'order'],
  leadership: ['name', 'role', 'bio', 'phone', 'order'],
};

function removeUploadedFile(file) {
  if (!file || !file.path) return;
  if (fs.existsSync(file.path)) {
    try {
      fs.unlinkSync(file.path);
    } catch (err) {
      console.error("Faylni o'chirishda xatolik:", err.message);
    }
  }
}

function removePublicFile(publicPath) {
  if (!publicPath || typeof publicPath !== 'string') return;
  if (!publicPath.startsWith('/uploads/')) return;

  const uploadsDir = path.join(__dirname, '..', 'uploads');
  const filePath = path.join(__dirname, '..', publicPath);
  if (!filePath.startsWith(uploadsDir + path.sep)) return;

  if (fs.existsSync(filePath)) {
    try {
      fs.unlinkSync(filePath);
    } catch (err) {
      console.error("Eski rasmni o'chirishda xatolik:", err.message);
    }
  }
}

function pickFields(body, fields) {
  const result = {};
  fields.forEach((key) => {
    if (body[key] !== undefined && body[key] !== null) result[key] = String(body[key]).trim();
  });
  return result;
}

// Rasm yo'li: yo yuklangan fayl (/uploads/...), yo sayt ichidagi statik yo'l
function safePhotoPath(value) {
  if (!value || typeof value !== 'string') return null;
  const path = value.trim();
  if (!path) return null;
  if (path.includes('..') || path.includes(':') || path.includes('\\')) return null;
  if (path.startsWith('/uploads/')) return path;
  if (/^[A-Za-z0-9_\-./]+\.(jpe?g|png|webp|gif|svg)$/i.test(path)) return path;
  return null;
}

// GET /api/content - saytning barcha tahrirlanadigan kontenti (ochiq)
router.get('/', (req, res) => {
  res.json(readContent());
});

// PUT /api/content/settings - sayt sozlamalari (faqat admin)
router.put('/settings', authMiddleware, (req, res) => {
  const content = readContent();
  const allowed = Object.keys(DEFAULT_CONTENT.settings);
  const patch = pickFields(req.body, allowed);

  content.settings = { ...content.settings, ...patch };
  writeContent(content)
    .then(() => res.json({ success: true, settings: content.settings }))
    .catch((err) => {
      console.error(err);
      res.status(500).json({ error: "Sozlamalarni saqlashda xatolik" });
    });
});

// POST /api/content/:collection - yangi element qo'shish (faqat admin)
router.post('/:collection', authMiddleware, upload.single('photo'), (req, res) => {
  const collection = req.params.collection;
  const fields = COLLECTIONS[collection];

  if (!fields) {
    removeUploadedFile(req.file);
    return res.status(404).json({ error: "Bunday bo'lim topilmadi" });
  }

  if (!req.body.name || !req.body.name.trim()) {
    removeUploadedFile(req.file);
    return res.status(400).json({ error: 'Ism kiritilishi shart' });
  }

  const content = readContent();
  const item = {
    id: makeId(collection === 'teachers' ? 't' : 'l'),
    ...pickFields(req.body, fields),
    photo: req.file ? `/uploads/${req.file.filename}` : safePhotoPath(req.body.photo),
    createdAt: new Date().toISOString(),
  };

  content[collection].push(item);

  writeContent(content)
    .then(() => res.status(201).json({ success: true, item }))
    .catch((err) => {
      console.error(err);
      res.status(500).json({ error: "Saqlashda xatolik yuz berdi" });
    });
});

// PUT /api/content/:collection/:id - elementni tahrirlash (faqat admin)
router.put('/:collection/:id', authMiddleware, upload.single('photo'), (req, res) => {
  const collection = req.params.collection;
  const fields = COLLECTIONS[collection];

  if (!fields) {
    removeUploadedFile(req.file);
    return res.status(404).json({ error: "Bunday bo'lim topilmadi" });
  }

  const content = readContent();
  const index = content[collection].findIndex((item) => item.id === req.params.id);

  if (index === -1) {
    removeUploadedFile(req.file);
    return res.status(404).json({ error: "Element topilmadi" });
  }

  const old = content[collection][index];
  const patch = pickFields(req.body, fields);
  let photo = old.photo;

  if (req.file) {
    removePublicFile(old.photo);
    photo = `/uploads/${req.file.filename}`;
  } else if (req.body.removePhoto === '1') {
    removePublicFile(old.photo);
    photo = null;
  }

  content[collection][index] = {
    ...old,
    ...patch,
    photo,
    updatedAt: new Date().toISOString(),
  };

  writeContent(content)
    .then(() => res.json({ success: true, item: content[collection][index] }))
    .catch((err) => {
      console.error(err);
      res.status(500).json({ error: "Yangilashda xatolik yuz berdi" });
    });
});

// DELETE /api/content/:collection/:id (faqat admin)
router.delete('/:collection/:id', authMiddleware, (req, res) => {
  const collection = req.params.collection;

  if (!COLLECTIONS[collection]) {
    return res.status(404).json({ error: "Bunday bo'lim topilmadi" });
  }

  const content = readContent();
  const index = content[collection].findIndex((item) => item.id === req.params.id);

  if (index === -1) return res.status(404).json({ error: 'Element topilmadi' });

  removePublicFile(content[collection][index].photo);
  content[collection].splice(index, 1);

  writeContent(content)
    .then(() => res.json({ success: true }))
    .catch((err) => {
      console.error(err);
      res.status(500).json({ error: "O'chirishda xatolik yuz berdi" });
    });
});

module.exports = router;
