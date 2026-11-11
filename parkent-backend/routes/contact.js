const express = require('express');
const router = express.Router();
const https = require('https');
const { readContent } = require('../utils/content');

// Chat ID manbasi: avval admin panel (settings.contactChatId), keyin env (CONTACT_CHAT_IDS / CONTACT_CHAT_ID)
function getChatIds() {
  let ids = [];

  try {
    const settings = readContent().settings || {};
    if (settings.contactChatId) {
      ids = String(settings.contactChatId)
        .split(',')
        .map((id) => id.trim())
        .filter(Boolean);
    }
  } catch (err) {
    console.error('CONTACT: sozlamalarni o\'qishda xatolik —', err.message);
  }

  if (!ids.length) {
    const raw = process.env.CONTACT_CHAT_IDS || process.env.CONTACT_CHAT_ID || '';
    ids = raw
      .split(',')
      .map((id) => id.trim())
      .filter(Boolean);
  }

  return ids;
}

function sendTelegramMessage(token, chatId, text) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify({ chat_id: chatId, text, disable_web_page_preview: true });
    const options = {
      hostname: 'api.telegram.org',
      path: `/bot${token}/sendMessage`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(data),
      },
      timeout: 10000,
    };

    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => (body += chunk));
      res.on('end', () => {
        let parsed;
        try {
          parsed = JSON.parse(body);
        } catch (e) {
          return reject(new Error('Telegram javobini o\'qib bo\'lmadi'));
        }
        if (!parsed.ok) {
          const error = new Error(parsed.description || 'Telegram xabarni qabul qilmadi');
          error.telegram = parsed;
          return reject(error);
        }
        resolve(parsed.result);
      });
    });

    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Telegramga ulanish vaqti tugadi'));
    });
    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

// POST /api/contact - bog'lanish formasidan xabar yuborish
router.post('/', async (req, res) => {
  const { name, phone, email, message } = req.body || {};

  if (!name || !phone || !message) {
    return res.status(400).json({ error: "Ism, telefon va xabar to'ldirilishi shart" });
  }

  const token = process.env.CONTACT_BOT_TOKEN;
  const chatIds = getChatIds();

  if (!token) {
    return res.status(500).json({ error: 'Serverda CONTACT_BOT_TOKEN sozlanmagan' });
  }
  if (!chatIds.length) {
    return res.status(500).json({ error: "Telegram guruh ID sozlanmagan (admin panel → Sozlamalar)" });
  }

  const text = [
    '📩 Yangi murojaat (saytdan)',
    '',
    `👤 Ism: ${name}`,
    `📞 Tel: ${phone}`,
    `📧 Email: ${email || '-'}`,
    `💬 Xabar: ${message}`,
  ].join('\n');

  const errors = [];

  for (const chatId of chatIds) {
    try {
      await sendTelegramMessage(token, chatId, text);
      return res.json({ success: true, message: 'Xabar yuborildi' });
    } catch (err) {
      errors.push(`${chatId}: ${err.message}`);
      console.error(`CONTACT: ${chatId} ga yuborilmadi — ${err.message}`);
    }
  }

  return res.status(502).json({
    error: "Telegramga yuborib bo'lmadi",
    detail: errors.join(' | '),
  });
});

module.exports = router;
