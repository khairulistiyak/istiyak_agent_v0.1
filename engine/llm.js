import { GoogleGenerativeAI } from "@google/generative-ai";
import OpenAI from "openai";
import crypto from "crypto";
import fs from "fs";
import { recordMetric } from "./telemetry.js";
import { estimateTokens } from "./costTracker.js";

/**
 * Classifies a user prompt and selects the best suited model.
 * @param {Array} messages 
 * @param {string} provider 
 * @returns {string} resolved model name
 */
export function classifyAndRoute(messages, provider) {
  const lastUserMsg = messages.filter(m => m.role === "user").slice(-1)[0];
  const content = lastUserMsg ? lastUserMsg.content.toLowerCase() : "";

  // Keywords indicating complex coding tasks
  const complexityKeywords = [
    "refactor", "optimize", "debug", "error", "write tests", "implement", "fix bug", 
    "architecture", "race condition", "memory leak", "performance", "class", "database"
  ];

  const isComplex = complexityKeywords.some(keyword => content.includes(keyword)) || content.length > 1200;
  const p = provider.toLowerCase();

  if (p === "gemini") {
    return isComplex ? "gemini-2.5-pro" : "gemini-2.5-flash";
  } else if (p === "openai") {
    return isComplex ? "gpt-4o" : "gpt-4o-mini";
  } else if (p === "claude" || p === "anthropic") {
    return isComplex ? "claude-3-5-sonnet-20241022" : "claude-3-5-haiku-20241022";
  }
  return "gemini-2.5-flash"; // default fallback
}

export let mockStreamLLMFn = null;

export function setMockStreamLLM(mockFn) {
  mockStreamLLMFn = mockFn;
}

/**
 * Dynamically routes prompt contents to the selected LLM provider and streams the result.
 * @param {Array} messages - Chat history in the format: [{ role: 'user'|'assistant', content: '...' }]
 * @param {string} provider - 'gemini' | 'openai' | 'claude' | 'ollama' | 'custom'
 * @param {string} model - The specific model name (e.g. 'gemini-2.5-flash', 'gpt-4o')
 * @param {string} authMethod - 'apiKey' | 'serviceAccount'
 * @param {string} apiKey - The provider's API key
 * @param {string} serviceAccountPath - Path to GCP service account JSON key file
 * @param {string} projectId - GCP Project ID
 * @param {string} location - GCP location/region
 * @param {Function} onChunk - Callback triggered when new text chunk arrives
 * @returns {Promise<string>} The full accumulated response text
 */
export async function streamLLM(
  messages,
  provider,
  model,
  authMethod,
  apiKey,
  serviceAccountPath,
  projectId,
  location,
  onChunk
) {
  if (mockStreamLLMFn) {
    return await mockStreamLLMFn(messages, provider, model, authMethod, apiKey, serviceAccountPath, projectId, location, onChunk);
  }

  const startTime = Date.now();
  let targetModel = model;

  if (model === "auto" || model === "auto-route") {
    targetModel = classifyAndRoute(messages, provider);
    console.log(`[Router] Dynamically routed to model: ${targetModel}`);
  }

  let responseText = "";
  const p = provider.toLowerCase();

  try {
    if (p === "gemini") {
      if (authMethod === "serviceAccount") {
        responseText = await streamVertexAI(messages, targetModel, serviceAccountPath, projectId, location || "global", onChunk);
      } else {
        responseText = await streamGemini(messages, targetModel, apiKey, onChunk);
      }
    } else if (p === "openai" || p === "custom") {
      responseText = await streamOpenAI(messages, targetModel, apiKey, onChunk);
    } else if (p === "claude" || p === "anthropic") {
      responseText = await streamClaude(messages, targetModel, apiKey, onChunk);
    } else if (p === "ollama") {
      responseText = await streamOllama(messages, targetModel, onChunk);
    } else {
      throw new Error(`Unsupported provider: ${provider}`);
    }

    const latencyMs = Date.now() - startTime;
    const tokensIn = messages.reduce((acc, m) => acc + estimateTokens(m.content), 0);
    const tokensOut = estimateTokens(responseText);
    recordMetric(provider, targetModel, latencyMs, tokensIn, tokensOut);

    return responseText;
  } catch (error) {
    const latencyMs = Date.now() - startTime;
    const tokensIn = messages.reduce((acc, m) => acc + estimateTokens(m.content), 0);
    recordMetric(provider, targetModel || "failed-route", latencyMs, tokensIn, 0);
    throw error;
  }
}

async function getAccessTokenFromServiceAccount(serviceAccountPath) {
  let fileContent;
  try {
    if (fs.existsSync(serviceAccountPath) && fs.statSync(serviceAccountPath).isDirectory()) {
      throw new Error("Specified path is a directory, but it must be a path to a Service Account JSON file (e.g., /path/to/key.json)");
    }
    fileContent = fs.readFileSync(serviceAccountPath, "utf8");
  } catch (err) {
    throw new Error(`Failed to read Service Account JSON file at '${serviceAccountPath}': ${err.message}`);
  }

  let creds;
  try {
    creds = JSON.parse(fileContent);
  } catch (err) {
    throw new Error(`Failed to parse Service Account JSON: The file is not a valid JSON. Error: ${err.message}`);
  }

  const privateKey = creds.private_key;
  const clientEmail = creds.client_email;
  if (!privateKey || !clientEmail) {
    throw new Error("Invalid Service Account JSON: 'private_key' and/or 'client_email' are missing in the key file.");
  }

  const tokenUrl = "https://oauth2.googleapis.com/token";

  const header = {
    alg: "RS256",
    typ: "JWT"
  };

  const now = Math.floor(Date.now() / 1000);
  const payload = {
    iss: clientEmail,
    scope: "https://www.googleapis.com/auth/cloud-platform",
    aud: tokenUrl,
    exp: now + 3600,
    iat: now
  };

  const base64UrlEncode = (str) => {
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
    headers: {
      "Content-Type": "application/x-www-form-urlencoded"
    },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion: jwt
    })
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Failed to exchange service account JWT for access token: ${response.status} ${errText}`);
  }

  const data = await response.json();
  return data.access_token;
}

async function streamVertexAI(messages, model, serviceAccountPath, projectId, location, onChunk) {
  if (!serviceAccountPath || !projectId) {
    throw new Error("Missing Service Account JSON Path or GCP Project ID for Vertex AI");
  }

  const accessToken = await getAccessTokenFromServiceAccount(serviceAccountPath);
  const targetModel = model || "gemini-2.5-flash";
  
  const host = location === "global" ? "aiplatform.googleapis.com" : `${location}-aiplatform.googleapis.com`;
  const endpoint = `https://${host}/v1/projects/${projectId}/locations/${location}/publishers/google/models/${targetModel}:streamGenerateContent`;

  const contents = messages
    .filter((m) => m.role === "user" || m.role === "assistant")
    .map((m) => {
      let role = m.role === "assistant" ? "model" : m.role;
      return {
        role,
        parts: [{ text: m.content }],
      };
    });

  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${accessToken}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ contents })
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Vertex AI stream error: ${response.status} ${errText}`);
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder("utf-8");
  let accumulatedText = "";
  let buffer = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    
    // Balanced bracket JSON streaming parser
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
              // Ignore incomplete or invalid JSON chunk
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

async function streamGemini(messages, model, apiKey, onChunk) {
  if (!apiKey) {
    throw new Error("Gemini API key is missing");
  }
  const genAI = new GoogleGenerativeAI(apiKey);
  const targetModel = model || "gemini-2.5-flash";
  const modelInstance = genAI.getGenerativeModel({ model: targetModel });

  const contents = messages
    .filter((m) => m.role === "user" || m.role === "assistant")
    .map((m) => {
      let role = m.role === "assistant" ? "model" : m.role;
      return {
        role,
        parts: [{ text: m.content }],
      };
    });

  try {
    const result = await modelInstance.generateContentStream({ contents });
    let accumulatedText = "";
    for await (const chunk of result.stream) {
      const text = chunk.text();
      accumulatedText += text;
      if (onChunk) onChunk(text);
    }
    return accumulatedText;
  } catch (error) {
    if (error.status === 429) {
      console.warn("Gemini Rate limit hit. Retrying in 2 seconds...");
      await new Promise((resolve) => setTimeout(resolve, 2000));
      return streamGemini(messages, model, apiKey, onChunk);
    }
    throw error;
  }
}

async function streamOpenAI(messages, model, apiKey, onChunk) {
  if (!apiKey) {
    throw new Error("OpenAI API key is missing");
  }
  const openai = new OpenAI({ apiKey });
  const targetModel = model || "gpt-4o";

  const apiMessages = messages
    .filter((m) => m.role === "user" || m.role === "assistant" || m.role === "system")
    .map((m) => ({
      role: m.role,
      content: m.content,
    }));

  try {
    const stream = await openai.chat.completions.create({
      model: targetModel,
      messages: apiMessages,
      stream: true,
    });

    let accumulatedText = "";
    for await (const chunk of stream) {
      const text = chunk.choices[0]?.delta?.content || "";
      if (text) {
        accumulatedText += text;
        if (onChunk) onChunk(text);
      }
    }
    return accumulatedText;
  } catch (error) {
    if (error.status === 429) {
      console.warn("OpenAI Rate limit hit. Retrying in 2 seconds...");
      await new Promise((resolve) => setTimeout(resolve, 2000));
      return streamOpenAI(messages, model, apiKey, onChunk);
    }
    throw error;
  }
}

async function streamClaude(messages, model, apiKey, onChunk) {
  if (!apiKey) {
    throw new Error("Claude API key is missing");
  }
  const targetModel = model || "claude-3-5-sonnet-20241022";
  const apiMessages = messages
    .filter((m) => m.role === "user" || m.role === "assistant")
    .map((m) => ({
      role: m.role,
      content: m.content,
    }));

  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json",
      },
      body: JSON.stringify({
        model: targetModel,
        messages: apiMessages,
        max_tokens: 4096,
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        console.warn("Claude Rate limit hit. Retrying in 2 seconds...");
        await new Promise((resolve) => setTimeout(resolve, 2000));
        return streamClaude(messages, model, apiKey, onChunk);
      }
      const errText = await response.text();
      throw new Error(`Claude API error: ${response.status} ${errText}`);
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder("utf-8");
    let accumulatedText = "";
    let buffer = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop();

      for (const line of lines) {
        const cleanLine = line.trim();
        if (!cleanLine.startsWith("data:")) continue;

        const dataStr = cleanLine.substring(5).trim();
        if (dataStr === "[DONE]") continue;

        try {
          const parsed = JSON.parse(dataStr);
          if (parsed.type === "content_block_delta" && parsed.delta?.text) {
            const text = parsed.delta.text;
            accumulatedText += text;
            if (onChunk) onChunk(text);
          }
        } catch (e) {
          // Ignore json parse error
        }
      }
    }
    return accumulatedText;
  } catch (error) {
    throw error;
  }
}

async function streamOllama(messages, model, onChunk) {
  const targetModel = model || "llama3";
  const apiMessages = messages
    .filter((m) => m.role === "user" || m.role === "assistant")
    .map((m) => ({
      role: m.role,
      content: m.content,
    }));

  const response = await fetch("http://localhost:11434/api/chat", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: targetModel,
      messages: apiMessages,
      stream: true,
    }),
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Ollama API error: ${response.status} ${errText}`);
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder("utf-8");
  let accumulatedText = "";
  let buffer = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n");
    buffer = lines.pop();

    for (const line of lines) {
      const cleanLine = line.trim();
      if (!cleanLine) continue;

      try {
        const parsed = JSON.parse(cleanLine);
        const text = parsed.message?.content || "";
        if (text) {
          accumulatedText += text;
          if (onChunk) onChunk(text);
        }
      } catch (e) {
        // Ignore json parse error
      }
    }
  }
  return accumulatedText;
}

