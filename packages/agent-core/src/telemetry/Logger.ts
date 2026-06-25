import { Logger as BaseLogger } from "@istiyak/shared-utils";

export class Logger {
  private logger: BaseLogger;

  constructor(context: string) {
    this.logger = new BaseLogger(`AgentCore:${context}`);
  }

  public info(msg: string, ...args: any[]): void {
    this.logger.info(msg, ...args);
  }

  public warn(msg: string, ...args: any[]): void {
    this.logger.warn(msg, ...args);
  }

  public error(msg: string, ...args: any[]): void {
    this.logger.error(msg, ...args);
  }
}
export default Logger;
