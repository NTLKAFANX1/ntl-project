import express from 'express';
import fetch from 'node-fetch';
import cors from 'cors';

const app=express();
app.use(cors());
app.use(express.json());
app.use(express.static('public')); // ضع index.html داخل مجلد public

app.post('/ask', async(req,res)=>{
  const prompt=req.body.prompt;
  try{
    const response=await fetch("https://api.openai.com/v1/chat/completions",{
      method:"POST",
      headers:{
        "Content-Type":"application/json",
        "Authorization":`Bearer ${process.env.OPENAI_KEY}`
      },
      body: JSON.stringify({
        model:"gpt-4",
        messages:[{role:"user",content:prompt}]
      })
    });
    const data=await response.json();
    res.json({response:data.choices[0].message.content});
  }catch(e){
    res.json({response:"حدث خطأ في الاتصال بـ OpenAI"});
  }
});

app.listen(process.env.PORT||3000,()=>console.log("Server running"));
