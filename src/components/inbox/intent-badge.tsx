"use client";

import { CheckSquare, Lightbulb, HelpCircle, Bell, FileText } from "lucide-react";
import { cn } from "@/lib/utils";
import type { IntentType } from "@/lib/ai/prompts";

interface IntentBadgeProps {
  intent: IntentType;
  confidence?: number;
  className?: string;
}

const intentConfig: Record<
  IntentType,
  { icon: typeof CheckSquare; label: string; color: string; bgColor: string }
> = {
  task: {
    icon: CheckSquare,
    label: "Task",
    color: "text-blue-400",
    bgColor: "bg-blue-400/10",
  },
  idea: {
    icon: Lightbulb,
    label: "Idea",
    color: "text-amber-400",
    bgColor: "bg-amber-400/10",
  },
  question: {
    icon: HelpCircle,
    label: "Question",
    color: "text-purple-400",
    bgColor: "bg-purple-400/10",
  },
  reminder: {
    icon: Bell,
    label: "Reminder",
    color: "text-orange-400",
    bgColor: "bg-orange-400/10",
  },
  note: {
    icon: FileText,
    label: "Note",
    color: "text-slate-400",
    bgColor: "bg-slate-400/10",
  },
};

export function IntentBadge({ intent, confidence, className }: IntentBadgeProps) {
  const config = intentConfig[intent];
  const Icon = config.icon;

  return (
    <div
      className={cn(
        "intent-badge inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium",
        config.bgColor,
        config.color,
        className
      )}
      title={confidence ? `${Math.round(confidence * 100)}% confident` : undefined}
    >
      <Icon className="h-2.5 w-2.5" />
      <span>{config.label}</span>
    </div>
  );
}
