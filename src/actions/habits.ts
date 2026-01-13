"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { habits, habitCompletions } from "@/lib/db/schema";
import type { Habit, NewHabit, HabitCompletion } from "@/lib/db/schema";
import { eq, and, desc, asc, gte, lte } from "drizzle-orm";
import { getCurrentUserId } from "@/lib/auth";
import { format, subDays } from "date-fns";
import { calculateStreak, type StreakData, getTodayString } from "@/lib/habits/streaks";

export type HabitWithStreak = Habit & {
  streak: StreakData;
  completions: HabitCompletion[];
};

/**
 * Get all habits with streak data
 */
export async function getHabitsWithStreaks(): Promise<HabitWithStreak[]> {
  const userId = await getCurrentUserId();

  const userHabits = await db
    .select()
    .from(habits)
    .where(and(eq(habits.userId, userId), eq(habits.isArchived, false)))
    .orderBy(asc(habits.sortOrder), desc(habits.createdAt));

  // Get completions for streak calculation (last 365 days)
  const startDate = format(subDays(new Date(), 365), "yyyy-MM-dd");

  const habitsWithStreaks = await Promise.all(
    userHabits.map(async (habit) => {
      const completions = await db
        .select()
        .from(habitCompletions)
        .where(
          and(
            eq(habitCompletions.habitId, habit.id),
            gte(habitCompletions.completedDate, startDate)
          )
        )
        .orderBy(desc(habitCompletions.completedDate));

      const completionDates = completions.map((c) => c.completedDate);
      const streak = calculateStreak(completionDates);

      return {
        ...habit,
        streak,
        completions,
      };
    })
  );

  return habitsWithStreaks;
}

/**
 * Get a single habit with streak data
 */
export async function getHabitWithStreak(id: string): Promise<HabitWithStreak | null> {
  const userId = await getCurrentUserId();

  const [habit] = await db
    .select()
    .from(habits)
    .where(and(eq(habits.id, id), eq(habits.userId, userId)))
    .limit(1);

  if (!habit) return null;

  const startDate = format(subDays(new Date(), 365), "yyyy-MM-dd");

  const completions = await db
    .select()
    .from(habitCompletions)
    .where(
      and(
        eq(habitCompletions.habitId, habit.id),
        gte(habitCompletions.completedDate, startDate)
      )
    )
    .orderBy(desc(habitCompletions.completedDate));

  const completionDates = completions.map((c) => c.completedDate);
  const streak = calculateStreak(completionDates);

  return {
    ...habit,
    streak,
    completions,
  };
}

/**
 * Create a new habit
 */
export async function createHabit(data: {
  name: string;
  description?: string;
  icon?: string;
  color?: string;
}): Promise<Habit> {
  const userId = await getCurrentUserId();

  // Get max sort order
  const existingHabits = await db
    .select({ sortOrder: habits.sortOrder })
    .from(habits)
    .where(eq(habits.userId, userId))
    .orderBy(desc(habits.sortOrder))
    .limit(1);

  const nextSortOrder = (existingHabits[0]?.sortOrder ?? -1) + 1;

  const newHabit: NewHabit = {
    userId,
    name: data.name,
    description: data.description,
    icon: data.icon ?? "check",
    color: data.color ?? "#d4a574",
    sortOrder: nextSortOrder,
  };

  const [result] = await db.insert(habits).values(newHabit).returning();

  revalidatePath("/daily");
  revalidatePath("/");
  return result;
}

/**
 * Toggle habit completion for a date
 */
export async function toggleHabitCompletion(
  habitId: string,
  date?: string // "YYYY-MM-DD", defaults to today
): Promise<{ completed: boolean; streak: StreakData }> {
  const userId = await getCurrentUserId();
  const completedDate = date ?? getTodayString();

  // Verify habit belongs to user
  const [habit] = await db
    .select()
    .from(habits)
    .where(and(eq(habits.id, habitId), eq(habits.userId, userId)))
    .limit(1);

  if (!habit) {
    throw new Error("Habit not found");
  }

  // Check if already completed
  const [existing] = await db
    .select()
    .from(habitCompletions)
    .where(
      and(
        eq(habitCompletions.habitId, habitId),
        eq(habitCompletions.completedDate, completedDate),
        eq(habitCompletions.userId, userId)
      )
    )
    .limit(1);

  let completed: boolean;

  if (existing) {
    // Remove completion
    await db.delete(habitCompletions).where(eq(habitCompletions.id, existing.id));
    completed = false;
  } else {
    // Add completion
    await db.insert(habitCompletions).values({
      habitId,
      userId,
      completedDate,
    });
    completed = true;
  }

  // Get updated streak
  const startDate = format(subDays(new Date(), 365), "yyyy-MM-dd");
  const completions = await db
    .select()
    .from(habitCompletions)
    .where(
      and(
        eq(habitCompletions.habitId, habitId),
        gte(habitCompletions.completedDate, startDate)
      )
    )
    .orderBy(desc(habitCompletions.completedDate));

  const completionDates = completions.map((c) => c.completedDate);
  const streak = calculateStreak(completionDates);

  revalidatePath("/daily");
  revalidatePath("/");
  return { completed, streak };
}

/**
 * Update habit
 */
export async function updateHabit(
  id: string,
  data: Partial<{
    name: string;
    description: string;
    icon: string;
    color: string;
  }>
): Promise<void> {
  const userId = await getCurrentUserId();

  await db
    .update(habits)
    .set({ ...data, updatedAt: new Date() })
    .where(and(eq(habits.id, id), eq(habits.userId, userId)));

  revalidatePath("/daily");
}

/**
 * Archive habit (soft delete)
 */
export async function archiveHabit(id: string): Promise<void> {
  const userId = await getCurrentUserId();

  await db
    .update(habits)
    .set({ isArchived: true, updatedAt: new Date() })
    .where(and(eq(habits.id, id), eq(habits.userId, userId)));

  revalidatePath("/daily");
  revalidatePath("/");
}

/**
 * Delete habit and all completions (hard delete)
 */
export async function deleteHabit(id: string): Promise<void> {
  const userId = await getCurrentUserId();

  // Verify ownership
  const [habit] = await db
    .select()
    .from(habits)
    .where(and(eq(habits.id, id), eq(habits.userId, userId)))
    .limit(1);

  if (!habit) {
    throw new Error("Habit not found");
  }

  // Delete completions first (foreign key)
  await db.delete(habitCompletions).where(eq(habitCompletions.habitId, id));

  // Delete habit
  await db.delete(habits).where(eq(habits.id, id));

  revalidatePath("/daily");
  revalidatePath("/");
}

/**
 * Reorder habits
 */
export async function reorderHabits(orderedIds: string[]): Promise<void> {
  const userId = await getCurrentUserId();

  await Promise.all(
    orderedIds.map((id, index) =>
      db
        .update(habits)
        .set({ sortOrder: index })
        .where(and(eq(habits.id, id), eq(habits.userId, userId)))
    )
  );

  revalidatePath("/daily");
}

/**
 * Get habit completions for a date range (for calendar visualization)
 */
export async function getCompletionsInRange(
  startDate: string,
  endDate: string
): Promise<HabitCompletion[]> {
  const userId = await getCurrentUserId();

  return db
    .select()
    .from(habitCompletions)
    .where(
      and(
        eq(habitCompletions.userId, userId),
        gte(habitCompletions.completedDate, startDate),
        lte(habitCompletions.completedDate, endDate)
      )
    )
    .orderBy(habitCompletions.completedDate);
}

/**
 * Get today's habit completion summary
 */
export async function getTodaysSummary(): Promise<{
  completed: number;
  total: number;
  habits: HabitWithStreak[];
}> {
  const habits = await getHabitsWithStreaks();
  const completedToday = habits.filter((h) => h.streak.isCompletedToday).length;

  return {
    completed: completedToday,
    total: habits.length,
    habits,
  };
}
