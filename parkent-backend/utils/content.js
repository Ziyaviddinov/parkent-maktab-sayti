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
  pages: {},
  schedule: null,
  about: {
    badge: 'Maktab haqida',
    title: 'Bizning maktab - sizning kelajagingiz!',
    text: "Parkent Ixtisoslashtirilgan maktabi 2022-yil sentabr oyida tashkil topgan bo'lib, O'zbekiston Respublikasi Ixtisoslashtirilgan ta'lim muassasalari agentligi tasarrufida faoliyat yuritadi. Hozirgi kunda maktabimizda 460 nafardan ortiq o'quvchi tahsil olmoqda.\n\nO'quv jarayoni aniq va tabiiy fanlarga ixtisoslashtirilgan holda tashkil etilgan bo'lib, bu o'quvchilarning matematika, fizika, kimyo, biologiya kabi fanlar bo'yicha chuqur bilim va amaliy ko'nikmalarga ega bo'lishini ta'minlaydi. Maqsadimiz — mustaqil fikrlay oladigan, ilmiy-tadqiqot faoliyatiga qiziquvchan yoshlarni voyaga yetkazishdir.",
    list: [
      "Aniq va tabiiy fanlarga ixtisoslashgan ta'lim",
      "460 nafardan ortiq o'quvchi",
      'Davlat agentligi tasarrufidagi maktab',
      "Amaliy va tahliliy tafakkurga yo'naltirilgan dastur"
    ],
    image: 'maktab.jpg',
    statsTitle: 'MAKTAB STATISTIKASI',
    stats: [
      { value: '500+', label: "O'quvchilar" },
      { value: '50+', label: "O'qituvchilar" },
      { value: '15+', label: "To'garaklar" },
      { value: '100%', label: "OTM ga kirish ko'rsatkichi" }
    ]
  }
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
      pages: parsed.pages && typeof parsed.pages === 'object' ? parsed.pages : {},
      about: { ...clone(DEFAULT_CONTENT.about), ...(parsed.about || {}) },
      schedule: parsed.schedule && typeof parsed.schedule === 'object' ? parsed.schedule : null
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
