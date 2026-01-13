import type { PlayerContact } from "@/lib/db/schema";
import { ContactCard } from "./contact-card";
import { cn } from "@/lib/utils";

interface ContactGridProps {
  contacts: PlayerContact[];
  className?: string;
}

export function ContactGrid({ contacts, className }: ContactGridProps) {
  if (contacts.length === 0) {
    return (
      <div className="player-empty">
        <p className="text-[var(--player-text-sm)]">No contacts yet</p>
        <p className="text-[var(--player-text-xs)]">
          Add your first contact to get started
        </p>
      </div>
    );
  }

  return (
    <div className={cn("grid gap-px bg-[var(--player-border)]", className)}>
      {contacts.map((contact) => (
        <ContactCard key={contact.id} contact={contact} />
      ))}
    </div>
  );
}

interface ContactGridCompactProps {
  contacts: PlayerContact[];
  maxDisplay?: number;
  className?: string;
}

export function ContactGridCompact({
  contacts,
  maxDisplay = 6,
  className,
}: ContactGridCompactProps) {
  const displayContacts = contacts.slice(0, maxDisplay);
  const remaining = contacts.length - maxDisplay;

  if (contacts.length === 0) {
    return (
      <div className="player-empty py-4">
        <p className="text-[var(--player-text-xs)]">No contacts</p>
      </div>
    );
  }

  return (
    <div className={cn("flex flex-wrap gap-1", className)}>
      {displayContacts.map((contact) => (
        <ContactAvatarLink key={contact.id} contact={contact} />
      ))}
      {remaining > 0 && (
        <span className="player-avatar-sm flex items-center justify-center text-[var(--player-text-xs)] text-[var(--player-ink-tertiary)]">
          +{remaining}
        </span>
      )}
    </div>
  );
}

function ContactAvatarLink({ contact }: { contact: PlayerContact }) {
  return (
    <a
      href={`/player/contacts/${contact.id}`}
      className="player-avatar-sm transition-opacity hover:opacity-80"
      title={contact.name}
    >
      {contact.photoUri ? (
        <img src={contact.photoUri} alt={contact.name} />
      ) : (
        getInitials(contact.name)
      )}
    </a>
  );
}

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) {
    return parts[0].charAt(0).toUpperCase();
  }
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}
