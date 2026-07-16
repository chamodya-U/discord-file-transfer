const crypto = require("crypto");
const { splitFile } = require("./chunker");
const { encryptChunk } = require("./crypto");
const fs = require("fs");
const path = require("path");

async function processUpload(filePath, password) {
  const fileId = crypto.randomUUID();

  const outputDir = path.join(process.cwd(), "file-transfer/temp", fileId);
  const databaseDir = path.join(process.cwd(), "file-transfer/database");

  fs.mkdirSync(outputDir, { recursive: true });
  fs.mkdirSync(databaseDir, { recursive: true });

  const chunks = splitFile(filePath);

  const salt = crypto.randomBytes(16);
  const key = crypto.scryptSync(password, salt, 32);

  const metadata = {
    fileId,
    fileName: path.basename(filePath),
    totalChunks: chunks.length,
    salt: salt.toString("base64"),
    algorithm: "aes-256-gcm",
    createdAt: new Date().toISOString(),
    chunks: [],
  };

  const metadataPath = path.join(databaseDir, `${fileId}_metadata.json`);

  fs.writeFileSync(metadataPath, JSON.stringify(metadata, null, 2));

  for (let index = 0; index < chunks.length; index++) {
    try {
      const encrypted = encryptChunk(chunks[index], key);

      const chunkPath = path.join(outputDir, `${fileId}_${index}.json`);

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
    } catch (err) {
      throw new Error(`Failed preparing chunk ${index}: ${err.message}`);
    }
  }

  return {
    fileId,
    outputDir,
    metadataPath,
    totalChunks: chunks.length,
  };
}

module.exports = {
  processUpload,
};
