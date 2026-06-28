
export function PermissionAlert({ command, onApprove, onDeny }: { command: string; onApprove: () => void; onDeny: () => void }) {
  return (
    <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
      <div className="bg-[#12141c] border border-white/10 p-6 rounded-xl max-w-md w-full shadow-2xl">
        <h3 className="text-white font-semibold text-lg mb-2">Execute Terminal Command?</h3>
        <p className="text-xs text-white/50 mb-4">The agent is requesting permission to execute the following command:</p>
        <pre className="bg-black/50 border border-white/5 p-3 rounded-lg text-red-400 text-xs overflow-x-auto whitespace-pre-wrap mb-6">
          {command}
        </pre>
        <div className="flex justify-end gap-3">
          <button onClick={onDeny} className="px-4 py-2 border border-white/10 hover:bg-white/5 text-white text-xs font-semibold rounded-lg">
            Deny
          </button>
          <button onClick={onApprove} className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold rounded-lg">
            Approve
          </button>
        </div>
      </div>
    </div>
  );
}
