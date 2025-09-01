import express from "express";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { startBot } from "./bot.js";

const app = express();
const PORT = process.env.PORT || 10000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

app.use(express.static(join(__dirname, "public")));

app.get("/", (req, res) => {
  res.sendFile(join(__dirname, "public", "index.html"));
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

startBot(); // تشغيل البوت مباشرة عند رفع السيرفر
