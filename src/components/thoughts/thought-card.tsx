"use client";

import { useState, useTransition } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Pin, Archive, Trash2, Sparkles, FolderKanban, X } from "lucide-react";
import { archiveThought, pinThought, deleteThought, assignThoughtToProject } from "@/actions/thoughts";
import { toast } from "sonner";
import { formatRelativeTime } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { Thought, Project } from "@/lib/db";
import { DueDateBadge } from "./due-date-badge";

interface ThoughtCardProps {
  thought: Thought;
  project?: Project | null;
  projects?: Project[];
}

export function ThoughtCard({ thought, project, projects = [] }: ThoughtCardProps) {
  const [showActions, setShowActions] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handlePin = () => {
    startTransition(async () => {
      try {
        await pinThought(thought.id, !thought.isPinned);
        toast.success(thought.isPinned ? "Unpinned" : "Pinned");
      } catch {
        toast.error("Failed to update thought");
      }
    });
  };

  const handleArchive = () => {
    startTransition(async () => {
      try {
        await archiveThought(thought.id);
        toast.success("Archived");
      } catch {
        toast.error("Failed to archive thought");
      }
    });
  };

  const handleDelete = () => {
    startTransition(async () => {
      try {
        await deleteThought(thought.id);
        toast.success("Deleted");
      } catch {
        toast.error("Failed to delete thought");
      }
    });
  };

  const handleAssignProject = (projectId: string | null) => {
    startTransition(async () => {
      try {
        await assignThoughtToProject(thought.id, projectId);
        toast.success(projectId ? "Added to project" : "Removed from project");
      } catch {
        toast.error("Failed to update project");
      }
    });
  };

  return (
    <Card
      className={cn(
        "group relative overflow-hidden border-0 bg-card/60 backdrop-blur-sm transition-all duration-300",
        "hover:bg-card/80 hover:shadow-lg hover:shadow-black/10",
        isPending && "opacity-50",
        thought.isPinned && "ring-1 ring-primary/30 bg-gradient-to-r from-primary/5 to-transparent"
      )}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      {/* Pinned indicator line */}
      {thought.isPinned && (
        <div className="absolute left-0 top-0 bottom-0 w-[2px] bg-gradient-to-b from-primary via-primary/60 to-transparent" />
      )}

      {/* Subtle top shine */}
      <div className="absolute top-0 left-6 right-6 h-px bg-gradient-to-r from-transparent via-white/5 to-transparent" />

      <CardContent className="relative p-4 pl-5">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <p className="text-sm text-foreground/90 whitespace-pre-wrap break-words leading-relaxed">
              {thought.content}
            </p>
            <div className="mt-3 flex items-center gap-3 flex-wrap">
              <span className="text-[11px] text-muted-foreground/50 font-medium">
                {formatRelativeTime(thought.createdAt)}
              </span>
              {thought.isPinned && (
                <span className="flex items-center gap-1.5 text-[11px] font-medium text-primary/80">
                  <Sparkles className="h-3 w-3" />
                  Pinned
                </span>
              )}
              {project && (
                <span
                  className="flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[10px] font-medium"
                  style={{
                    backgroundColor: `${project.color}15`,
                    color: project.color ?? "#d4a574",
                  }}
                >
                  <FolderKanban className="h-2.5 w-2.5" />
                  {project.name}
                </span>
              )}
              {thought.dueDate && (
                <DueDateBadge
                  dueDate={new Date(thought.dueDate)}
                  dueDateText={thought.dueDateText}
                />
              )}
            </div>
          </div>

          {/* Actions */}
          <div
            className={cn(
              "flex items-center gap-1 rounded-lg bg-secondary/50 p-1 transition-all duration-300",
              showActions ? "opacity-100 translate-x-0" : "opacity-0 translate-x-4 pointer-events-none"
            )}
          >
            {/* Project selector */}
            {projects.length > 0 && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className={cn(
                      "h-7 w-7 rounded-md transition-all duration-200",
                      project
                        ? "text-foreground hover:bg-secondary"
                        : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                    )}
                    disabled={isPending}
                    title="Assign to project"
                  >
                    <FolderKanban className="h-3.5 w-3.5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="border-border/50 bg-card/95 backdrop-blur-xl">
                  {projects.map((p) => (
                    <DropdownMenuItem
                      key={p.id}
                      onClick={() => handleAssignProject(p.id)}
                      className={cn(
                        "gap-2",
                        project?.id === p.id && "bg-primary/10"
                      )}
                    >
                      <div
                        className="h-3 w-3 rounded-full"
                        style={{ backgroundColor: p.color ?? "#d4a574" }}
                      />
                      {p.name}
                    </DropdownMenuItem>
                  ))}
                  {project && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => handleAssignProject(null)}
                        className="gap-2 text-muted-foreground"
                      >
                        <X className="h-3 w-3" />
                        Remove from project
                      </DropdownMenuItem>
                    </>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
            <Button
              variant="ghost"
              size="icon"
              className={cn(
                "h-7 w-7 rounded-md transition-all duration-200",
                thought.isPinned
                  ? "text-primary hover:text-primary hover:bg-primary/20"
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary"
              )}
              onClick={handlePin}
              disabled={isPending}
              title={thought.isPinned ? "Unpin" : "Pin"}
            >
              <Pin
                className={cn(
                  "h-3.5 w-3.5 transition-transform hover:scale-110",
                  thought.isPinned && "fill-current"
                )}
              />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 rounded-md text-muted-foreground hover:text-foreground hover:bg-secondary transition-all duration-200"
              onClick={handleArchive}
              disabled={isPending}
              title="Archive"
            >
              <Archive className="h-3.5 w-3.5 transition-transform hover:scale-110" />
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all duration-200"
                  disabled={isPending}
                  title="Delete"
                >
                  <Trash2 className="h-3.5 w-3.5 transition-transform hover:scale-110" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent className="border-border/50 bg-card/95 backdrop-blur-xl">
                <AlertDialogHeader>
                  <AlertDialogTitle className="text-foreground">Delete thought?</AlertDialogTitle>
                  <AlertDialogDescription className="text-muted-foreground">
                    This action cannot be undone. This will permanently delete
                    this thought.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel className="border-border/50 hover:bg-secondary">
                    Cancel
                  </AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDelete}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
