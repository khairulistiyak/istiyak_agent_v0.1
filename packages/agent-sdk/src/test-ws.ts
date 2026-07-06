import { Client } from "./Client.js";

async function runTest() {
  console.log("Initializing Agent SDK Client...");
  const client = new Client("http://localhost:3001"); // Will connect to ws://localhost:3001/ws

  try {
    console.log("Connecting...");
    await client.connect();
    console.log("Connected successfully!");

    console.log("Sending chat request...");
    const response = await client.chat({
      messages: [{ role: "user", content: "Hi, just reply with 'pong'." }],
      onChunk: (chunk: string) => {
        process.stdout.write(chunk);
      },
      onPermissionRequest: async (reqId: string, command: string) => {
        console.log(`\n[Agent Requested Permission] Command: ${command}`);
        return true;
      }
    });

    console.log("\n\nFull response received:");
    console.log(response);

  } catch (err) {
    console.error("Test failed:", err);
  } finally {
    client.disconnect();
    console.log("Disconnected.");
  }
}

runTest();
