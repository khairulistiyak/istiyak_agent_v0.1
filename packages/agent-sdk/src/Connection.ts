export class Connection {
  private endpoint: string;

  constructor(endpoint: string) {
    this.endpoint = endpoint;
  }

  async send(event: string, payload: any): Promise<any> {
    console.log(`[Connection] Sending event ${event} to ${this.endpoint}`, payload);
    return { success: true };
  }
}
