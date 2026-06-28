import { classifyAndRoute } from "../llm/ModelManager.js";

export class TaskClassifier {
  static classify(taskDescription: string, provider: string): string {
    return classifyAndRoute(taskDescription, provider);
  }
}
