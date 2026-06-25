import { CORRECTION_TEMPLATE } from "@istiyak/agent-prompts";

export class ExceptionHandler {
  public static handle(error: Error | any): string {
    const errorMsg = error instanceof Error ? error.message : String(error);
    return CORRECTION_TEMPLATE.replace("{{error}}", errorMsg);
  }
}

export default ExceptionHandler;
