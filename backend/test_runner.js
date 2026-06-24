import { estimateTokens, calculateCost } from "../engine/costTracker.js";
import { compressHistory, runAgent } from "../engine/runner.js";

// Mock streamLLM function by replacing the module or mocking it locally
import * as llmModule from "../engine/llm.js";

async function runTests() {
  console.log("=== Running Onboarding Rule 4: Mock LLM Runner Test Suite ===");

  console.log("\n=== Test 1: Validate history compression mechanism ===");
  // Create history that exceeds MAX_HISTORY_TOKENS (6000 tokens, which is ~24000 characters)
  const largeContent = "a".repeat(25000); // ~6250 tokens
  const messages = [
    { id: "sys", role: "system", content: "System prompt" },
    { id: "msg1", role: "user", content: largeContent },
    { id: "msg2", role: "assistant", content: "Response 1" },
    { id: "msg3", role: "user", content: largeContent },
    { id: "msg4", role: "assistant", content: "Response 2" },
    { id: "msg5", role: "user", content: "Another user prompt" },
    { id: "msg6", role: "assistant", content: "Response 3" },
    { id: "msg7", role: "user", content: "Latest user prompt" }
  ];

  const compressed = compressHistory(messages);
  console.log("Original history length:", messages.length);
  console.log("Compressed history length:", compressed.length);
  
  const hasCompressedPlaceholder = compressed.some(m => m.content.includes("compressed to save tokens"));
  console.log("Has compression warning snippet:", hasCompressedPlaceholder);

  if (!hasCompressedPlaceholder) {
    throw new Error("Test 1 Failed: History was not compressed when exceeding limit");
  }

  console.log("\n=== Test 2: Run Agent with Mock LLM stream responses ===");
  const { setMockStreamLLM } = llmModule;

  // Mock streamLLM implementation to simulate streaming
  setMockStreamLLM(async (
    msgs,
    prov,
    mod,
    auth,
    key,
    saPath,
    projId,
    loc,
    onChunk
  ) => {
    console.log(`[Mock streamLLM] Mocking call to ${prov}/${mod}`);
    const mockResponse = "This is a mock streamed response from the developer agent test suite.";
    
    // Simulate streaming chunks
    const chunks = mockResponse.split(" ");
    for (const chunk of chunks) {
      if (onChunk) onChunk(chunk + " ");
      await new Promise(r => setTimeout(r, 10)); // tiny delay
    }
    
    return mockResponse;
  });

  try {
    const testMsgs = [
      { role: "system", content: "You are a test companion." },
      { role: "user", content: "Hello world" }
    ];

    let streamedOutput = "";
    const result = await runAgent(
      testMsgs,
      "gemini",
      "gemini-2.5-flash",
      "apiKey",
      "mock-key",
      "",
      "",
      "",
      "",
      false,
      (chunk) => {
        streamedOutput += chunk;
      }
    );

    console.log("Agent output received:", result.content);
    console.log("Stream callback output:", streamedOutput);
    console.log("Input tokens calculated:", result.inputTokens);
    console.log("Output tokens calculated:", result.outputTokens);

    if (result.content !== streamedOutput.trim()) {
      throw new Error("Test 2 Failed: Stream callback output mismatch");
    }
    if (result.inputTokens <= 0 || result.outputTokens <= 0) {
      throw new Error("Test 2 Failed: Token estimation returned zero");
    }

    console.log("\n=== Mock LLM Runner integration tests passed successfully! ===");
  } finally {
    // Restore original streamLLM by setting mock to null
    setMockStreamLLM(null);
  }
}

runTests();
