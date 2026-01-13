"use client";

import { useRef, useEffect, useState, useTransition, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Sparkles, Loader2, ArrowRight, FolderKanban, X, ChevronDown } from "lucide-react";
import { createThought } from "@/actions/thoughts";
import { getProjects, createProject } from "@/actions/projects";
import { getSuggestions } from "@/actions/suggestions";
import { SuggestionChips } from "@/components/inbox/suggestion-chips";
import { useSuggestionKeyboard } from "@/hooks/use-suggestion-keyboard";
import type { Project } from "@/lib/db/schema";
import type { ProjectSuggestion } from "@/lib/openai";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 5) return "Working late";
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  if (hour < 21) return "Good evening";
  return "Night owl mode";
}

export function InboxCard() {
  const [content, setContent] = useState("");
  const [isPending, startTransition] = useTransition();
  const [greeting, setGreeting] = useState("Hello");
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [showProjectPicker, setShowProjectPicker] = useState(false);
  const [suggestions, setSuggestions] = useState<ProjectSuggestion[]>([]);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const pickerRef = useRef<HTMLDivElement>(null);

  // Set greeting on mount (client-side only)
  useEffect(() => {
    setGreeting(getGreeting());
  }, []);

  // Auto-focus on mount
  useEffect(() => {
    textareaRef.current?.focus();
  }, []);

  // Fetch projects on mount
  useEffect(() => {
    getProjects().then(setProjects);
  }, []);

  // Close picker when clicking outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (pickerRef.current && !pickerRef.current.contains(e.target as Node)) {
        setShowProjectPicker(false);
      }
    }
    if (showProjectPicker) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [showProjectPicker]);

  // Track abort controller for canceling stale requests
  const abortControllerRef = useRef<AbortController | null>(null);

  // Debounced AI suggestions as user types - fast 150ms debounce
  useEffect(() => {
    // Don't fetch if content is too short or a project is already selected
    if (content.trim().length < 10 || selectedProject) {
      setSuggestions([]);
      setIsLoadingSuggestions(false);
      return;
    }

    // Show loading immediately for instant feedback
    setIsLoadingSuggestions(true);

    // Cancel any in-flight request
    abortControllerRef.current?.abort();
    abortControllerRef.current = new AbortController();
    const signal = abortControllerRef.current.signal;

    const timeoutId = setTimeout(async () => {
      try {
        const results = await getSuggestions(content);
        // Only update if this request wasn't aborted
        if (!signal.aborted) {
          setSuggestions(results);
          setIsLoadingSuggestions(false);
        }
      } catch (error) {
        if (!signal.aborted) {
          console.error("Failed to get suggestions:", error);
          setSuggestions([]);
          setIsLoadingSuggestions(false);
        }
      }
    }, 150); // Fast 150ms debounce for instant feel

    return () => {
      clearTimeout(timeoutId);
      abortControllerRef.current?.abort();
    };
  }, [content, selectedProject]);

  // Handle suggestion chip click
  const handleSuggestionSelect = useCallback((projectId: string) => {
    const project = projects.find((p) => p.id === projectId);
    if (project) {
      setSelectedProject(project);
      setSuggestions([]); // Clear suggestions after selection
    }
  }, [projects]);

  // Handle dismissing suggestions
  const handleDismissSuggestions = useCallback(() => {
    setSuggestions([]);
    setIsLoadingSuggestions(false);
  }, []);

  // Keyboard navigation for suggestions (Tab, 1-3, Escape)
  const { focusedIndex } = useSuggestionKeyboard({
    suggestions,
    onSelect: handleSuggestionSelect,
    onDismiss: handleDismissSuggestions,
    inputRef: textareaRef,
    enabled: suggestions.length > 0 && !selectedProject,
  });

  // Handle creating a new project from AI suggestion
  const handleCreateProject = useCallback(async (projectName: string) => {
    try {
      const newProject = await createProject({ name: projectName });
      setProjects((prev) => [...prev, newProject]);
      setSelectedProject(newProject);
      setSuggestions([]);
      toast.success(`Created "${projectName}"`, {
        description: "New project created and selected",
      });
    } catch (error) {
      console.error("Failed to create project:", error);
      toast.error("Failed to create project");
    }
  }, []);

  const handleSubmit = () => {
    if (content.trim() && !isPending) {
      const thoughtContent = content.trim();
      const projectId = selectedProject?.id ?? null;
      setContent(""); // Clear immediately for responsiveness
      setSuggestions([]); // Clear suggestions

      startTransition(async () => {
        try {
          await createThought(thoughtContent, projectId);
          const projectName = selectedProject?.name;
          toast.success("Captured", {
            description: projectName
              ? `Saved to ${projectName}`
              : "Your thought has been saved",
          });
          setSelectedProject(null); // Reset project selection
        } catch {
          toast.error("Failed to save thought");
          setContent(thoughtContent); // Restore on error
        }
        // Refocus after save
        textareaRef.current?.focus();
      });
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Cmd+Enter or Ctrl+Enter to submit
    if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <Card className="group relative overflow-hidden border-0 bg-gradient-to-br from-card via-card to-card/80 card-glow">
      {/* Animated border gradient */}
      <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-primary/20 via-transparent to-primary/10 opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
      <div className="absolute inset-[1px] rounded-xl bg-card" />

      {/* Top accent line */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />

      {/* Content */}
      <CardContent className="relative p-6">
        {/* Header */}
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="absolute inset-0 animate-pulse rounded-full bg-primary/20 blur-md" />
              <div className="relative flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-primary/20 to-primary/5 ring-1 ring-primary/20">
                <Sparkles className="h-5 w-5 text-primary" />
              </div>
            </div>
            <div>
              <h2 className="text-lg font-semibold text-foreground">
                {greeting}
              </h2>
              <p className="text-sm text-muted-foreground">
                What&apos;s on your mind?
              </p>
            </div>
          </div>
          {isPending && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin text-primary" />
              <span>Saving...</span>
            </div>
          )}
        </div>

        {/* Textarea */}
        <div className="relative">
          <Textarea
            ref={textareaRef}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Capture a thought, idea, or task..."
            disabled={isPending}
            className="min-h-[120px] resize-none border-0 bg-secondary/30 text-foreground text-base placeholder:text-muted-foreground/60 focus-visible:ring-1 focus-visible:ring-primary/50 disabled:opacity-50"
          />

          {/* AI Suggestions */}
          {(suggestions.length > 0 || isLoadingSuggestions) && !selectedProject && (
            <div className="mt-3 mb-1">
              <SuggestionChips
                suggestions={suggestions}
                onSelect={handleSuggestionSelect}
                onCreateProject={handleCreateProject}
                isLoading={isLoadingSuggestions}
                focusedIndex={focusedIndex}
              />
            </div>
          )}

          {/* Bottom bar */}
          <div className="mt-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              {/* Project Picker */}
              <div className="relative" ref={pickerRef}>
                {selectedProject ? (
                  <button
                    onClick={() => setShowProjectPicker(!showProjectPicker)}
                    className={cn(
                      "flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium transition-colors",
                      "bg-primary/10 text-primary hover:bg-primary/20"
                    )}
                  >
                    <FolderKanban className="h-3 w-3" />
                    <span>{selectedProject.name}</span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedProject(null);
                      }}
                      className="ml-0.5 rounded-full p-0.5 hover:bg-primary/20"
                    >
                      <X className="h-2.5 w-2.5" />
                    </button>
                  </button>
                ) : (
                  <button
                    onClick={() => setShowProjectPicker(!showProjectPicker)}
                    className={cn(
                      "flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs transition-colors",
                      "text-muted-foreground/60 hover:text-muted-foreground hover:bg-secondary/50"
                    )}
                  >
                    <FolderKanban className="h-3 w-3" />
                    <span>Add to project</span>
                    <ChevronDown className="h-3 w-3" />
                  </button>
                )}

                {/* Project Dropdown */}
                {showProjectPicker && projects.length > 0 && (
                  <div className="absolute left-0 top-full z-10 mt-1 w-48 rounded-lg border border-border/50 bg-card/95 backdrop-blur-xl p-1 shadow-xl">
                    {projects.map((project) => (
                      <button
                        key={project.id}
                        onClick={() => {
                          setSelectedProject(project);
                          setShowProjectPicker(false);
                        }}
                        className={cn(
                          "flex w-full items-center gap-2 rounded-md px-2.5 py-1.5 text-xs text-left transition-colors",
                          selectedProject?.id === project.id
                            ? "bg-primary/10 text-primary"
                            : "text-foreground/80 hover:bg-secondary/50"
                        )}
                      >
                        <FolderKanban className="h-3.5 w-3.5 text-muted-foreground" />
                        <span className="flex-1 truncate">{project.name}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <span className="text-xs text-muted-foreground/60">
                <kbd className="rounded-md border border-border/50 bg-muted/50 px-1.5 py-0.5 font-mono text-[10px]">
                  ⌘
                </kbd>{" "}
                <kbd className="rounded-md border border-border/50 bg-muted/50 px-1.5 py-0.5 font-mono text-[10px]">
                  ↵
                </kbd>{" "}
                to capture
              </span>
            </div>

            {/* Submit indicator */}
            {content.trim() && (
              <button
                onClick={handleSubmit}
                disabled={isPending}
                className="flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1.5 text-xs font-medium text-primary transition-all hover:bg-primary/20 hover:gap-2 disabled:opacity-50"
              >
                Capture
                <ArrowRight className="h-3 w-3" />
              </button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
