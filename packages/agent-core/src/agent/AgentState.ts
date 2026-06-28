import { Message } from "@istiyak/shared-types";

export class AgentState {
  stepsCount = 0;
  messages: Message[] = [];
  status: "idle" | "running" | "completed" | "error" = "idle";
  cost = 0;

  addMessage(msg: Message) {
    this.messages.push(msg);
  }
}
