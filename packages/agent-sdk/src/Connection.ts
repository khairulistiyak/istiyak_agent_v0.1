export interface ConnectionOptions {
  endpoint: string;
  timeout?: number;
}

export class Connection {
  private endpoint: string;
  private timeout: number;

  constructor(endpoint: string, timeout = 30000) {
    this.endpoint = endpoint.replace(/\/$/, ""); // Remove trailing slash
    this.timeout = timeout;
  }

  async send(event: string, payload: any, method: "POST" | "GET" = "POST"): Promise<any> {
    let url = `${this.endpoint}/api/${event}`;
    const options: RequestInit = {
      method,
      headers: {},
      signal: AbortSignal.timeout(this.timeout),
    };

    if (method === "POST") {
      options.headers = {
        "Content-Type": "application/json",
      };
      options.body = JSON.stringify(payload);
    } else if (method === "GET" && payload) {
      const searchParams = new URLSearchParams();
      for (const [key, val] of Object.entries(payload)) {
        if (val !== undefined && val !== null) {
          searchParams.append(key, String(val));
        }
      }
      const queryString = searchParams.toString();
      if (queryString) {
        url += `?${queryString}`;
      }
    }

    const response = await fetch(url, options);

    if (!response.ok) {
      const errorText = await response.text().catch(() => "Unknown error");
      throw new Error(`SDK Connection Error [${response.status}]: ${errorText}`);
    }

    const contentType = response.headers.get("content-type") || "";

    if (contentType.includes("application/json")) {
      return await response.json();
    }

    // For streaming responses (text/plain), return the full text
    return await response.text();
  }

  async stream(event: string, payload: any, onChunk: (chunk: string) => void): Promise<string> {
    const url = `${this.endpoint}/api/${event}`;

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => "Unknown error");
      throw new Error(`SDK Stream Error [${response.status}]: ${errorText}`);
    }

    const reader = response.body?.getReader();
    if (!reader) {
      throw new Error("SDK Stream Error: Response body is not readable");
    }

    const decoder = new TextDecoder();
    let fullText = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      const chunk = decoder.decode(value, { stream: true });
      fullText += chunk;
      onChunk(chunk);
    }

    return fullText;
  }

  async health(): Promise<{ status: string; mode: string }> {
    const url = `${this.endpoint}/api/health`;
    const response = await fetch(url, {
      signal: AbortSignal.timeout(5000),
    });
    return await response.json();
  }
}
