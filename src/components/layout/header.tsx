"use client";

import { Search, Command, Sparkles } from "lucide-react";

export function Header() {
  return (
    <header className="flex h-14 items-center justify-between border-b border-border/30 bg-background/60 backdrop-blur-xl px-6 pl-16 md:pl-6">
      {/* Search */}
      <button
        className="group flex items-center gap-3 rounded-xl border border-border/30 bg-secondary/20 px-4 py-2 text-sm text-muted-foreground transition-all duration-300 hover:border-primary/40 hover:bg-secondary/40 hover:shadow-lg hover:shadow-black/5"
        onClick={() => {
          const event = new KeyboardEvent("keydown", {
            key: "k",
            metaKey: true,
            bubbles: true,
          });
          document.dispatchEvent(event);
        }}
      >
        <Search className="h-4 w-4 transition-all duration-300 group-hover:text-primary group-hover:scale-110" />
        <span className="hidden sm:inline text-muted-foreground/70 group-hover:text-muted-foreground transition-colors">Search or jump to...</span>
        <span className="sm:hidden text-muted-foreground/70">Search</span>
        <div className="ml-6 hidden items-center gap-1 sm:flex">
          <kbd className="flex h-5 w-5 items-center justify-center rounded-md border border-border/40 bg-muted/30 font-mono text-[10px] text-muted-foreground/60 transition-colors group-hover:border-primary/30 group-hover:text-muted-foreground">
            <Command className="h-3 w-3" />
          </kbd>
          <kbd className="flex h-5 items-center justify-center rounded-md border border-border/40 bg-muted/30 px-1.5 font-mono text-[10px] text-muted-foreground/60 transition-colors group-hover:border-primary/30 group-hover:text-muted-foreground">
            K
          </kbd>
        </div>
      </button>

      {/* Right side */}
      <div className="flex items-center gap-2">
        {/* User avatar */}
        <button className="group relative flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 ring-1 ring-primary/20 transition-all duration-300 hover:ring-primary/40 hover:scale-105">
          <Sparkles className="h-4 w-4 text-primary transition-transform duration-300 group-hover:rotate-12" />
        </button>
      </div>
    </header>
  );
}
