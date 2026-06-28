import { Message } from "@istiyak/shared-types";
import { VectorMemory } from "../memory/VectorMemory.js";
import { SessionMemory } from "../memory/SessionMemory.js";
import { ContextCompressor } from "../memory/ContextCompressor.js";

export class MemoryManager {
  private session: SessionMemory;
  private workspacePath: string;

  constructor(workspacePath: string) {
    this.session = new SessionMemory();
    this.workspacePath = workspacePath;
  }

  addMessage(msg: Message) {
    this.session.addMessage(msg);
  }

  getMessages(): Message[] {
    return this.session.getMessages();
  }

  getCompressedMessages(): Message[] {
    return ContextCompressor.compress(this.session.getMessages());
  }

  async retrieveContext(query: string, limit = 3) {
    return VectorMemory.search(query, limit);
  }

  clear() {
    this.session.clear();
  }
}
