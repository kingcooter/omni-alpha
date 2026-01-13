"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import {
  FolderKanban,
  ArrowLeft,
  Lightbulb,
  Pin,
  MoreHorizontal,
  Archive,
  Trash2,
  Clock,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { formatRelativeTime } from "@/lib/format";
import { pinThought, archiveThought, deleteThought } from "@/actions/thoughts";
import { toast } from "sonner";
import type { Project, Thought } from "@/lib/db/schema";

interface ProjectDetailClientProps {
  project: Project;
  thoughts: Thought[];
}

export function ProjectDetailClient({ project, thoughts }: ProjectDetailClientProps) {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href="/projects"
          className="flex items-center justify-center h-10 w-10 rounded-xl bg-secondary/50 text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 ring-1 ring-primary/20">
              <FolderKanban className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">{project.name}</h1>
              {project.description && (
                <p className="text-sm text-muted-foreground">{project.description}</p>
              )}
            </div>
          </div>
        </div>
        <div className="text-right">
          <span className="text-2xl font-bold text-foreground">{thoughts.length}</span>
          <p className="text-xs text-muted-foreground">
            {thoughts.length === 1 ? "thought" : "thoughts"}
          </p>
        </div>
      </div>

      {/* Thoughts List */}
      {thoughts.length === 0 ? (
        <Card className="border-0 bg-card/40">
          <CardContent className="py-12 text-center">
            <Lightbulb className="h-12 w-12 mx-auto text-muted-foreground/30 mb-4" />
            <p className="text-muted-foreground">No thoughts in this project yet</p>
            <p className="text-sm text-muted-foreground/60 mt-1">
              Add thoughts to this project from the inbox
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {thoughts.map((thought) => (
            <ThoughtItem key={thought.id} thought={thought} />
          ))}
        </div>
      )}
    </div>
  );
}

function ThoughtItem({ thought }: { thought: Thought }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [showMenu, setShowMenu] = useState(false);

  const handlePin = () => {
    startTransition(async () => {
      await pinThought(thought.id, !thought.isPinned);
      router.refresh();
      toast.success(thought.isPinned ? "Unpinned" : "Pinned");
    });
    setShowMenu(false);
  };

  const handleArchive = () => {
    startTransition(async () => {
      await archiveThought(thought.id);
      router.refresh();
      toast.success("Archived");
    });
    setShowMenu(false);
  };

  const handleDelete = () => {
    startTransition(async () => {
      await deleteThought(thought.id);
      router.refresh();
      toast.success("Deleted");
    });
    setShowMenu(false);
  };

  return (
    <Card
      className={cn(
        "group relative border-0 bg-card/60 backdrop-blur-sm transition-all duration-200",
        "hover:bg-card hover:-translate-y-0.5",
        thought.isPinned && "ring-1 ring-primary/20 bg-primary/5",
        isPending && "opacity-50"
      )}
    >
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div
            className={cn(
              "mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg",
              thought.isPinned
                ? "bg-primary/20 text-primary"
                : "bg-secondary/50 text-muted-foreground"
            )}
          >
            {thought.isPinned ? (
              <Pin className="h-4 w-4" />
            ) : (
              <Lightbulb className="h-4 w-4" />
            )}
          </div>

          <div className="flex-1 min-w-0">
            <p className="text-sm text-foreground/90 leading-relaxed whitespace-pre-wrap">
              {thought.content}
            </p>
            <div className="mt-2 flex items-center gap-2 text-[11px] text-muted-foreground/50">
              <Clock className="h-3 w-3" />
              {thought.createdAt ? formatRelativeTime(thought.createdAt) : ""}
            </div>
          </div>

          {/* Actions Menu */}
          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground/50 opacity-0 transition-all hover:bg-secondary/50 hover:text-muted-foreground group-hover:opacity-100"
            >
              <MoreHorizontal className="h-4 w-4" />
            </button>

            {showMenu && (
              <div className="absolute right-0 top-full z-10 mt-1 w-36 rounded-lg border border-border/50 bg-card/95 backdrop-blur-xl p-1 shadow-xl">
                <button
                  onClick={handlePin}
                  className="flex w-full items-center gap-2 rounded-md px-2.5 py-1.5 text-xs text-foreground/80 hover:bg-secondary/50"
                >
                  <Pin className="h-3.5 w-3.5" />
                  {thought.isPinned ? "Unpin" : "Pin"}
                </button>
                <button
                  onClick={handleArchive}
                  className="flex w-full items-center gap-2 rounded-md px-2.5 py-1.5 text-xs text-foreground/80 hover:bg-secondary/50"
                >
                  <Archive className="h-3.5 w-3.5" />
                  Archive
                </button>
                <button
                  onClick={handleDelete}
                  className="flex w-full items-center gap-2 rounded-md px-2.5 py-1.5 text-xs text-red-400 hover:bg-red-500/10"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  Delete
                </button>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
