const multer = require('multer');
const path = require('path');
const fs = require('fs');
const github = require('../utils/github');

const UPLOAD_DIR = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });

// Rasm diskka yoziladi va GitHub'dagi uploads/ papkasiga commit qilinadi.
// Shunda server qayta ishga tushganda ham rasm yo'qolmaydi.
const githubStorage = {
  _handleFile(req, file, cb) {
    const ext = path.extname(file.originalname).toLowerCase();
    const filename = Date.now() + '-' + Math.round(Math.random() * 1e9) + ext;
    const fullPath = path.join(UPLOAD_DIR, filename);
    const chunks = [];

    file.stream.on('data', (chunk) => chunks.push(chunk));
    file.stream.on('error', cb);
    file.stream.on('end', async () => {
      try {
        const buffer = Buffer.concat(chunks);
        await fs.promises.writeFile(fullPath, buffer);
        await github.putFile(`uploads/${filename}`, buffer, `upload: ${filename}`);
        cb(null, { filename, path: fullPath, size: buffer.length });
      } catch (err) {
        fs.promises.unlink(fullPath).catch(() => {});
        cb(err);
      }
    });
  },
  _removeFile(req, file, cb) {
    fs.unlink(file.path, cb);
  },
};

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

const storage = githubStorage;

function fileFilter(req, file, cb) {
  if (ALLOWED_TYPES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Faqat rasm fayllari (jpg, png, webp, gif) qabul qilinadi'), false);
  }
}

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // har bir rasm uchun 5MB maksimal
    files: 12, // bitta so'rovda ko'pi bilan 12 ta fayl (10 ta rasm + zaxira)
  },
});

module.exports = upload;
