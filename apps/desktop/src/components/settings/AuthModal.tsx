import { useState } from "react";
import { useGlobalStore } from "../../store/index.js";

export function AuthModal({ onClose }: { onClose: () => void }) {
  const userEmail = useGlobalStore((state) => state.userEmail);
  const updateSettings = useGlobalStore((state) => state.updateSettings);
  const [emailInput, setEmailInput] = useState(userEmail);

  const handleSave = () => {
    updateSettings({ userEmail: emailInput });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
      <div className="bg-[#12141c] border border-white/10 p-6 rounded-xl max-w-sm w-full shadow-2xl">
        <h3 className="text-white font-semibold text-lg mb-2">Cloud Authentication</h3>
        <p className="text-xs text-white/50 mb-4">Log in to link your license and unlock unlimited cloud sandbox sessions.</p>
        <input
          type="email"
          value={emailInput}
          onChange={(e) => setEmailInput(e.target.value)}
          placeholder="user@example.com"
          className="w-full bg-white/5 border border-white/10 rounded-lg p-2 text-white text-xs mb-6 placeholder-white/20"
        />
        <div className="flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 border border-white/10 hover:bg-white/5 text-white text-xs font-semibold rounded-lg">
            Cancel
          </button>
          <button onClick={handleSave} className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold rounded-lg">
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
