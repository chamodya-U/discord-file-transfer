let selectedFiles = [];

async function initUploadPage() {
  const browseButton = document.getElementById("browseButton");
  const uploadButton = document.getElementById("uploadButton");
  const fileInput = document.getElementById("selectedFile");

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
}
