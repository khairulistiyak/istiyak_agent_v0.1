import { MODELS, ModelMetadata } from "../config/Models.js";
import { ProviderType } from "../config/Providers.js";

export class ModelManager {
  private activeModelId: string = "gemini-2.5-flash";

  public getModelMetadata(modelId: string): ModelMetadata {
    const meta = MODELS[modelId];
    if (!meta) {
      // Return a dynamic metadata config for custom models
      return {
        id: modelId,
        name: modelId,
        provider: "custom",
        contextWindow: 128_000,
        maxOutputTokens: 4096,
        pricing: { inputCostPer1M: 0, outputCostPer1M: 0 }
      };
    }
    return meta;
  }

  public getActiveModel(): ModelMetadata {
    return this.getModelMetadata(this.activeModelId);
  }

  public setActiveModel(modelId: string): void {
    this.activeModelId = modelId;
  }

  public getModelsByProvider(provider: ProviderType): ModelMetadata[] {
    return Object.values(MODELS).filter(m => m.provider === provider);
  }
}
export default ModelManager;
