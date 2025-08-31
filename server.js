const express = require("express");
const fetch = require("node-fetch");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const bodyParser = require("body-parser");
const { Client, GatewayIntentBits } = require("discord.js");

const app = express();
app.use(bodyParser.json());

const upload = multer({ dest: "uploads/" });
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

// تخزين البوتات
let bots = []; // { name, token, client, online }

// إضافة بوت جديد وتشغيله فورًا
function addBot(name, token) {
  const client = new Client({ intents: [GatewayIntentBits.Guilds] });
  client.login(token)
    .then(() => console.log(`${name} is online!`))
    .catch(err => console.log(`Failed to login ${name}: ${err}`));

  const botObj = { name, token, client, online: false };
  bots.push(botObj);

  client.on("ready", () => {
    console.log(`${name} logged in as ${client.user.tag}`);
    botObj.online = true;
  });
}

// إيقاف البوت
function stopBot(token) {
  const botObj = bots.find(b => b.token === token);
  if(botObj) {
    botObj.client.destroy();
    botObj.online = false;
    console.log(`${botObj.name} stopped`);
  }
}

// واجهة الويب
app.get("/", (req, res) => {
  let botHTML = bots.map((b, i) => `
    <div style="background:#222; padding:10px; margin:10px 0; border-radius:5px;">
      <h3>${b.name} - ${b.online ? "أونلاين ✅" : "أوفلاين ❌"}</h3>
      <textarea id="input${i}" rows="4" placeholder="اكتب أي شيء عن البوت"></textarea><br>
      <button onclick="generateCode(${i})">توليد كود</button>
      <button onclick="document.getElementById('file${i}').click()">رفع ملف</button>
      <button onclick="toggleBot(${i})">${b.online ? "إيقاف" : "تشغيل"}</button>
      <pre id="result${i}"></pre>
      <input type="file" id="file${i}" style="display:none"/>
    </div>
  `).join("\n");

  res.send(`
  <!DOCTYPE html>
  <html lang="ar">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>لوحة بوتات ديسكورد الذكية</title>
    <style>
      body { font-family: monospace; background: #1e1e1e; color: #fff; padding:20px; }
      h1 { text-align:center; color:#00ffff; }
      input, textarea { width:100%; background:#333; color:#fff; border:none; padding:10px; border-radius:5px; margin:5px 0; }
      button { padding:10px 20px; margin:5px; border:none; border-radius:5px; cursor:pointer; background:#00ffff; color:#000; font-weight:bold; }
      pre { background:#333; padding:10px; border-radius:5px; overflow-x:auto; }
    </style>
  </head>
  <body>
    <h1>لوحة بوتات ديسكورد الذكية</h1>
    <div>
      <input id="botName" placeholder="اسم البوت" />
      <input id="botToken" placeholder="توكن البوت" />
      <button onclick="addBotUI()">إضافة بوت</button>
    </div>
    <div id="botList">
      ${botHTML}
    </div>

    <script>
      async function addBotUI() {
        const name = document.getElementById('botName').value;
        const token = document.getElementById('botToken').value;
        if(!name || !token) return alert("أدخل اسم وتوكن البوت!");
        await fetch('/add-bot', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({name, token}) });
        location.reload();
      }

      async function generateCode(index) {
        const input = document.getElementById('input'+index).value;
        const res = await fetch('/generate', {
          method: 'POST',
          headers: {'Content-Type':'application/json'},
          body: JSON.stringify({ text: input })
        });
        const data = await res.json();
        document.getElementById('result'+index).textContent = data.code;
      }

      function toggleBot(index) {
        const btn = document.querySelectorAll('button')[index*3 + 2]; 
        const token = btn.getAttribute('data-token');
        fetch('/toggle-bot', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({index}) })
          .then(()=> location.reload());
      }

      // رفع الملفات
      document.querySelectorAll('input[type=file]').forEach((fileInput, i)=>{
        fileInput.onchange = async ()=>{
          const formData = new FormData();
          formData.append('file', fileInput.files[0]);
          formData.append('botIndex', i);
          await fetch('/upload', { method:'POST', body:formData });
          alert('تم رفع الملف!');
        };
      });
    </script>
  </body>
  </html>
  `);
});

// إضافة بوت من الواجهة
app.post("/add-bot", (req, res) => {
  const { name, token } = req.body;
  addBot(name, token);
  res.send({ success:true });
});

// توليد كود البوت
app.post("/generate", async (req, res) => {
  const userInput = req.body.text;
  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: "gpt-4",
        messages: [
          { role: "system", content: "أنت مساعد ذكي يحول أي كلام إلى كود بوتات ديسكورد." },
          { role: "user", content: userInput }
        ]
      })
    });
    const data = await response.json();
    res.send({ code: data.choices[0].message.content });
  } catch(err) {
    res.status(500).send({ code: "حدث خطأ: " + err.message });
  }
});

// إيقاف / تشغيل البوت
app.post("/toggle-bot", (req, res) => {
  const { index } = req.body;
  const bot = bots[index];
  if(!bot) return res.send({ success:false });
  if(bot.online) stopBot(bot.token);
  else addBot(bot.name, bot.token);
  res.send({ success:true });
});

// رفع الملفات
app.post("/upload", upload.single("file"), (req, res) => {
  const botIndex = req.body.botIndex;
  const filePath = path.join(__dirname, "uploads", req.file.originalname);
  fs.renameSync(req.file.path, filePath);
  res.send({ success:true, path:filePath });
});

// تشغيل السيرفر
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("Server running on port", PORT));
