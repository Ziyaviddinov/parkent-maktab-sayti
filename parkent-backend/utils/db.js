const fs = require('fs');
const path = require('path');

const DB_PATH = path.join(__dirname, '..', 'data', 'news.json');

// "data" papkasi bo'lmasa (masalan, yangi serverda) avtomatik yaratamiz
const DB_DIR = path.dirname(DB_PATH);
if (!fs.existsSync(DB_DIR)) fs.mkdirSync(DB_DIR, { recursive: true });

// Yozish navbati - bir vaqtda bir nechta yozish bo'lib, fayl buzilib qolmasligi uchun
let writeQueue = Promise.resolve();

function readAll() {
  try {
    const raw = fs.readFileSync(DB_PATH, 'utf-8');
    return JSON.parse(raw || '[]');
  } catch (err) {
    console.error("Ma'lumotlarni o'qishda xatolik:", err);
    return [];
  }
}

function writeAll(data) {
  writeQueue = writeQueue
    .catch(() => {}) // oldingi yozish xato bo'lsa ham navbat davom etsin
    .then(
      () =>
        new Promise((resolve, reject) => {
          fs.writeFile(DB_PATH, JSON.stringify(data, null, 2), 'utf-8', (err) => {
            if (err) reject(err);
            else resolve();
          });
        })
    );
  return writeQueue;
}

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

module.exports = { readAll, writeAll, generateId };
