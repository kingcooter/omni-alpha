"use client";

import { useRef, useEffect, useState, useTransition } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { MessageSquare, Loader2 } from "lucide-react";
import { createThought } from "@/actions/thoughts";

export function InboxCard() {
  const [content, setContent] = useState("");
  const [isPending, startTransition] = useTransition();
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-focus on mount
  useEffect(() => {
    textareaRef.current?.focus();
  }, []);

  const handleSubmit = () => {
    if (content.trim() && !isPending) {
      const thoughtContent = content.trim();
      setContent(""); // Clear immediately for responsiveness

      startTransition(async () => {
        await createThought(thoughtContent);
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
    <Card className="border-primary/20 bg-card">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg font-medium">
          <MessageSquare className="h-5 w-5 text-primary" />
          Inbox
          {isPending && (
            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <Textarea
            ref={textareaRef}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="What's on your mind?"
            disabled={isPending}
            className="min-h-[100px] resize-none border-input bg-secondary/30 text-foreground placeholder:text-muted-foreground focus-visible:ring-primary disabled:opacity-50"
          />
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <div className="flex gap-2">
              {/* Project suggestions will go here */}
            </div>
            <div className="flex items-center gap-1">
              <kbd className="rounded border border-border bg-muted px-1.5 py-0.5 font-mono text-[10px]">
                ⌘
              </kbd>
              <kbd className="rounded border border-border bg-muted px-1.5 py-0.5 font-mono text-[10px]">
                ↵
              </kbd>
              <span className="ml-1">to save</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
