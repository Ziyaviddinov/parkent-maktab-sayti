const express = require('express');
const router = express.Router();
const https = require('https');

const BOT_TOKEN = process.env.CONTACT_BOT_TOKEN;
const CHAT_ID = process.env.CONTACT_CHAT_ID;

function sendTelegramMessage(token, chatId, text) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify({ chat_id: chatId, text });
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
          return reject(new Error('Telegram javobini oʻqib boʻlmadi'));
        }
        if (!parsed.ok) {
          return reject(new Error(parsed.description || 'Telegram xabarni qabul qilmadi'));
        }
        resolve(parsed);
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
  const { name, phone, email, message } = req.body;

  if (!name || !phone || !message) {
    return res.status(400).json({ error: "Ism, telefon va xabar to'ldirilishi shart" });
  }

  const text = `📩 Yangi murojaat (saytdan)\n\n👤 Ism: ${name}\n📞 Tel: ${phone}\n📧 Email: ${email || '-'}\n💬 Xabar: ${message}`;

  try {
    await sendTelegramMessage(BOT_TOKEN, CHAT_ID, text);
    res.json({ success: true, message: 'Xabar yuborildi' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Xabar yuborishda xatolik' });
  }
});

module.exports = router;
