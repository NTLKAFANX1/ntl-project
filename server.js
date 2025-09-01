
const express = require('express');
const fs = require('fs');
const path = require('path');
const { Client, GatewayIntentBits, ActivityType } = require('discord.js');

const app = express();
app.use(express.json());
app.use(express.static('public'));

let client;

app.post('/start', async (req, res) => {
    const { token, status, activity } = req.body;
    if (!token) return res.json({ message: 'توكن ناقص' });

    try {
        client = new Client({ intents: [GatewayIntentBits.Guilds] });
        client.once('ready', () => {
            console.log(`Bot is online: ${client.user.tag}`);
            if (status || activity) {
                client.user.setPresence({
                    status: status || 'online',
                    activities: activity ? [{
                        name: activity,
                        type: ActivityType.Playing
                    }] : []
                });
            }
        });
        await client.login(token);
        res.json({ message: '✅ البوت اشتغل بنجاح' });
    } catch (err) {
        console.error(err);
        res.json({ message: '❌ فشل تسجيل الدخول، التوكن غلط أو في مشكلة' });
    }
});

app.post('/status', async (req, res) => {
    const { status, activity } = req.body;
    if (!client || !client.user) return res.json({ message: 'البوت غير متصل حالياً' });

    try {
        await client.user.setPresence({
            status: status || 'online',
            activities: activity ? [{
                name: activity,
                type: ActivityType.Playing
            }] : []
        });
        res.json({ message: '✅ تم تحديث الحالة بنجاح' });
    } catch (err) {
        console.error(err);
        res.json({ message: '❌ حدث خطأ أثناء تحديث الحالة' });
    }
});

// AI محاكي
app.post('/ai', (req, res) => {
    const { prompt } = req.body;
    if (!prompt) return res.json({ message: '❌ لم يتم إرسال طلب.' });

    let response = "🛠️ لم أتمكن من تنفيذ التعديل تلقائياً، جرب تحديد الملف أو أرسل لي الكود المطلوب إضافته.";

    if (prompt.includes("اضف كود ترحيب")) {
        response = `✅ أضفت كود ترحيب إلى server.js
client.on("guildMemberAdd", member => {
  member.send("أهلاً بك في السيرفر!");
});`;

        const filePath = path.join(__dirname, 'server.js');
        fs.appendFileSync(filePath, `
client.on("guildMemberAdd", member => {
  member.send("أهلاً بك في السيرفر!");
});`);
    }

    res.json({ message: response });
});

// عرض ملف
app.get('/file', (req, res) => {
    const file = req.query.name;
    if (!file) return res.status(400).send("❌ اسم الملف مفقود");
    const filePath = path.join(__dirname, file);
    if (!fs.existsSync(filePath)) return res.status(404).send("❌ الملف غير موجود");
    const content = fs.readFileSync(filePath, 'utf-8');
    res.send(content);
});

// حفظ ملف
app.post('/file', (req, res) => {
    const { name, content } = req.body;
    const filePath = path.join(__dirname, name);
    if (!fs.existsSync(filePath)) return res.json({ message: '❌ الملف غير موجود' });
    fs.writeFileSync(filePath, content, 'utf-8');
    res.json({ message: '✅ تم حفظ التعديلات بنجاح' });
});

app.listen(process.env.PORT || 3000, () => {
    console.log('🚀 Server started');
});
