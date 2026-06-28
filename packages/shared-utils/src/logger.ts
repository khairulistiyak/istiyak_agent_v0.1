export class Logger {
  private prefix: string;

  constructor(prefix: string) {
    this.prefix = prefix;
  }

  info(msg: string, ...args: any[]) {
    console.log(`[${this.prefix}] [INFO] ${msg}`, ...args);
  }

  warn(msg: string, ...args: any[]) {
    console.warn(`[${this.prefix}] [WARN] ${msg}`, ...args);
  }

  error(msg: string, ...args: any[]) {
    console.error(`[${this.prefix}] [ERROR] ${msg}`, ...args);
  }
}
