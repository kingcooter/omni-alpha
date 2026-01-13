"use client";

import { useCallback, useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Command } from "cmdk";
import {
  Inbox,
  Clock,
  Calendar,
  FolderKanban,
  Users,
  Mail,
  Newspaper,
  TrendingUp,
  Settings,
  Plus,
  Search,
  Sparkles,
  ArrowRight,
  Zap,
  Lightbulb,
  FileText,
  Loader2,
  Send,
  AlertCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { searchThoughts, getRecentThoughts, createThought, getOverdueThoughts, getThoughtsDueToday } from "@/actions/thoughts";
import { getProjects } from "@/actions/projects";
import { formatRelativeTime } from "@/lib/format";
import { toast } from "sonner";
import type { Thought, Project } from "@/lib/db/schema";
import type { ThoughtWithProject } from "@/actions/thoughts";

interface CommandPaletteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const navigationItems = [
  { name: "Inbox", href: "/", icon: Inbox, shortcut: "G I" },
  { name: "Recents", href: "/recents", icon: Clock, shortcut: "G R" },
  { name: "Calendar", href: "/calendar", icon: Calendar, shortcut: "G C" },
  { name: "Projects", href: "/projects", icon: FolderKanban, shortcut: "G P" },
  { name: "People", href: "/people", icon: Users, shortcut: "G E" },
  { name: "Settings", href: "/settings", icon: Settings, shortcut: "G S" },
];

const agentItems = [
  { name: "Email Digest", href: "/agents/email", icon: Mail },
  { name: "News Feed", href: "/agents/news", icon: Newspaper },
  { name: "Trends", href: "/agents/trends", icon: TrendingUp },
];

export function CommandPalette({ open, onOpenChange }: CommandPaletteProps) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [thoughts, setThoughts] = useState<Thought[]>([]);
  const [recentThoughts, setRecentThoughts] = useState<Thought[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [urgentItems, setUrgentItems] = useState<ThoughtWithProject[]>([]);
  const [isPending, startTransition] = useTransition();
  const [isSaving, setIsSaving] = useState(false);
  const [mode, setMode] = useState<"search" | "capture">("search");

  // Detect capture mode - when input starts with ">" or user presses Tab on empty input
  const isCaptureModeActive = mode === "capture" || search.startsWith(">");
  const captureContent = isCaptureModeActive ? search.replace(/^>\s*/, "") : "";

  // Fetch data when palette opens
  useEffect(() => {
    if (open) {
      startTransition(async () => {
        const [recents, projectList, overdue, dueToday] = await Promise.all([
          getRecentThoughts(5),
          getProjects(),
          getOverdueThoughts(),
          getThoughtsDueToday(),
        ]);
        setRecentThoughts(recents);
        setProjects(projectList);
        setUrgentItems([...overdue, ...dueToday].slice(0, 3));
      });
    }
  }, [open]);

  // Search thoughts and projects when query changes
  useEffect(() => {
    if (isCaptureModeActive || search.length < 2) {
      setThoughts([]);
      return;
    }

    const timeoutId = setTimeout(() => {
      startTransition(async () => {
        const results = await searchThoughts(search, { limit: 5 });
        setThoughts(results);
      });
    }, 200);

    return () => clearTimeout(timeoutId);
  }, [search, isCaptureModeActive]);

  // Quick capture - save thought directly from command palette
  const handleQuickCapture = useCallback(async () => {
    const content = captureContent.trim();
    if (!content || isSaving) return;

    setIsSaving(true);
    try {
      await createThought(content);
      toast.success("Captured!", {
        description: content.length > 50 ? content.slice(0, 50) + "..." : content,
      });
      setSearch("");
      setMode("search");
      onOpenChange(false);
    } catch (error) {
      toast.error("Failed to capture thought");
    } finally {
      setIsSaving(false);
    }
  }, [captureContent, isSaving, onOpenChange]);

  // Handle special key combinations
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    // Cmd+Enter to quick capture in capture mode
    if ((e.metaKey || e.ctrlKey) && e.key === "Enter" && isCaptureModeActive && captureContent.trim()) {
      e.preventDefault();
      handleQuickCapture();
      return;
    }

    // Tab to enter capture mode when input is empty or starts with ">"
    if (e.key === "Tab" && !e.shiftKey) {
      if (search === "" || search === ">") {
        e.preventDefault();
        setSearch("> ");
        setMode("capture");
        return;
      }
    }

    // Escape to exit capture mode
    if (e.key === "Escape" && mode === "capture") {
      e.preventDefault();
      setSearch("");
      setMode("search");
      return;
    }
  }, [isCaptureModeActive, captureContent, handleQuickCapture, search, mode]);

  const navigateTo = useCallback((href: string) => {
    router.push(href);
    onOpenChange(false);
  }, [router, onOpenChange]);

  const openThought = useCallback((thoughtId: string) => {
    router.push(`/recents?highlight=${thoughtId}`);
    onOpenChange(false);
  }, [router, onOpenChange]);

  const openProject = useCallback((projectId: string) => {
    router.push(`/projects/${projectId}`);
    onOpenChange(false);
  }, [router, onOpenChange]);

  const runAction = useCallback((action: string) => {
    switch (action) {
      case "new-thought":
        router.push("/");
        setTimeout(() => {
          const input = document.querySelector("textarea");
          input?.focus();
        }, 100);
        break;
      case "quick-capture":
        setSearch("> ");
        setMode("capture");
        return; // Don't close palette
      case "new-project":
        router.push("/projects?new=true");
        break;
    }
    onOpenChange(false);
  }, [router, onOpenChange]);

  useEffect(() => {
    if (!open) {
      setSearch("");
      setMode("search");
    }
  }, [open]);

  // Filter projects by search
  const filteredProjects = projects.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.description?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Command.Dialog
      open={open}
      onOpenChange={onOpenChange}
      label="Command Palette"
      className={cn(
        "fixed inset-0 z-50 flex items-start justify-center pt-[15vh]",
        "bg-black/60 backdrop-blur-sm",
        "animate-in fade-in-0 duration-200"
      )}
      onKeyDown={handleKeyDown}
    >
      <div
        className={cn(
          "w-full max-w-xl overflow-hidden rounded-2xl",
          "bg-card/95 backdrop-blur-xl",
          "border border-border/50",
          "shadow-2xl shadow-black/40",
          "animate-in slide-in-from-top-4 duration-200",
          isCaptureModeActive && "ring-2 ring-primary/50"
        )}
      >
        {/* Search/Capture input */}
        <div className="flex items-center gap-3 border-b border-border/50 px-4 py-3">
          {isCaptureModeActive ? (
            <Zap className="h-5 w-5 text-primary animate-pulse" />
          ) : (
            <Search className="h-5 w-5 text-muted-foreground/60" />
          )}
          <Command.Input
            value={search}
            onValueChange={setSearch}
            placeholder={isCaptureModeActive ? "Type a thought... (⌘↵ to save)" : "Search or type > to capture..."}
            className="flex-1 bg-transparent text-base text-foreground placeholder:text-muted-foreground/50 outline-none"
          />
          {isCaptureModeActive && captureContent.trim() ? (
            <button
              onClick={handleQuickCapture}
              disabled={isSaving}
              className="flex items-center gap-1.5 rounded-lg bg-primary/20 px-3 py-1.5 text-xs font-medium text-primary hover:bg-primary/30 transition-colors disabled:opacity-50"
            >
              {isSaving ? (
                <Loader2 className="h-3 w-3 animate-spin" />
              ) : (
                <Send className="h-3 w-3" />
              )}
              Save
            </button>
          ) : (
            <kbd className="hidden rounded-md border border-border/50 bg-muted/30 px-2 py-1 font-mono text-[10px] text-muted-foreground/60 sm:block">
              ESC
            </kbd>
          )}
        </div>

        {/* Quick capture mode content */}
        {isCaptureModeActive ? (
          <div className="p-4">
            <div className="rounded-xl bg-primary/5 border border-primary/20 p-4">
              <div className="flex items-start gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/20">
                  <Lightbulb className="h-4 w-4 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground">Quick Capture Mode</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Type your thought and press <kbd className="rounded bg-muted px-1 py-0.5 font-mono text-[10px]">⌘</kbd> <kbd className="rounded bg-muted px-1 py-0.5 font-mono text-[10px]">↵</kbd> to save instantly.
                    Supports natural dates like "tomorrow" or "next Friday".
                  </p>
                </div>
              </div>
              {captureContent.trim() && (
                <div className="mt-3 pt-3 border-t border-primary/10">
                  <p className="text-sm text-foreground/80 whitespace-pre-wrap">{captureContent}</p>
                </div>
              )}
            </div>
          </div>
        ) : (
          /* Command list */
          <Command.List className="max-h-[400px] overflow-y-auto p-2">
            <Command.Empty className="py-8 text-center text-sm text-muted-foreground">
              No results found. Try a different search or press Tab to capture.
            </Command.Empty>

            {/* Urgent Items - Overdue and Due Today */}
            {search.length < 2 && urgentItems.length > 0 && (
              <Command.Group heading="Needs Attention" className="mb-2">
                <div className="mb-2 px-2 pt-2">
                  <span className="text-[11px] font-semibold uppercase tracking-widest text-destructive/70">
                    Needs Attention
                  </span>
                </div>
                {urgentItems.map((thought) => (
                  <Command.Item
                    key={`urgent-${thought.id}`}
                    value={`urgent-${thought.id}-${thought.content}`}
                    onSelect={() => openThought(thought.id)}
                    className={cn(
                      "group flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5",
                      "text-sm text-foreground/80",
                      "transition-colors duration-150",
                      "aria-selected:bg-destructive/10 aria-selected:text-destructive"
                    )}
                  >
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-destructive/20 transition-colors group-aria-selected:bg-destructive/30">
                      <AlertCircle className="h-4 w-4 text-destructive" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium line-clamp-1">{thought.content}</p>
                      <p className="text-[11px] text-destructive/70">
                        {thought.dueDate && new Date(thought.dueDate) < new Date() ? "Overdue" : "Due today"}
                      </p>
                    </div>
                  </Command.Item>
                ))}
              </Command.Group>
            )}

            {/* Search Results - Thoughts */}
            {(thoughts.length > 0 || (search.length >= 2 && isPending)) && (
              <Command.Group heading="Thoughts" className="mb-2">
                <div className="mb-2 px-2 pt-2">
                  <span className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground/50">
                    Thoughts
                  </span>
                  {isPending && (
                    <Loader2 className="ml-2 inline h-3 w-3 animate-spin text-muted-foreground/50" />
                  )}
                </div>
                {thoughts.map((thought) => (
                  <Command.Item
                    key={thought.id}
                    value={`thought-${thought.id}-${thought.content}`}
                    onSelect={() => openThought(thought.id)}
                    className={cn(
                      "group flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5",
                      "text-sm text-foreground/80",
                      "transition-colors duration-150",
                      "aria-selected:bg-primary/10 aria-selected:text-primary"
                    )}
                  >
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-secondary/50 transition-colors group-aria-selected:bg-primary/20">
                      <FileText className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium line-clamp-1">{thought.content}</p>
                      <p className="text-[11px] text-muted-foreground/50">
                        {thought.createdAt ? formatRelativeTime(thought.createdAt) : ""}
                      </p>
                    </div>
                    <Lightbulb className="h-3.5 w-3.5 text-muted-foreground/30 opacity-0 transition-opacity group-aria-selected:opacity-100" />
                  </Command.Item>
                ))}
              </Command.Group>
            )}

            {/* Search Results - Projects */}
            {search.length >= 2 && filteredProjects.length > 0 && (
              <Command.Group heading="Projects" className="mb-2">
                <div className="mb-2 px-2 pt-2">
                  <span className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground/50">
                    Projects
                  </span>
                </div>
                {filteredProjects.slice(0, 3).map((project) => (
                  <Command.Item
                    key={`project-${project.id}`}
                    value={`project-${project.id}-${project.name}`}
                    onSelect={() => openProject(project.id)}
                    className={cn(
                      "group flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5",
                      "text-sm text-foreground/80",
                      "transition-colors duration-150",
                      "aria-selected:bg-primary/10 aria-selected:text-primary"
                    )}
                  >
                    <div
                      className="flex h-8 w-8 items-center justify-center rounded-lg transition-colors"
                      style={{ backgroundColor: `${project.color}20` }}
                    >
                      <FolderKanban className="h-4 w-4" style={{ color: project.color ?? "#d4a574" }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium">{project.name}</p>
                      {project.description && (
                        <p className="text-[11px] text-muted-foreground/50 line-clamp-1">{project.description}</p>
                      )}
                    </div>
                    <ArrowRight className="h-3.5 w-3.5 text-muted-foreground/30 opacity-0 transition-opacity group-aria-selected:opacity-100" />
                  </Command.Item>
                ))}
              </Command.Group>
            )}

            {/* Quick Actions */}
            <Command.Group heading="Quick Actions" className="mb-2">
              <div className="mb-2 px-2 pt-2">
                <span className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground/50">
                  Quick Actions
                </span>
              </div>
              <Command.Item
                value="Quick Capture"
                onSelect={() => runAction("quick-capture")}
                className={cn(
                  "group flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5",
                  "text-sm text-foreground/80",
                  "transition-colors duration-150",
                  "aria-selected:bg-primary/10 aria-selected:text-primary"
                )}
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/20 transition-colors group-aria-selected:bg-primary/30">
                  <Zap className="h-4 w-4 text-primary" />
                </div>
                <span className="flex-1 font-medium">Quick Capture</span>
                <kbd className="rounded-md border border-border/30 bg-muted/30 px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground/50">
                  Tab
                </kbd>
              </Command.Item>
              <Command.Item
                value="New Thought"
                onSelect={() => runAction("new-thought")}
                className={cn(
                  "group flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5",
                  "text-sm text-foreground/80",
                  "transition-colors duration-150",
                  "aria-selected:bg-primary/10 aria-selected:text-primary"
                )}
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-secondary/50 transition-colors group-aria-selected:bg-primary/20">
                  <Plus className="h-4 w-4" />
                </div>
                <span className="flex-1 font-medium">New Thought</span>
                <kbd className="rounded-md border border-border/30 bg-muted/30 px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground/50">
                  N
                </kbd>
              </Command.Item>
              <Command.Item
                value="New Project"
                onSelect={() => runAction("new-project")}
                className={cn(
                  "group flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5",
                  "text-sm text-foreground/80",
                  "transition-colors duration-150",
                  "aria-selected:bg-primary/10 aria-selected:text-primary"
                )}
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-secondary/50 transition-colors group-aria-selected:bg-primary/20">
                  <FolderKanban className="h-4 w-4" />
                </div>
                <span className="flex-1 font-medium">New Project</span>
              </Command.Item>
            </Command.Group>

            {/* Navigation */}
            <Command.Group heading="Navigation" className="mb-2">
              <div className="mb-2 px-2 pt-2">
                <span className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground/50">
                  Navigation
                </span>
              </div>
              {navigationItems.map((item) => (
                <Command.Item
                  key={item.href}
                  value={item.name}
                  onSelect={() => navigateTo(item.href)}
                  className={cn(
                    "group flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5",
                    "text-sm text-foreground/80",
                    "transition-colors duration-150",
                    "aria-selected:bg-primary/10 aria-selected:text-primary"
                  )}
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-secondary/50 transition-colors group-aria-selected:bg-primary/20">
                    <item.icon className="h-4 w-4" />
                  </div>
                  <span className="flex-1 font-medium">{item.name}</span>
                  {item.shortcut && (
                    <kbd className="rounded-md border border-border/30 bg-muted/30 px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground/50">
                      {item.shortcut}
                    </kbd>
                  )}
                </Command.Item>
              ))}
            </Command.Group>

            {/* AI Agents */}
            <Command.Group heading="AI Agents" className="mb-2">
              <div className="mb-2 px-2 pt-2">
                <span className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground/50">
                  AI Agents
                </span>
              </div>
              {agentItems.map((item) => (
                <Command.Item
                  key={item.href}
                  value={item.name}
                  onSelect={() => navigateTo(item.href)}
                  className={cn(
                    "group flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5",
                    "text-sm text-foreground/80",
                    "transition-colors duration-150",
                    "aria-selected:bg-primary/10 aria-selected:text-primary"
                  )}
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-secondary/50 transition-colors group-aria-selected:bg-primary/20">
                    <item.icon className="h-4 w-4" />
                  </div>
                  <span className="flex-1 font-medium">{item.name}</span>
                  <ArrowRight className="h-3.5 w-3.5 text-muted-foreground/30 opacity-0 transition-opacity group-aria-selected:opacity-100" />
                </Command.Item>
              ))}
            </Command.Group>

            {/* Recent Thoughts - shown when no search query */}
            {search.length < 2 && recentThoughts.length > 0 && (
              <Command.Group heading="Recent Thoughts" className="mb-2">
                <div className="mb-2 px-2 pt-2">
                  <span className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground/50">
                    Recent Thoughts
                  </span>
                </div>
                {recentThoughts.map((thought) => (
                  <Command.Item
                    key={thought.id}
                    value={`recent-${thought.id}-${thought.content}`}
                    onSelect={() => openThought(thought.id)}
                    className={cn(
                      "group flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5",
                      "text-sm text-foreground/80",
                      "transition-colors duration-150",
                      "aria-selected:bg-primary/10 aria-selected:text-primary"
                    )}
                  >
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-secondary/50 transition-colors group-aria-selected:bg-primary/20">
                      <Clock className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium line-clamp-1">{thought.content}</p>
                      <p className="text-[11px] text-muted-foreground/50">
                        {thought.createdAt ? formatRelativeTime(thought.createdAt) : ""}
                      </p>
                    </div>
                    <ArrowRight className="h-3.5 w-3.5 text-muted-foreground/30 opacity-0 transition-opacity group-aria-selected:opacity-100" />
                  </Command.Item>
                ))}
              </Command.Group>
            )}
          </Command.List>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-border/50 px-4 py-2.5">
          <div className="flex items-center gap-4 text-[11px] text-muted-foreground/50">
            {isCaptureModeActive ? (
              <span className="flex items-center gap-1 text-primary/70">
                <kbd className="rounded border border-primary/30 bg-primary/10 px-1 py-0.5 font-mono text-[10px]">⌘</kbd>
                <kbd className="rounded border border-primary/30 bg-primary/10 px-1 py-0.5 font-mono text-[10px]">↵</kbd>
                <span className="ml-1">to capture</span>
              </span>
            ) : (
              <>
                <span className="flex items-center gap-1">
                  <kbd className="rounded border border-border/30 bg-muted/30 px-1 py-0.5 font-mono text-[10px]">Tab</kbd>
                  <span className="ml-1">Quick capture</span>
                </span>
                <span className="flex items-center gap-1">
                  <kbd className="rounded border border-border/30 bg-muted/30 px-1 py-0.5 font-mono text-[10px]">↑</kbd>
                  <kbd className="rounded border border-border/30 bg-muted/30 px-1 py-0.5 font-mono text-[10px]">↓</kbd>
                  <span className="ml-1">Navigate</span>
                </span>
              </>
            )}
          </div>
          <div className="flex items-center gap-1.5 text-[11px] text-primary/60">
            <Sparkles className="h-3 w-3" />
            <span>Omni</span>
          </div>
        </div>
      </div>
    </Command.Dialog>
  );
}
