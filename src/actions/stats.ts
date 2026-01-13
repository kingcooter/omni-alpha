"use server";

import { db } from "@/lib/db";
import { thoughts, projects, habits, habitCompletions } from "@/lib/db/schema";
import { eq, and, gte, count } from "drizzle-orm";
import { getCurrentUserId } from "@/lib/auth";
import { format } from "date-fns";

export interface DashboardStats {
  totalThoughts: number;
  pinnedThoughts: number;
  todayThoughts: number;
  totalProjects: number;
  habitsCompletedToday: number;
  totalHabits: number;
}

export async function getDashboardStats(): Promise<DashboardStats> {
  const userId = await getCurrentUserId();

  try {
    // Get start of today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayStr = format(today, "yyyy-MM-dd");

    // Run queries in parallel
    const [
      totalResult,
      pinnedResult,
      todayResult,
      projectsResult,
      totalHabitsResult,
      todayHabitsResult,
    ] = await Promise.all([
      // Total thoughts (not archived)
      db
        .select({ count: count() })
        .from(thoughts)
        .where(and(eq(thoughts.userId, userId), eq(thoughts.isArchived, false))),

      // Pinned thoughts
      db
        .select({ count: count() })
        .from(thoughts)
        .where(
          and(
            eq(thoughts.userId, userId),
            eq(thoughts.isPinned, true),
            eq(thoughts.isArchived, false)
          )
        ),

      // Thoughts created today
      db
        .select({ count: count() })
        .from(thoughts)
        .where(
          and(
            eq(thoughts.userId, userId),
            eq(thoughts.isArchived, false),
            gte(thoughts.createdAt, today)
          )
        ),

      // Total projects
      db
        .select({ count: count() })
        .from(projects)
        .where(and(eq(projects.userId, userId), eq(projects.isArchived, false))),

      // Total habits
      db
        .select({ count: count() })
        .from(habits)
        .where(and(eq(habits.userId, userId), eq(habits.isArchived, false))),

      // Habits completed today
      db
        .select({ count: count() })
        .from(habitCompletions)
        .where(
          and(
            eq(habitCompletions.userId, userId),
            eq(habitCompletions.completedDate, todayStr)
          )
        ),
    ]);

    return {
      totalThoughts: totalResult[0]?.count ?? 0,
      pinnedThoughts: pinnedResult[0]?.count ?? 0,
      todayThoughts: todayResult[0]?.count ?? 0,
      totalProjects: projectsResult[0]?.count ?? 0,
      totalHabits: totalHabitsResult[0]?.count ?? 0,
      habitsCompletedToday: todayHabitsResult[0]?.count ?? 0,
    };
  } catch (error) {
    console.error("Failed to get dashboard stats:", error);
    return {
      totalThoughts: 0,
      pinnedThoughts: 0,
      todayThoughts: 0,
      totalProjects: 0,
      totalHabits: 0,
      habitsCompletedToday: 0,
    };
  }
}
