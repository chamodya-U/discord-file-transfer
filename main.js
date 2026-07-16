const { app, BrowserWindow, ipcMain, dialog } = require("electron");
const fs = require("fs");
const path = require("path");
/* const crypto = require("crypto");
const { splitFile } = require("./src/modules/chunker"); */
const { assembleChunks } = require("./src/modules/assembler");
const { processUpload } = require("./src/modules/uploadProcessor");
const { encryptChunk, decryptChunk } = require("./src/modules/crypto");

function createWindow() {
  const win = new BrowserWindow({
    width: 800,
    height: 600,

    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
    },
  });

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

ipcMain.on("upload-file", (event, data) => {
  //conformation message
  console.log("Received from UI:");
  console.log(data);

  processUpload(data.path, data.password);

  //just a test
  /*   assembleChunks(
    outputDir,
    path.join(__dirname, "recovered.mp4"),
    chunks.length,
  );

  console.log("File reassembled!"); */
});

app.whenReady().then(() => {
  createWindow();
});
