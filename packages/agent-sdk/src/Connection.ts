import WebSocket from "isomorphic-ws";
import type { HealthResponse } from "./types.js";

export interface ConnectionOptions {
  endpoint: string;
  timeout?: number;
}

export class Connection {
  private endpoint: string;
  private wsEndpoint: string;
  private timeout: number;
  private ws: WebSocket | null = null;
  private wsMessageHandlers: Set<(message: any) => void> = new Set();

  constructor(endpoint: string, timeout = 30000) {
    this.endpoint = endpoint.replace(/\/$/, ""); // Remove trailing slash
    this.wsEndpoint = this.endpoint.replace(/^http/, "ws") + "/ws";
    this.timeout = timeout;
  }

  /**
   * Connect to the WebSocket server if not already connected.
   */
  async connectWs(): Promise<void> {
    if (this.ws && (this.ws.readyState === WebSocket.OPEN || this.ws.readyState === WebSocket.CONNECTING)) {
      return;
    }

    return new Promise((resolve, reject) => {
      this.ws = new WebSocket(this.wsEndpoint);

      this.ws.onopen = () => {
        resolve();
      };

      this.ws.onerror = (err) => {
        reject(err);
      };

      this.ws.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data as string);
          for (const handler of this.wsMessageHandlers) {
            handler(message);
          }
        } catch (e) {
          console.error("[SDK WS] Failed to parse message", e);
        }
      };

      this.ws.onclose = () => {
        this.ws = null;
      };
    });
  }

  /**
   * Add a generic message handler for WebSocket events.
   */
  addWsHandler(handler: (message: any) => void) {
    this.wsMessageHandlers.add(handler);
  }

  removeWsHandler(handler: (message: any) => void) {
    this.wsMessageHandlers.delete(handler);
  }

  /**
   * Send a message over WebSocket
   */
  sendWs(message: any) {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      throw new Error("WebSocket is not connected");
    }
    this.ws.send(JSON.stringify(message));
  }

  /**
   * Close the WebSocket connection
   */
  disconnectWs() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }

  // HTTP fallback send
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

  // Retain original HTTP streaming as fallback if needed
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

  async health(): Promise<HealthResponse> {
    const url = `${this.endpoint}/api/health`;
    const response = await fetch(url, {
      signal: AbortSignal.timeout(5000),
    });
    return await response.json();
  }
}
