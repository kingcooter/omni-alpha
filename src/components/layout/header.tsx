"use client";

import { Search, Settings, User } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Header() {
  return (
    <header className="flex h-14 items-center justify-between border-b border-border bg-background px-4">
      {/* Search */}
      <button
        className="flex items-center gap-2 rounded-md border border-input bg-secondary/50 px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
        onClick={() => {
          // TODO: Open command palette
        }}
      >
        <Search className="h-4 w-4" />
        <span>Search...</span>
        <kbd className="pointer-events-none ml-4 hidden h-5 select-none items-center gap-1 rounded border border-border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground sm:flex">
          <span className="text-xs">⌘</span>K
        </kbd>
      </button>

      {/* Right side actions */}
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <Settings className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <User className="h-4 w-4" />
        </Button>
      </div>
    </header>
  );
}
