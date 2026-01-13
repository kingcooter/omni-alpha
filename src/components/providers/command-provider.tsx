"use client";

import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { CommandPalette } from "@/components/layout/command-palette";
import { cn } from "@/lib/utils";

interface CommandContextType {
  open: boolean;
  setOpen: (open: boolean) => void;
  gPrefixActive: boolean;
}

const CommandContext = createContext<CommandContextType | null>(null);

export function useCommand() {
  const context = useContext(CommandContext);
  if (!context) {
    throw new Error("useCommand must be used within CommandProvider");
  }
  return context;
}

export function CommandProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  // Track for "G" prefix shortcuts (like "G I" for Go to Inbox)
  const [gPrefix, setGPrefix] = useState(false);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    // Don't trigger if typing in an input
    const target = e.target as HTMLElement;
    if (
      target.tagName === "INPUT" ||
      target.tagName === "TEXTAREA" ||
      target.isContentEditable
    ) {
      // Exception: Cmd+K should always work
      if (!((e.metaKey || e.ctrlKey) && e.key === "k")) {
        return;
      }
    }

    // Cmd/Ctrl + K to open command palette
    if ((e.metaKey || e.ctrlKey) && e.key === "k") {
      e.preventDefault();
      setOpen(true);
      return;
    }

    // Handle G prefix shortcuts
    if (gPrefix) {
      setGPrefix(false);
      switch (e.key.toLowerCase()) {
        case "i":
          e.preventDefault();
          router.push("/");
          break;
        case "r":
          e.preventDefault();
          router.push("/recents");
          break;
        case "c":
          e.preventDefault();
          router.push("/calendar");
          break;
        case "p":
          e.preventDefault();
          router.push("/projects");
          break;
        case "e":
          e.preventDefault();
          router.push("/people");
          break;
        case "s":
          e.preventDefault();
          router.push("/settings");
          break;
      }
      return;
    }

    // "G" to start prefix
    if (e.key === "g" && !e.metaKey && !e.ctrlKey) {
      setGPrefix(true);
      // Reset after timeout
      setTimeout(() => setGPrefix(false), 1000);
      return;
    }

    // Escape key - clear focus or close modals
    if (e.key === "Escape") {
      const activeElement = document.activeElement as HTMLElement;
      if (activeElement && (activeElement.tagName === "INPUT" || activeElement.tagName === "TEXTAREA")) {
        activeElement.blur();
        e.preventDefault();
      }
      return;
    }

    // Quick shortcuts (without prefix)
    switch (e.key.toLowerCase()) {
      case "n":
        if (!e.metaKey && !e.ctrlKey) {
          e.preventDefault();
          router.push("/");
          setTimeout(() => {
            const textarea = document.querySelector("textarea");
            textarea?.focus();
          }, 100);
        }
        break;
      case ",":
        if (!e.metaKey && !e.ctrlKey) {
          e.preventDefault();
          router.push("/settings");
        }
        break;
      case "/":
        if (!e.metaKey && !e.ctrlKey) {
          e.preventDefault();
          setOpen(true);
        }
        break;
      case "?":
        // Show keyboard shortcuts help
        if (!e.metaKey && !e.ctrlKey && e.shiftKey) {
          e.preventDefault();
          setOpen(true);
        }
        break;
    }
  }, [gPrefix, router]);

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  return (
    <CommandContext.Provider value={{ open, setOpen, gPrefixActive: gPrefix }}>
      {children}
      <CommandPalette open={open} onOpenChange={setOpen} />

      {/* G prefix indicator */}
      {gPrefix && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 animate-in fade-in-0 slide-in-from-bottom-4 duration-200">
          <div className="flex items-center gap-2 rounded-full bg-card/95 backdrop-blur-xl border border-border/50 px-4 py-2 shadow-xl">
            <kbd className="rounded-md bg-primary/20 text-primary px-2 py-0.5 font-mono text-sm font-medium">
              G
            </kbd>
            <span className="text-sm text-muted-foreground">
              + I/R/C/P/S to navigate
            </span>
          </div>
        </div>
      )}
    </CommandContext.Provider>
  );
}
