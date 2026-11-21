// Server ishga tushganda GitHub'dagi ma'lumotlar va rasmlarni lokal diskka tiklaydi.
// Shunda bepul hostingda server qayta ishga tushsa ham hech narsa yo'qolmaydi.
const fs = require('fs');
const path = require('path');
const github = require('./github');

const ROOT = path.join(__dirname, '..');
const DATA_FILES = ['data/content.json', 'data/news.json'];
const UPLOAD_REPO_DIR = 'uploads';

function writeLocal(relPath, buffer) {
  const full = path.join(ROOT, relPath);
  fs.mkdirSync(path.dirname(full), { recursive: true });
  fs.writeFileSync(full, buffer);
}

async function syncFromGithub() {
  if (!github.enabled()) {
    console.log("ℹ️  GitHub saqlash sozlanmagan - ma'lumotlar faqat lokal diskda saqlanadi");
    return;
  }

  // 1) JSON ma'lumotlar: GitHub haqiqat manbai. Yo'q bo'lsa lokaldagisini GitHub'ga yuklaymiz.
  for (const rel of DATA_FILES) {
    const remote = await github.download(rel);
    if (remote) {
      writeLocal(rel, remote);
      console.log(`⬇️  ${rel} GitHub'dan tiklandi`);
    } else {
      const local = path.join(ROOT, rel);
      if (fs.existsSync(local)) {
        await github.putFile(rel, fs.readFileSync(local), `init: ${rel} birinchi marta yuklandi`);
        console.log(`⬆️  ${rel} GitHub'ga yuklandi`);
      }
    }
  }

  // 2) Rasmlar: GitHub'dagi uploads/ papkasidan yo'qlarini yuklab olamiz
  const files = await github.listDir(UPLOAD_REPO_DIR);
  const uploadsDir = path.join(ROOT, 'uploads');
  fs.mkdirSync(uploadsDir, { recursive: true });
  let restored = 0;
  for (const f of files) {
    if (f.type !== 'file') continue;
    const local = path.join(uploadsDir, f.name);
    if (fs.existsSync(local)) continue;
    const buf = await github.downloadByUrl(f.download_url);
    fs.writeFileSync(local, buf);
    restored++;
  }
  console.log(`🖼️  GitHub'dan ${restored} ta rasm tiklandi`);
}

module.exports = { syncFromGithub };
