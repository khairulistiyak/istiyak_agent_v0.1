import React from "react";
import { X } from "lucide-react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-lg bg-[var(--cyber-card)] border border-[var(--cyber-card-border)] rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--cyber-card-border)]">
          <h3 className="font-semibold text-sm text-[var(--cyber-text-primary)]">{title}</h3>
          <button onClick={onClose} className="text-[var(--cyber-text-secondary)] hover:text-white transition-colors">
            <X size={16} />
          </button>
        </div>
        <div className="p-4 overflow-y-auto flex-1">{children}</div>
      </div>
    </div>
  );
};
export default Modal;
