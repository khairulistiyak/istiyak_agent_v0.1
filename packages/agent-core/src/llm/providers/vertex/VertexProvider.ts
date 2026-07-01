import fs from "fs";
import crypto from "crypto";
import { Message } from "@istiyak/shared-types";

export class VertexProvider {
  private serviceAccountPath: string;
  private projectId: string;
  private location: string;

  constructor(serviceAccountPath: string, projectId: string, location: string) {
    this.serviceAccountPath = serviceAccountPath;
    this.projectId = projectId;
    this.location = location || "us-central1";
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

  async streamGenerate(
    messages: Message[],
    model: string,
    onChunk?: (text: string) => void,
    jsonMode = true
  ): Promise<string> {
    const accessToken = await this.getAccessToken();
    const host = this.location === "global" ? "aiplatform.googleapis.com" : `${this.location}-aiplatform.googleapis.com`;
    const targetModel = model || "gemini-2.5-flash";
    const endpoint = `https://${host}/v1/projects/${this.projectId}/locations/${this.location}/publishers/google/models/${targetModel}:streamGenerateContent`;

    const contents = messages
      .filter((m) => m.role === "user" || m.role === "assistant")
      .map((m) => {
        const role = m.role === "assistant" ? "model" : m.role;
        return {
          role,
          parts: [{ text: m.content }],
        };
      });

    const systemMessage = messages.find((m) => m.role === "system");
    const payload: any = {
      contents,
      generationConfig: {
        temperature: jsonMode ? 0.3 : 0.7,
        maxOutputTokens: 65536
      }
    };
    if (jsonMode) {
      payload.generationConfig.responseMimeType = "application/json";
    }
    if (systemMessage) {
      payload.systemInstruction = {
        parts: [{ text: systemMessage.content }]
      };
    }

    // Retry with exponential backoff for 429 rate limit errors
    const MAX_RETRIES = 3;
    const BASE_DELAY_MS = 10000; // 10 seconds base

    let lastError: Error | null = null;
    for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
      if (attempt > 0) {
        const delay = BASE_DELAY_MS * Math.pow(2, attempt - 1); // 10s, 20s, 40s
        console.log(`[VertexProvider] Rate limit retry ${attempt}/${MAX_RETRIES} — waiting ${delay / 1000}s...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }

      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${accessToken}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errText = await response.text();
        if (response.status === 429 && attempt < MAX_RETRIES) {
          console.warn(`[VertexProvider] 429 Rate limit hit on attempt ${attempt + 1}. Will retry...`);
          lastError = new Error(`Vertex AI stream error: ${response.status} ${errText}`);
          continue; // retry
        }
        throw new Error(`Vertex AI stream error: ${response.status} ${errText}`);
      }

      // Success — proceed with streaming
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

        const chunkStr = decoder.decode(value, { stream: true });
        buffer += chunkStr;
        
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
                    if (onChunk) onChunk(text);
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

      return accumulatedText;
    }

    // All retries exhausted
    throw lastError || new Error("Vertex AI request failed after all retries.");
  }
}

