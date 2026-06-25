export function maskSecrets(text: string): string {
  if (!text) return text;
  
  // Mask typical API keys (Gemini, OpenAI, Claude)
  let masked = text.replace(/(AIzaSy[A-Za-z0-9_-]{35})/g, "AIzaSy...[MASKED]");
  masked = masked.replace(/(sk-proj-[A-Za-z0-9_-]{48})/g, "sk-proj-...[MASKED]");
  masked = masked.replace(/(sk-ant-api03-[A-Za-z0-9_-]{90})/g, "sk-ant-api03-...[MASKED]");
  
  // Mask passwords in JWT / OAuth configs
  masked = masked.replace(/"password"\s*:\s*"[^"]+"/gi, '"password": "[MASKED]"');
  masked = masked.replace(/"apiKey"\s*:\s*"[^"]+"/gi, '"apiKey": "[MASKED]"');
  masked = masked.replace(/"token"\s*:\s*"[^"]+"/gi, '"token": "[MASKED]"');
  masked = masked.replace(/"private_key"\s*:\s*"[^"]+"/gi, '"private_key": "[MASKED]"');

  return masked;
}
