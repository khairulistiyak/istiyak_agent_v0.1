import { AgentStep } from "@istiyak/shared-types";

export class AgentState {
  private activeStep: number = 1;
  private status: "idle" | "running" | "waiting_approval" | "done" | "error" = "idle";
  private stepsList: AgentStep[] = [];

  public getStep(): number {
    return this.activeStep;
  }

  public incrementStep(): void {
    this.activeStep++;
  }

  public setStatus(status: typeof this.status): void {
    this.status = status;
  }

  public getStatus(): typeof this.status {
    return this.status;
  }

  public addStepLog(stepLog: AgentStep): void {
    this.stepsList.push(stepLog);
  }

  public getSteps(): AgentStep[] {
    return this.stepsList;
  }

  public clear(): void {
    this.activeStep = 1;
    this.status = "idle";
    this.stepsList = [];
  }
}
