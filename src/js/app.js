const content = document.getElementById("content");

async function loadPage(page) {
  const response = await fetch(`pages/${page}.html`);

  const html = await response.text();

  content.innerHTML = html;

  // Initialize page logic
  switch (page) {
    case "upload":
      initUploadPage();
      break;

    case "download":
      initDownloadPage();
      break;

    case "history":
      initHistoryPage();
      break;

    case "settings":
      initSettingsPage();
      break;
  }
}

document.getElementById("uploadBtn").addEventListener("click", () => {
  loadPage("upload");
});

document.getElementById("downloadBtn").addEventListener("click", () => {
  loadPage("download");
});

document.getElementById("historyBtn").addEventListener("click", () => {
  loadPage("history");
});

document.getElementById("settingsBtn").addEventListener("click", () => {
  loadPage("settings");
});

// Default page
loadPage("upload");
