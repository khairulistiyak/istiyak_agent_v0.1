import { ChatMessage } from "@istiyak/shared-types";

export class SessionMemory {
  private messages: ChatMessage[] = [];

  public addMessage(message: ChatMessage): void {
    this.messages.push(message);
  }

  public getMessages(): ChatMessage[] {
    return this.messages;
  }

  public clear(): void {
    this.messages = [];
  }
}

export default SessionMemory;
