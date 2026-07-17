let selectedFiles = [];

async function initUploadPage() {
  const browseButton = document.getElementById("browseButton");
  const uploadButton = document.getElementById("uploadButton");
  const fileInput = document.getElementById("selectedFile");
  const progressBar = document.getElementById("uploadProgress");
  const status = document.getElementById("status");

  browseButton.onclick = async () => {
    const files = await window.electronAPI.selectFile();

    if (files) {
      selectedFiles = files;
      console.log(selectedFiles);

      fileInput.value = files.join("\n");
    }
  };

  uploadButton.onclick = () => {
    if (selectedFiles.length === 0) {
      alert("Select a file first");

      return;
    }

    window.electronAPI.uploadFile({
      files: selectedFiles,
    });
  };

  window.electronAPI.onUploadProgress((progress) => {
    if (progress.status == "uploading") {
      progressBar.style.display = "block";
      progressBar.value = progress.percent;
      status.textContent = `${progress.fileName} (${progress.uploadedChunks}/${progress.totalChunks})`;
    } else {
      progressBar.style.display = "none";
      status.textContent = `${progress.status}`;
    }
  });
}
