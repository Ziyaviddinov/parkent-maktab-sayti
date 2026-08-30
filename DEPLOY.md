# Parkent Maktabi Sayti — Joylashtirish (Deploy) Qo'llanmasi

## Loyiha tuzilishi

```
parkent-final/
├── sayt/              → Statik sayt (HTML/CSS/JS) - hosting kerak
├── parkent-backend/   → Backend server (Node.js) - alohida hosting kerak
└── admin.html         → Admin panel (statik sayt ichiga qo'yish mumkin)
```

## 1-QADAM: Backend serverni joylashtirish

Backend uchun **bepul** variantlar: Render.com, Railway.app, Fly.io

### Render.com orqali (eng oson):
1. GitHub'da yangi repository yarating, `parkent-backend/` papkasini yuklang
   - ⚠️ `.env` faylini **hech qachon** public repoga qo'ymang! (`.gitignore` allaqachon shunday sozlangan)
2. [render.com](https://render.com) da ro'yxatdan o'ting, "New Web Service" tanlang
3. GitHub repongizni ulang
4. Build Command: `npm install`
5. Start Command: `node server.js`
6. **Environment Variables** bo'limida `.env` faylidagi barcha qiymatlarni qo'lda kiriting:
   - `CONTACT_BOT_TOKEN`, `CONTACT_CHAT_ID`
   - `NEWS_BOT_TOKEN`, `NEWS_CHAT_ID`
   - `ADMIN_TELEGRAM_IDS`
   - `PORT` (Render avtomatik beradi, qo'ymasa ham bo'ladi)
   - `ADMIN_USERNAME`, `ADMIN_PASSWORD` — **kuchli parol qo'ying!**
   - `JWT_SECRET` — tasodifiy uzun matn (masalan: `openssl rand -hex 32` orqali generatsiya qiling)
7. Deploy qiling. Sizga `https://sizning-nom.onrender.com` kabi manzil beriladi

### Botni doim ishlab turishi uchun:
Render'ning bepul rejasida server "uxlab qoladi". Bot uchun alohida **Background Worker** yarating (Start Command: `node bot.js`), yoki oddiy VPS (masalan, DigitalOcean, $4-6/oy) da `pm2` bilan doim ishlatib turing:
```bash
npm install -g pm2
pm2 start server.js --name parkent-api
pm2 start bot.js --name parkent-bot
pm2 save
pm2 startup
```

## 2-QADAM: Backend manzilini frontend fayllarda yangilash

Backend joylashgandan so'ng (masalan `https://parkent-api.onrender.com`), quyidagi fayllarda `http://localhost:3000` ni shu manzilga almashtiring:

- `sayt/yangiliklar.html` — qidiring: `NEWS_API_URL`
- `sayt/script.js` — qidiring: `BACKEND_API_URL`
- `admin.html` — qidiring: `API_URL`

Har birida bitta qatorni o'zgartirasiz, masalan:
```js
const NEWS_API_URL = 'https://parkent-api.onrender.com';
```

## 3-QADAM: Statik saytni joylashtirish

`sayt/` papkasini istalgan statik hosting'ga yuklang: Netlify, Vercel, GitHub Pages, yoki oddiy cPanel hosting.

`admin.html` faylini ham shu papka ichiga qo'ying (masalan `sayt/admin.html`), shunda `https://sizsayt.uz/admin.html` orqali kirasiz.

## 4-QADAM: Telegram bot va CORS sozlamalari

1. **CORS**: `parkent-backend/server.js` da hozircha barcha manzillardan so'rovga ruxsat berilgan (`cors()`). Xavfsizlik uchun buni faqat o'z domeningizga cheklashni tavsiya qilaman:
   ```js
   app.use(cors({ origin: 'https://sizsayt.uz' }));
   ```

2. **Bot ishga tushirish**: Serverga kirib, `node bot.js` ni ishga tushiring (yoki pm2 orqali doimiy qilib qo'ying). Botga (`@yangiliklar_card_bot`) `/start` yozib sinab ko'ring.

3. **Kim admin ekanini tekshiring**: `.env` dagi `ADMIN_TELEGRAM_IDS` bo'sh bo'lmasligi shart — aks holda bot hech kimga javob bermaydi.

## 5-QADAM: Xavfsizlik nazorati (ishga tushirishdan oldin)

- [ ] `.env` dagi `ADMIN_PASSWORD` standart qiymatdan (`change_this_password`) o'zgartirilganmi?
- [ ] `JWT_SECRET` tasodifiy va uzun (kamida 32 belgi) qiymatga o'zgartirilganmi?
- [ ] `ADMIN_TELEGRAM_IDS` to'ldirilganmi?
- [ ] `.env` fayli GitHub'ga yuklanmaganmi? (`.gitignore` tekshiring)
- [ ] CORS faqat o'z domeningizga cheklandimi?
- [ ] Eski, ochiq bo'lgan Telegram token (`8000485677:...`) BotFather orqali `/revoke` qilindimi? (Agar hali qilmagan bo'lsangiz — hoziroq qiling!)

## Muammo yuzaga kelsa

- Backend ishlamayapti → `render.com` yoki serveringiz loglarini tekshiring
- Yangiliklar chiqmayapti → brauzer konsolida (F12 → Console) xatolikni ko'ring, odatda CORS yoki noto'g'ri `API_URL` sabab bo'ladi
- Bot javob bermayapti → `ADMIN_TELEGRAM_IDS` to'g'ri kiritilganini va `node bot.js` ishlab turganini tekshiring
