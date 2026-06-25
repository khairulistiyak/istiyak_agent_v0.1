export class Planner {
  public generatePlan(taskDescription: string): string {
    return `# Execution Plan: ${taskDescription}\n\n## Actions\n1. Analyze local directory\n2. Modify files\n3. Verify changes`;
  }
}
