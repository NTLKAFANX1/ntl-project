const express = require('express');
const { Client, GatewayIntentBits } = require('discord.js');
const app = express();
app.use(express.json());
app.use(express.static('public'));

app.post('/start', async (req, res) => {
    const { token } = req.body;
    if (!token) return res.json({ message: 'توكن ناقص' });

    try {
        const client = new Client({ intents: [GatewayIntentBits.Guilds] });
        client.once('ready', () => {
            console.log(`Bot is online: ${client.user.tag}`);
        });
        await client.login(token);
        res.json({ message: '✅ البوت اشتغل بنجاح' });
    } catch (err) {
        console.error(err);
        res.json({ message: '❌ فشل تسجيل الدخول، التوكن غلط أو في مشكلة' });
    }
});

app.listen(process.env.PORT || 3000, () => {
    console.log('🚀 Server started');
});