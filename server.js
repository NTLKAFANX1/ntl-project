import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { Client, GatewayIntentBits } from 'discord.js';

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// تشغيل البوت
let botClient;
app.post('/start-bot', (req, res) => {
  const token = req.body.token;
  if(!token) return res.json({message:"ضع توكن البوت!"});

  botClient = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent] });
  botClient.once('ready', () => console.log(`بوت شغال: ${botClient.user.tag}`));
  
  botClient.on('messageCreate', message => {
    if(message.content === "!ping") message.channel.send("Pong!");
  });

  botClient.login(token)
    .then(()=> res.json({message:"البوت شغّل!"}))
    .catch(()=> res.json({message:"توكن غير صحيح!"}));
});

// تشغيل أكواد JS مباشرة
app.post('/run-code', (req, res) => {
  try{
    eval(req.body.code);
    res.json({message:"تم تشغيل الكود!"});
  } catch(e){
    res.json({message:"خطأ: "+e.message});
  }
});

app.listen(process.env.PORT || 3000, () => console.log("Server running"));
