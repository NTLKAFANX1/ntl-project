document.addEventListener("DOMContentLoaded", () => {
  const botList = document.getElementById("bot-list");
  const addBotForm = document.getElementById("add-bot-form");
  const botNameInput = document.getElementById("bot-name");
  const botTokenInput = document.getElementById("bot-token");

  async function loadBots() {
    const res = await fetch("/bots.json");
    const bots = await res.json();
    botList.innerHTML = "";
    for (let bot of bots) {
      const li = document.createElement("li");
      li.classList.add("bot-item");
      li.innerHTML = `
        <span>${bot.name}</span>
        <button class="open-btn">Open</button>
        <button class="start-btn">${bot.running ? "Stop" : "Start"}</button>
      `;
      li.querySelector(".open-btn").addEventListener("click", () => {
        window.location.href = `/bot.html?name=${encodeURIComponent(bot.name)}`;
      });
      li.querySelector(".start-btn").addEventListener("click", async () => {
        const action = bot.running ? "stop" : "start";
        await fetch(`/bot/${bot.name}/${action}`, { method: "POST" });
        bot.running = !bot.running;
        li.querySelector(".start-btn").textContent = bot.running ? "Stop" : "Start";
      });
      botList.appendChild(li);
    }
  }

  loadBots();

  addBotForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const name = botNameInput.value.trim();
    const token = botTokenInput.value.trim();
    if (!name || !token) return alert("Name & Token required!");
    await fetch("/bot/add", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, token })
    });
    botNameInput.value = "";
    botTokenInput.value = "";
    loadBots();
  });
});
