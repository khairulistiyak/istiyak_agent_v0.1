import { Reflection } from "./Reflection.js";
import assert from "assert";

console.log("🚀 Starting Reflection tests...");

function runTests() {
  // Test 1: Periodic reflection interval (every 5 steps)
  console.log("Testing periodic reflection interval...");
  assert.strictEqual(Reflection.shouldReflect(0, ""), false, "Step 0 should not reflect");
  assert.strictEqual(Reflection.shouldReflect(1, ""), false, "Step 1 should not reflect");
  assert.strictEqual(Reflection.shouldReflect(5, ""), true, "Step 5 should reflect");
  assert.strictEqual(Reflection.shouldReflect(10, ""), true, "Step 10 should reflect");
  assert.strictEqual(Reflection.shouldReflect(14, ""), false, "Step 14 should not reflect");
  assert.strictEqual(Reflection.shouldReflect(15, ""), true, "Step 15 should reflect");

  // Test 2: Error keyword triggers in lastToolResult
  console.log("Testing error keyword triggers (case-insensitivity, matches)...");
  assert.strictEqual(Reflection.shouldReflect(1, "error: something went wrong"), true, "Should reflect on 'error:'");
  assert.strictEqual(Reflection.shouldReflect(1, "Operation failed successfully"), true, "Should reflect on 'failed'");
  assert.strictEqual(Reflection.shouldReflect(1, "Permission Denied to access file"), true, "Should reflect on 'permission denied' (case insensitive)");
  assert.strictEqual(Reflection.shouldReflect(1, "file not found on disk"), true, "Should reflect on 'not found'");
  assert.strictEqual(Reflection.shouldReflect(1, "ENOENT: no such file"), true, "Should reflect on 'enoent'");
  assert.strictEqual(Reflection.shouldReflect(1, "EACCES: permission denied"), true, "Should reflect on 'eacces'");
  assert.strictEqual(Reflection.shouldReflect(1, "Connection timeout"), true, "Should reflect on 'timeout'");
  assert.strictEqual(Reflection.shouldReflect(1, "Syntax Error: unexpected token"), true, "Should reflect on 'syntax error'");
  assert.strictEqual(Reflection.shouldReflect(1, "cannot find module"), true, "Should reflect on 'cannot find'");
  assert.strictEqual(Reflection.shouldReflect(1, "Cannot read property of undefined"), true, "Should reflect on 'undefined'");
  assert.strictEqual(Reflection.shouldReflect(1, "null reference error"), true, "Should reflect on 'null reference'");
  assert.strictEqual(Reflection.shouldReflect(1, "success"), false, "Should not reflect on 'success'");

  // Test 3: Loop detection (3 identical tool names in a row)
  console.log("Testing loop detection...");
  assert.strictEqual(Reflection.shouldReflect(1, "", ["list_files", "view_file", "write_file"]), false, "Distinct tools should not trigger loop reflection");
  assert.strictEqual(Reflection.shouldReflect(1, "", ["list_files", "list_files"]), false, "2 identical tools should not trigger loop reflection");
  assert.strictEqual(Reflection.shouldReflect(1, "", ["list_files", "list_files", "list_files"]), true, "3 identical tools should trigger loop reflection");
  assert.strictEqual(Reflection.shouldReflect(1, "", ["view_file", "list_files", "list_files", "list_files"]), true, "3 identical tools at the end should trigger loop reflection");

  // Test 4: Safety / Non-string inputs for lastToolResult
  console.log("Testing safety/robustness with non-string inputs for lastToolResult...");

  // Undefined / Null / Empty
  assert.strictEqual(Reflection.shouldReflect(1, undefined as any), false, "Should not throw on undefined");
  assert.strictEqual(Reflection.shouldReflect(1, null as any), false, "Should not throw on null");
  assert.strictEqual(Reflection.shouldReflect(1, ""), false, "Should not throw on empty string");

  // Numbers and Booleans
  assert.strictEqual(Reflection.shouldReflect(1, 404 as any), false, "Should not throw on number");
  assert.strictEqual(Reflection.shouldReflect(1, false as any), false, "Should not throw on boolean");

  // Arrays (e.g. ScanProjectTool or ListFilesTool result)
  const arrayResult = ["src/index.ts", "src/agent/Reflection.ts"];
  assert.strictEqual(Reflection.shouldReflect(1, arrayResult as any), false, "Should not throw on string array without errors");

  // Array with error strings inside
  const arrayErrorResult = ["src/index.ts", "Operation failed"];
  assert.strictEqual(Reflection.shouldReflect(1, arrayErrorResult as any), true, "Should trigger reflection if stringified array contains error trigger");

  // Objects
  const objectResult = { status: "success", count: 10 };
  assert.strictEqual(Reflection.shouldReflect(1, objectResult as any), false, "Should not throw on plain object");

  const objectErrorResult = { status: "failed", error: "permission denied" };
  assert.strictEqual(Reflection.shouldReflect(1, objectErrorResult as any), true, "Should trigger reflection if stringified object contains error trigger");

  // Test 5: Reflection prompt building
  console.log("Testing reflection prompt building...");
  const promptWithoutError = Reflection.buildReflectionPrompt([], 3);
  assert.ok(promptWithoutError.includes("[Self-Reflection Check — Step 3]"), "Prompt should contain step count");
  assert.ok(!promptWithoutError.includes("Last Error"), "Prompt should not contain error section if not provided");

  const promptWithError = Reflection.buildReflectionPrompt([], 3, "failed to read file");
  assert.ok(promptWithError.includes("Last Error"), "Prompt should contain error section if provided");
  assert.ok(promptWithError.includes("failed to read file"), "Prompt should contain the specific error message");

  const promptWithLoop = Reflection.buildReflectionPrompt([{} as any, {} as any, {} as any, {} as any, {} as any, {} as any], 3);
  assert.ok(promptWithLoop.includes("Loop Check"), "Prompt should contain loop check section if history length >= 6");

  console.log("✅ All Reflection tests passed successfully!");
}

try {
  runTests();
} catch (error) {
  console.error("❌ Test failed:", error);
  process.exit(1);
}
