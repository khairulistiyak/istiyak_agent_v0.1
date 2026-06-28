import { useGlobalStore } from "../../store/index.js";

export function ProviderForm() {
  const provider = useGlobalStore((state) => state.provider);
  const apiKey = useGlobalStore((state) => state.apiKey);
  const selectedModel = useGlobalStore((state) => state.selectedModel);
  const updateSettings = useGlobalStore((state) => state.updateSettings);

  return (
    <div className="space-y-3 text-xs text-white/80">
      <div>
        <label className="block text-white/50 mb-1">AI Provider</label>
        <select
          value={provider}
          onChange={(e) => updateSettings({ provider: e.target.value as any })}
          className="w-full bg-white/5 border border-white/10 rounded-lg p-2 text-white"
        >
          <option value="gemini">Gemini (Google Studio)</option>
          <option value="openai">OpenAI</option>
          <option value="claude">Anthropic Claude</option>
          <option value="ollama">Local Ollama</option>
        </select>
      </div>

      <div>
        <label className="block text-white/50 mb-1">API Key</label>
        <input
          type="password"
          value={apiKey}
          onChange={(e) => updateSettings({ apiKey: e.target.value })}
          placeholder="Enter provider secret token key"
          className="w-full bg-white/5 border border-white/10 rounded-lg p-2 text-white placeholder-white/20"
        />
      </div>

      <div>
        <label className="block text-white/50 mb-1">Selected Model</label>
        <input
          type="text"
          value={selectedModel}
          onChange={(e) => updateSettings({ selectedModel: e.target.value })}
          className="w-full bg-white/5 border border-white/10 rounded-lg p-2 text-white"
        />
      </div>
    </div>
  );
}
