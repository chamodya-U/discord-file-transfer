window.electronAPI.onDiscordError((message) => {
  document.getElementById("status").textContent = message;
});
