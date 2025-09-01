document.addEventListener("DOMContentLoaded", () => {
  const tokenInput = document.getElementById("botToken");
  const nameInput = document.getElementById("botName");
  const startBtn = document.getElementById("startBotBtn");
  const consoleOutput = document.getElementById("console");

  function logToConsole(text) {
    const msg = document.createElement("div");
    msg.textContent = text;
    consoleOutput.appendChild(msg);
    consoleOutput.scrollTop = consoleOutput.scrollHeight;
  }

  startBtn.addEventListener("click", async () => {
    const name = nameInput.value.trim();
    const token = tokenInput.value.trim();

    if (!name || !token) {
      alert("اكتب اسم البوت والتوكن!");
      return;
    }

    logToConsole(`🚀 بدء تشغيل البوت ${name}...`);

    const response = await fetch("/api/start-bot", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        name,
        token
      })
    });

    const data = await response.json();
    if (data.success) {
      logToConsole(`✅ ${data.message}`);
    } else {
      logToConsole(`❌ خطأ: ${data.error || "لم يتم التشغيل"}`);
    }
  });
});
