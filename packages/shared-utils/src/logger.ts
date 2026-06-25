import { maskSecrets } from "./mask.js";

export class Logger {
  private context: string;

  constructor(context: string) {
    this.context = context;
  }

  public info(message: string, ...args: any[]): void {
    console.log(`[INFO] [${this.context}] ${maskSecrets(message)}`, ...args.map(a => typeof a === 'string' ? maskSecrets(a) : a));
  }

  public warn(message: string, ...args: any[]): void {
    console.warn(`[WARN] [${this.context}] ${maskSecrets(message)}`, ...args.map(a => typeof a === 'string' ? maskSecrets(a) : a));
  }

  public error(message: string, ...args: any[]): void {
    console.error(`[ERROR] [${this.context}] ${maskSecrets(message)}`, ...args.map(a => typeof a === 'string' ? maskSecrets(a) : a));
  }
}
