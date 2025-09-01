const express = require('express');
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');
const bodyParser = require('body-parser');

const app = express();
const PORT = process.env.PORT || 10000;

app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

const bots = {}; // لتخزين البوتات قيد التشغيل

app.post('/api/start-bot', (req, res) => {
    const { name, token } = req.body;

    if (!name || !token) {
        return res.status(400).json({ error: "اسم أو توكن البوت ناقص." });
    }

    const botFolder = path.join(__dirname, 'bots', name);
    if (!fs.existsSync(botFolder)) fs.mkdirSync(botFolder, { recursive: true });

    const filePath = path.join(botFolder, 'bot.js');

    const code = `const { Client, GatewayIntentBits } = require('discord.js');
const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent] });

client.once('ready', () => {
    console.log("${name} is online!");
});

client.on('messageCreate', message => {
    if (message.author.bot) return;
    if (message.content.toLowerCase() === 'ping') {
        message.channel.send('pong!');
    }
});

client.login('${token}');
`;

    fs.writeFileSync(filePath, code);

    // إذا البوت شغال بالفعل، نوقفه
    if (bots[name]) {
        bots[name].kill();
    }

    // تشغيل البوت
    const child = spawn('node', [filePath], { cwd: botFolder });
    bots[name] = child;

    child.stdout.on('data', (data) => {
        console.log(`[${name}] ${data}`);
    });

    child.stderr.on('data', (data) => {
        console.error(`[${name} ERROR] ${data}`);
    });

    child.on('exit', (code) => {
        console.log(`[${name}] exited with code ${code}`);
    });

    res.json({ success: true, message: `${name} شغّال.` });
});

app.listen(PORT, () => {
    console.log("🔌 Server running on http://localhost:" + PORT);
});
