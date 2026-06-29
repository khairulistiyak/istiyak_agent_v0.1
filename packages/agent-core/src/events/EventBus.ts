import { EventEmitter } from "events";

export interface EventPayload {
  timestamp: number;
  [key: string]: any;
}

/**
 * Central event bus for the agent system.
 * Extends EventEmitter with typed events, listener management,
 * event history for debugging, and wildcard support.
 */
class AgentEventBus extends EventEmitter {
  private eventHistory: Array<{ event: string; payload: any; timestamp: number }> = [];
  private static readonly MAX_HISTORY = 100;

  constructor() {
    super();
    this.setMaxListeners(50); // Allow more listeners for complex agent workflows
  }

  /**
   * Emits an event with automatic timestamp injection and history recording.
   */
  override emit(event: string | symbol, ...args: any[]): boolean {
    const eventName = String(event);

    // Record in history
    this.eventHistory.push({
      event: eventName,
      payload: args[0],
      timestamp: Date.now(),
    });

    // Prune old history
    while (this.eventHistory.length > AgentEventBus.MAX_HISTORY) {
      this.eventHistory.shift();
    }

    // Also emit a wildcard event for global listeners
    if (eventName !== "*") {
      super.emit("*", eventName, ...args);
    }

    return super.emit(event, ...args);
  }

  /**
   * Returns the recent event history for debugging.
   */
  getHistory(count = 20): Array<{ event: string; payload: any; timestamp: number }> {
    return this.eventHistory.slice(-count);
  }

  /**
   * Returns events matching a specific event name pattern.
   */
  getHistoryByEvent(eventName: string, count = 20): Array<{ event: string; payload: any; timestamp: number }> {
    return this.eventHistory
      .filter(e => e.event === eventName)
      .slice(-count);
  }

  /**
   * Clears the event history.
   */
  clearHistory(): void {
    this.eventHistory = [];
  }

  /**
   * Returns the number of registered listeners for all events.
   */
  getListenerStats(): Record<string, number> {
    const stats: Record<string, number> = {};
    for (const event of this.eventNames()) {
      stats[String(event)] = this.listenerCount(event);
    }
    return stats;
  }

  /**
   * Registers a subscriber that receives ALL events.
   * Useful for telemetry, logging, or forwarding events to UI.
   */
  onAny(callback: (event: string, data: any) => void): void {
    this.on("*", callback);
  }
}

export const EventBus = new AgentEventBus();
