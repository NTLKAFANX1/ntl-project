import express from "express";
import fs from "fs";
import path from "path";
import { Client, GatewayIntentBits } from "discord.js";

const app = express();
const PORT = process.env.PORT || 10000;

app.use(express.json());
app.use(express.static("public"));

let bots = {};

app.post("/add-bot", (req, res) => {
    const { name, token } = req.body;
    if (!name || !token) return res.status(400).send("Name or token missing");

    if (bots[name]) return res.status(400).send("Bot already exists");

    const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent] });

    client.on("ready", () => {
        console.log(`${name} logged in!`);
    });

    client.on("messageCreate", msg => {
        console.log(`[${name}] ${msg.author.tag}: ${msg.content}`);
    });

    client.login(token).catch(err => console.log(`Failed login for ${name}:`, err));

    bots[name] = { client, token, code: "" };

    res.send({ success: true });
});

app.post("/save-bot-code", (req, res) => {
    const { name, code } = req.body;
    if (!bots[name]) return res.status(404).send("Bot not found");

    bots[name].code = code;
    try {
        eval(code); // ينفذ أكواد البوت ديناميكياً
        res.send({ success: true });
    } catch (err) {
        res.status(500).send({ error: err.toString() });
    }
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
