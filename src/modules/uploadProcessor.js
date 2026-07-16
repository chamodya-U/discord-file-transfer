const crypto = require("crypto");
const { splitFile } = require("./chunker");
const { encryptChunk } = require("./crypto");
const fs = require("fs");
const path = require("path");

function processUpload(filePath, password) {
  //create output path
  const outputDir = path.join(process.cwd(), "chunks");

  // Create chunks folder if it doesn't exist
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir);
  }

  // Split
  const chunks = splitFile(filePath); // default 8 MB

  console.log("Total chunks:", chunks.length);

  // Encrypt
  const salt = crypto.randomBytes(16);
  const key = crypto.scryptSync(password, salt, 32);
  const fileId = crypto.randomUUID();

  const metadata = {
    fileId: fileId,
    fileName: path.basename(filePath),
    totalChunks: chunks.length,
    salt: salt.toString("base64"),
    algorithm: "aes-256-gcm",
  };

  chunks.forEach((chunk, index) => {
    try {
      const encryptedData = encryptChunk(chunk, key);

      const chunkPath = path.join(outputDir, `${fileId}_${index}.json`);

      const output = {
        fileId: fileId,
        index: index,
        iv: encryptedData.iv.toString("base64"),
        authTag: encryptedData.authTag.toString("base64"),
        data: encryptedData.encrypted.toString("base64"),
      };

      fs.writeFileSync(chunkPath, JSON.stringify(output));

      console.log(`Encrypted chunk ${index}`);
    } catch (err) {
      console.error(err.message);

      // tell UI upload failed
    }
  });

  const metadataPath = path.join(outputDir, `${fileId}_metadata.json`);

  fs.writeFileSync(metadataPath, JSON.stringify(metadata, null, 2));

  // Save
  // Later: Upload to Discord
}

module.exports = {
  processUpload,
};
