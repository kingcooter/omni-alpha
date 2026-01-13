import { cn } from "@/lib/utils";

interface PlayerShellProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * Main shell for Player Menu pages.
 * Provides consistent layout and styling.
 */
export function PlayerShell({ children, className }: PlayerShellProps) {
  return (
    <div className={cn("min-h-screen bg-[var(--player-paper)]", className)}>
      {children}
    </div>
  );
}

interface PlayerHeaderProps {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
}

export function PlayerHeader({ title, subtitle, actions }: PlayerHeaderProps) {
  return (
    <header className="player-cell-lg border-b border-[var(--player-border)]">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[var(--player-text-xl)] font-medium text-[var(--player-ink)]">
            {title}
          </h1>
          {subtitle && (
            <p className="text-[var(--player-text-sm)] text-[var(--player-ink-secondary)] mt-1">
              {subtitle}
            </p>
          )}
        </div>
        {actions && <div className="flex items-center gap-2">{actions}</div>}
      </div>
    </header>
  );
}

interface PlayerSectionProps {
  title?: string;
  children: React.ReactNode;
  className?: string;
  actions?: React.ReactNode;
}

export function PlayerSection({ title, children, className, actions }: PlayerSectionProps) {
  return (
    <section className={cn("player-cell-lg", className)}>
      {(title || actions) && (
        <div className="flex items-center justify-between mb-3">
          {title && <h2 className="player-label">{title}</h2>}
          {actions}
        </div>
      )}
      {children}
    </section>
  );
}

interface PlayerGridProps {
  children: React.ReactNode;
  columns?: 1 | 2 | 3 | 4;
  className?: string;
}

export function PlayerGrid({ children, columns = 2, className }: PlayerGridProps) {
  const colClasses = {
    1: "grid-cols-1",
    2: "grid-cols-1 md:grid-cols-2",
    3: "grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
    4: "grid-cols-1 md:grid-cols-2 lg:grid-cols-4",
  };

  return (
    <div className={cn("grid gap-4", colClasses[columns], className)}>
      {children}
    </div>
  );
}

interface StatCardProps {
  label: string;
  value: string | number;
  subtext?: string;
  className?: string;
}

export function StatCard({ label, value, subtext, className }: StatCardProps) {
  return (
    <div className={cn("player-card player-stat", className)}>
      <span className="player-stat-value">{value}</span>
      <span className="player-stat-label">{label}</span>
      {subtext && (
        <span className="text-[var(--player-text-xs)] text-[var(--player-ink-tertiary)]">
          {subtext}
        </span>
      )}
    </div>
  );
}
