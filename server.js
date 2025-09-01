const express = require('express');
const { Client, GatewayIntentBits, PresenceUpdateStatus, ActivityType } = require('discord.js');
const app = express();
app.use(express.json());
app.use(express.static('public'));

let client; // لجعل البوت متاحاً عالمياً

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

app.listen(process.env.PORT || 3000, () => {
    console.log('🚀 Server started');
});
