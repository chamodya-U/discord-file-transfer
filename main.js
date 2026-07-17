const { app, BrowserWindow, ipcMain, dialog, Menu } = require("electron");
const fs = require("fs");
const path = require("path");
require("dotenv").config();
const uploadManager = require("./src/modules/uploadManager");
const { login } = require("./src/services/discordService");

let splashWindow;
let mainWindow;

function createSplashWindow() {
  splashWindow = new BrowserWindow({
    width: 450,
    height: 300,
    frame: false,
    resizable: false,
    maximizable: false,
    minimizable: false,
    fullscreenable: false,
    alwaysOnTop: true,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
    },
  });

  splashWindow.loadFile("src/splash.html");
}

function createWindow() {
  const win = new BrowserWindow({
    width: 800,
    height: 600,

    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
    },
  });

  uploadManager.on("progress", (progress) => {
    win.webContents.send("upload-progress", progress);
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
  createSplashWindow();

  try {
    await login(process.env.DISCORD_TOKEN);

    createWindow();

    splashWindow.close();
  } catch (err) {
    console.error(err);
    splashWindow.webContents.send("discord-error", err.message);
  }
});
