const express = require("express");
const fetch = require("node-fetch");
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const bodyParser = require("body-parser");
const { Client, GatewayIntentBits } = require("discord.js");

const app = express();
app.use(bodyParser.json());
app.use(express.static('public'));

const upload = multer({ dest: "uploads/" });
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

// البوتات
let bots = []; // { name, token, client, online, files }

// إضافة بوت
function addBot(name, token) {
  if (bots.find(b => b.name === name || b.token === token)) return false;
  const client = new Client({ intents: [GatewayIntentBits.Guilds] });
  const botObj = { name, token, client, online: false, files: [] };
  bots.push(botObj);

  client.login(token).catch(err => console.log(`Login failed: ${err}`));
  client.on("ready", () => {
    console.log(`${name} logged in as ${client.user.tag}`);
    botObj.online = true;
  });
  return true;
}

// إيقاف بوت
function stopBot(token) {
  const bot = bots.find(b => b.token === token);
  if (!bot) return false;
  bot.client.destroy();
  bot.online = false;
  return true;
}

// رفع ملفات
app.post("/upload", upload.single("file"), (req, res) => {
  const { botName } = req.body;
  const bot = bots.find(b => b.name === botName);
  if (!bot) return res.status(400).send({ success:false });

  const botDir = path.join(__dirname, "bots", botName);
  if(!fs.existsSync(botDir)) fs.mkdirSync(botDir, { recursive: true });

  const destPath = path.join(botDir, req.file.originalname);
  fs.renameSync(req.file.path, destPath);
  bot.files.push(destPath);

  res.send({ success:true, path:destPath });
});

// توليد كود AI
app.post("/generate", async (req, res) => {
  const { text } = req.body;
  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type":"application/json",
        "Authorization": `Bearer ${OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model:"gpt-4",
        messages:[
          {role:"system", content:"أنت مساعد ذكي يحول أي كلام إلى كود بوتات ديسكورد."},
          {role:"user", content:text}
        ]
      })
    });
    const data = await response.json();
    res.send({ code: data.choices[0].message.content });
  } catch(err) {
    res.status(500).send({ code: "حدث خطأ: "+err.message });
  }
});

// API إضافة بوت
app.post("/add-bot", (req,res)=>{
  const {name, token} = req.body;
  if(addBot(name, token)) res.send({success:true});
  else res.send({success:false, msg:"Bot name or token already exists"});
});

// API تشغيل/إيقاف بوت
app.post("/toggle-bot", (req,res)=>{
  const {token} = req.body;
  const bot = bots.find(b=>b.token===token);
  if(!bot) return res.send({success:false});
  if(bot.online) stopBot(token);
  else addBot(bot.name, token);
  res.send({success:true});
});

// API جلب البوتات
app.get("/get-bots",(req,res)=>{
  res.send({ bots: bots.map(b=>({name:b.name,online:b.online})) });
});

// واجهة المستخدم
app.get("/", (req,res)=>{
  res.sendFile(path.join(__dirname,"public/index.html"));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT,()=>console.log("Server running on port "+PORT));
