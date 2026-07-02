import { memo } from "react";
import type { CostMeta } from "../../types/chat.js";

interface CostBadgeProps {
  costMeta: CostMeta | null;
}

export const CostBadge = memo(({ costMeta }: CostBadgeProps) => {
  if (!costMeta) return null;

  return (
    <div className="font-mono text-[9px] text-cyber-textMuted pt-1 select-none">
      cost: ${costMeta.cost}  |  tokens: {costMeta.tokens} ({costMeta.tokensIn} in / {costMeta.tokensOut} out)
    </div>
  );
});

CostBadge.displayName = "CostBadge";
