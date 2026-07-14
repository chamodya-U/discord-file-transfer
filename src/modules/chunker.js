const fs = require("fs");

function splitFile(path, chunkSize = 8 * 1024 * 1024) {
  const buffer = fs.readFileSync(path);

  let chunks = [];

  for (let i = 0; i < buffer.length; i += chunkSize) {
    chunks.push(buffer.subarray(i, i + chunkSize));
  }

  return chunks;
}

module.exports = {
  splitFile,
};
