const EventEmitter = require("events");
const fs = require("fs");
const path = require("path");

const { processUpload } = require("./uploadProcessor");
const { uploadFile } = require("../services/discordService");

class UploadManager extends EventEmitter {
  constructor() {
    super();

    this.fileQueue = [];
    this.uploadQueue = [];

    this.isSplitting = false;
    this.isUploading = false;

    // When splitter finishes a file
    this.on("fileReady", () => {
      this.processUploadQueue();
    });
  }

  addFiles(files, password) {
    for (const file of files) {
      this.fileQueue.push({
        file,
        password,
      });
    }

    this.startSplitter();
  }

  async startSplitter() {
    if (this.isSplitting) return;

    this.isSplitting = true;

    while (this.fileQueue.length > 0) {
      const job = this.fileQueue.shift();

      console.log("Splitting:", job.file);

      const prepared = await processUpload(job.file, job.password);

      this.uploadQueue.push(prepared);

      console.log("Ready:", prepared.fileId);

      // Wake uploader
      this.emit("fileReady");
    }

    this.isSplitting = false;
  }

  async processUploadQueue() {
    if (this.isUploading) return;

    this.isUploading = true;

    while (this.uploadQueue.length > 0) {
      const file = this.uploadQueue.shift();

      await this.uploadPreparedFile(file);
    }

    this.isUploading = false;
  }

  async uploadPreparedFile(prepared) {
    console.log("Uploading:", prepared.fileId);

    const metadata = JSON.parse(fs.readFileSync(prepared.metadataPath));

    for (let index = 0; index < prepared.totalChunks; index++) {
      const chunkPath = path.join(
        prepared.outputDir,
        `${prepared.fileId}_${index}.json`,
      );

      //uploading
      const message = await uploadFile(
        process.env.DISCORD_CHANNEL_ID,
        chunkPath,
      );

      metadata.chunks.push({
        index,

        messageId: message.id,
      });

      fs.unlinkSync(chunkPath);

      console.log(`Uploaded ${index + 1}/${prepared.totalChunks}`);
    }

    fs.writeFileSync(prepared.metadataPath, JSON.stringify(metadata, null, 2));

    fs.rmSync(prepared.outputDir, {
      recursive: true,
      force: true,
    });

    console.log("Finished:", prepared.fileId);
  }
}

module.exports = new UploadManager();
