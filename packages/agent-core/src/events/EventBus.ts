import { EventEmitter } from "events";

export class EventBus extends EventEmitter {
  private static instance: EventBus;

  private constructor() {
    super();
    // Set max listeners to avoid node warnings
    this.setMaxListeners(100);
  }

  public static getInstance(): EventBus {
    if (!EventBus.instance) {
      EventBus.instance = new EventBus();
    }
    return EventBus.instance;
  }

  public emitAgentEvent(event: string, payload: any): void {
    this.emit(`agent:${event}`, payload);
  }

  public onAgentEvent(event: string, callback: (payload: any) => void): void {
    this.on(`agent:${event}`, callback);
  }

  public emitToolEvent(event: string, payload: any): void {
    this.emit(`tool:${event}`, payload);
  }

  public onToolEvent(event: string, callback: (payload: any) => void): void {
    this.on(`tool:${event}`, callback);
  }
}
