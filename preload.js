const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electronAPI", {
  selectFile: () => {
    return ipcRenderer.invoke("select-file");
  },

  uploadFile: (data) => {
    ipcRenderer.send("upload-file", data);
  },

  onUploadProgress: (callback) => {
    ipcRenderer.on("upload-progress", (event, data) => {
      callback(data);
    });
  },
  onDiscordError: (callback) => {
    ipcRenderer.on("discord-error", (_, message) => callback(message));
  },
});
