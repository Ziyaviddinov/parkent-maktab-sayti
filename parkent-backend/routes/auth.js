const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

// Oddiy urinishlarni cheklash (brute-force himoyasi) - IP bo'yicha xotirada saqlanadi
const attempts = new Map();
const MAX_ATTEMPTS = 5;
const WINDOW_MS = 15 * 60 * 1000; // 15 daqiqa

function isRateLimited(ip) {
  const record = attempts.get(ip);
  if (!record) return false;
  if (Date.now() - record.firstAttempt > WINDOW_MS) {
    attempts.delete(ip);
    return false;
  }
  return record.count >= MAX_ATTEMPTS;
}

function recordAttempt(ip) {
  const record = attempts.get(ip);
  if (!record) {
    attempts.set(ip, { count: 1, firstAttempt: Date.now() });
  } else {
    record.count += 1;
  }
}

function clearAttempts(ip) {
  attempts.delete(ip);
}

function safeCompare(a, b) {
  const bufA = Buffer.from(String(a));
  const bufB = Buffer.from(String(b));
  if (bufA.length !== bufB.length) return false;
  return crypto.timingSafeEqual(bufA, bufB);
}

// POST /api/auth/login
router.post('/login', (req, res) => {
  const ip = req.ip;

  if (isRateLimited(ip)) {
    return res.status(429).json({ error: "Juda ko'p urinish. 15 daqiqadan keyin qayta urinib ko'ring." });
  }

  const { username, password } = req.body;
  const validUser = safeCompare(username || '', process.env.ADMIN_USERNAME || '');
  const validPass = safeCompare(password || '', process.env.ADMIN_PASSWORD || '');

  if (!validUser || !validPass) {
    recordAttempt(ip);
    return res.status(401).json({ error: "Login yoki parol noto'g'ri" });
  }

  clearAttempts(ip);
  const token = jwt.sign({ username }, process.env.JWT_SECRET, { expiresIn: '12h' });
  res.json({ success: true, token });
});

module.exports = router;
