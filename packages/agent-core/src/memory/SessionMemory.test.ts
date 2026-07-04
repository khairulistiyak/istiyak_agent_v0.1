import { describe, it, expect } from "vitest";
import { SessionMemory } from "./SessionMemory.js";
import { Message } from "@istiyak/shared-types";

describe("SessionMemory", () => {
  it("should add messages and retrieve them", () => {
    const memory = new SessionMemory();
    const msg: Message = { role: "user", content: "hello" };
    memory.addMessage(msg);
    expect(memory.getMessageCount()).toBe(1);
    expect(memory.getMessages()[0]).toEqual(msg);
  });

  it("should fetch recent messages", () => {
    const memory = new SessionMemory();
    memory.addMessage({ role: "user", content: "1" });
    memory.addMessage({ role: "assistant", content: "2" });
    memory.addMessage({ role: "user", content: "3" });
    expect(memory.getRecentMessages(2)).toEqual([
      { role: "assistant", content: "2" },
      { role: "user", content: "3" }
    ]);
  });

  it("should calculate stats", () => {
    const memory = new SessionMemory();
    memory.addMessage({ role: "system", content: "sys" });
    memory.addMessage({ role: "user", content: "hello" });
    const stats = memory.getStats();
    expect(stats.messageCount).toBe(2);
    expect(stats.roles.system).toBe(1);
    expect(stats.roles.user).toBe(1);
  });

  it("should serialize and deserialize session", () => {
    const memory = new SessionMemory({ maxMessages: 50, maxTokens: 20000 });
    memory.addMessage({ role: "user", content: "serialization test" });
    const jsonStr = memory.serialize();
    
    const restored = SessionMemory.deserialize(jsonStr);
    expect(restored.getMessageCount()).toBe(1);
    expect(restored.getMessages()[0].content).toBe("serialization test");
    expect(restored.getStats().maxMessages).toBe(50);
    expect(restored.getStats().maxTokens).toBe(20000);
  });

  it("should compress history when limits are exceeded", () => {
    // Set low limits to trigger auto-compression
    const memory = new SessionMemory({ maxMessages: 5, maxTokens: 1000 });
    memory.addMessage({ role: "system", content: "System setup instructions" });
    
    for (let i = 0; i < 10; i++) {
      memory.addMessage({ role: "user", content: `This is normal conversation turn number ${i}` });
    }
    
    // Auto-compression should have condensed the conversation
    expect(memory.getMessageCount()).toBeLessThan(11);
    expect(memory.getMessages().some(m => m.content.includes("messages compressed"))).toBe(true);
  });
});
