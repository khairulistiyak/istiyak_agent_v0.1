import React from "react";
import { useChatStore } from "../../store/useChatStore.js";
import { Dropdown } from "../ui/Dropdown.js";
import { InputField } from "../ui/InputField.js";

export const EngineConfigForm: React.FC = () => {
  const { engineConfig, updateEngineConfig } = useChatStore();

  const providers = [
    { value: "Google Gemini", label: "Google Gemini" },
    { value: "OpenAI", label: "OpenAI" },
    { value: "Anthropic Claude", label: "Anthropic Claude" },
    { value: "Ollama", label: "Ollama" },
    { value: "Custom Provider", label: "Custom Provider" }
  ];

  const getModelOptions = () => {
    switch (engineConfig.provider) {
      case "Google Gemini":
        return [
          { value: "Gemini 2.5 Flash", label: "Gemini 2.5 Flash" },
          { value: "Gemini 2.5 Pro", label: "Gemini 2.5 Pro" },
          { value: "Gemini 3.5 Pro", label: "Gemini 3.5 Pro" },
          { value: "Gemini 2.0 Flash", label: "Gemini 2.0 Flash" },
          { value: "Custom Model", label: "Custom Model" }
        ];
      case "OpenAI":
        return [
          { value: "GPT-4o", label: "GPT-4o" },
          { value: "GPT-4 Turbo", label: "GPT-4 Turbo" },
          { value: "Custom Model", label: "Custom Model" }
        ];
      case "Anthropic Claude":
        return [
          { value: "Claude 3.5 Sonnet", label: "Claude 3.5 Sonnet" },
          { value: "Custom Model", label: "Custom Model" }
        ];
      case "Ollama":
        return [
          { value: "Llama 3", label: "Llama 3" },
          { value: "Mistral", label: "Mistral" },
          { value: "Custom Model", label: "Custom Model" }
        ];
      case "Custom Provider":
      default:
        return [
          { value: "Custom Model", label: "Custom Model" }
        ];
    }
  };

  const showCustomModelInput = engineConfig.selectedModel === "Custom Model";
  const isGemini = engineConfig.provider === "Google Gemini";
  const needsAuthKey = engineConfig.provider !== "Ollama";

  const handleBrowseFile = () => {
    alert("Simulating file browsing on host system...");
    updateEngineConfig({ serviceAccountPath: "/Volumes/SSD/credentials/gcp-service-account.json" });
  };

  return (
    <div className="flex flex-col gap-4 text-left">
      <div>
        <h3 className="text-xs font-semibold text-gray-200">Model Engine Configuration</h3>
        <p className="text-[10px] text-gray-500">Select active AI providers and endpoints.</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* Provider Select */}
        <Dropdown
          label="AI Provider"
          options={providers}
          value={engineConfig.provider}
          onChange={(val) => {
            const nextModels = {
              "Google Gemini": "Gemini 2.5 Flash",
              "OpenAI": "GPT-4o",
              "Anthropic Claude": "Claude 3.5 Sonnet",
              "Ollama": "Llama 3",
              "Custom Provider": "Custom Model"
            };
            const defaultModel = nextModels[val as keyof typeof nextModels];
            updateEngineConfig({ 
              provider: val as any, 
              selectedModel: defaultModel 
            });
          }}
        />

        {/* Selected Model Select */}
        <Dropdown
          label="Selected Model"
          options={getModelOptions()}
          value={engineConfig.selectedModel}
          onChange={(val) => updateEngineConfig({ selectedModel: val })}
        />
      </div>

      {/* Custom Model Name Input */}
      {showCustomModelInput && (
        <InputField
          label="Custom Model Identifier"
          placeholder="e.g. gemini-3.5-pro-experimental"
          value={engineConfig.customModelName}
          onChange={(e) => updateEngineConfig({ customModelName: e.target.value })}
        />
      )}

      {/* Gemini Specific Auth Dropdowns */}
      {isGemini && (
        <div className="grid grid-cols-2 gap-4">
          <Dropdown
            label="Authentication"
            options={[
              { value: "API Key", label: "API Key" },
              { value: "Service Account JSON", label: "Service Account JSON" }
            ]}
            value={engineConfig.authentication}
            onChange={(val) => updateEngineConfig({ authentication: val as any })}
          />

          {engineConfig.authentication === "Service Account JSON" && (
            <InputField
              label="Service Account JSON Path"
              placeholder="/path/to/credentials.json"
              value={engineConfig.serviceAccountPath}
              onChange={(e) => updateEngineConfig({ serviceAccountPath: e.target.value })}
              onBrowse={handleBrowseFile}
            />
          )}
        </div>
      )}

      {/* API Key value field */}
      {needsAuthKey && (engineConfig.authentication === "API Key" || !isGemini) && (
        <InputField
          label="Provider API Key"
          type="password"
          placeholder="Enter provider token key..."
          value={engineConfig.apiKey}
          onChange={(e) => updateEngineConfig({ apiKey: e.target.value })}
        />
      )}

      {/* Google Cloud/Vertex AI specific items */}
      {isGemini && (
        <div className="grid grid-cols-2 gap-4">
          <InputField
            label="GCP Project ID"
            placeholder="istiyak-companion-123"
            value={engineConfig.gcpProjectId}
            onChange={(e) => updateEngineConfig({ gcpProjectId: e.target.value })}
          />

          <Dropdown
            label="Vertex Region"
            options={[
              { value: "global", label: "global" },
              { value: "us-central1", label: "us-central1" },
              { value: "us-east4", label: "us-east4" },
              { value: "europe-west4", label: "europe-west4" },
              { value: "asia-southeast1", label: "asia-southeast1" }
            ]}
            value={engineConfig.vertexRegion}
            onChange={(val) => updateEngineConfig({ vertexRegion: val })}
          />
        </div>
      )}
    </div>
  );
};
