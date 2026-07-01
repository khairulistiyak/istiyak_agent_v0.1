import readline from "readline";
import dotenv from "dotenv";
import { startDaemon } from "./daemon.js";
import { runAgent, calculateCost } from "@istiyak/agent-core";

dotenv.config();

const args = process.argv.slice(2);
const isTerminalMode = args.includes("--terminal");

if (isTerminalMode) {
  startTerminalMode();
} else {
  startDaemon();
}

/**
 * Starts the CLI Terminal mode.
 */
function startTerminalMode() {
  console.log("Welcome to ISTIYAK AI Companion - Terminal Mode");
  console.log("-----------------------------------------------");

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  const provider = process.env.AI_PROVIDER || "gemini";
  const model = process.env.AI_MODEL || "gemini-2.5-flash";
  const apiKey = process.env.GEMINI_API_KEY || process.env.OPENAI_API_KEY;

  if (!apiKey) {
    console.error("❌ Error: API key is missing. Set GEMINI_API_KEY or OPENAI_API_KEY environment variables.");
    process.exit(1);
  }

  const messages = [
    {
      role: "system",
      content: "You are ISTIYAK AGENT, an autonomous software engineering expert.",
    },
  ];

  function promptUser() {
    rl.question("\nYou: ", async (userInput) => {
      const trimmed = userInput.trim();
      if (trimmed.toLowerCase() === "exit") {
        console.log("Goodbye!");
        rl.close();
        process.exit(0);
      }

      messages.push({ role: "user", content: trimmed });
      process.stdout.write("Assistant: ");

      try {
        let responseBuffer = "";
        const agentResult = await runAgent({
          messages,
          provider,
          model,
          authMethod: "apiKey",
          apiKey,
          serviceAccountPath: "",
          projectId: "",
          location: "",
          workspacePath: process.cwd(),
          googleSearchEnabled: false,
          onChunk: (chunk) => {
            responseBuffer += chunk;
            process.stdout.write(chunk);
          },
          cloudSandboxEnabled: false,
          token: ""
        });

        messages.push({ role: "assistant", content: responseBuffer });

        const totalTokens = agentResult.inputTokens + agentResult.outputTokens;
        const cost = calculateCost(provider, agentResult.inputTokens, agentResult.outputTokens, model);
        console.log("\n-----------------------------------------------");
        console.log(`Cost: $${cost.toFixed(6)} | Tokens: ${totalTokens}`);
        console.log("-----------------------------------------------");
      } catch (err) {
        console.error(`\n❌ Error: ${err.message}`);
      }

      promptUser();
    });
  }

  promptUser();
}
