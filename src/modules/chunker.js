const fs = require("fs");

//default file size
const size = 8;

function splitFile(path, chunkSize = size * 1024 * 1024) {
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
