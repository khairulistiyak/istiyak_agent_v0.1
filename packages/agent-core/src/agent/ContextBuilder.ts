import { Message } from "@istiyak/shared-types";
import { compressHistory } from "./AgentRunner.js";

export class ContextBuilder {
  static buildContext(messages: Message[]): Message[] {
    return compressHistory(messages);
  }
}
