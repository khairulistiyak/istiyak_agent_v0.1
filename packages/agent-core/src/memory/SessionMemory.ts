import { Message } from "@istiyak/shared-types";

export class SessionMemory {
  private messages: Message[] = [];

  addMessage(msg: Message) {
    this.messages.push(msg);
  }

  getMessages(): Message[] {
    return this.messages;
  }

  clear() {
    this.messages = [];
  }
}
