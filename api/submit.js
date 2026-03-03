export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { site, problem, contact } = req.body;
  
  const BOT_TOKEN = '8788819759:AAHWaWU5phO0FNGQtKmunqdsiEVQfYsuapA';
  const CHAT_ID = '-1003771262125';

  const text = `🚨 СРОЧНЫЙ РЕМОНТ САЙТА\n\n🌐 Сайт: ${site || 'Не указан'}\n❌ Проблема: ${problem || 'Не указана'}\n📞 Контакт: ${contact || 'Не указан'}`;

  try {
    const response = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: CHAT_ID, text: text })
    });

    if (!response.ok) {
      throw new Error('Telegram API error');
    }

    res.status(200).json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
}
