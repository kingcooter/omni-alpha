"use client";

import { Sparkles, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ProjectSuggestion } from "@/lib/openai";
import { IntentBadge } from "./intent-badge";

interface SuggestionChipsProps {
  suggestions: ProjectSuggestion[];
  onSelect: (projectId: string) => void;
  onCreateProject?: (name: string) => void;
  isLoading: boolean;
  focusedIndex?: number;
}

export function SuggestionChips({
  suggestions,
  onSelect,
  onCreateProject,
  isLoading,
  focusedIndex = -1,
}: SuggestionChipsProps) {
  if (!isLoading && suggestions.length === 0) {
    return null;
  }

  // Extract intent from first suggestion (they all share the same intent)
  const intent = suggestions[0]?.intent;
  const intentConfidence = suggestions[0]?.intentConfidence;

  // Filter out placeholder suggestions that only carry intent data
  const projectSuggestions = suggestions.filter(
    (s) => s.projectId !== "__none__" && s.projectName
  );

  return (
    <div className="flex items-center gap-2 flex-wrap">
      {/* Intent badge - shows detected intent type */}
      {intent && !isLoading && (
        <IntentBadge intent={intent} confidence={intentConfidence} />
      )}

      {/* AI thinking indicator */}
      {isLoading && (
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground/60 ai-thinking">
          <Sparkles className="h-3 w-3 text-primary" />
          <span>Thinking...</span>
        </div>
      )}

      {/* Loading skeleton chips */}
      {isLoading && suggestions.length === 0 && (
        <>
          <div className="h-7 w-20 rounded-full bg-secondary/30 animate-pulse" />
          <div className="h-7 w-16 rounded-full bg-secondary/30 animate-pulse" />
        </>
      )}

      {/* Project suggestion chips with keyboard hints */}
      {projectSuggestions.map((suggestion, index) => {
        const isNewProject = suggestion.projectId === "__new__";

        return (
          <button
            key={suggestion.projectId}
            onClick={() => {
              if (isNewProject && onCreateProject) {
                onCreateProject(suggestion.projectName);
              } else {
                onSelect(suggestion.projectId);
              }
            }}
            className={cn(
              "suggestion-chip group relative flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium",
              "transition-all duration-200",
              "hover:scale-105 hover:shadow-lg",
              "focus:outline-none focus:ring-2 focus:ring-primary/50",
              // New project gets dashed border
              isNewProject
                ? "border border-dashed border-primary/50 bg-primary/5"
                : index === 0
                  ? "ring-1 ring-primary/40 shadow-[0_0_12px_-3px] shadow-primary/30"
                  : "ring-1 ring-border/30",
              // Keyboard focus highlight
              focusedIndex === index && "ring-2 ring-primary scale-105"
            )}
            style={
              isNewProject
                ? { color: "#d4a574" }
                : {
                    backgroundColor: `${suggestion.projectColor}20`,
                    color: suggestion.projectColor,
                    animationDelay: `${index * 100}ms`,
                  }
            }
            title={suggestion.reason}
          >
            {/* Keyboard shortcut badge */}
            {index === 0 && !isNewProject ? (
              <kbd className="kbd-hint absolute -top-2 -left-1 flex items-center gap-0.5 rounded bg-primary/90 px-1 py-0.5 text-[9px] font-mono text-primary-foreground shadow-sm">
                Tab
              </kbd>
            ) : index < 3 ? (
              <span className="absolute -top-1.5 -left-1 flex h-4 w-4 items-center justify-center rounded-full bg-muted/80 text-[9px] font-mono text-muted-foreground shadow-sm">
                {index + 1}
              </span>
            ) : null}

            {/* Icon */}
            {isNewProject ? (
              <Plus className="h-3 w-3 text-primary" />
            ) : index === 0 ? (
              <Sparkles className="h-3 w-3 text-primary animate-pulse" />
            ) : null}

            <span>{isNewProject ? `Create "${suggestion.projectName}"` : suggestion.projectName}</span>

            {/* Confidence bar (not for new project) */}
            {!isNewProject && (
              <div
                className="h-1 rounded-full bg-current opacity-40"
                style={{ width: `${suggestion.confidence * 20}px` }}
              />
            )}
          </button>
        );
      })}

      {/* Keyboard hint footer */}
      {projectSuggestions.length > 0 && (
        <span className="ml-1 text-[10px] text-muted-foreground/40">
          or press 1-{Math.min(projectSuggestions.length, 3)}
        </span>
      )}
    </div>
  );
}
