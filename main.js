const { app, BrowserWindow, ipcMain, dialog, Menu } = require("electron");
const fs = require("fs");
const path = require("path");
require("dotenv").config();
const { assembleChunks } = require("./src/modules/assembler");
const { processUpload } = require("./src/modules/uploadProcessor");
const { encryptChunk, decryptChunk } = require("./src/modules/crypto");
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
    properties: ["openFile"],
  });

  if (result.canceled) {
    return null;
  }

  return result.filePaths[0];
});

ipcMain.on("upload-file", async (event, data) => {
  await processUpload(data.path, data.password);
});

app.whenReady().then(async () => {
  await login(process.env.DISCORD_TOKEN);

  createWindow();
});
