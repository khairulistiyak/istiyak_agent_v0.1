import { PlanningPrompt } from "../llm/prompts/PlanningPrompt.js";
import fs from "fs/promises";
import path from "path";

/**
 * Generates step-by-step task plans for complex tasks and manages
 * the workspace_plan.md file that tracks progress.
 */
export class Planner {
  /**
   * Returns the planning system prompt template.
   */
  generatePlanningSystemPrompt(): string {
    return PlanningPrompt;
  }

  /**
   * Generates a structured plan from a task description.
   * Uses heuristic decomposition to break down the task into actionable steps.
   * Each step is prefixed with "- [ ]" for checklist tracking.
   */
  static generatePlan(taskDescription: string): string[] {
    const task = taskDescription.toLowerCase();
    const steps: string[] = [];

    // Step 1: Always start with understanding/analysis
    steps.push("Analyze the task requirements and identify relevant files");

    // Step 2: If code changes are needed, read the target files first
    if (task.includes("file") || task.includes("code") || task.includes("function") ||
        task.includes("class") || task.includes("component") || task.includes("implement")) {
      steps.push("Read and understand the current code structure");
    }

    // Step 3: If it's a feature/implementation task, plan the changes
    if (task.includes("add") || task.includes("create") || task.includes("implement") ||
        task.includes("build") || task.includes("feature")) {
      steps.push("Plan the implementation approach and file changes");
      steps.push("Implement the required code changes");
    }

    // Step 4: If it's a refactor/fix task
    if (task.includes("refactor") || task.includes("fix") || task.includes("debug") ||
        task.includes("optimize") || task.includes("improve")) {
      steps.push("Identify the root cause or improvement areas");
      steps.push("Apply the necessary code modifications");
    }

    // Step 5: If tests are mentioned
    if (task.includes("test") || task.includes("verify") || task.includes("check")) {
      steps.push("Write or update relevant tests");
      steps.push("Run tests to verify correctness");
    }

    // Step 6: Always verify at the end
    steps.push("Verify the changes work correctly");

    // If somehow no specific steps were added, add generic ones
    if (steps.length <= 2) {
      steps.splice(1, 0, "Research the current state of the codebase");
      steps.splice(2, 0, "Implement the required changes");
    }

    return steps;
  }

  /**
   * Writes a plan to workspace_plan.md in the workspace root.
   * Each step is written as a markdown checklist item.
   */
  static async writePlanToFile(workspacePath: string, taskDescription: string, steps: string[]): Promise<string> {
    const planContent = [
      `# Task Plan`,
      ``,
      `**Task:** ${taskDescription}`,
      `**Created:** ${new Date().toISOString()}`,
      ``,
      `## Steps`,
      ``,
      ...steps.map((step, i) => `- [ ] **Step ${i + 1}:** ${step}`),
      ``
    ].join("\n");

    const planPath = path.resolve(workspacePath, "workspace_plan.md");
    await fs.writeFile(planPath, planContent, "utf-8");
    return planPath;
  }

  /**
   * Updates a specific step in workspace_plan.md as completed.
   */
  static async markStepComplete(workspacePath: string, stepIndex: number): Promise<void> {
    const planPath = path.resolve(workspacePath, "workspace_plan.md");
    try {
      let content = await fs.readFile(planPath, "utf-8");
      const lines = content.split("\n");
      let stepCount = 0;
      for (let i = 0; i < lines.length; i++) {
        if (lines[i].startsWith("- [ ] **Step")) {
          if (stepCount === stepIndex) {
            lines[i] = lines[i].replace("- [ ]", "- [x]");
            break;
          }
          stepCount++;
        }
      }
      await fs.writeFile(planPath, lines.join("\n"), "utf-8");
    } catch {
      // Plan file may not exist yet — that's fine, skip silently
    }
  }
}
