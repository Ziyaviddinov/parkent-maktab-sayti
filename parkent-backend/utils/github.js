// GitHub'ni doimiy saqlash joyi sifatida ishlatish.
// Ma'lumotlar (data/*.json) va yuklangan rasmlar (uploads/*) GitHub repozitoriyasiga commit qilinadi.
// Kerakli env o'zgaruvchilari:
//   GITHUB_TOKEN  - repo uchun "Contents: Read and write" huquqiga ega fine-grained token
//   GITHUB_REPO   - "egasi/repo-nomi" ko'rinishida (masalan: "ali/parkent-data")
//   GITHUB_BRANCH - ixtiyoriy, standart "main"

const API = 'https://api.github.com';

function config() {
  const token = process.env.GITHUB_TOKEN;
  const repo = process.env.GITHUB_REPO;
  if (!token || !repo) return null;
  return { token, repo, branch: process.env.GITHUB_BRANCH || 'main' };
}

function enabled() {
  return config() !== null;
}

function authHeaders(cfg) {
  return {
    Authorization: `Bearer ${cfg.token}`,
    Accept: 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
    'User-Agent': 'parkent-backend',
  };
}

function contentsUrl(cfg, repoPath) {
  const encoded = repoPath.split('/').map(encodeURIComponent).join('/');
  return `${API}/repos/${cfg.repo}/contents/${encoded}`;
}

// Fayl haqida ma'lumot (sha, download_url). Fayl yo'q bo'lsa null qaytaradi.
async function getMeta(cfg, repoPath) {
  const res = await fetch(`${contentsUrl(cfg, repoPath)}?ref=${encodeURIComponent(cfg.branch)}`, {
    headers: authHeaders(cfg),
  });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`GitHub GET ${repoPath}: ${res.status}`);
  return res.json();
}

// Ochiq yoki yopiq repodagi faylning haqiqiy baytlarini olish
async function fetchRaw(cfg, downloadUrl) {
  const res = await fetch(downloadUrl, { headers: { Authorization: `Bearer ${cfg.token}` } });
  if (!res.ok) throw new Error(`GitHub yuklab olish xatosi: ${res.status}`);
  return Buffer.from(await res.arrayBuffer());
}

// Bir vaqtda bir nechta commit SHA to'qnashuvini oldini olish uchun navbat
let queue = Promise.resolve();
function enqueue(task) {
  const next = queue.catch(() => {}).then(task);
  queue = next;
  return next;
}

// Faylni yozish yoki yangilash (commit bilan). GitHub sozlanmagan bo'lsa jim o'tadi.
function putFile(repoPath, buffer, message) {
  const cfg = config();
  if (!cfg) return Promise.resolve(false);

  return enqueue(async () => {
    let lastError = null;
    for (let attempt = 1; attempt <= 3; attempt++) {
      const meta = await getMeta(cfg, repoPath);
      const body = {
        message,
        content: Buffer.from(buffer).toString('base64'),
        branch: cfg.branch,
      };
      if (meta) body.sha = meta.sha;

      const res = await fetch(contentsUrl(cfg, repoPath), {
        method: 'PUT',
        headers: { ...authHeaders(cfg), 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (res.ok) return true;

      const text = await res.text();
      lastError = new Error(`GitHub PUT ${repoPath}: ${res.status} ${text.slice(0, 200)}`);
      // 409/422 - sha mos kelmadi (kimdir boshqa commit qilgan). Qayta urinamiz.
      if (res.status !== 409 && res.status !== 422) break;
    }
    throw lastError;
  });
}

function deleteFile(repoPath, message) {
  const cfg = config();
  if (!cfg) return Promise.resolve(false);

  return enqueue(async () => {
    const meta = await getMeta(cfg, repoPath);
    if (!meta) return false;
    const res = await fetch(contentsUrl(cfg, repoPath), {
      method: 'DELETE',
      headers: { ...authHeaders(cfg), 'Content-Type': 'application/json' },
      body: JSON.stringify({ message, sha: meta.sha, branch: cfg.branch }),
    });
    if (!res.ok) throw new Error(`GitHub DELETE ${repoPath}: ${res.status}`);
    return true;
  });
}

// Papkadagi fayllar ro'yxati. Papka yo'q bo'lsa bo'sh massiv.
async function listDir(repoPath) {
  const cfg = config();
  if (!cfg) return [];
  const res = await fetch(`${contentsUrl(cfg, repoPath)}?ref=${encodeURIComponent(cfg.branch)}`, {
    headers: authHeaders(cfg),
  });
  if (res.status === 404) return [];
  if (!res.ok) throw new Error(`GitHub papka ${repoPath}: ${res.status}`);
  return res.json();
}

async function download(repoPath) {
  const cfg = config();
  if (!cfg) return null;
  const meta = await getMeta(cfg, repoPath);
  if (!meta) return null;
  return fetchRaw(cfg, meta.download_url);
}

async function downloadByUrl(downloadUrl) {
  const cfg = config();
  if (!cfg) return null;
  return fetchRaw(cfg, downloadUrl);
}

module.exports = { enabled, putFile, deleteFile, listDir, download, downloadByUrl };
