"use client";

import { useState, useTransition } from "react";
import { Check, MoreHorizontal, Trash2, Edit2, Flame } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { StreakBadge } from "./streak-badge";
import { toggleHabitCompletion, deleteHabit, type HabitWithStreak } from "@/actions/habits";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { getTodayString } from "@/lib/habits/streaks";

interface HabitCardProps {
  habit: HabitWithStreak;
  onUpdate: (habit: HabitWithStreak) => void;
  onDelete: (habitId: string) => void;
}

export function HabitCard({ habit, onUpdate, onDelete }: HabitCardProps) {
  const [isPending, startTransition] = useTransition();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const { isCompletedToday, currentStreak, isStreakAtRisk } = habit.streak;

  const handleToggle = () => {
    startTransition(async () => {
      try {
        const result = await toggleHabitCompletion(habit.id, getTodayString());
        onUpdate({
          ...habit,
          streak: result.streak,
        });

        if (result.completed) {
          if (result.streak.currentStreak > 1) {
            toast.success(`${result.streak.currentStreak} day streak!`, {
              icon: "🔥",
            });
          } else {
            toast.success("Completed!");
          }
        }
      } catch (error) {
        toast.error("Failed to update habit");
      }
    });
  };

  const handleDelete = () => {
    startTransition(async () => {
      try {
        await deleteHabit(habit.id);
        onDelete(habit.id);
        toast.success("Habit deleted");
      } catch (error) {
        toast.error("Failed to delete habit");
      }
    });
  };

  return (
    <>
      <Card
        className={cn(
          "group border-0 bg-card/80 backdrop-blur-sm transition-all duration-200",
          "hover:bg-card",
          isCompletedToday && "ring-1 ring-green-500/30 bg-green-500/5",
          isStreakAtRisk && !isCompletedToday && "ring-1 ring-amber-500/30"
        )}
      >
        <div className="flex items-center gap-4 p-4">
          {/* Checkbox */}
          <button
            onClick={handleToggle}
            disabled={isPending}
            className={cn(
              "flex-shrink-0 w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all",
              isCompletedToday
                ? "bg-green-500 border-green-500 text-white habit-check"
                : "border-muted-foreground/30 hover:border-primary/50",
              isPending && "opacity-50"
            )}
          >
            {isCompletedToday && <Check className="h-5 w-5" />}
          </button>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span
                className={cn(
                  "font-medium transition-all",
                  isCompletedToday && "text-muted-foreground line-through"
                )}
              >
                {habit.name}
              </span>
              {currentStreak > 0 && (
                <StreakBadge streak={currentStreak} atRisk={isStreakAtRisk} />
              )}
            </div>
            {habit.description && (
              <p className="text-sm text-muted-foreground truncate">
                {habit.description}
              </p>
            )}
          </div>

          {/* Actions */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
              <DropdownMenuItem
                onClick={() => setShowDeleteDialog(true)}
                className="text-destructive focus:text-destructive"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </Card>

      {/* Delete Confirmation */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete habit?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete &quot;{habit.name}&quot; and all its history.
              {currentStreak > 0 && (
                <span className="block mt-2 text-amber-400">
                  You&apos;ll lose your {currentStreak} day streak!
                </span>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
