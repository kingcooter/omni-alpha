import { cn } from "@/lib/utils";

interface ProgressBarProps {
  value: number; // 0-100
  className?: string;
  showLabel?: boolean;
}

export function ProgressBar({ value, className, showLabel }: ProgressBarProps) {
  const clampedValue = Math.max(0, Math.min(100, value));

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div className="player-progress flex-1">
        <div
          className="player-progress-fill"
          style={{ width: `${clampedValue}%` }}
        />
      </div>
      {showLabel && (
        <span className="player-data text-[var(--player-text-xs)] text-[var(--player-ink-tertiary)]">
          {clampedValue}%
        </span>
      )}
    </div>
  );
}
