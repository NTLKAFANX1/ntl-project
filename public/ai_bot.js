// ai_bot.js
const readline = require('readline');
const { OpenAI } = require('openai');
require('dotenv').config();

if (!process.env.OPENAI_API_KEY) {
  console.error("❌ يجب تعيين مفتاح OpenAI في المتغير OPENAI_API_KEY");
  process.exit(1);
}

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log("🤖 الذكاء الاصطناعي جاهز! اكتب سؤالك بالبرمجة أو أي استفسار:");

async function askAI(question) {
  try {
    const response = await client.responses.create({
      model: 'gpt-5',
      input: question
    });
    console.log("\n💡 إجابة AI:");
    console.log(response.output_text || "❌ لم يتم الرد");
    promptUser();
  } catch (err) {
    console.error("❌ حدث خطأ:", err.message);
    promptUser();
  }
}

function promptUser() {
  rl.question("\nسؤال: ", async (input) => {
    if (input.toLowerCase() === 'exit' || input.toLowerCase() === 'quit') {
      console.log("👋 تم إغلاق الذكاء الاصطناعي. باي!");
      rl.close();
      process.exit(0);
    } else {
      await askAI(input);
    }
  });
}

promptUser();
