const fs = require("fs");
const size = 7;

function readChunks(filePath, chunkSize = size * 1024 * 1024) {
  const stream = fs.createReadStream(filePath, {
    highWaterMark: chunkSize,
  });

  return stream;
}

module.exports = {
  readChunks,
};
