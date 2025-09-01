import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import cors from 'cors';
import fetch from 'node-fetch';
import { Client, GatewayIntentBits } from 'discord.js';

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// صفحة البداية
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// AI Route
app.post('/ask', async (req, res) => {
  const prompt = req.body.prompt;
  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.OPENAI_KEY}`
      },
      body: JSON.stringify({
        model: "gpt-4",
        messages: [{ role: "user", content: prompt }]
      })
    });
    const data = await response.json();
    res.json({ response: data.choices[0].message.content });
  } catch (e) {
    res.json({ response: "حدث خطأ في الاتصال بـ OpenAI" });
  }
});

// Start Bot Route
app.post('/start-bot', (req, res) => {
  const token = req.body.token;
  if(!token) return res.json({message: "ضع توكن البوت أولاً"});

  const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent] });
  
  client.once('ready', () => console.log(`بوت شغّال باسم ${client.user.tag}`));
  
  client.on('messageCreate', message => {
    if(message.content === "!ping") message.channel.send("Pong!");
  });

  client.login(token)
    .then(() => res.json({message: "البوت شغّل بنجاح!"}))
    .catch(()=> res.json({message: "خطأ في توكن البوت"}));
});

app.listen(process.env.PORT || 3000, () => console.log("Server running"));
