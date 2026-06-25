export const GEMINI_MODELS = {
  FLASH_2_5: "gemini-2.5-flash",
  PRO_1_5: "gemini-1.5-pro"
} as const;

export type GeminiModelType = typeof GEMINI_MODELS[keyof typeof GEMINI_MODELS];
