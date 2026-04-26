export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
  const CHAT_ID = process.env.TELEGRAM_CHAT_ID;

  if (!BOT_TOKEN || !CHAT_ID) {
    console.error('Missing TELEGRAM_BOT_TOKEN or TELEGRAM_CHAT_ID env variables');
    return res.status(500).json({
      success: false,
      error: 'Server is not configured. Set TELEGRAM_BOT_TOKEN and TELEGRAM_CHAT_ID in environment.'
    });
  }

  const body = req.body || {};
  const { name, contact, site, type, goal } = body;

  // basic anti-spam guard: trim + length cap, fall back to em-dash
  const clean = (v, max = 600) =>
    typeof v === 'string' && v.trim() ? v.trim().slice(0, max) : '—';

  // honeypot (optional, can be added to form as hidden input)
  if (typeof body.company === 'string' && body.company.trim() !== '') {
    // silently accept to avoid signaling bots, but skip Telegram
    return res.status(200).json({ success: true });
  }

  const text =
    `🍒 НОВАЯ ЗАЯВКА · OAIWeb Digital\n\n` +
    `👤 Имя: ${clean(name, 120)}\n` +
    `📞 Контакт: ${clean(contact, 200)}\n` +
    `🌐 Сайт / референс: ${clean(site, 300)}\n` +
    `🧩 Тип проекта: ${clean(type, 120)}\n` +
    `📝 Задача:\n${clean(goal, 1500)}`;

  try {
    const tgRes = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: CHAT_ID,
        text,
        disable_web_page_preview: true
      })
    });

    if (!tgRes.ok) {
      const detail = await tgRes.text().catch(() => '');
      console.error('Telegram API error:', tgRes.status, detail);
      throw new Error(`Telegram API ${tgRes.status}`);
    }

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('submit handler error:', error);
    return res.status(500).json({
      success: false,
      error: 'Не удалось отправить заявку. Напиши в Telegram @anonosya — я отвечу лично.'
    });
  }
}
