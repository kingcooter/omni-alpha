"use client";

import Link from "next/link";
import type { PlayerContact } from "@/lib/db/schema";
import { PlayerAvatar } from "../shared/player-avatar";
import { TierBadge } from "../shared/tier-badge";
import { TimeAgo } from "../shared/time-ago";
import { cn } from "@/lib/utils";

interface ContactCardProps {
  contact: PlayerContact;
  className?: string;
}

export function ContactCard({ contact, className }: ContactCardProps) {
  const metadata = contact.metadata;

  return (
    <Link
      href={`/player/contacts/${contact.id}`}
      className={cn(
        "player-card player-card-hover player-cell-lg block",
        className
      )}
    >
      <div className="flex items-start gap-3">
        <PlayerAvatar
          name={contact.name}
          photoUri={contact.photoUri}
          size="md"
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <h3 className="font-medium text-[var(--player-ink)] truncate">
              {contact.name}
            </h3>
            <TierBadge tier={contact.tier ?? "acquaintance"} showLabel={false} />
          </div>

          {(contact.title || metadata?.role || metadata?.company) && (
            <p className="text-[var(--player-text-sm)] text-[var(--player-ink-secondary)] truncate mt-0.5">
              {contact.title || metadata?.role}
              {metadata?.company && (
                <span className="text-[var(--player-ink-tertiary)]">
                  {" "}
                  at {metadata.company}
                </span>
              )}
            </p>
          )}

          <div className="flex items-center gap-3 mt-2 text-[var(--player-text-xs)] text-[var(--player-ink-tertiary)]">
            <span className="player-data">
              <TimeAgo date={contact.lastInteractionAt} />
            </span>
            <span className="player-data">
              {contact.interactionCount ?? 0} interactions
            </span>
            {(contact.totalInteractionMinutes ?? 0) > 0 && (
              <span className="player-data">
                {formatDuration(contact.totalInteractionMinutes ?? 0)}
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}

function formatDuration(minutes: number): string {
  if (minutes < 60) {
    return `${minutes}m`;
  }
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (mins === 0) {
    return `${hours}h`;
  }
  return `${hours}h ${mins}m`;
}
