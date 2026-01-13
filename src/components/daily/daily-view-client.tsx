"use client";

import { useState, useTransition } from "react";
import { format } from "date-fns";
import { Plus, Flame, CheckCircle2, Circle, Target } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { HabitCard } from "./habit-card";
import { AddHabitDialog } from "./add-habit-dialog";
import { StreakBadge } from "./streak-badge";
import type { HabitWithStreak } from "@/actions/habits";
import { cn } from "@/lib/utils";

interface DailyViewClientProps {
  initialHabits: HabitWithStreak[];
}

export function DailyViewClient({ initialHabits }: DailyViewClientProps) {
  const [habits, setHabits] = useState(initialHabits);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [isPending, startTransition] = useTransition();

  const today = new Date();
  const completedToday = habits.filter((h) => h.streak.isCompletedToday).length;
  const totalHabits = habits.length;
  const progressPercentage = totalHabits > 0 ? (completedToday / totalHabits) * 100 : 0;

  // Find best current streak
  const bestStreak = Math.max(...habits.map((h) => h.streak.currentStreak), 0);
  const habitsAtRisk = habits.filter((h) => h.streak.isStreakAtRisk);

  const handleHabitAdded = (newHabit: HabitWithStreak) => {
    setHabits((prev) => [...prev, newHabit]);
    setShowAddDialog(false);
  };

  const handleHabitUpdated = (updatedHabit: HabitWithStreak) => {
    setHabits((prev) =>
      prev.map((h) => (h.id === updatedHabit.id ? updatedHabit : h))
    );
  };

  const handleHabitDeleted = (habitId: string) => {
    setHabits((prev) => prev.filter((h) => h.id !== habitId));
  };

  return (
    <div className="space-y-6 fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Daily</h1>
          <p className="text-sm text-muted-foreground">
            {format(today, "EEEE, MMMM d")}
          </p>
        </div>
        <Button
          onClick={() => setShowAddDialog(true)}
          className="gap-2"
          size="sm"
        >
          <Plus className="h-4 w-4" />
          Add Habit
        </Button>
      </div>

      {/* Progress Card */}
      <Card className="border-0 bg-card/80 backdrop-blur-sm overflow-hidden">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10">
                <Target className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Today&apos;s Progress</p>
                <p className="text-2xl font-semibold">
                  {completedToday}/{totalHabits}
                </p>
              </div>
            </div>
            {bestStreak > 0 && (
              <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-orange-500/10">
                <Flame className="h-5 w-5 text-orange-400 streak-fire" />
                <span className="text-sm font-medium text-orange-400">
                  {bestStreak} day{bestStreak !== 1 ? "s" : ""} best
                </span>
              </div>
            )}
          </div>

          {/* Progress Bar */}
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div
              className={cn(
                "h-full rounded-full transition-all duration-500",
                progressPercentage === 100 ? "bg-green-500" : "bg-primary"
              )}
              style={{ width: `${progressPercentage}%` }}
            />
          </div>

          {/* Streak at risk warning */}
          {habitsAtRisk.length > 0 && (
            <div className="mt-4 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
              <p className="text-sm text-amber-400">
                <Flame className="inline h-4 w-4 mr-1" />
                {habitsAtRisk.length} habit{habitsAtRisk.length > 1 ? "s" : ""} at risk of losing streak
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Habits List */}
      {habits.length === 0 ? (
        <Card className="border-0 bg-card/80 backdrop-blur-sm">
          <CardContent className="p-12 text-center">
            <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10">
              <CheckCircle2 className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-lg font-medium mb-2">No habits yet</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Start building daily habits to track your progress
            </p>
            <Button onClick={() => setShowAddDialog(true)} className="gap-2">
              <Plus className="h-4 w-4" />
              Add your first habit
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {habits.map((habit) => (
            <HabitCard
              key={habit.id}
              habit={habit}
              onUpdate={handleHabitUpdated}
              onDelete={handleHabitDeleted}
            />
          ))}
        </div>
      )}

      {/* Add Habit Dialog */}
      <AddHabitDialog
        open={showAddDialog}
        onOpenChange={setShowAddDialog}
        onHabitAdded={handleHabitAdded}
      />
    </div>
  );
}
