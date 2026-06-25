import { LlmProvider, LlmRequest, LlmResponse } from "../../ProviderManager.js";
import { ProviderType } from "../../../config/Providers.js";
import { TokenCounter } from "../../TokenCounter.js";
import fs from "fs";
import crypto from "crypto";

export class VertexProvider implements LlmProvider {
  public readonly id: ProviderType = "vertex";
  private serviceAccountPath: string;
  private projectId: string;
  private location: string;
  private modelName: string;

  constructor(config?: {
    serviceAccountPath?: string;
    projectId?: string;
    location?: string;
    modelName?: string;
  }) {
    this.serviceAccountPath = config?.serviceAccountPath || process.env.VERTEX_SERVICE_ACCOUNT_PATH || "";
    this.projectId = config?.projectId || process.env.VERTEX_PROJECT_ID || "";
    this.location = config?.location || process.env.VERTEX_LOCATION || "us-central1";
    this.modelName = config?.modelName || "gemini-1.5-pro";
  }

  private async getAccessToken(): Promise<string> {
    if (!this.serviceAccountPath) {
      throw new Error("Missing Vertex Service Account JSON Path configuration.");
    }

    let fileContent: string;
    try {
      fileContent = fs.readFileSync(this.serviceAccountPath, "utf8");
    } catch (err: any) {
      throw new Error(`Failed to read Service Account JSON file at '${this.serviceAccountPath}': ${err.message}`);
    }

    const creds = JSON.parse(fileContent);
    const privateKey = creds.private_key;
    const clientEmail = creds.client_email;
    if (!privateKey || !clientEmail) {
      throw new Error("Invalid Service Account JSON: 'private_key' and/or 'client_email' are missing.");
    }

    const tokenUrl = "https://oauth2.googleapis.com/token";
    const header = { alg: "RS256", typ: "JWT" };
    const now = Math.floor(Date.now() / 1000);
    const payload = {
      iss: clientEmail,
      scope: "https://www.googleapis.com/auth/cloud-platform",
      aud: tokenUrl,
      exp: now + 3600,
      iat: now
    };

    const base64UrlEncode = (str: string) => {
      return Buffer.from(str)
        .toString("base64")
        .replace(/=/g, "")
        .replace(/\+/g, "-")
        .replace(/\//g, "_");
    };

    const encodedHeader = base64UrlEncode(JSON.stringify(header));
    const encodedPayload = base64UrlEncode(JSON.stringify(payload));
    const signatureInput = `${encodedHeader}.${encodedPayload}`;

    const signer = crypto.createSign("RSA-SHA256");
    signer.update(signatureInput);
    const signature = signer.sign(privateKey, "base64")
      .replace(/=/g, "")
      .replace(/\+/g, "-")
      .replace(/\//g, "_");

    const jwt = `${signatureInput}.${signature}`;

    const response = await fetch(tokenUrl, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
        assertion: jwt
      })
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Failed to exchange service account JWT for access token: ${response.status} ${errText}`);
    }

    const data: any = await response.json();
    return data.access_token;
  }

  public async generateText(request: LlmRequest): Promise<LlmResponse> {
    const accessToken = await this.getAccessToken();
    const host = this.location === "global" ? "aiplatform.googleapis.com" : `${this.location}-aiplatform.googleapis.com`;
    const endpoint = `https://${host}/v1/projects/${this.projectId}/locations/${this.location}/publishers/google/models/${this.modelName}:generateContent`;

    const contents = [
      {
        role: "user",
        parts: [{ text: `System Prompt:\n${request.systemPrompt}\n\nUser Message:\n${request.userMessage}` }]
      }
    ];

    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${accessToken}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        contents,
        generationConfig: {
          temperature: request.temperature ?? 0.2,
          maxOutputTokens: request.maxTokens ?? 4096
        }
      })
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Vertex AI error: ${response.status} ${errText}`);
    }

    const result: any = await response.json();
    const text = result.candidates?.[0]?.content?.parts?.[0]?.text || "";

    const inputTokens = TokenCounter.countTokens(request.systemPrompt + request.userMessage);
    const outputTokens = TokenCounter.countTokens(text);

    return {
      content: text,
      inputTokens,
      outputTokens
    };
  }

  public async generateStream(
    request: LlmRequest,
    onChunk: (text: string) => void
  ): Promise<LlmResponse> {
    const accessToken = await this.getAccessToken();
    const host = this.location === "global" ? "aiplatform.googleapis.com" : `${this.location}-aiplatform.googleapis.com`;
    const endpoint = `https://${host}/v1/projects/${this.projectId}/locations/${this.location}/publishers/google/models/${this.modelName}:streamGenerateContent`;

    const contents = [
      {
        role: "user",
        parts: [{ text: `System Prompt:\n${request.systemPrompt}\n\nUser Message:\n${request.userMessage}` }]
      }
    ];

    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${accessToken}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        contents,
        generationConfig: {
          temperature: request.temperature ?? 0.2,
          maxOutputTokens: request.maxTokens ?? 4096
        }
      })
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Vertex AI stream error: ${response.status} ${errText}`);
    }

    const reader = response.body?.getReader();
    if (!reader) {
      throw new Error("Vertex AI response body is not readable for streaming.");
    }

    const decoder = new TextDecoder("utf-8");
    let accumulatedText = "";
    let buffer = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      
      let openBraces = 0;
      let startIdx = -1;
      let inString = false;
      let escaped = false;

      for (let i = 0; i < buffer.length; i++) {
        const char = buffer[i];
        if (escaped) {
          escaped = false;
          continue;
        }
        if (char === '\\') {
          escaped = true;
          continue;
        }
        if (char === '"') {
          inString = !inString;
          continue;
        }
        if (!inString) {
          if (char === '{') {
            if (openBraces === 0) {
              startIdx = i;
            }
            openBraces++;
          } else if (char === '}') {
            openBraces--;
            if (openBraces === 0 && startIdx !== -1) {
              const jsonStr = buffer.substring(startIdx, i + 1);
              try {
                const parsed = JSON.parse(jsonStr);
                const text = parsed.candidates?.[0]?.content?.parts?.[0]?.text || "";
                if (text) {
                  accumulatedText += text;
                  onChunk(text);
                }
              } catch (e) {
                // Ignore incomplete JSON chunks
              }
              buffer = buffer.substring(i + 1);
              i = -1;
              startIdx = -1;
            }
          }
        }
      }
    }

    const inputTokens = TokenCounter.countTokens(request.systemPrompt + request.userMessage);
    const outputTokens = TokenCounter.countTokens(accumulatedText);

    return {
      content: accumulatedText,
      inputTokens,
      outputTokens
    };
  }
}

export default VertexProvider;
