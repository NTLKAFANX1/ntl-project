// ai_bot.js
const axios = require('axios');
const cheerio = require('cheerio');

class LocalAI {
  constructor() {
    this.wordsDB = {};  // قاعدة بيانات الكلمات العربية
    this.codeDB = {};   // قاعدة بيانات الأكواد الجاهزة
  }

  // جلب الكلمات العربية من موقع
  async fetchArabicWords() {
    try {
      const url = 'https://www.almaany.com/ar/dict/ar-en/';
      const { data } = await axios.get(url);
      const $ = cheerio.load(data);

      $('div.result').each((i, el) => {
        const word = $(el).find('a.word').text().trim();
        const meaning = $(el).find('div.meaning').text().trim();
        if(word && meaning) this.wordsDB[word] = meaning;
      });

      console.log('✅ تم جلب الكلمات العربية:', Object.keys(this.wordsDB).length);
    } catch (err) {
      console.error('❌ فشل في جلب الكلمات:', err.message);
    }
  }

  // جلب أكواد جاهزة من GitHub
  async fetchDiscordJsExamples() {
    try {
      const url = 'https://raw.githubusercontent.com/discordjs/discord.js/main/examples/ping-pong.js';
      const { data } = await axios.get(url);
      this.codeDB['pingPong'] = data;
      console.log('✅ تم جلب أكواد Discord.js');
    } catch (err) {
      console.error('❌ فشل في جلب الأكواد:', err.message);
    }
  }

  // تهيئة الذكاء الاصطناعي
  async init() {
    await this.fetchArabicWords();
    await this.fetchDiscordJsExamples();
  }

  // الرد على الأسئلة
  ask(question) {
    question = question.toLowerCase();

    // البحث عن كلمة عربية
    for (let word in this.wordsDB) {
      if (question.includes(word.toLowerCase())) {
        return `💡 معنى "${word}": ${this.wordsDB[word]}`;
      }
    }

    // البحث عن أمثلة أكواد
    if(question.includes('discord') || question.includes('بوت')) {
      return this.codeDB['pingPong'] || '❌ لا يوجد كود متاح حالياً.';
    }

    return '❌ لم أجد إجابة لهذا السؤال.';
  }
}

// مثال استخدام
(async () => {
  const ai = new LocalAI();
  await ai.init();

  console.log(ai.ask('ما معنى كلمة كتاب؟')); // اختبار معنى كلمة
  console.log(ai.ask('أريد كود بوت Discord')); // اختبار الأكواد
})();

module.exports = LocalAI;
