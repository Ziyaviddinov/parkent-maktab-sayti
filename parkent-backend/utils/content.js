const fs = require('fs');
const path = require('path');

const CONTENT_PATH = path.join(__dirname, '..', 'data', 'content.json');

const DIR = path.dirname(CONTENT_PATH);
if (!fs.existsSync(DIR)) fs.mkdirSync(DIR, { recursive: true });

const DEFAULT_CONTENT = {
  settings: {
    schoolName: 'Parkent tuman ixtisoslashtirilgan maktabi',
    phone: '+998 99 612 51 80',
    email: 'pimaparkent@gmail.com',
    address: "Toshkent viloyati, Parkent tumani",
    telegram: 'https://t.me/Parkent_tuman_IM',
    instagram: 'https://www.instagram.com/parkent_pima',
    facebook: 'https://www.facebook.com/groups/1553604381759572/',
    youtube: 'https://www.youtube.com/@PIMAParkent'
  },
  teachers: [],
  leadership: [],
  pages: {}
};

let writeQueue = Promise.resolve();

function clone(obj) {
  return JSON.parse(JSON.stringify(obj));
}

function readContent() {
  try {
    const raw = fs.readFileSync(CONTENT_PATH, 'utf-8');
    const parsed = JSON.parse(raw || '{}') || {};
    return {
      ...clone(DEFAULT_CONTENT),
      ...parsed,
      settings: { ...clone(DEFAULT_CONTENT.settings), ...(parsed.settings || {}) },
      teachers: Array.isArray(parsed.teachers) ? parsed.teachers : [],
      leadership: Array.isArray(parsed.leadership) ? parsed.leadership : [],
      pages: parsed.pages && typeof parsed.pages === 'object' ? parsed.pages : {}
    };
  } catch (err) {
    return clone(DEFAULT_CONTENT);
  }
}

function writeContent(data) {
  writeQueue = writeQueue
    .catch(() => {})
    .then(
      () =>
        new Promise((resolve, reject) => {
          fs.writeFile(CONTENT_PATH, JSON.stringify(data, null, 2), 'utf-8', (err) => {
            if (err) reject(err);
            else resolve();
          });
        })
    );
  return writeQueue;
}

function makeId(prefix) {
  return (prefix || 'id') + '_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
}

module.exports = { readContent, writeContent, makeId, CONTENT_PATH, DEFAULT_CONTENT };
