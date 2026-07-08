import React, { useState } from "react";
import { useChatStore } from "../../store/useChatStore.js";
import { Trash2, Plus, Edit2, Check, X } from "lucide-react";
import { InputField } from "../ui/InputField.js";
import { GlassButton } from "../ui/GlassButton.js";

export const ModelTable: React.FC = () => {
  const { models, addModel, updateModel, deleteModel, toggleModelStatus } = useChatStore();

  // Add Model Form State
  const [isAdding, setIsAdding] = useState(false);
  const [name, setName] = useState("");
  const [baseUrl, setBaseUrl] = useState("");
  const [apiKey, setApiKey] = useState("");
  const [modelId, setModelId] = useState("");

  // Edit Model State
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editBaseUrl, setEditBaseUrl] = useState("");
  const [editApiKey, setEditApiKey] = useState("");
  const [editModelId, setEditModelId] = useState("");

  const handleSaveAdd = () => {
    if (!name || !modelId) return;
    addModel({
      name,
      baseUrl: baseUrl || "https://api.openai.com/v1",
      apiKey: apiKey || "••••••••••••••••",
      modelId,
      status: true
    });
    // Reset Form
    setName("");
    setBaseUrl("");
    setApiKey("");
    setModelId("");
    setIsAdding(false);
  };

  const startEdit = (id: string) => {
    const model = models.find((m) => m.id === id);
    if (!model) return;
    setEditingId(id);
    setEditName(model.name);
    setEditBaseUrl(model.baseUrl);
    setEditApiKey(model.apiKey);
    setEditModelId(model.modelId);
  };

  const handleSaveEdit = (id: string) => {
    updateModel(id, {
      name: editName,
      baseUrl: editBaseUrl,
      apiKey: editApiKey,
      modelId: editModelId
    });
    setEditingId(null);
  };

  return (
    <div className="flex flex-col gap-5">
      
      {/* Title & Add Button */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xs font-semibold text-gray-200">Model CRUD Manager</h3>
          <p className="text-[10px] text-gray-500">Configure models for custom providers.</p>
        </div>
        {!isAdding && (
          <GlassButton onClick={() => setIsAdding(true)} variant="primary" size="sm">
            <Plus className="w-3.5 h-3.5" />
            Add Model
          </GlassButton>
        )}
      </div>

      {/* Add New Model Form */}
      {isAdding && (
        <div className="p-4 border border-white/10 bg-white/[0.02] rounded-xl flex flex-col gap-3">
          <h4 className="text-[10px] font-bold text-gray-300 uppercase tracking-widest">New Model Specification</h4>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <InputField 
              label="Model Name" 
              placeholder="e.g. Gemini Custom" 
              value={name} 
              onChange={(e) => setName(e.target.value)} 
            />
            <InputField 
              label="Model ID" 
              placeholder="e.g. gemini-3.5-pro" 
              value={modelId} 
              onChange={(e) => setModelId(e.target.value)} 
            />
          </div>

          <InputField 
            label="Base URL" 
            placeholder="e.g. https://generativelanguage.googleapis.com" 
            value={baseUrl} 
            onChange={(e) => setBaseUrl(e.target.value)} 
          />

          <InputField 
            label="API Key" 
            type="password"
            placeholder="e.g. AIzaSy..." 
            value={apiKey} 
            onChange={(e) => setApiKey(e.target.value)} 
          />

          <div className="flex justify-end gap-2 mt-1">
            <GlassButton onClick={() => setIsAdding(false)} size="sm">Cancel</GlassButton>
            <GlassButton onClick={handleSaveAdd} variant="primary" size="sm">Save Model</GlassButton>
          </div>
        </div>
      )}

      {/* Models List Table */}
      <div className="border border-cyber-card-border rounded-xl overflow-hidden">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-cyber-card-border bg-black/15 text-gray-500 font-semibold text-[10px] uppercase tracking-wider">
              <th className="px-4 py-2">Model Details</th>
              <th className="px-4 py-2">Endpoint ID</th>
              <th className="px-4 py-2 text-center">Status</th>
              <th className="px-4 py-2 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {models.map((model) => (
              <tr key={model.id} className="hover:bg-white/[0.01] transition-colors">
                <td className="px-4 py-3">
                  {editingId === model.id ? (
                    <div className="flex flex-col gap-1.5">
                      <InputField 
                        value={editName} 
                        onChange={(e) => setEditName(e.target.value)} 
                        className="py-1 px-2"
                      />
                      <InputField 
                        value={editBaseUrl} 
                        onChange={(e) => setEditBaseUrl(e.target.value)} 
                        className="py-1 px-2 text-[10px] text-gray-400"
                      />
                    </div>
                  ) : (
                    <div className="flex flex-col text-left">
                      <span className="font-semibold text-gray-300">{model.name}</span>
                      <span className="text-[10px] text-gray-500 truncate max-w-[180px]">{model.baseUrl}</span>
                    </div>
                  )}
                </td>
                
                <td className="px-4 py-3 font-mono text-[10px] text-gray-400">
                  {editingId === model.id ? (
                    <InputField 
                      value={editModelId} 
                      onChange={(e) => setEditModelId(e.target.value)} 
                      className="py-1 px-2"
                    />
                  ) : (
                    model.modelId
                  )}
                </td>

                <td className="px-4 py-3 text-center">
                  <GlassButton
                    onClick={() => toggleModelStatus(model.id)}
                    className={`!rounded-full border transition-colors cursor-pointer !gap-1 !px-2 !py-0.5 !text-[9px] !font-bold ${
                      model.status
                        ? "!bg-white/10 !border-white/25 !text-white"
                        : "!bg-transparent !border-white/5 !text-gray-500"
                    }`}
                  >
                    {model.status ? "Active" : "Inactive"}
                  </GlassButton>
                </td>

                <td className="px-4 py-3 text-right">
                  <div className="flex items-center justify-end gap-1.5">
                    {editingId === model.id ? (
                      <>
                        <GlassButton
                          onClick={() => handleSaveEdit(model.id)}
                          variant="ghost"
                          size="xs"
                          className="!p-1 text-white hover:!bg-white/10"
                        >
                          <Check className="w-3.5 h-3.5" />
                        </GlassButton>
                        <GlassButton
                          onClick={() => setEditingId(null)}
                          variant="ghost"
                          size="xs"
                          className="!p-1 text-gray-400 hover:!bg-white/10"
                        >
                          <X className="w-3.5 h-3.5" />
                        </GlassButton>
                      </>
                    ) : (
                      <>
                        <GlassButton
                          onClick={() => startEdit(model.id)}
                          variant="ghost"
                          size="xs"
                          className="!p-1 text-gray-400 hover:text-white"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </GlassButton>
                        <GlassButton
                          onClick={() => deleteModel(model.id)}
                          variant="ghost"
                          size="xs"
                          className="!p-1 text-gray-500 hover:!text-white hover:!bg-white/5"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </GlassButton>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
