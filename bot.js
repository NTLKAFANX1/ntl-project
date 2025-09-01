import { Client, GatewayIntentBits } from "discord.js";
import OpenAI from "openai";

// القيم مباشرة من Environment Variables في Render
const BOT_TOKEN = process.env.BOT_TOKEN; 
const OPENAI_KEY = process.env.OPENAI_KEY;

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent] });

const openai = new OpenAI({ apiKey: OPENAI_KEY });

export function startBot() {
  client.once("ready", () => {
    console.log(`${client.user.tag} is online!`);
  });

  client.on("messageCreate", async (message) => {
    if (message.author.bot) return;

    if (message.content === "ping") {
      message.channel.send("pong!");
    } else {
      try {
        const response = await openai.chat.completions.create({
          model: "gpt-4",
          messages: [{ role: "user", content: message.content }]
        });
        message.channel.send(response.choices[0].message.content);
      } catch (err) {
        console.log(err);
      }
    }
  });

  client.login(BOT_TOKEN);
}
