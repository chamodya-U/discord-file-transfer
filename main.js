const { app, BrowserWindow, ipcMain, dialog } = require("electron");
const fs = require("fs");
const path = require("path");
const { splitFile } = require("./src/modules/chunker");
const { assembleChunks } = require("./src/modules/assembler");

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
  console.log("Received from UI:");
  console.log(data);

  const chunks = splitFile(data.path);

  console.log("Total chunks:", chunks.length);

  const outputDir = path.join(__dirname, "chunks");

  // Create chunks folder if it doesn't exist
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir);
  }

  chunks.forEach((chunk, index) => {
    const chunkPath = path.join(outputDir, `chunk_${index}.bin`);

    fs.writeFileSync(chunkPath, chunk);

    console.log(`Saved chunk ${index}:`, chunk.length / 1024 / 1024, "MB");
  });

  assembleChunks(
    outputDir,
    path.join(__dirname, "recovered.mp4"),
    chunks.length,
  );

  console.log("File reassembled!");
});

app.whenReady().then(() => {
  createWindow();
});
