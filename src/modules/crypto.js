const crypto = require("crypto");

function encryptChunk(chunk, key) {
  const iv = crypto.randomBytes(12);

  const cipher = crypto.createCipheriv("aes-256-gcm", key, iv);

  const encrypted = Buffer.concat([cipher.update(chunk), cipher.final()]);

  const authTag = cipher.getAuthTag();

  return {
    iv,
    encrypted,
    authTag,
  };
}

function decryptChunk(data, key) {
  try {
    const decipher = crypto.createDecipheriv("aes-256-gcm", key, data.iv);

    decipher.setAuthTag(data.authTag);

    return Buffer.concat([decipher.update(data.encrypted), decipher.final()]);
  } catch (err) {
    throw new Error(
      "Failed to decrypt chunk. The password may be incorrect or the data has been modified.",
    );
  }
}

module.exports = {
  encryptChunk,
  decryptChunk,
};
