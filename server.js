const express = require("express");
const fetch = require("node-fetch");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const bodyParser = require("body-parser");

const app = express();
app.use(bodyParser.json());

// إعداد رفع الملفات
const upload = multer({ dest: "uploads/" });

// مفتاح OpenAI من متغير البيئة
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

// قائمة البوتات
let bots = [];

// واجهة الويب
app.get("/", (req, res) => {
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
      textarea { width:100%; background:#333; color:#fff; border:none; padding:10px; border-radius:5px; }
      button { padding:10px 20px; margin:5px; border:none; border-radius:5px; cursor:pointer; background:#00ffff; color:#000; font-weight:bold; }
      pre { background:#333; padding:10px; border-radius:5px; overflow-x:auto; }
      .bot { background:#222; padding:10px; margin:10px 0; border-radius:5px; }
    </style>
  </head>
  <body>
    <h1>لوحة بوتات ديسكورد الذكية</h1>
    
    <div>
      <input id="botName" placeholder="اسم البوت" />
      <input id="botToken" placeholder="توكن البوت" />
      <button onclick="addBot()">إضافة بوت</button>
    </div>

    <div id="botList"></div>

    <script>
      let bots = [];

      function renderBots() {
        const container = document.getElementById('botList');
        container.innerHTML = '';
        bots.forEach((bot, index) => {
          const div = document.createElement('div');
          div.className = 'bot';
          div.innerHTML = \`
            <h3>\${bot.name}</h3>
            <p>توكن: \${bot.token}</p>
            <textarea id="input\${index}" rows="4" placeholder="اكتب أي شيء عن البوت"></textarea><br>
            <button onclick="generateCode(\${index})">توليد كود</button>
            <button onclick="uploadFile(\${index})">رفع ملف</button>
            <pre id="result\${index}"></pre>
            <input type="file" id="file\${index}" style="display:none"/>
          \`;
          container.appendChild(div);
        });
      }

      function addBot() {
        const name = document.getElementById('botName').value;
        const token = document.getElementById('botToken').value;
        if(name && token) {
          bots.push({name, token});
          renderBots();
        } else alert("أدخل اسم وتوكن البوت!");
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

      function uploadFile(index) {
        const fileInput = document.getElementById('file'+index);
        fileInput.click();
        fileInput.onchange = async () => {
          const formData = new FormData();
          formData.append('file', fileInput.files[0]);
          formData.append('botIndex', index);
          await fetch('/upload', {
            method: 'POST',
            body: formData
          });
          alert('تم رفع الملف للبوت: ' + bots[index].name);
        }
      }
    </script>
  </body>
  </html>
  `);
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

// رفع الملفات للبوتات
app.post("/upload", multer({ dest: "uploads/" }).single("file"), (req, res) => {
  const botIndex = req.body.botIndex;
  const filePath = path.join(__dirname, "uploads", req.file.originalname);
  fs.renameSync(req.file.path, filePath);
  res.send({ success:true, path:filePath });
});

// تشغيل السيرفر
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("Server running on port", PORT));
