require('dotenv').config();
const path = require('path');
const fs = require('fs');
const {
  getUpdates,
  sendMessage,
  editMessageText,
  answerCallbackQuery,
  getFileUrl,
  downloadFile,
} = require('./utils/telegram');
const { readAll, writeAll, generateId } = require('./utils/db');

const TOKEN = process.env.NEWS_BOT_TOKEN;
const ADMIN_IDS = (process.env.ADMIN_TELEGRAM_IDS || '')
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean);

const UPLOAD_DIR = path.join(__dirname, 'uploads');
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });

// ============ QO'SHIMCHA ADMINLAR (bot ichidan qo'shiladi) ============
const ADMINS_DB_PATH = path.join(__dirname, 'data', 'admins.json');

function readExtraAdmins() {
  try {
    const raw = fs.readFileSync(ADMINS_DB_PATH, 'utf-8');
    return JSON.parse(raw || '[]');
  } catch (err) {
    return [];
  }
}

function writeExtraAdmins(list) {
  const dir = path.dirname(ADMINS_DB_PATH);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(ADMINS_DB_PATH, JSON.stringify(list, null, 2), 'utf-8');
}

if (!TOKEN) {
  console.error('❌ NEWS_BOT_TOKEN topilmadi (.env faylini tekshiring)');
  process.exit(1);
}

if (ADMIN_IDS.length === 0) {
  console.warn("⚠️  DIQQAT: ADMIN_TELEGRAM_IDS bo'sh! Hozircha HECH KIM botdan foydalana olmaydi.");
}

let offset = 0;

// Har bir foydalanuvchi uchun vaqtinchalik holat (yangilik qo'shish jarayoni bosqichlari)
// step: 'main_photo' -> 'gallery_photos' -> 'title' -> 'text'
const userState = new Map();

const MAX_GALLERY = 10; // asosiy rasmdan tashqari qo'shimcha rasmlar soni chegarasi

const UZ_MONTHS = ['Yan', 'Fev', 'Mar', 'Apr', 'May', 'Iyun', 'Iyul', 'Avg', 'Sen', 'Okt', 'Noy', 'Dek'];

function formatDate(iso) {
  const d = new Date(iso);
  return `${d.getDate()} ${UZ_MONTHS[d.getMonth()]} ${d.getFullYear()}`;
}

function escapeHtml(str) {
  return String(str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

// Egasi (.env dagi ADMIN_TELEGRAM_IDS) — hech qachon o'chirilmaydi, adminlarni boshqara oladi
function isOwner(userId) {
  return ADMIN_IDS.includes(String(userId));
}

// Bot ichidan qo'shilgan adminlar + egalar — barchasi botdan foydalana oladi
function isAuthorized(userId) {
  if (isOwner(userId)) return true;
  const extra = readExtraAdmins();
  return extra.some((a) => a.id === String(userId));
}

// ============ TUGMALAR (INLINE KEYBOARD) ============

function mainMenuKeyboard(userId) {
  const rows = [
    [{ text: "➕ Yangilik qo'shish", callback_data: 'add_news' }],
    [{ text: '📋 Oxirgi yangiliklar', callback_data: 'list_news' }],
    [{ text: "🗑 Yangilikni o'chirish", callback_data: 'delete_menu' }],
  ];
  if (isOwner(userId)) {
    rows.push([{ text: '👤 Adminlar', callback_data: 'admin_menu' }]);
  }
  rows.push([{ text: 'ℹ️ Yordam', callback_data: 'help' }]);
  return { inline_keyboard: rows };
}

function backToMenuKeyboard() {
  return { inline_keyboard: [[{ text: '⬅️ Bosh menyu', callback_data: 'menu' }]] };
}

function cancelKeyboard() {
  return { inline_keyboard: [[{ text: '❌ Bekor qilish', callback_data: 'cancel_add' }]] };
}

function galleryStepKeyboard(count) {
  const rows = [];
  if (count > 0) {
    rows.push([{ text: `✅ Tayyor, davom etish (${count}/${MAX_GALLERY})`, callback_data: 'gallery_done' }]);
  } else {
    rows.push([{ text: "⏭ Qo'shimcha rasmsiz davom etish", callback_data: 'gallery_done' }]);
  }
  rows.push([{ text: '❌ Bekor qilish', callback_data: 'cancel_add' }]);
  return { inline_keyboard: rows };
}

function deleteListKeyboard(items) {
  const rows = items.map((item) => [
    { text: `🗑 ${item.title.slice(0, 35)}`, callback_data: `del_${item.id}` },
  ]);
  rows.push([{ text: '⬅️ Bosh menyu', callback_data: 'menu' }]);
  return { inline_keyboard: rows };
}

function confirmDeleteKeyboard(id) {
  return {
    inline_keyboard: [
      [
        { text: '✅ Ha, o\'chirish', callback_data: `delyes_${id}` },
        { text: '❌ Bekor qilish', callback_data: 'delete_menu' },
      ],
    ],
  };
}

// ============ MA'LUMOTLAR BILAN ISHLASH ============

async function saveNewsItem({ title, text, imagePaths }) {
  const news = readAll();
  const urls = imagePaths.map((p) => `/uploads/${path.basename(p)}`);
  const newItem = {
    id: generateId(),
    title,
    text,
    image: urls[0] || null, // asosiy rasm (karta uchun)
    gallery: urls, // asosiy rasm + qo'shimcha rasmlar (fotogalereya uchun)
    createdAt: new Date().toISOString(),
    source: 'telegram-bot',
  };
  news.push(newItem);
  await writeAll(news);
  return newItem;
}

async function deleteNewsItem(id) {
  const news = readAll();
  const index = news.findIndex((n) => n.id === id);
  if (index === -1) return null;
  const [removed] = news.splice(index, 1);
  const allImages = removed.gallery && removed.gallery.length ? removed.gallery : (removed.image ? [removed.image] : []);
  for (const img of allImages) {
    const imgPath = path.join(__dirname, img);
    if (fs.existsSync(imgPath)) fs.unlinkSync(imgPath);
  }
  await writeAll(news);
  return removed;
}

function getRecentNews(limit = 8) {
  return readAll()
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, limit);
}

// Telegramdan kelgan bitta rasmni (eng katta o'lchamini) diskka yuklab olish
async function downloadTelegramPhoto(photoArray) {
  const largestPhoto = photoArray[photoArray.length - 1];
  const fileUrl = await getFileUrl(TOKEN, largestPhoto.file_id);
  const ext = path.extname(new URL(fileUrl).pathname) || '.jpg';
  const filename = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
  const destPath = path.join(UPLOAD_DIR, filename);
  await downloadFile(fileUrl, destPath);
  return destPath;
}

// Agar jarayon bekor qilinsa yoki xato bo'lsa, shu vaqtgacha yuklangan fayllarni tozalab tashlaymiz
function cleanupFiles(paths) {
  for (const p of paths || []) {
    try {
      if (fs.existsSync(p)) fs.unlinkSync(p);
    } catch (e) {
      /* e'tiborsiz qoldiramiz */
    }
  }
}

// ============ XABARLAR ============

const WELCOME_TEXT =
  '👋 <b>Assalomu alaykum!</b>\n\n' +
  "🏫 Bu <b>Parkent maktabi yangiliklar boti</b>.\n" +
  "Quyidagi tugmalardan birini tanlang 👇";

const HELP_TEXT =
  'ℹ️ <b>Bot qanday ishlaydi?</b>\n\n' +
  "➕ <b>Yangilik qo'shish</b> bosqichlari:\n" +
  "  1️⃣ <b>Asosiy rasm</b> yuboring (kartada ko'rinadigan rasm)\n" +
  `  2️⃣ <b>Qo'shimcha rasmlar</b> yuboring, biri ketidan biri (ixtiyoriy, maksimal ${MAX_GALLERY} ta), so'ng \"✅ Tayyor\" tugmasini bosing\n` +
  "  3️⃣ Yangilik <b>sarlavhasini</b> matn qilib yuboring\n" +
  "  4️⃣ Yangilik <b>matnini (izohini)</b> yuboring\n\n" +
  "✅ Shundan so'ng yangilik <b>avtomatik ravishda saytga</b> chiqadi!\n\n" +
  "📋 <b>Oxirgi yangiliklar</b> — so'nggi qo'shilgan 8 ta yangilikni ko'rsatadi\n" +
  "🗑 <b>O'chirish</b> — istalgan yangilikni bot orqali o'chirish mumkin\n\n" +
  "Jarayonning istalgan bosqichida ❌ <b>Bekor qilish</b> tugmasini bosishingiz mumkin.";

async function showMenu(chatId, messageId, userId) {
  if (messageId) {
    await editMessageText(TOKEN, chatId, messageId, WELCOME_TEXT, { reply_markup: mainMenuKeyboard(userId) });
  } else {
    await sendMessage(TOKEN, chatId, WELCOME_TEXT, { reply_markup: mainMenuKeyboard(userId) });
  }
}

// ============ ADMINLARNI BOSHQARISH (faqat egasi uchun) ============

function adminMenuKeyboard() {
  return {
    inline_keyboard: [
      [{ text: "➕ Admin qo'shish", callback_data: 'admin_add' }],
      [{ text: '📋 Adminlar ro\'yxati', callback_data: 'admin_list' }],
      [{ text: "🗑 Adminni o'chirish", callback_data: 'admin_del_menu' }],
      [{ text: '⬅️ Bosh menyu', callback_data: 'menu' }],
    ],
  };
}

function adminDeleteListKeyboard(list) {
  const rows = list.map((a) => [
    { text: `🗑 ${a.id}`, callback_data: `admindel_${a.id}` },
  ]);
  rows.push([{ text: '⬅️ Orqaga', callback_data: 'admin_menu' }]);
  return { inline_keyboard: rows };
}

async function showAdminMenu(chatId, messageId) {
  const text =
    '👤 <b>Adminlarni boshqarish</b>\n\n' +
    'Bu bo\'lim orqali botdan foydalana oladigan yangi adminlarni qo\'shishingiz yoki o\'chirishingiz mumkin.';
  await editMessageText(TOKEN, chatId, messageId, text, { reply_markup: adminMenuKeyboard() });
}

async function showAdminList(chatId, messageId) {
  const owners = ADMIN_IDS.map((id) => `👑 <code>${id}</code> (egasi)`);
  const extra = readExtraAdmins().map((a) => `👤 <code>${a.id}</code>`);
  const lines = [...owners, ...extra];
  const text = `📋 <b>Adminlar ro'yxati:</b>\n\n${lines.join('\n')}`;
  await editMessageText(TOKEN, chatId, messageId, text, {
    reply_markup: { inline_keyboard: [[{ text: '⬅️ Orqaga', callback_data: 'admin_menu' }]] },
  });
}

async function showAdminDeleteMenu(chatId, messageId) {
  const extra = readExtraAdmins();
  if (extra.length === 0) {
    return editMessageText(TOKEN, chatId, messageId, "📭 O'chirish uchun qo'shimcha admin yo'q.", {
      reply_markup: adminMenuKeyboard(),
    });
  }
  await editMessageText(TOKEN, chatId, messageId, "🗑 <b>Qaysi adminni o'chirmoqchisiz?</b>", {
    reply_markup: adminDeleteListKeyboard(extra),
  });
}

async function showNewsList(chatId, messageId) {
  const items = getRecentNews(8);
  if (items.length === 0) {
    return editMessageText(TOKEN, chatId, messageId, '📭 Hozircha yangiliklar yo\'q.', {
      reply_markup: backToMenuKeyboard(),
    });
  }
  const lines = items.map((item, i) => {
    const count = item.gallery ? item.gallery.length : (item.image ? 1 : 0);
    const icon = count > 0 ? '🖼' : '📄';
    const countLabel = count > 1 ? ` (${count} ta rasm)` : '';
    return `${i + 1}. ${icon} <b>${escapeHtml(item.title)}</b>${countLabel}\n   📅 ${formatDate(item.createdAt)}`;
  });
  const text = `📋 <b>Oxirgi ${items.length} ta yangilik:</b>\n\n${lines.join('\n\n')}`;
  await editMessageText(TOKEN, chatId, messageId, text, { reply_markup: backToMenuKeyboard() });
}

async function showDeleteMenu(chatId, messageId) {
  const items = getRecentNews(8);
  if (items.length === 0) {
    return editMessageText(TOKEN, chatId, messageId, "📭 O'chirish uchun yangiliklar yo'q.", {
      reply_markup: backToMenuKeyboard(),
    });
  }
  await editMessageText(
    TOKEN,
    chatId,
    messageId,
    "🗑 <b>Qaysi yangilikni o'chirmoqchisiz?</b>\n\nRo'yxatdan birini tanlang:",
    { reply_markup: deleteListKeyboard(items) }
  );
}

// Yangilik qo'shish jarayonini boshlash / qayta boshlash
async function startAddFlow(chatId, messageId, userId) {
  userState.set(userId, { step: 'main_photo', gallery: [] });
  const text =
    "➕ <b>Yangilik qo'shish — 1/4 bosqich</b>\n\n" +
    '📸 Menga <b>asosiy rasmni</b> yuboring.\n' +
    "Bu rasm yangilik kartasida va sarlavhada ko'rinadi.";
  if (messageId) {
    return editMessageText(TOKEN, chatId, messageId, text, { reply_markup: cancelKeyboard() });
  }
  return sendMessage(TOKEN, chatId, text, { reply_markup: cancelKeyboard() });
}

// ============ CALLBACK (TUGMA BOSISHLAR) ============

async function handleCallbackQuery(cq) {
  const chatId = cq.message.chat.id;
  const messageId = cq.message.message_id;
  const userId = cq.from.id;
  const data = cq.data;

  if (!isAuthorized(userId)) {
    await answerCallbackQuery(TOKEN, cq.id, "⛔ Sizda ruxsat yo'q", true);
    return;
  }

  await answerCallbackQuery(TOKEN, cq.id);

  if (data === 'menu') {
    userState.delete(userId);
    return showMenu(chatId, messageId, userId);
  }

  // ---------- ADMINLARNI BOSHQARISH (faqat egasi) ----------
  if (data === 'admin_menu' || data === 'admin_add' || data === 'admin_list' || data === 'admin_del_menu' || data.startsWith('admindel_')) {
    if (!isOwner(userId)) {
      await answerCallbackQuery(TOKEN, cq.id, "⛔ Bu bo'lim faqat bot egasi uchun", true);
      return;
    }

    if (data === 'admin_menu') {
      userState.delete(userId);
      return showAdminMenu(chatId, messageId);
    }

    if (data === 'admin_add') {
      userState.set(userId, { step: 'awaiting_admin_id' });
      return editMessageText(
        TOKEN,
        chatId,
        messageId,
        "➕ <b>Yangi admin qo'shish</b>\n\n" +
          "Yangi adminning Telegram ID raqamini yuboring.\n\n" +
          "ℹ️ ID'ni bilish uchun: o'sha odam botga /start yuborishi kerak (agar ruxsati bo'lmasa, bot unga ID'sini ko'rsatadi), o'sha ID'ni shu yerga yuboring.",
        { reply_markup: { inline_keyboard: [[{ text: '❌ Bekor qilish', callback_data: 'admin_menu' }]] } }
      );
    }

    if (data === 'admin_list') {
      return showAdminList(chatId, messageId);
    }

    if (data === 'admin_del_menu') {
      return showAdminDeleteMenu(chatId, messageId);
    }

    if (data.startsWith('admindel_')) {
      const id = data.slice('admindel_'.length);
      const list = readExtraAdmins().filter((a) => a.id !== id);
      writeExtraAdmins(list);
      return editMessageText(TOKEN, chatId, messageId, `✅ <code>${id}</code> adminlikdan olib tashlandi.`, {
        reply_markup: adminMenuKeyboard(),
      });
    }
  }

  if (data === 'help') {
    return editMessageText(TOKEN, chatId, messageId, HELP_TEXT, { reply_markup: backToMenuKeyboard() });
  }

  if (data === 'add_news') {
    return startAddFlow(chatId, messageId, userId);
  }

  if (data === 'cancel_add') {
    const state = userState.get(userId);
    if (state) {
      // Shu vaqtgacha yuklab olingan rasmlarni tozalaymiz
      const files = [...(state.mainImage ? [state.mainImage] : []), ...(state.gallery || [])];
      cleanupFiles(files);
    }
    userState.delete(userId);
    return editMessageText(TOKEN, chatId, messageId, "❌ Yangilik qo'shish bekor qilindi.", {
      reply_markup: mainMenuKeyboard(userId),
    });
  }

  if (data === 'gallery_done') {
    const state = userState.get(userId);
    if (!state || state.step !== 'gallery_photos') {
      return editMessageText(TOKEN, chatId, messageId, "⚠️ Jarayon topilmadi, qaytadan boshlang.", {
        reply_markup: mainMenuKeyboard(userId),
      });
    }
    state.step = 'title';
    userState.set(userId, state);
    return editMessageText(
      TOKEN,
      chatId,
      messageId,
      `✅ Rasmlar qabul qilindi (${state.gallery.length} ta qo'shimcha).\n\n` +
        "📝 <b>Yangilik qo'shish — 3/4 bosqich</b>\n\n" +
        "Endi yangilikning <b>sarlavhasini</b> matn qilib yuboring.",
      { reply_markup: cancelKeyboard() }
    );
  }

  if (data === 'list_news') {
    return showNewsList(chatId, messageId);
  }

  if (data === 'delete_menu') {
    return showDeleteMenu(chatId, messageId);
  }

  if (data.startsWith('del_')) {
    const id = data.slice(4);
    const news = readAll();
    const item = news.find((n) => n.id === id);
    if (!item) {
      return editMessageText(TOKEN, chatId, messageId, "⚠️ Yangilik topilmadi (allaqachon o'chirilgan bo'lishi mumkin).", {
        reply_markup: backToMenuKeyboard(),
      });
    }
    return editMessageText(
      TOKEN,
      chatId,
      messageId,
      `⚠️ <b>Rostdan ham o'chirmoqchimisiz?</b>\n\n📰 ${escapeHtml(item.title)}\n📅 ${formatDate(item.createdAt)}\n\nBu amalni orqaga qaytarib bo'lmaydi!`,
      { reply_markup: confirmDeleteKeyboard(id) }
    );
  }

  if (data.startsWith('delyes_')) {
    const id = data.slice(7);
    const removed = await deleteNewsItem(id);
    if (!removed) {
      return editMessageText(TOKEN, chatId, messageId, "⚠️ Yangilik topilmadi.", { reply_markup: backToMenuKeyboard() });
    }
    return editMessageText(
      TOKEN,
      chatId,
      messageId,
      `✅ <b>O'chirildi!</b>\n\n🗑 "${escapeHtml(removed.title)}" yangiligi o'chirib tashlandi.`,
      { reply_markup: backToMenuKeyboard() }
    );
  }
}

// ============ ODDIY XABARLAR (matn/rasm) ============

async function handleMessage(msg) {
  const chatId = msg.chat.id;
  const userId = msg.from.id;

  if (!isAuthorized(userId)) {
    await sendMessage(
      TOKEN,
      chatId,
      `⛔ <b>Kirish taqiqlangan</b>\n\nSizda bu botdan foydalanishga ruxsat yo'q.\n🆔 ID: <code>${userId}</code>\n\nAdministratorga shu ID'ni yuboring.`
    );
    return;
  }

  if (msg.text === '/start' || msg.text === '/menu') {
    const prevState = userState.get(userId);
    if (prevState) {
      const files = [...(prevState.mainImage ? [prevState.mainImage] : []), ...(prevState.gallery || [])];
      cleanupFiles(files);
    }
    userState.delete(userId);
    return showMenu(chatId, null, userId);
  }

  const state = userState.get(userId);

  // ---------- ADMIN ID KUTILMOQDA (egasi yangi admin qo'shmoqchi) ----------
  if (state && state.step === 'awaiting_admin_id') {
    const idText = (msg.text || '').trim();
    if (!/^\d+$/.test(idText)) {
      await sendMessage(TOKEN, chatId, "⚠️ Iltimos, faqat <b>raqamlardan iborat</b> Telegram ID yuboring.", {
        reply_markup: { inline_keyboard: [[{ text: '❌ Bekor qilish', callback_data: 'admin_menu' }]] },
      });
      return;
    }
    userState.delete(userId);
    if (isOwner(idText) || readExtraAdmins().some((a) => a.id === idText)) {
      await sendMessage(TOKEN, chatId, `⚠️ <code>${idText}</code> allaqachon admin.`, {
        reply_markup: adminMenuKeyboard(),
      });
      return;
    }
    const list = readExtraAdmins();
    list.push({ id: idText, addedAt: new Date().toISOString(), addedBy: String(userId) });
    writeExtraAdmins(list);
    await sendMessage(
      TOKEN,
      chatId,
      `✅ <b>Yangi admin qo'shildi!</b>\n\n🆔 <code>${idText}</code>\n\nEndi u botdan foydalana oladi.`,
      { reply_markup: adminMenuKeyboard() }
    );
    return;
  }

  // ---------- 1-BOSQICH: ASOSIY RASM ----------
  if (state && state.step === 'main_photo') {
    if (!msg.photo || msg.photo.length === 0) {
      await sendMessage(TOKEN, chatId, "⚠️ Iltimos, <b>rasm</b> yuboring (matn emas).", {
        reply_markup: cancelKeyboard(),
      });
      return;
    }
    const processingMsg = await sendMessage(TOKEN, chatId, '⏳ Yuklanmoqda...');
    try {
      const filePath = await downloadTelegramPhoto(msg.photo);
      state.mainImage = filePath;
      state.step = 'gallery_photos';
      userState.set(userId, state);
      await editMessageText(
        TOKEN,
        chatId,
        processingMsg.message_id,
        "✅ Asosiy rasm qabul qilindi.\n\n" +
          "🖼 <b>Yangilik qo'shish — 2/4 bosqich</b>\n\n" +
          `Endi <b>qo'shimcha rasmlarni</b> birma-bir yuboring (ixtiyoriy, maksimal ${MAX_GALLERY} ta).\n` +
          "Tugatgach, pastdagi tugmani bosing.",
        { reply_markup: galleryStepKeyboard(0) }
      );
    } catch (err) {
      console.error(err);
      await editMessageText(TOKEN, chatId, processingMsg.message_id, '❌ Rasmni yuklashda xatolik, qayta urinib ko\'ring.', {
        reply_markup: cancelKeyboard(),
      });
    }
    return;
  }

  // ---------- 2-BOSQICH: QO'SHIMCHA RASMLAR ----------
  if (state && state.step === 'gallery_photos') {
    if (!msg.photo || msg.photo.length === 0) {
      await sendMessage(
        TOKEN,
        chatId,
        "⚠️ Iltimos, <b>rasm</b> yuboring yoki \"✅ Tayyor\" tugmasini bosib keyingi bosqichga o'ting.",
        { reply_markup: galleryStepKeyboard(state.gallery.length) }
      );
      return;
    }
    if (state.gallery.length >= MAX_GALLERY) {
      await sendMessage(
        TOKEN,
        chatId,
        `⚠️ Maksimal ${MAX_GALLERY} ta qo'shimcha rasmga yetdingiz. "✅ Tayyor" tugmasini bosing.`,
        { reply_markup: galleryStepKeyboard(state.gallery.length) }
      );
      return;
    }
    try {
      const filePath = await downloadTelegramPhoto(msg.photo);
      state.gallery.push(filePath);
      userState.set(userId, state);

      if (state.gallery.length >= MAX_GALLERY) {
        state.step = 'title';
        userState.set(userId, state);
        await sendMessage(
          TOKEN,
          chatId,
          `✅ Qo'shildi (${state.gallery.length}/${MAX_GALLERY}). Maksimal chegaraga yetdingiz.\n\n` +
            "📝 <b>Yangilik qo'shish — 3/4 bosqich</b>\n\nEndi yangilikning <b>sarlavhasini</b> matn qilib yuboring.",
          { reply_markup: cancelKeyboard() }
        );
      } else {
        await sendMessage(TOKEN, chatId, `✅ Qo'shildi (${state.gallery.length}/${MAX_GALLERY}).`, {
          reply_markup: galleryStepKeyboard(state.gallery.length),
        });
      }
    } catch (err) {
      console.error(err);
      await sendMessage(TOKEN, chatId, '❌ Rasmni yuklashda xatolik, qayta urinib ko\'ring.', {
        reply_markup: galleryStepKeyboard(state.gallery.length),
      });
    }
    return;
  }

  // ---------- 3-BOSQICH: SARLAVHA ----------
  if (state && state.step === 'title') {
    if (!msg.text || !msg.text.trim()) {
      await sendMessage(TOKEN, chatId, "⚠️ Iltimos, sarlavhani <b>matn</b> ko'rinishida yuboring.", {
        reply_markup: cancelKeyboard(),
      });
      return;
    }
    state.title = msg.text.trim();
    state.step = 'text';
    userState.set(userId, state);
    await sendMessage(
      TOKEN,
      chatId,
      "✅ Sarlavha qabul qilindi.\n\n" +
        "📄 <b>Yangilik qo'shish — 4/4 bosqich</b>\n\n" +
        "Endi yangilikning <b>matnini (izohini)</b> yuboring.",
      { reply_markup: cancelKeyboard() }
    );
    return;
  }

  // ---------- 4-BOSQICH: MATN / IZOH ----------
  if (state && state.step === 'text') {
    if (!msg.text || !msg.text.trim()) {
      await sendMessage(TOKEN, chatId, "⚠️ Iltimos, izohni <b>matn</b> ko'rinishida yuboring.", {
        reply_markup: cancelKeyboard(),
      });
      return;
    }
    const processingMsg = await sendMessage(TOKEN, chatId, '⏳ Saqlanmoqda...');
    try {
      const imagePaths = [state.mainImage, ...state.gallery];
      const item = await saveNewsItem({ title: state.title, text: msg.text.trim(), imagePaths });
      userState.delete(userId);

      const totalImgs = imagePaths.length;
      await editMessageText(
        TOKEN,
        chatId,
        processingMsg.message_id,
        `✅ <b>Yangilik muvaffaqiyatli qo'shildi!</b>\n\n` +
          `📰 <b>${escapeHtml(item.title)}</b>\n` +
          `🖼 Rasmlar: ${totalImgs} ta\n` +
          `📅 ${formatDate(item.createdAt)}\n\n` +
          `🌐 Endi saytda ko'rinadi!`,
        { reply_markup: mainMenuKeyboard(userId) }
      );
    } catch (err) {
      console.error(err);
      await editMessageText(TOKEN, chatId, processingMsg.message_id, '❌ Xatolik yuz berdi, qayta urinib ko\'ring.', {
        reply_markup: backToMenuKeyboard(),
      });
    }
    return;
  }

  // Boshqa har qanday matn - menyuni ko'rsatamiz
  await sendMessage(TOKEN, chatId, "🤔 Tushunmadim. Quyidagi menyudan foydalaning 👇", {
    reply_markup: mainMenuKeyboard(userId),
  });
}

// ============ ASOSIY POLLING TSIKLI ============

async function pollLoop() {
  console.log(`🤖 Telegram bot ishga tushdi (ruxsat berilgan ID'lar: ${ADMIN_IDS.join(', ') || "YO'Q"})`);
  while (true) {
    try {
      const updates = await getUpdates(TOKEN, offset);
      for (const update of updates) {
        offset = update.update_id + 1;
        if (update.message) {
          await handleMessage(update.message);
        } else if (update.callback_query) {
          await handleCallbackQuery(update.callback_query);
        }
      }
    } catch (err) {
      console.error('Bot xatoligi:', err.message);
      await new Promise((r) => setTimeout(r, 3000));
    }
  }
}

pollLoop();
