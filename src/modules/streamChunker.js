const fs = require("fs");

function readChunks(filePath, chunkSize = 8 * 1024 * 1024) {
  const stream = fs.createReadStream(filePath, {
    highWaterMark: chunkSize,
  });

  return stream;
}

module.exports = {
  readChunks,
};
