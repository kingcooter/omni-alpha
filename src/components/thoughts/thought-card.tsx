"use client";

import { useState, useTransition } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Pin, Archive, Trash2, MoreHorizontal } from "lucide-react";
import { archiveThought, pinThought, deleteThought } from "@/actions/thoughts";
import type { Thought } from "@/lib/db";

interface ThoughtCardProps {
  thought: Thought;
}

export function ThoughtCard({ thought }: ThoughtCardProps) {
  const [showActions, setShowActions] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handlePin = () => {
    startTransition(async () => {
      await pinThought(thought.id, !thought.isPinned);
    });
  };

  const handleArchive = () => {
    startTransition(async () => {
      await archiveThought(thought.id);
    });
  };

  const handleDelete = () => {
    startTransition(async () => {
      await deleteThought(thought.id);
    });
  };

  const formatDate = (date: Date | null) => {
    if (!date) return "";
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return "just now";
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <Card
      className={`group bg-card transition-colors hover:bg-card/80 ${
        isPending ? "opacity-50" : ""
      } ${thought.isPinned ? "border-primary/30" : ""}`}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <p className="text-sm text-foreground whitespace-pre-wrap break-words">
              {thought.content}
            </p>
            <p className="mt-2 text-xs text-muted-foreground">
              {formatDate(thought.createdAt)}
              {thought.isPinned && (
                <span className="ml-2 text-primary">Pinned</span>
              )}
            </p>
          </div>

          {/* Actions */}
          <div
            className={`flex items-center gap-1 transition-opacity ${
              showActions ? "opacity-100" : "opacity-0"
            }`}
          >
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={handlePin}
              disabled={isPending}
            >
              <Pin
                className={`h-3.5 w-3.5 ${
                  thought.isPinned ? "fill-primary text-primary" : ""
                }`}
              />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={handleArchive}
              disabled={isPending}
            >
              <Archive className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-destructive hover:text-destructive"
              onClick={handleDelete}
              disabled={isPending}
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
