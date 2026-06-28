import { Connection } from "./Connection.js";

export class Client {
  private connection: Connection;

  constructor(endpoint: string) {
    this.connection = new Connection(endpoint);
  }

  async sendTask(task: string): Promise<string> {
    return await this.connection.send("task", { task });
  }
}
