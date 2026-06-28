export const GEMINI_MODELS = [
  "gemini-2.5-flash",
  "gemini-2.5-pro",
  "gemini-1.5-flash",
  "gemini-1.5-pro"
] as const;
export type GeminiModelType = typeof GEMINI_MODELS[number];
