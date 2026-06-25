import { Connection } from "./Connection.js";

export class Client {
  private connection: Connection;

  constructor(daemonUrl: string = "http://localhost:3001") {
    this.connection = new Connection(daemonUrl);
  }

  public async getHealth(): Promise<any> {
    return this.connection.get("/api/health");
  }

  public async startWatcher(workspacePath: string): Promise<any> {
    return this.connection.post("/api/watcher/start", { workspacePath });
  }

  public async stopWatcher(): Promise<any> {
    return this.connection.post("/api/watcher/stop", {});
  }

  public async approveCommand(requestId: string, approved: boolean): Promise<any> {
    return this.connection.post("/api/agent/approve", { requestId, approved });
  }

  public async reindexWorkspace(workspacePath: string): Promise<any> {
    return this.connection.post("/api/rag/reindex", { workspacePath });
  }
}
