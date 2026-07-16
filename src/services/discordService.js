const fs = require("fs");
const { Client, GatewayIntentBits } = require("discord.js");

const client = new Client({
  intents: [GatewayIntentBits.Guilds],
});

let ready = false;

async function login(token) {
  await client.login(token);

  ready = true;

  console.log(`Logged in as ${client.user.tag}`);
}

async function uploadFile(channelId, filePath) {
  if (!ready) {
    throw new Error("Discord client is not ready");
  }

  const channel = await client.channels.fetch(channelId);

  const fileSize = fs.statSync(filePath).size;

  let uploaded = 0;

  const stream = fs.createReadStream(filePath);

  stream.on("data", (chunk) => {
    uploaded += chunk.length;

    const percent = ((uploaded / fileSize) * 100).toFixed(2);

    process.stdout.write(`\rUploading: ${percent}% `);
  });

  try {
    const message = await channel.send({
      files: [filePath],
    });

    return message;
  } catch (err) {
    console.error("Discord upload error:", err.message);

    throw err;
  }
}

module.exports = {
  login,
  uploadFile,
};
