let selectedFiles = [];

async function initUploadPage() {
  const browseButton = document.getElementById("browseButton");
  const uploadButton = document.getElementById("uploadButton");
  const fileInput = document.getElementById("selectedFile");
  const progressBar = document.getElementById("uploadProgress");
  const uploadStatus = document.getElementById("upload-status");
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
    if (progress.status == "splitting") {
      status.textContent = `${progress.status} ${progress.fileName} ${progress.current}/${progress.totalChunks}`;
    }
    if (progress.status == "completed") {
      status.textContent = `${progress.status}`;
      progressBar.style.display = "none";
      uploadStatus.style.display = "none";
    }

    if (progress.status == "uploading") {
      progressBar.value = progress.percent;
      uploadStatus.textContent = `${progress.status} ${progress.fileName} (${progress.uploadedChunks}/${progress.totalChunks})`;
      progressBar.style.display = "block";
      uploadStatus.style.display = "block";
    }
  });
}
