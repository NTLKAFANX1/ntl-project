const express = require('express');
const fs = require('fs');
const path = require('path');
const { Client, GatewayIntentBits, ActivityType } = require('discord.js');
const OpenAI = require('openai');

const app = express();
app.use(express.json());
app.use(express.static('public'));

let client;
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

app.post('/start', async (req, res) => {
  const { token, status, activity } = req.body;
  if (!token) return res.json({ message: '❌ يرجى إدخال التوكن' });

  try {
    client = new Client({ intents: [GatewayIntentBits.Guilds] });
    client.once('ready', () => {
      console.log(`🤖 Logged in as ${client.user.tag}`);
      client.user.setPresence({
        status: status || 'online',
        activities: activity ? [{ name: activity, type: ActivityType.Playing }] : []
      });
    });
    await client.login(token);
    res.json({ message: '✅ البوت الآن يعمل' });
  } catch (err) {
    console.error(err);
    res.json({ message: '❌ خطأ في التوكن أو الاتصال' });
  }
});

app.get('/file', (req, res) => {
  const filePath = path.join(__dirname, req.query.name || '');
  if (!fs.existsSync(filePath)) return res.status(404).send('❌ الملف غير موجود');
  res.send(fs.readFileSync(filePath, 'utf-8'));
});

app.post('/file', (req, res) => {
  const { name, content } = req.body;
  const filePath = path.join(__dirname, name);
  fs.writeFileSync(filePath, content, 'utf-8');
  res.json({ message: '✅ تم حفظ الملف' });
});

app.post('/ask', async (req, res) => {
  const { question } = req.body;
  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [{ role: 'user', content: question }]
    });
    res.json({ answer: completion.choices[0].message.content });
  } catch (err) {
    console.error(err);
    res.json({ answer: '❌ فشل في الاتصال بـ OpenAI، تأكد من المفتاح.' });
  }
});

app.listen(process.env.PORT || 3000, () => {
  console.log('🚀 Server running...');
});
