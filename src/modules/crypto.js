const crypto = require("crypto");

const original = Buffer.from("Hello World");

const key = crypto.scryptSync("password", "salt", 32);

const encrypted = encryptChunk(original, key);

const decrypted = decryptChunk(encrypted, key);

console.log(original.toString());
console.log(decrypted.toString());

console.log(original.equals(decrypted));

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
  const decipher = crypto.createDecipheriv("aes-256-gcm", key, data.iv);

  decipher.setAuthTag(data.authTag);

  return Buffer.concat([decipher.update(data.encrypted), decipher.final()]);
}
