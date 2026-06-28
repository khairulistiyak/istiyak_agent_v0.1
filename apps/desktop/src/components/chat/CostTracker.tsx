
export function CostTracker({ inputTokens, outputTokens, totalCost }: { inputTokens: number; outputTokens: number; totalCost: number }) {
  return (
    <div className="flex justify-between items-center px-4 py-2 bg-black/40 border-b border-white/5 text-[10px] text-white/50 font-medium">
      <div>
        Cost: <span className="text-green-400">${totalCost.toFixed(6)}</span>
      </div>
      <div className="flex gap-3">
        <span>In: {inputTokens} tokens</span>
        <span>Out: {outputTokens} tokens</span>
      </div>
    </div>
  );
}
