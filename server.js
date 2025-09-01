import express from "express";
import { Client, GatewayIntentBits } from "discord.js";
import bodyParser from "body-parser";
import fs from "fs";
import path from "path";
import { WebSocketServer } from "ws";

const app = express();
const PORT = process.env.PORT || 10000;

app.use(bodyParser.json());
app.use(express.static("public"));

let bots = {}; // كل بوت مخزن هنا

// API لإضافة بوت جديد
app.post("/api/add-bot", (req, res) => {
  const { name, token } = req.body;
  if (!name || !token) return res.status(400).send("Name or token missing");
  
  const bot = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent] });
  
  bot.once("ready", () => {
    console.log(`${name} logged in as ${bot.user.tag}`);
  });

  bot.login(token).catch(err => console.log(err));
  
  bots[name] = { client: bot, files: {}, console: [] };
  
  res.send({ success: true });
});

// API لحفظ ملف للبوت
app.post("/api/save-file", (req, res) => {
  const { botName, fileName, content } = req.body;
  if (!bots[botName]) return res.status(404).send("Bot not found");

  bots[botName].files[fileName] = content;
  res.send({ success: true });
});

// API لجلب ملفات بوت
app.get("/api/files/:botName", (req, res) => {
  const bot = bots[req.params.botName];
  if (!bot) return res.status(404).send("Bot not found");
  res.send(bot.files);
});

// WebSocket للـ Console
const wss = new WebSocketServer({ port: 8080 });
wss.on("connection", ws => {
  ws.send(JSON.stringify({ msg: "Connected to console" }));
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
