"use client";

import { useEffect, useState, useCallback, RefObject } from "react";
import type { ProjectSuggestion } from "@/lib/openai";

interface UseSuggestionKeyboardOptions {
  suggestions: ProjectSuggestion[];
  onSelect: (projectId: string) => void;
  onDismiss: () => void;
  inputRef: RefObject<HTMLTextAreaElement | null>;
  enabled?: boolean;
}

interface UseSuggestionKeyboardReturn {
  focusedIndex: number;
  setFocusedIndex: (index: number) => void;
}

/**
 * Keyboard navigation hook for AI suggestions
 *
 * Shortcuts:
 * - Tab: Accept first/best suggestion
 * - 1, 2, 3: Select specific suggestion by number
 * - Arrow Left/Right: Navigate between suggestions
 * - Enter (when focused): Confirm focused suggestion
 * - Escape: Dismiss all suggestions
 */
export function useSuggestionKeyboard({
  suggestions,
  onSelect,
  onDismiss,
  inputRef,
  enabled = true,
}: UseSuggestionKeyboardOptions): UseSuggestionKeyboardReturn {
  const [focusedIndex, setFocusedIndex] = useState(-1);

  // Reset focused index when suggestions change
  useEffect(() => {
    setFocusedIndex(-1);
  }, [suggestions]);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      // Only handle when enabled and suggestions exist
      if (!enabled || suggestions.length === 0) return;

      // Only handle when textarea is focused
      if (document.activeElement !== inputRef.current) return;

      // Tab - accept first/best suggestion
      if (e.key === "Tab" && !e.shiftKey) {
        e.preventDefault();
        onSelect(suggestions[0].projectId);
        return;
      }

      // Number keys 1-3 - select specific suggestion
      if (["1", "2", "3"].includes(e.key) && !e.metaKey && !e.ctrlKey && !e.altKey) {
        const index = parseInt(e.key) - 1;
        if (suggestions[index]) {
          e.preventDefault();
          onSelect(suggestions[index].projectId);
          return;
        }
      }

      // Arrow Right - move focus to next chip
      if (e.key === "ArrowRight" && e.altKey) {
        e.preventDefault();
        setFocusedIndex((prev) =>
          prev < suggestions.length - 1 ? prev + 1 : prev
        );
        return;
      }

      // Arrow Left - move focus to previous chip (or back to -1)
      if (e.key === "ArrowLeft" && e.altKey) {
        e.preventDefault();
        setFocusedIndex((prev) => (prev > -1 ? prev - 1 : -1));
        return;
      }

      // Enter when a chip is focused - select it
      if (e.key === "Enter" && focusedIndex >= 0 && !e.metaKey && !e.ctrlKey) {
        e.preventDefault();
        onSelect(suggestions[focusedIndex].projectId);
        return;
      }

      // Escape - dismiss suggestions
      if (e.key === "Escape") {
        e.preventDefault();
        onDismiss();
        setFocusedIndex(-1);
        return;
      }
    },
    [suggestions, onSelect, onDismiss, inputRef, focusedIndex, enabled]
  );

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  return {
    focusedIndex,
    setFocusedIndex,
  };
}
