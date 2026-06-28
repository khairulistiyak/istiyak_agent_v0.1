import { runAgent, RunnerOptions } from "./AgentRunner.js";

export class Agent {
  private options: RunnerOptions;

  constructor(options: RunnerOptions) {
    this.options = options;
  }

  async run() {
    return await runAgent(this.options);
  }
}
