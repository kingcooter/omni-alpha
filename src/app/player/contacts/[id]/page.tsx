export const dynamic = 'force-dynamic';

import { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  PlayerShell,
  PlayerHeader,
  PlayerSection,
  StatCard,
} from "@/components/player/layout/player-shell";
import { PlayerAvatar } from "@/components/player/shared/player-avatar";
import { TierBadge } from "@/components/player/shared/tier-badge";
import { TimeAgo } from "@/components/player/shared/time-ago";
import { ProgressBar } from "@/components/player/shared/progress-bar";
import { getPlayerContact } from "@/actions/player-contacts";
import { getContactInteractions } from "@/actions/player-interactions";
import { getEntityJournalEntries } from "@/actions/player-journal";
import { LogInteractionForm } from "./log-interaction-form";
import type { InteractionType } from "@/lib/db/schema";
import { ArrowLeft, Phone, Mail, MessageSquare, Coffee, Calendar, Users } from "lucide-react";

interface ContactDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function ContactDetailPage({ params }: ContactDetailPageProps) {
  const { id } = await params;
  const contact = await getPlayerContact(id);

  if (!contact) {
    notFound();
  }

  const metadata = contact.metadata;

  return (
    <PlayerShell>
      <PlayerHeader
        title={contact.name}
        subtitle={contact.title || metadata?.role || undefined}
        actions={
          <Link
            href="/player/contacts"
            className="flex items-center gap-1 text-[var(--player-text-sm)] text-[var(--player-ink-secondary)] hover:text-[var(--player-ink)]"
          >
            <ArrowLeft className="w-4 h-4" />
            Contacts
          </Link>
        }
      />

      <div className="p-6">
        {/* Contact Overview */}
        <div className="player-card player-cell-lg">
          <div className="flex items-start gap-4">
            <PlayerAvatar
              name={contact.name}
              photoUri={contact.photoUri}
              size="lg"
            />
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <TierBadge tier={contact.tier ?? "acquaintance"} />
                <span className="player-data text-[var(--player-text-sm)] text-[var(--player-ink-tertiary)]">
                  Score: {contact.tierScore ?? 0}/100
                </span>
              </div>

              <ProgressBar value={contact.tierScore ?? 0} className="mb-3" />

              {contact.firstMetContext && (
                <p className="text-[var(--player-text-sm)] text-[var(--player-ink-secondary)] mb-2">
                  {contact.firstMetContext}
                </p>
              )}

              {metadata?.company && (
                <p className="text-[var(--player-text-sm)] text-[var(--player-ink-tertiary)]">
                  {metadata.company}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="mt-4 grid grid-cols-3 gap-px bg-[var(--player-border)]">
          <StatCard
            label="Last Contact"
            value={contact.lastInteractionAt ? formatDate(contact.lastInteractionAt) : "Never"}
          />
          <StatCard
            label="Interactions"
            value={contact.interactionCount ?? 0}
          />
          <StatCard
            label="Total Time"
            value={formatDuration(contact.totalInteractionMinutes ?? 0)}
          />
        </div>

        {/* Log Interaction */}
        <PlayerSection title="Log Interaction" className="mt-6">
          <LogInteractionForm contactId={contact.id} contactName={contact.name} />
        </PlayerSection>

        {/* Interaction History */}
        <PlayerSection title="History" className="mt-6">
          <Suspense fallback={<HistorySkeleton />}>
            <InteractionHistory contactId={contact.id} />
          </Suspense>
        </PlayerSection>

        {/* Journal Entries for this Contact */}
        <PlayerSection title="Journal" className="mt-6">
          <Suspense fallback={<JournalSkeleton />}>
            <ContactJournal contactId={contact.id} />
          </Suspense>
        </PlayerSection>
      </div>
    </PlayerShell>
  );
}

async function InteractionHistory({ contactId }: { contactId: string }) {
  const interactions = await getContactInteractions(contactId, { limit: 10 });

  if (interactions.length === 0) {
    return (
      <div className="player-card player-cell-lg">
        <p className="text-[var(--player-text-sm)] text-[var(--player-ink-tertiary)]">
          No interactions logged yet
        </p>
      </div>
    );
  }

  return (
    <div className="player-card">
      {interactions.map((interaction) => (
        <div key={interaction.id} className="player-list-item">
          <InteractionIcon type={interaction.type} />
          <div className="flex-1 min-w-0">
            <p className="text-[var(--player-text-sm)] text-[var(--player-ink)]">
              {interaction.summary || getInteractionLabel(interaction.type)}
            </p>
            <div className="flex items-center gap-2 mt-0.5">
              <TimeAgo date={interaction.occurredAt} />
              {interaction.durationMinutes && (
                <span className="player-time">
                  {interaction.durationMinutes}m
                </span>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

async function ContactJournal({ contactId }: { contactId: string }) {
  const entries = await getEntityJournalEntries("contact", contactId, { limit: 5 });

  if (entries.length === 0) {
    return (
      <div className="player-card player-cell-lg">
        <p className="text-[var(--player-text-sm)] text-[var(--player-ink-tertiary)]">
          No journal entries for this contact
        </p>
      </div>
    );
  }

  return (
    <div className="player-card">
      {entries.map((entry) => (
        <div key={entry.id} className="player-list-item">
          <div className="flex-1 min-w-0">
            <p className="text-[var(--player-text-sm)] text-[var(--player-ink)]">
              {entry.content}
            </p>
            <TimeAgo date={entry.createdAt} />
          </div>
        </div>
      ))}
    </div>
  );
}

function InteractionIcon({ type }: { type: InteractionType }) {
  const icons: Record<InteractionType, React.ReactNode> = {
    call: <Phone className="w-3 h-3" />,
    meeting: <Users className="w-3 h-3" />,
    text: <MessageSquare className="w-3 h-3" />,
    email: <Mail className="w-3 h-3" />,
    coffee: <Coffee className="w-3 h-3" />,
    event: <Calendar className="w-3 h-3" />,
    intro: <Users className="w-3 h-3" />,
    other: <MessageSquare className="w-3 h-3" />,
  };

  const classMap: Record<InteractionType, string> = {
    call: "interaction-call",
    meeting: "interaction-meeting",
    text: "interaction-text",
    email: "interaction-email",
    coffee: "interaction-coffee",
    event: "interaction-meeting",
    intro: "interaction-meeting",
    other: "interaction-email",
  };

  return (
    <div className={`interaction-type ${classMap[type]}`}>
      {icons[type]}
    </div>
  );
}

function getInteractionLabel(type: InteractionType): string {
  const labels: Record<InteractionType, string> = {
    call: "Phone call",
    meeting: "Meeting",
    text: "Text message",
    email: "Email",
    coffee: "Coffee chat",
    event: "Event",
    intro: "Introduction",
    other: "Other",
  };
  return labels[type];
}

function formatDate(date: Date): string {
  const now = new Date();
  const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays}d ago`;

  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function formatDuration(minutes: number): string {
  if (minutes === 0) return "0m";
  if (minutes < 60) return `${minutes}m`;

  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (mins === 0) return `${hours}h`;
  return `${hours}h ${mins}m`;
}

function HistorySkeleton() {
  return (
    <div className="player-card animate-pulse">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="player-list-item">
          <div className="w-6 h-6 rounded bg-[var(--player-border)]" />
          <div className="flex-1">
            <div className="h-4 w-48 bg-[var(--player-border)] rounded mb-1" />
            <div className="h-3 w-24 bg-[var(--player-border)] rounded" />
          </div>
        </div>
      ))}
    </div>
  );
}

function JournalSkeleton() {
  return (
    <div className="player-card animate-pulse">
      {[...Array(2)].map((_, i) => (
        <div key={i} className="player-list-item">
          <div className="h-4 w-full bg-[var(--player-border)] rounded" />
        </div>
      ))}
    </div>
  );
}
