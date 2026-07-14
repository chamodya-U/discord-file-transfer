const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electronAPI", {
  selectFile: () => {
    return ipcRenderer.invoke("select-file");
  },

  uploadFile: (data) => {
    ipcRenderer.send("upload-file", data);
  },
});
