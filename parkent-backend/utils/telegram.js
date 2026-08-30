const BASE = (token) => `https://api.telegram.org/bot${token}`;
const FILE_BASE = (token) => `https://api.telegram.org/file/bot${token}`;

async function apiCall(token, method, params = {}) {
  const res = await fetch(`${BASE(token)}/${method}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });
  const data = await res.json();
  if (!data.ok) throw new Error(`Telegram API xatosi (${method}): ${data.description}`);
  return data.result;
}

async function getUpdates(token, offset) {
  return apiCall(token, 'getUpdates', { offset, timeout: 25 });
}

async function sendMessage(token, chatId, text, extra = {}) {
  return apiCall(token, 'sendMessage', { chat_id: chatId, text, parse_mode: 'HTML', ...extra });
}

async function editMessageText(token, chatId, messageId, text, extra = {}) {
  return apiCall(token, 'editMessageText', {
    chat_id: chatId,
    message_id: messageId,
    text,
    parse_mode: 'HTML',
    ...extra,
  });
}

async function answerCallbackQuery(token, callbackQueryId, text = '', showAlert = false) {
  return apiCall(token, 'answerCallbackQuery', {
    callback_query_id: callbackQueryId,
    text,
    show_alert: showAlert,
  });
}

async function getFileUrl(token, fileId) {
  const file = await apiCall(token, 'getFile', { file_id: fileId });
  return `${FILE_BASE(token)}/${file.file_path}`;
}

async function downloadFile(url, destPath) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Faylni yuklab olishda xatolik: ${res.status}`);
  const buffer = Buffer.from(await res.arrayBuffer());
  const fs = require('fs');
  fs.writeFileSync(destPath, buffer);
}

module.exports = {
  getUpdates,
  sendMessage,
  editMessageText,
  answerCallbackQuery,
  getFileUrl,
  downloadFile,
};
