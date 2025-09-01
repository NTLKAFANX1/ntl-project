import express from "express";
import fs from "fs";
import path from "path";

const app = express();
app.use(express.json());
app.use(express.static("public"));

const botsFile = path.join("./public", "bots.json");
if (!fs.existsSync(botsFile)) fs.writeFileSync(botsFile, JSON.stringify([]));

app.get("/bots.json", (req, res) => {
  const bots = JSON.parse(fs.readFileSync(botsFile));
  res.json(bots);
});

app.post("/bot/add", (req, res) => {
  const { name, token } = req.body;
  const bots = JSON.parse(fs.readFileSync(botsFile));
  bots.push({ name, token, running: false, files: [] });
  fs.writeFileSync(botsFile, JSON.stringify(bots));
  res.sendStatus(200);
});

app.post("/bot/:name/:action", (req, res) => {
  const { name, action } = req.params;
  const bots = JSON.parse(fs.readFileSync(botsFile));
  const bot = bots.find(b => b.name === name);
  if (bot) bot.running = action === "start";
  fs.writeFileSync(botsFile, JSON.stringify(bots));
  res.sendStatus(200);
});

app.get("/bot/:name/file", (req, res) => {
  const bots = JSON.parse(fs.readFileSync(botsFile));
  const bot = bots.find(b => b.name === req.params.name);
  res.json(bot.files[0] || {});
});

app.post("/bot/:name/save", (req, res) => {
  const { name: fileName, code } = req.body;
  const bots = JSON.parse(fs.readFileSync(botsFile));
  const bot = bots.find(b => b.name === req.params.name);
  if (!bot.files[0]) bot.files[0] = {};
  bot.files[0].name = fileName;
  bot.files[0].code = code;
  fs.writeFileSync(botsFile, JSON.stringify(bots));
  res.sendStatus(200);
});

const port = process.env.PORT || 10000;
app.listen(port, () => console.log(`Server running on port ${port}`));
