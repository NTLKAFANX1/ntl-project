async function addBot() {
  const name = document.getElementById("botName").value;
  const token = document.getElementById("botToken").value;

  const res = await fetch("/api/add-bot", {
    method: "POST",
    headers: {"Content-Type":"application/json"},
    body: JSON.stringify({ name, token })
  });
  const data = await res.json();
  if(data.success) alert("Bot added!");
}
