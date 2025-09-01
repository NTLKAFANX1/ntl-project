const express = require('express');
const { spawn } = require('child_process');
const app = express();
app.use(express.json());
app.use(express.static('public'));

app.post('/ask', async (req, res) => {
  const question = req.body.question;
  // نفترض إن llama.cpp شغّال على localhost:8080 يدعم OpenAI endpoint
  const { default: fetch } = await import('node-fetch');
  const apiRes = await fetch('http://localhost:8080/v1/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ messages: [{ role: "user", content: question }], model: "llama2" })
  });
  const json = await apiRes.json();
  res.json({ answer: json.choices[0].message.content });
});

app.listen(process.env.PORT || 3000, () => console.log('AI server running...'));
