import type { ContactTier } from "@/lib/db/schema";
import { getTierDisplayName, getTierClass } from "@/lib/player/tier-calculator";
import { cn } from "@/lib/utils";

interface TierBadgeProps {
  tier: ContactTier;
  showLabel?: boolean;
  className?: string;
}

export function TierBadge({ tier, showLabel = true, className }: TierBadgeProps) {
  const tierClass = getTierClass(tier);
  const displayName = getTierDisplayName(tier);

  return (
    <span className={cn("tier-badge", tierClass, className)}>
      <TierDot tier={tier} />
      {showLabel && <span>{displayName}</span>}
    </span>
  );
}

interface TierDotProps {
  tier: ContactTier;
  className?: string;
}

export function TierDot({ tier, className }: TierDotProps) {
  const colorMap: Record<ContactTier, string> = {
    inner_circle: "bg-[var(--tier-inner-circle)]",
    close: "bg-[var(--tier-close)]",
    regular: "bg-[var(--tier-regular)]",
    acquaintance: "bg-[var(--tier-acquaintance)]",
    dormant: "bg-[var(--tier-dormant)]",
  };

  return (
    <span
      className={cn("w-2 h-2 rounded-full", colorMap[tier], className)}
      aria-hidden="true"
    />
  );
}
