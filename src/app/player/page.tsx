export const dynamic = 'force-dynamic';

import { Suspense } from "react";
import Link from "next/link";
import {
  PlayerShell,
  PlayerHeader,
  PlayerSection,
  PlayerGrid,
  StatCard,
} from "@/components/player/layout/player-shell";
import { ContactGridCompact } from "@/components/player/contacts/contact-grid";
import { getPlayerContacts, getContactCountsByTier } from "@/actions/player-contacts";
import { getRecentJournalEntries } from "@/actions/player-journal";
import { TimeAgo } from "@/components/player/shared/time-ago";
import { TierBadge } from "@/components/player/shared/tier-badge";
import { Users, BookOpen, Swords, User } from "lucide-react";

export default function PlayerMenuPage() {
  return (
    <PlayerShell>
      <PlayerHeader
        title="Player Menu"
        subtitle="Your world at a glance"
      />

      <div className="p-6">
        <PlayerGrid columns={2}>
          {/* Stats Overview */}
          <Suspense fallback={<StatsSkeleton />}>
            <StatsSection />
          </Suspense>

          {/* Quick Nav */}
          <QuickNavSection />
        </PlayerGrid>

        <div className="mt-6">
          <PlayerGrid columns={2}>
            {/* Contacts */}
            <PlayerSection title="Contacts">
              <Suspense fallback={<ContactsSkeleton />}>
                <ContactsPreview />
              </Suspense>
            </PlayerSection>

            {/* Recent Journal */}
            <PlayerSection title="Journal">
              <Suspense fallback={<JournalSkeleton />}>
                <JournalPreview />
              </Suspense>
            </PlayerSection>
          </PlayerGrid>
        </div>
      </div>
    </PlayerShell>
  );
}

async function StatsSection() {
  const tierCounts = await getContactCountsByTier();
  const totalContacts = Object.values(tierCounts).reduce((a, b) => a + b, 0);

  return (
    <div className="player-card">
      <div className="player-grid grid-cols-2">
        <StatCard label="Contacts" value={totalContacts} />
        <StatCard label="Inner Circle" value={tierCounts.inner_circle} />
        <StatCard label="Close" value={tierCounts.close} />
        <StatCard label="Regular" value={tierCounts.regular} />
      </div>
    </div>
  );
}

function QuickNavSection() {
  const navItems = [
    { href: "/player/contacts", icon: Users, label: "Contacts" },
    { href: "/player/quests", icon: Swords, label: "Quests" },
    { href: "/player/journal", icon: BookOpen, label: "Journal" },
    { href: "/player/character", icon: User, label: "Character" },
  ];

  return (
    <div className="player-card">
      <div className="player-grid grid-cols-2">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="player-cell-lg flex items-center gap-3 hover:bg-[rgba(255,255,255,0.02)] transition-colors"
          >
            <item.icon className="w-5 h-5 text-[var(--player-ink-secondary)]" />
            <span className="text-[var(--player-ink)]">{item.label}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}

async function ContactsPreview() {
  const contacts = await getPlayerContacts({ limit: 8 });

  if (contacts.length === 0) {
    return (
      <div className="player-card player-cell-lg">
        <p className="text-[var(--player-text-sm)] text-[var(--player-ink-tertiary)]">
          No contacts yet.{" "}
          <Link href="/player/contacts" className="text-primary hover:underline">
            Add your first contact
          </Link>
        </p>
      </div>
    );
  }

  return (
    <div className="player-card">
      <div className="player-cell-lg">
        <ContactGridCompact contacts={contacts} maxDisplay={8} />
      </div>
      <Link
        href="/player/contacts"
        className="player-cell block text-center text-[var(--player-text-xs)] text-[var(--player-ink-tertiary)] hover:text-[var(--player-ink)] border-t border-[var(--player-border)]"
      >
        View all contacts
      </Link>
    </div>
  );
}

async function JournalPreview() {
  const entries = await getRecentJournalEntries({ limit: 5 });

  if (entries.length === 0) {
    return (
      <div className="player-card player-cell-lg">
        <p className="text-[var(--player-text-sm)] text-[var(--player-ink-tertiary)]">
          No journal entries yet. Log an interaction to get started.
        </p>
      </div>
    );
  }

  return (
    <div className="player-card">
      {entries.map((entry) => (
        <div key={entry.id} className="player-list-item">
          <div className="flex-1 min-w-0">
            <p className="text-[var(--player-text-sm)] text-[var(--player-ink)] truncate">
              {entry.content}
            </p>
            <TimeAgo date={entry.createdAt} />
          </div>
        </div>
      ))}
      <Link
        href="/player/journal"
        className="player-cell block text-center text-[var(--player-text-xs)] text-[var(--player-ink-tertiary)] hover:text-[var(--player-ink)] border-t border-[var(--player-border)]"
      >
        View full journal
      </Link>
    </div>
  );
}

function StatsSkeleton() {
  return (
    <div className="player-card animate-pulse">
      <div className="player-grid grid-cols-2">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="player-cell-lg">
            <div className="h-6 w-12 bg-[var(--player-border)] rounded mb-2" />
            <div className="h-3 w-16 bg-[var(--player-border)] rounded" />
          </div>
        ))}
      </div>
    </div>
  );
}

function ContactsSkeleton() {
  return (
    <div className="player-card player-cell-lg animate-pulse">
      <div className="flex gap-1">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="w-8 h-8 rounded-full bg-[var(--player-border)]" />
        ))}
      </div>
    </div>
  );
}

function JournalSkeleton() {
  return (
    <div className="player-card animate-pulse">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="player-list-item">
          <div className="h-4 w-full bg-[var(--player-border)] rounded" />
        </div>
      ))}
    </div>
  );
}
