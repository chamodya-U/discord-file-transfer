const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const { decryptChunk } = require("./crypto");

function processDecrypt(inputDir, password) {
  // Read metadata
  const metadataPath = fs
    .readdirSync(inputDir)
    .find((file) => file.includes("_metadata.json"));

  const metadata = JSON.parse(
    fs.readFileSync(path.join(inputDir, metadataPath)),
  );

  // recreate key
  const salt = Buffer.from(metadata.salt, "base64");

  const key = crypto.scryptSync(password, salt, 32);

  const decryptedChunks = [];

  for (let i = 0; i < metadata.totalChunks; i++) {
    const chunkPath = path.join(inputDir, `${metadata.fileId}_${i}.json`);

    const encryptedData = JSON.parse(fs.readFileSync(chunkPath));

    const decrypted = decryptChunk(
      {
        encrypted: Buffer.from(encryptedData.data, "base64"),

        iv: Buffer.from(encryptedData.iv, "base64"),

        authTag: Buffer.from(encryptedData.authTag, "base64"),
      },
      key,
    );

    decryptedChunks.push(decrypted);

    console.log(`Decrypted chunk ${i}`);
  }

  return [decryptedChunks, metadata.fileName];
}

module.exports = {
  processDecrypt,
};
