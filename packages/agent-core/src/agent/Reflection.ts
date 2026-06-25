import { ProviderManager } from "../llm/ProviderManager.js";
import { getReflectionPrompt } from "../llm/prompts/ReflectionPrompt.js";

export class Reflection {
  private providerManager: ProviderManager;

  constructor(providerManager: ProviderManager) {
    this.providerManager = providerManager;
  }

  public async evaluate(
    task: string,
    planStatus: string,
    lastAction: string,
    lastResult: string
  ): Promise<{ complete: boolean; feedback: string }> {
    try {
      const provider = this.providerManager.getActiveProvider();
      const systemPrompt = "You are a quality assurance auditor. Verify if the task is completely finished.";
      const userMessage = getReflectionPrompt(task, planStatus, lastAction, lastResult);

      const response = await provider.generateText({ systemPrompt, userMessage });
      const text = response.content;

      const isComplete = text.toLowerCase().includes("success") || text.toLowerCase().includes("complete");
      return {
        complete: isComplete,
        feedback: text
      };
    } catch (err: any) {
      return {
        complete: false,
        feedback: `Reflection evaluation failed: ${err.message}. Assuming task is incomplete.`
      };
    }
  }
}

export default Reflection;
