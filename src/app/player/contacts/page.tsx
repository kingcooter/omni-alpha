export const dynamic = 'force-dynamic';

import { Suspense } from "react";
import Link from "next/link";
import {
  PlayerShell,
  PlayerHeader,
  PlayerSection,
} from "@/components/player/layout/player-shell";
import { ContactGrid } from "@/components/player/contacts/contact-grid";
import { AddContactButton } from "@/components/player/contacts/add-contact-form";
import { getPlayerContacts, getContactCountsByTier } from "@/actions/player-contacts";
import { TierBadge } from "@/components/player/shared/tier-badge";
import type { ContactTier } from "@/lib/db/schema";
import { ArrowLeft } from "lucide-react";

export default function ContactsPage() {
  return (
    <PlayerShell>
      <PlayerHeader
        title="Contacts"
        subtitle="Your network of allies and connections"
        actions={
          <Link
            href="/player"
            className="flex items-center gap-1 text-[var(--player-text-sm)] text-[var(--player-ink-secondary)] hover:text-[var(--player-ink)]"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Link>
        }
      />

      <div className="p-6">
        {/* Tier Summary */}
        <Suspense fallback={<TierSummarySkeleton />}>
          <TierSummary />
        </Suspense>

        {/* Add Contact */}
        <div className="mt-6">
          <AddContactButton className="w-full" />
        </div>

        {/* Contact List */}
        <div className="mt-6">
          <Suspense fallback={<ContactListSkeleton />}>
            <ContactList />
          </Suspense>
        </div>
      </div>
    </PlayerShell>
  );
}

async function TierSummary() {
  const counts = await getContactCountsByTier();
  const tiers: ContactTier[] = ["inner_circle", "close", "regular", "acquaintance", "dormant"];

  return (
    <div className="player-card">
      <div className="flex flex-wrap gap-3 player-cell-lg">
        {tiers.map((tier) => (
          <div key={tier} className="flex items-center gap-2">
            <TierBadge tier={tier} />
            <span className="player-data text-[var(--player-text-sm)]">
              {counts[tier]}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

async function ContactList() {
  const contacts = await getPlayerContacts();

  return <ContactGrid contacts={contacts} />;
}

function TierSummarySkeleton() {
  return (
    <div className="player-card player-cell-lg animate-pulse">
      <div className="flex gap-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-6 w-24 bg-[var(--player-border)] rounded" />
        ))}
      </div>
    </div>
  );
}

function ContactListSkeleton() {
  return (
    <div className="space-y-px">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="player-card player-cell-lg animate-pulse">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[var(--player-border)]" />
            <div className="flex-1">
              <div className="h-4 w-32 bg-[var(--player-border)] rounded mb-2" />
              <div className="h-3 w-48 bg-[var(--player-border)] rounded" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
