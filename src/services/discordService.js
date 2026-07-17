const fs = require("fs");
const { Client, GatewayIntentBits } = require("discord.js");

const client = new Client({
  intents: [GatewayIntentBits.Guilds],
});

let ready = false;

async function login(token) {
  try {
    await client.login(token);

    ready = true;

    console.log(`Logged in as ${client.user.tag}`);
  } catch (err) {
    console.error("Login error:", err.message);
    throw err;
  }
}

async function uploadFile(channelId, filePath) {
  if (!ready) {
    throw new Error("Discord client is not ready");
  }

  const channel = await client.channels.fetch(channelId);

  const fileSize = fs.statSync(filePath).size;

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
