document.addEventListener("DOMContentLoaded", () => {
  const params = new URLSearchParams(window.location.search);
  const botName = params.get("name");
  const title = document.getElementById("bot-title");
  const fileNameInput = document.getElementById("file-name");
  const fileCodeInput = document.getElementById("file-code");
  const saveBtn = document.getElementById("save-btn");
  const consoleLog = document.getElementById("console-log");

  title.textContent = `Editing: ${botName}`;

  async function loadBotFile() {
    const res = await fetch(`/bot/${botName}/file`);
    const data = await res.json();
    fileNameInput.value = data.name || "";
    fileCodeInput.value = data.code || "";
  }

  saveBtn.addEventListener("click", async () => {
    await fetch(`/bot/${botName}/save`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: fileNameInput.value, code: fileCodeInput.value })
    });
    consoleLog.textContent += `Saved ${fileNameInput.value}\n`;
  });

  loadBotFile();
});
