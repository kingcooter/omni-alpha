"use client";

import { useState, useTransition } from "react";
import { logInteraction } from "@/actions/player-interactions";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import type { InteractionType } from "@/lib/db/schema";
import { Phone, Mail, MessageSquare, Coffee, Calendar, Users, MoreHorizontal } from "lucide-react";

interface LogInteractionFormProps {
  contactId: string;
  contactName: string;
}

const interactionTypes: { type: InteractionType; icon: React.ReactNode; label: string }[] = [
  { type: "call", icon: <Phone className="w-4 h-4" />, label: "Call" },
  { type: "meeting", icon: <Users className="w-4 h-4" />, label: "Meeting" },
  { type: "coffee", icon: <Coffee className="w-4 h-4" />, label: "Coffee" },
  { type: "email", icon: <Mail className="w-4 h-4" />, label: "Email" },
  { type: "text", icon: <MessageSquare className="w-4 h-4" />, label: "Text" },
  { type: "event", icon: <Calendar className="w-4 h-4" />, label: "Event" },
];

export function LogInteractionForm({ contactId, contactName }: LogInteractionFormProps) {
  const [isPending, startTransition] = useTransition();
  const [selectedType, setSelectedType] = useState<InteractionType | null>(null);
  const [notes, setNotes] = useState("");
  const [duration, setDuration] = useState("");

  const handleSubmit = () => {
    if (!selectedType) {
      toast.error("Select an interaction type");
      return;
    }

    startTransition(async () => {
      try {
        await logInteraction({
          contactId,
          type: selectedType,
          durationMinutes: duration ? parseInt(duration, 10) : undefined,
          rawInput: notes.trim() || undefined,
          summary: notes.trim() || undefined,
        });

        toast.success(`Logged ${selectedType} with ${contactName}`);
        setSelectedType(null);
        setNotes("");
        setDuration("");
      } catch {
        toast.error("Failed to log interaction");
      }
    });
  };

  return (
    <div className="player-card player-cell-lg space-y-4">
      {/* Type Selection */}
      <div>
        <p className="player-label mb-2">Type</p>
        <div className="flex flex-wrap gap-2">
          {interactionTypes.map(({ type, icon, label }) => (
            <button
              key={type}
              onClick={() => setSelectedType(type)}
              disabled={isPending}
              className={`flex items-center gap-2 px-3 py-2 text-[var(--player-text-sm)] border transition-colors ${
                selectedType === type
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-[var(--player-border)] text-[var(--player-ink-secondary)] hover:border-[var(--player-border-strong)]"
              }`}
            >
              {icon}
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Notes */}
      {selectedType && (
        <>
          <div>
            <p className="player-label mb-2">Notes (optional)</p>
            <Textarea
              placeholder="What did you discuss?"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="bg-transparent border-[var(--player-border)] min-h-[80px]"
              disabled={isPending}
            />
          </div>

          {/* Duration */}
          <div>
            <p className="player-label mb-2">Duration (minutes)</p>
            <input
              type="number"
              placeholder="15"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              className="w-24 px-3 py-2 text-[var(--player-text-sm)] bg-transparent border border-[var(--player-border)] focus:border-primary outline-none"
              disabled={isPending}
              min="1"
            />
          </div>

          {/* Submit */}
          <div className="flex justify-end">
            <Button onClick={handleSubmit} disabled={isPending}>
              Log Interaction
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
