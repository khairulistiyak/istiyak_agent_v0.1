export class Connection {
  private endpoint: string;

  constructor(endpoint: string) {
    this.endpoint = endpoint;
  }

  public async post(path: string, body: Record<string, any>): Promise<any> {
    const url = `${this.endpoint}${path}`;
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    });
    
    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(`HTTP ${res.status}: ${errorText}`);
    }

    return res.json();
  }

  public async get(path: string): Promise<any> {
    const url = `${this.endpoint}${path}`;
    const res = await fetch(url);
    if (!res.ok) {
      throw new Error(`HTTP ${res.status}`);
    }
    return res.json();
  }
}
