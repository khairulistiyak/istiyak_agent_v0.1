import { ReflectionPrompt } from "../llm/prompts/ReflectionPrompt.js";

export class Reflection {
  getSelfCorrectionPrompt(): string {
    return ReflectionPrompt;
  }
}
