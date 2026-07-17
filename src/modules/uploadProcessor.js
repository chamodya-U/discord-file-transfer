const crypto = require("crypto");
const { readChunks } = require("./streamChunker");
const { encryptChunk } = require("./crypto");
const fs = require("fs");
const path = require("path");

async function processUpload(filePath, password) {
  const fileId = crypto.randomUUID();

  const outputDir = path.join(process.cwd(), "file-transfer/temp", fileId);
  const databaseDir = path.join(process.cwd(), "file-transfer/database");

  fs.mkdirSync(outputDir, { recursive: true });
  fs.mkdirSync(databaseDir, { recursive: true });

  const stream = readChunks(filePath);
  const stats = fs.statSync(filePath);

  const totalChunks = Math.ceil(stats.size / (8 * 1024 * 1024));

  const salt = crypto.randomBytes(16);
  const key = crypto.scryptSync(password, salt, 32);

  const metadata = {
    fileId,
    fileName: path.basename(filePath),
    totalChunks,
    salt: salt.toString("base64"),
    algorithm: "aes-256-gcm",
    createdAt: new Date().toISOString(),
    chunks: [],
  };

  const metadataPath = path.join(databaseDir, `${fileId}_metadata.json`);

  fs.writeFileSync(metadataPath, JSON.stringify(metadata, null, 2));

  let index = 0;

  for await (const chunk of stream) {
    try {
      const encrypted = encryptChunk(chunk, key);

      const chunkPath = path.join(outputDir, `${fileId}_${index}.json`);

      await fs.promises.writeFile(
        chunkPath,
        JSON.stringify({
          fileId,
          index,
          iv: encrypted.iv.toString("base64"),
          authTag: encrypted.authTag.toString("base64"),
          data: encrypted.encrypted.toString("base64"),
        }),
      );
      fs.writeFileSync(
        chunkPath,
        JSON.stringify({
          fileId,
          index,
          iv: encrypted.iv.toString("base64"),
          authTag: encrypted.authTag.toString("base64"),
          data: encrypted.encrypted.toString("base64"),
        }),
      );

      index++;
    } catch (err) {
      throw new Error(`Failed preparing chunk ${index}: ${err.message}`);
    }
  }

  return {
    fileId,
    outputDir,
    metadataPath,
    totalChunks: index,
  };
}

module.exports = {
  processUpload,
};
