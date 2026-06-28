import { useGlobalStore } from "../../store/index.js";
import { ProviderForm } from "./ProviderForm.js";

export function SettingsModal() {
  const isSettingsOpen = useGlobalStore((state) => state.isSettingsOpen);
  const setSettingsOpen = useGlobalStore((state) => state.setSettingsOpen);

  if (!isSettingsOpen) return null;

  return (
    <div className="fixed inset-0 z-40 bg-black/60 flex items-center justify-center p-4">
      <div className="bg-[#12141c] border border-white/10 p-6 rounded-xl max-w-lg w-full shadow-2xl relative">
        <button
          onClick={() => setSettingsOpen(false)}
          className="absolute top-4 right-4 text-white/50 hover:text-white text-sm"
        >
          ✕
        </button>
        <h2 className="text-white font-semibold text-lg mb-4">Companion Engine Settings</h2>
        <div className="space-y-4">
          <ProviderForm />
        </div>
      </div>
    </div>
  );
}
