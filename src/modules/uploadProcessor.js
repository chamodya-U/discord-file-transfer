const crypto = require("crypto");
const { splitFile } = require("./chunker");
const { encryptChunk } = require("./crypto");
const fs = require("fs");
const path = require("path");
const { uploadFile } = require("../services/discordService");

async function processUpload(filePath, password) {
  const fileId = crypto.randomUUID();

  const outputDir = path.join(process.cwd(), "file-transfer/temp", fileId);
  const databaseDir = path.join(process.cwd(), "file-transfer/database");

  fs.mkdirSync(outputDir, { recursive: true });
  fs.mkdirSync(databaseDir, { recursive: true });

  const metadataPath = path.join(databaseDir, `${fileId}_metadata.json`);

  const chunks = splitFile(filePath);

  const salt = crypto.randomBytes(16);
  const key = crypto.scryptSync(password, salt, 32);

  const metadata = {
    fileId: fileId,
    fileName: path.basename(filePath),
    totalChunks: chunks.length,
    salt: salt.toString("base64"),
    algorithm: "aes-256-gcm",
    createdAt: new Date().toISOString(),
    chunks: [],
  };

  fs.writeFileSync(metadataPath, JSON.stringify(metadata, null, 2));

  for (let index = 0; index < chunks.length; index++) {
    const chunk = chunks[index];

    try {
      const encryptedData = encryptChunk(chunk, key);

      const chunkPath = path.join(outputDir, `${fileId}_${index}.json`);

      const output = {
        fileId,
        index,
        iv: encryptedData.iv.toString("base64"),
        authTag: encryptedData.authTag.toString("base64"),
        data: encryptedData.encrypted.toString("base64"),
      };

      fs.writeFileSync(chunkPath, JSON.stringify(output));

      const message = await uploadFile(
        process.env.DISCORD_CHANNEL_ID,
        chunkPath,
      );

      metadata.chunks.push({
        index,
        messageId: message.id,
      });

      fs.writeFileSync(metadataPath, JSON.stringify(metadata, null, 2));

      //fs.unlinkSync(chunkPath);

      console.log(`Uploaded chunk ${index}`);
    } catch (err) {
      console.error(`Chunk ${index} failed:`, err.message);

      return {
        fileId,
        metadataPath,
      };
    }
  }

  // Save
  // Later: Upload to Discord
}

module.exports = {
  processUpload,
};
