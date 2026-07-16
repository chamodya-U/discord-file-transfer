const { app, BrowserWindow, ipcMain, dialog, Menu } = require("electron");
const fs = require("fs");
const path = require("path");
require("dotenv").config();
const uploadManager = require("./src/modules/uploadManager");
const { login } = require("./src/services/discordService");

function createWindow() {
  const win = new BrowserWindow({
    width: 800,
    height: 600,

    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
    },
  });
  Menu.setApplicationMenu(null);

  win.loadFile("src/index.html");
}

//get input file
ipcMain.handle("select-file", async () => {
  const result = await dialog.showOpenDialog({
    properties: ["openFile", "multiSelections"],
  });

  if (result.canceled) {
    return null;
  }

  return result.filePaths;
});

ipcMain.on("upload-file", (event, data) => {
  try {
    uploadManager.addFiles(data.files, process.env.UPLOAD_PASSWORD);
  } catch (err) {
    console.error("Upload failed:", err);
  }
});

app.whenReady().then(async () => {
  await login(process.env.DISCORD_TOKEN);

  createWindow();
});
