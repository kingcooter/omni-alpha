"use client";

import { useState, useTransition } from "react";
import { createPlayerContact } from "@/actions/player-contacts";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Plus, X } from "lucide-react";

interface AddContactFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function AddContactForm({ onSuccess, onCancel }: AddContactFormProps) {
  const [isPending, startTransition] = useTransition();
  const [name, setName] = useState("");
  const [title, setTitle] = useState("");
  const [company, setCompany] = useState("");
  const [context, setContext] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.error("Name is required");
      return;
    }

    startTransition(async () => {
      try {
        await createPlayerContact({
          name: name.trim(),
          title: title.trim() || undefined,
          firstMetContext: context.trim() || undefined,
          metadata: company.trim()
            ? { company: company.trim() }
            : undefined,
        });

        toast.success(`Added ${name}`);
        setName("");
        setTitle("");
        setCompany("");
        setContext("");
        onSuccess?.();
      } catch {
        toast.error("Failed to add contact");
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="player-card player-cell-lg space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="player-label">New Contact</h3>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="text-[var(--player-ink-tertiary)] hover:text-[var(--player-ink)]"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      <Input
        placeholder="Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="bg-transparent border-[var(--player-border)]"
        disabled={isPending}
        autoFocus
      />

      <div className="grid grid-cols-2 gap-2">
        <Input
          placeholder="Title / Role"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="bg-transparent border-[var(--player-border)]"
          disabled={isPending}
        />
        <Input
          placeholder="Company"
          value={company}
          onChange={(e) => setCompany(e.target.value)}
          className="bg-transparent border-[var(--player-border)]"
          disabled={isPending}
        />
      </div>

      <Input
        placeholder="How did you meet?"
        value={context}
        onChange={(e) => setContext(e.target.value)}
        className="bg-transparent border-[var(--player-border)]"
        disabled={isPending}
      />

      <div className="flex justify-end gap-2">
        {onCancel && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onCancel}
            disabled={isPending}
          >
            Cancel
          </Button>
        )}
        <Button type="submit" size="sm" disabled={isPending || !name.trim()}>
          <Plus className="w-4 h-4 mr-1" />
          Add Contact
        </Button>
      </div>
    </form>
  );
}

interface AddContactButtonProps {
  className?: string;
}

export function AddContactButton({ className }: AddContactButtonProps) {
  const [isOpen, setIsOpen] = useState(false);

  if (isOpen) {
    return (
      <AddContactForm
        onSuccess={() => setIsOpen(false)}
        onCancel={() => setIsOpen(false)}
      />
    );
  }

  return (
    <button
      onClick={() => setIsOpen(true)}
      className={`player-card player-card-hover player-cell-lg flex items-center justify-center gap-2 text-[var(--player-ink-tertiary)] hover:text-[var(--player-ink)] ${className}`}
    >
      <Plus className="w-4 h-4" />
      <span className="text-[var(--player-text-sm)]">Add Contact</span>
    </button>
  );
}
