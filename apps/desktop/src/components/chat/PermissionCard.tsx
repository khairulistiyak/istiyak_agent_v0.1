import { memo } from "react";
import type { PermissionRequest } from "../../types/chat.js";
import { FileCapsule } from "../ui/FileCapsule.js";

interface PermissionCardProps {
  request: PermissionRequest;
  state: "pending" | "approved" | "rejected" | "timed_out";
  onApprove: () => void;
  onReject: () => void;
}

const isCommandRequest = (req: PermissionRequest) =>
  req.type === "run_command" || req.type === "sandbox" || req.type === "terminal";

const extractFilePath = (req: PermissionRequest): string | null => {
  const fileTypes = ["read_file", "write_file", "precise_edit", "delete", "rename", "move"];
  if (fileTypes.includes(req.type)) {
    const match = req.command.match(/`([^`]+)`/);
    return match ? match[1] : null;
  }
  return null;
};

export const PermissionCard = memo(({
  request,
  state,
  onApprove,
  onReject
}: PermissionCardProps) => {
  const filePath = extractFilePath(request);
  const isCommand = isCommandRequest(request);

  if (state !== "pending") {
    return (
      <div
        className={`my-2.5 max-w-[90%] select-none rounded-xl border px-3.5 py-3 text-xs ${
          state === "approved"
            ? "border-emerald-500/30 bg-emerald-500/5"
            : state === "timed_out"
            ? "border-amber-500/30 bg-amber-500/5"
            : "border-red-500/30 bg-red-500/5"
        }`}
      >
        <div className={`flex items-center gap-2 font-semibold ${
          state === "approved" ? "text-emerald-400" : state === "timed_out" ? "text-amber-400" : "text-red-400"
        }`}>
          {state === "approved" ? (
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <circle cx="7" cy="7" r="6" fill="#10b981" fillOpacity="0.2" stroke="#10b981" strokeWidth="0.75"/>
              <path d="M4 7L6 9L10 5" stroke="#34d399" strokeWidth="1.2" strokeLinecap="round"/>
            </svg>
          ) : state === "timed_out" ? (
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <circle cx="7" cy="7" r="6" fill="#f59e0b" fillOpacity="0.2" stroke="#f59e0b" strokeWidth="0.75"/>
              <path d="M7 4V7L9 9" stroke="#fbbf24" strokeWidth="1.2" strokeLinecap="round"/>
            </svg>
          ) : (
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <circle cx="7" cy="7" r="6" fill="#ef4444" fillOpacity="0.2" stroke="#ef4444" strokeWidth="0.75"/>
              <line x1="5" y1="5" x2="9" y2="9" stroke="#f87171" strokeWidth="1.2" strokeLinecap="round"/>
              <line x1="9" y1="5" x2="5" y2="9" stroke="#f87171" strokeWidth="1.2" strokeLinecap="round"/>
            </svg>
          )}
          {state === "approved" ? "Approved & Executed" : state === "timed_out" ? "Request Timed Out" : "Blocked by User"}
        </div>
      </div>
    );
  }

  // Command execution security gate (07-accept-reject-zen.svg - Flow 2)
  if (isCommand) {
    return (
      <div className="my-2.5 max-w-[90%] select-none rounded-xl border border-amber-500/30 bg-amber-500/[0.03] px-4 py-3.5 text-xs">
        <div className="flex items-center gap-2 font-bold text-amber-400 uppercase tracking-wider">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <polygon points="8,2 14,12 2,12" fill="none" stroke="#f59e0b" strokeWidth="1.2" strokeLinejoin="round" />
            <line x1="8" y1="6" x2="8" y2="9" stroke="#f59e0b" strokeWidth="1.2" strokeLinecap="round" />
            <circle cx="8" cy="11.5" r="0.8" fill="#f59e0b" />
          </svg>
          Security Confirmation Required
        </div>

        <code className="mt-2 block rounded border border-slate-800 bg-[#0b0c0e] p-2.5 font-mono text-[10.5px] text-slate-200 break-all whitespace-pre-wrap">
          $ {request.command}
        </code>

        {request.reason && (
          <p className="mt-2 text-[10.5px] leading-relaxed text-amber-300/80 font-semibold">
            <span className="text-amber-400">⟳</span> {request.reason}
          </p>
        )}

        {/* Inline controls (07-accept-reject-zen.svg style) */}
        <div className="mt-3 flex items-center gap-3">
          <button
            onClick={onReject}
            className="text-[10.5px] font-bold text-red-400 hover:text-red-300 transition-colors cursor-pointer flex items-center gap-1"
          >
            Deny
            <span className="glass-key-cap-reject inline-flex items-center justify-center rounded px-1 py-0.5 text-[7px] font-bold">
              ⌫
            </span>
          </button>

          <span className="text-[10px] text-slate-600">|</span>

          <button
            className="text-[10.5px] text-slate-400 hover:text-slate-300 transition-colors cursor-pointer"
          >
            Run in Sandbox
          </button>

          <span className="text-[10px] text-slate-600">|</span>

          <button
            onClick={onApprove}
            className="glass-pill-button-active inline-flex items-center gap-1.5 rounded px-3 py-1.5 text-[10px] font-bold transition-all duration-200 cursor-pointer"
          >
            Approve and run
            <span className="glass-key-cap inline-flex items-center justify-center rounded px-1 py-0.5 text-[7px] font-bold">
              ⏎
            </span>
          </button>
        </div>
      </div>
    );
  }

  // File operation inline review bar (07-accept-reject-zen.svg - Flow 1)
  return (
    <div className="my-2.5 max-w-[90%] select-none rounded-xl border border-slate-800 bg-[#11131e] px-3.5 py-2.5 text-xs">
      <div className="flex items-center gap-3">
        {filePath && <FileCapsule filePath={filePath} />}

        <span className="text-[9px] text-slate-500 font-medium">
          {request.type === "write_file" || request.type === "precise_edit" ? "1 chunk pending" : `${request.type.replace(/_/g, " ")} pending`}
        </span>

        <span className="text-[10px] text-slate-700">|</span>

        <button
          onClick={onReject}
          className="text-[10.5px] font-bold text-red-400 hover:text-red-300 transition-colors cursor-pointer flex items-center gap-1"
        >
          Reject
          <span className="glass-key-cap-reject inline-flex items-center justify-center rounded px-1 py-0.5 text-[7px] font-bold">
            ⌫
          </span>
        </button>

        <span className="text-[10px] text-slate-700">|</span>

        <button className="text-[10.5px] text-slate-400 hover:text-slate-300 transition-colors cursor-pointer">
          Modify
        </button>

        <span className="text-[10px] text-slate-700">|</span>

        <button
          onClick={onApprove}
          className="glass-pill-button-active inline-flex items-center gap-1.5 rounded px-2.5 py-1 text-[10px] font-bold transition-all duration-200 cursor-pointer"
        >
          Accept
          <span className="glass-key-cap inline-flex items-center justify-center rounded px-1 py-0.5 text-[7px] font-bold">
            ⏎
          </span>
        </button>
      </div>

      {request.reason && (
        <p className="mt-2 text-[10px] text-slate-500">{request.reason}</p>
      )}
    </div>
  );
});

PermissionCard.displayName = "PermissionCard";
