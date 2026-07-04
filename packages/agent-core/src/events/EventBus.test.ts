import { describe, it, expect, vi } from "vitest";
import { EventBus } from "./EventBus.js";

describe("EventBus", () => {
  it("should record emitted events in history", () => {
    EventBus.clearHistory();
    const payload = { data: "test-data" };
    EventBus.emit("custom-event", payload);

    const history = EventBus.getHistory();
    expect(history.length).toBe(1);
    expect(history[0].event).toBe("custom-event");
    expect(history[0].payload).toEqual(payload);
  });

  it("should support wildcard/onAny listener", () => {
    const callback = vi.fn();
    EventBus.onAny(callback);

    EventBus.emit("another-event", { key: "value" });
    expect(callback).toHaveBeenCalledWith("another-event", { key: "value" });
  });

  it("should fetch history by event name", () => {
    EventBus.clearHistory();
    EventBus.emit("eventA", { id: 1 });
    EventBus.emit("eventB", { id: 2 });
    EventBus.emit("eventA", { id: 3 });

    const aHistory = EventBus.getHistoryByEvent("eventA");
    expect(aHistory.length).toBe(2);
    expect(aHistory[0].payload.id).toBe(1);
    expect(aHistory[1].payload.id).toBe(3);
  });

  it("should calculate listener stats", () => {
    // Clear all listeners to isolate stats test
    EventBus.removeAllListeners();
    
    EventBus.on("test1", () => {});
    EventBus.on("test1", () => {});
    EventBus.on("test2", () => {});

    const stats = EventBus.getListenerStats();
    expect(stats.test1).toBe(2);
    expect(stats.test2).toBe(1);
  });
});
