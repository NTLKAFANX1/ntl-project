const express = require('express');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const { Client, GatewayIntentBits, ActivityType } = require('discord.js');
const { Configuration, OpenAIApi } = require('openai');

const app = express();
app.use(express.json());
app.use(express.static('public'));

let client;

// تشغيل البوت مع التوكن والحالة والنشاط
app.post('/start', async (req, res) => {
  const { token, status, activity } = req.body;
  if (!token) return res.json({ message: '❌ يرجى إدخال التوكن' });

  try {
    client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent] });
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

// حفظ الملفات
app.post('/file', (req, res) => {
  const { name, content } = req.body;
  const dir = path.dirname(name);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(name, content, 'utf-8');
  res.json({ message: '✅ تم حفظ الملف' });
});

// تشغيل البوت من الملف المحفوظ
app.post('/run', (req, res) => {
  exec('node bots/bot.js', (error, stdout, stderr) => {
    if (error) {
      console.error(`خطأ: ${error.message}`);
      return res.json({ message: '❌ فشل تشغيل البوت' });
    }
    if (stderr) console.error(`STDERR: ${stderr}`);
    console.log(`STDOUT: ${stdout}`);
    res.json({ message: '✅ تم تشغيل البوت' });
  });
});

// واجهة OpenAI (اختياري)
app.post('/ask', async (req, res) => {
  const { question } = req.body;
  try {
    const openai = new OpenAIApi(new Configuration({ apiKey: process.env.OPENAI_API_KEY }));
    const completion = await openai.createChatCompletion({
      model: 'gpt-4',
      messages: [{ role: 'user', content: question }]
    });
    res.json({ answer: completion.data.choices[0].message.content });
  } catch (err) {
    console.error(err);
    res.json({ answer: '❌ فشل في الاتصال بـ OpenAI، تأكد من المفتاح.' });
  }
});

app.listen(process.env.PORT || 3000, () => {
  console.log('🚀 Server running...');
});
