import React, { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { InputField } from "../ui/InputField.js";
import { GlassButton } from "../ui/GlassButton.js";
import { useChatStore } from "../../store/useChatStore.js";
import { CustomProviderConfig, CustomHeader } from "../../types/index.js";

export const CustomProviderForm: React.FC = () => {
  const { customProviders, saveCustomProvider, deleteCustomProvider } = useChatStore();

  const [providerId, setProviderId] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [baseUrl, setBaseUrl] = useState("");
  const [apiKey, setApiKey] = useState("");
  
  // Custom Headers State
  const [headers, setHeaders] = useState<CustomHeader[]>([]);
  const [headerKey, setHeaderKey] = useState("");
  const [headerValue, setHeaderValue] = useState("");

  // Custom Models State
  const [providerModels, setProviderModels] = useState<{
    id: string;
    modelId: string;
    name: string;
    reasoning: boolean;
  }[]>([]);
  const [modelId, setModelId] = useState("");
  const [modelName, setModelName] = useState("");
  const [isReasoning, setIsReasoning] = useState(false);

  const handleAddHeader = () => {
    if (!headerKey || !headerValue) return;
    setHeaders([...headers, { id: `header-${Date.now()}`, key: headerKey, value: headerValue }]);
    setHeaderKey("");
    setHeaderValue("");
  };

  const handleRemoveHeader = (id: string) => {
    setHeaders(headers.filter((h) => h.id !== id));
  };

  const handleAddModel = () => {
    if (!modelId || !modelName) return;
    setProviderModels([
      ...providerModels,
      { id: `cmodel-${Date.now()}`, modelId, name: modelName, reasoning: isReasoning }
    ]);
    setModelId("");
    setModelName("");
    setIsReasoning(false);
  };

  const handleRemoveModel = (id: string) => {
    setProviderModels(providerModels.filter((m) => m.id !== id));
  };

  const handleSave = () => {
    if (!providerId || !displayName || !baseUrl) {
      alert("Provider ID, Display Name, and Base URL are required!");
      return;
    }
    
    // Validate Provider ID format
    const idRegex = /^[a-z0-9-_]+$/;
    if (!idRegex.test(providerId)) {
      alert("Provider ID must contain only lowercase letters, numbers, hyphens, or underscores.");
      return;
    }

    const newProvider: CustomProviderConfig = {
      providerId,
      displayName,
      baseUrl,
      apiKey,
      models: providerModels,
      headers
    };

    saveCustomProvider(newProvider);
    
    // Clear inputs
    setProviderId("");
    setDisplayName("");
    setBaseUrl("");
    setApiKey("");
    setHeaders([]);
    setProviderModels([]);
    alert("Custom Provider Saved Successfully!");
  };

  return (
    <div className="flex flex-col gap-5 text-left">
      <div>
        <h3 className="text-xs font-semibold text-gray-200">Custom Provider Configuration</h3>
        <p className="text-[10px] text-gray-500">Configure proxy endpoints (OpenRouter, DeepSeek API, custom gateways).</p>
      </div>

      {/* Basic Settings */}
      <div className="p-4 border border-white/10 bg-white/[0.02] rounded-xl flex flex-col gap-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <InputField 
            label="Provider ID" 
            placeholder="e.g. openrouter-dev" 
            value={providerId} 
            onChange={(e) => setProviderId(e.target.value)} 
          />
          <InputField 
            label="Display Name" 
            placeholder="e.g. OpenRouter API" 
            value={displayName} 
            onChange={(e) => setDisplayName(e.target.value)} 
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <InputField 
            label="Provider API Base URL" 
            placeholder="e.g. https://openrouter.ai/api/v1" 
            value={baseUrl} 
            onChange={(e) => setBaseUrl(e.target.value)} 
          />
          <InputField 
            label="API Key (Optional)" 
            type="password"
            placeholder="API token/key..." 
            value={apiKey} 
            onChange={(e) => setApiKey(e.target.value)} 
          />
        </div>
      </div>

      {/* Model Capabilities SPEC (CRUD inside provider config) */}
      <div className="p-4 border border-white/10 bg-white/[0.02] rounded-xl flex flex-col gap-3">
        <h4 className="text-[10px] font-bold text-gray-300 uppercase tracking-widest">Supported Model Capabilities</h4>
        
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-end">
          <InputField 
            label="Model ID" 
            placeholder="e.g. deepseek/deepseek-chat" 
            value={modelId} 
            onChange={(e) => setModelId(e.target.value)} 
          />
          <InputField 
            label="Display Name" 
            placeholder="e.g. DeepSeek Chat" 
            value={modelName} 
            onChange={(e) => setModelName(e.target.value)} 
          />
          <div className="flex flex-col gap-1.5 pb-1">
            <span className="text-[10px] text-gray-500 font-semibold uppercase tracking-wider">Reasoning Engine</span>
            <label className="relative inline-flex items-center cursor-pointer select-none">
              <input 
                type="checkbox" 
                checked={isReasoning} 
                onChange={(e) => setIsReasoning(e.target.checked)} 
                className="sr-only peer"
              />
              <div className="w-9 h-5 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-gray-300 after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-white/30 peer-checked:after:bg-white" />
              <span className="ml-2 text-[10px] font-semibold text-gray-400">Yes</span>
            </label>
          </div>
        </div>

        <GlassButton onClick={handleAddModel} size="sm" className="self-end mt-1">
          <Plus className="w-3.5 h-3.5" /> Add Model
        </GlassButton>

        {providerModels.length > 0 && (
          <div className="border border-white/5 bg-black/20 rounded-lg p-2 mt-2">
            <div className="grid grid-cols-3 text-[9px] font-bold text-gray-500 uppercase pb-1 border-b border-white/5">
              <span>Model ID</span>
              <span>Name</span>
              <span className="text-right">Actions</span>
            </div>
            {providerModels.map((m) => (
              <div key={m.id} className="grid grid-cols-3 text-xs py-1.5 border-b border-white/[0.03] last:border-b-0 items-center">
                <span className="font-mono text-[10px] text-gray-400">{m.modelId}</span>
                <span className="text-gray-300 font-medium">{m.name} {m.reasoning && <span className="text-[8px] bg-white/10 text-gray-300 px-1 py-0.5 rounded font-bold ml-1">REASONING</span>}</span>
                <GlassButton 
                  onClick={() => handleRemoveModel(m.id)}
                  variant="ghost"
                  size="xs"
                  className="!p-1 text-gray-400 hover:!text-white hover:!bg-white/5 self-center justify-self-end"
                >
                  <Trash2 className="w-3 h-3" />
                </GlassButton>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Dynamic Headers configuration */}
      <div className="p-4 border border-white/10 bg-white/[0.02] rounded-xl flex flex-col gap-3">
        <h4 className="text-[10px] font-bold text-gray-300 uppercase tracking-widest">Custom HTTP Headers</h4>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <InputField 
            label="Header Key" 
            placeholder="e.g. X-Title" 
            value={headerKey} 
            onChange={(e) => setHeaderKey(e.target.value)} 
          />
          <InputField 
            label="Value" 
            placeholder="e.g. Companion UI" 
            value={headerValue} 
            onChange={(e) => setHeaderValue(e.target.value)} 
          />
        </div>

        <GlassButton onClick={handleAddHeader} size="sm" className="self-end mt-1">
          <Plus className="w-3.5 h-3.5" /> Add Header
        </GlassButton>

        {headers.length > 0 && (
          <div className="border border-white/5 bg-black/20 rounded-lg p-2 mt-2">
            <div className="grid grid-cols-3 text-[9px] font-bold text-gray-500 uppercase pb-1 border-b border-white/5">
              <span>Header Key</span>
              <span>Value</span>
              <span className="text-right">Actions</span>
            </div>
            {headers.map((h) => (
              <div key={h.id} className="grid grid-cols-3 text-xs py-1.5 border-b border-white/[0.03] last:border-b-0 items-center">
                <span className="font-mono text-[10px] text-gray-400">{h.key}</span>
                <span className="text-gray-300 truncate pr-2">{h.value}</span>
                <GlassButton 
                  onClick={() => handleRemoveHeader(h.id)}
                  variant="ghost"
                  size="xs"
                  className="!p-1 text-gray-400 hover:!text-white hover:!bg-white/5 self-center justify-self-end"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </GlassButton>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Save Custom Provider Config */}
      <GlassButton onClick={handleSave} variant="primary" className="w-full py-2.5 rounded-xl border border-white/10 hover:border-white/20 shadow-xl">
        Save Custom Provider Setup
      </GlassButton>

      {/* List of saved custom providers */}
      {customProviders.length > 0 && (
        <div className="border border-white/10 rounded-xl p-4 bg-white/[0.01]">
          <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">Configured Custom Providers</h4>
          <div className="flex flex-col gap-2">
            {customProviders.map((p) => (
              <div key={p.providerId} className="flex items-center justify-between border border-white/5 bg-white/[0.02] p-2.5 rounded-lg">
                <div className="flex flex-col text-left">
                  <span className="text-xs font-semibold text-gray-300">{p.displayName}</span>
                  <span className="text-[9px] font-mono text-gray-500">{p.baseUrl}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[9px] font-bold bg-white/5 border border-white/10 text-gray-200 px-1.5 py-0.5 rounded">
                    {p.models.length} Models
                  </span>
                  <GlassButton
                    onClick={() => deleteCustomProvider(p.providerId)}
                    variant="ghost"
                    size="xs"
                    className="!p-1 text-gray-500 hover:!text-white hover:!bg-white/5"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </GlassButton>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
