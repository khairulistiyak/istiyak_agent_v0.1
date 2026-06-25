import { Agent } from "./Agent.js";
import { AgentWorkflow } from "./AgentWorkflow.js";
import { AgentState } from "./AgentState.js";

export class AgentRunner {
  private agent: Agent;

  constructor(workspacePath: string = process.cwd()) {
    this.agent = new Agent(workspacePath);
  }

  public getAgentState(): AgentState {
    return this.agent.state;
  }

  public getAgentInstance(): Agent {
    return this.agent;
  }

  public async runTask(taskDescription: string, onUpdate: (log: string) => void): Promise<string> {
    const workflow = new AgentWorkflow(this.agent);
    return await workflow.run(taskDescription, onUpdate);
  }
}

export default AgentRunner;
