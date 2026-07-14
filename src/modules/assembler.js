const fs = require("fs");
const path = require("path");

function assembleChunks(chunkFolder, outputFile, totalChunks) {
  const writeStream = fs.createWriteStream(outputFile);

  for (let i = 0; i < totalChunks; i++) {
    const chunkPath = path.join(chunkFolder, `chunk_${i}.bin`);

    const chunk = fs.readFileSync(chunkPath);

    writeStream.write(chunk);
  }

  writeStream.end();
}

module.exports = {
  assembleChunks,
};
