"use server";

import { revalidatePath } from "next/cache";
import { db, thoughts, projects, type NewThought, type Thought, type Project } from "@/lib/db";
import { desc, eq, and, like, or, isNull, gte, lte, isNotNull } from "drizzle-orm";
import { parseNaturalDate } from "@/lib/time";
import { getCurrentUserId } from "@/lib/auth";

export async function createThought(
  content: string,
  projectId?: string | null,
  options?: {
    detectedIntent?: string;
    extractedKeywords?: string[];
  }
): Promise<Thought> {
  if (!content || content.trim().length === 0) {
    throw new Error("Content is required");
  }

  const userId = await getCurrentUserId();

  try {
    // Parse natural language dates from content
    const parsedDate = parseNaturalDate(content);

    const newThought: NewThought = {
      userId,
      content: content.trim(),
      projectId: projectId ?? null,
      detectedIntent: options?.detectedIntent ?? null,
      extractedKeywords: options?.extractedKeywords ?? null,
      dueDate: parsedDate?.date ?? null,
      dueDateText: parsedDate?.originalText ?? null,
    };

    const [result] = await db.insert(thoughts).values(newThought).returning();

    revalidatePath("/");
    revalidatePath("/recents");
    revalidatePath("/calendar");
    if (projectId) {
      revalidatePath("/projects");
    }

    return result;
  } catch (error) {
    console.error("Failed to create thought:", error);
    throw new Error("Failed to save thought");
  }
}

export async function getRecentThoughts(limit = 10): Promise<Thought[]> {
  const userId = await getCurrentUserId();

  try {
    const result = await db
      .select()
      .from(thoughts)
      .where(and(eq(thoughts.userId, userId), eq(thoughts.isArchived, false)))
      .orderBy(desc(thoughts.isPinned), desc(thoughts.createdAt))
      .limit(limit);

    return result;
  } catch (error) {
    console.error("Failed to get thoughts:", error);
    return [];
  }
}

export async function archiveThought(id: string): Promise<void> {
  if (!id) {
    throw new Error("Thought ID is required");
  }

  const userId = await getCurrentUserId();

  try {
    await db
      .update(thoughts)
      .set({ isArchived: true, updatedAt: new Date() })
      .where(and(eq(thoughts.id, id), eq(thoughts.userId, userId)));

    revalidatePath("/");
    revalidatePath("/recents");
  } catch (error) {
    console.error("Failed to archive thought:", error);
    throw new Error("Failed to archive thought");
  }
}

export async function pinThought(id: string, isPinned: boolean): Promise<void> {
  if (!id) {
    throw new Error("Thought ID is required");
  }

  const userId = await getCurrentUserId();

  try {
    await db
      .update(thoughts)
      .set({ isPinned, updatedAt: new Date() })
      .where(and(eq(thoughts.id, id), eq(thoughts.userId, userId)));

    revalidatePath("/");
  } catch (error) {
    console.error("Failed to update thought:", error);
    throw new Error("Failed to update thought");
  }
}

export async function deleteThought(id: string): Promise<void> {
  if (!id) {
    throw new Error("Thought ID is required");
  }

  const userId = await getCurrentUserId();

  try {
    await db.delete(thoughts).where(and(eq(thoughts.id, id), eq(thoughts.userId, userId)));

    revalidatePath("/");
    revalidatePath("/recents");
  } catch (error) {
    console.error("Failed to delete thought:", error);
    throw new Error("Failed to delete thought");
  }
}

export async function assignThoughtToProject(
  thoughtId: string,
  projectId: string | null
): Promise<void> {
  if (!thoughtId) {
    throw new Error("Thought ID is required");
  }

  const userId = await getCurrentUserId();

  try {
    await db
      .update(thoughts)
      .set({ projectId, updatedAt: new Date() })
      .where(and(eq(thoughts.id, thoughtId), eq(thoughts.userId, userId)));

    revalidatePath("/");
    revalidatePath("/recents");
    revalidatePath("/projects");
  } catch (error) {
    console.error("Failed to assign thought to project:", error);
    throw new Error("Failed to assign thought to project");
  }
}

export async function searchThoughts(
  query: string,
  options?: {
    projectId?: string | null;
    includeArchived?: boolean;
    limit?: number;
  }
): Promise<Thought[]> {
  const userId = await getCurrentUserId();

  try {
    const conditions = [eq(thoughts.userId, userId)];

    // Text search
    if (query && query.trim()) {
      conditions.push(like(thoughts.content, `%${query.trim()}%`));
    }

    // Project filter
    if (options?.projectId !== undefined) {
      if (options.projectId === null) {
        conditions.push(isNull(thoughts.projectId));
      } else {
        conditions.push(eq(thoughts.projectId, options.projectId));
      }
    }

    // Archived filter
    if (!options?.includeArchived) {
      conditions.push(eq(thoughts.isArchived, false));
    }

    const result = await db
      .select()
      .from(thoughts)
      .where(and(...conditions))
      .orderBy(desc(thoughts.isPinned), desc(thoughts.createdAt))
      .limit(options?.limit ?? 50);

    return result;
  } catch (error) {
    console.error("Failed to search thoughts:", error);
    return [];
  }
}

export async function getThoughtsByProject(projectId: string): Promise<Thought[]> {
  const userId = await getCurrentUserId();

  try {
    return await db
      .select()
      .from(thoughts)
      .where(
        and(
          eq(thoughts.userId, userId),
          eq(thoughts.projectId, projectId),
          eq(thoughts.isArchived, false)
        )
      )
      .orderBy(desc(thoughts.isPinned), desc(thoughts.createdAt));
  } catch (error) {
    console.error("Failed to get thoughts by project:", error);
    return [];
  }
}

export type ThoughtWithProject = Thought & { project: Project | null };

export async function getThoughtsWithProjects(limit = 50): Promise<ThoughtWithProject[]> {
  const userId = await getCurrentUserId();

  try {
    const result = await db
      .select({
        thought: thoughts,
        project: projects,
      })
      .from(thoughts)
      .leftJoin(projects, eq(thoughts.projectId, projects.id))
      .where(and(eq(thoughts.userId, userId), eq(thoughts.isArchived, false)))
      .orderBy(desc(thoughts.isPinned), desc(thoughts.createdAt))
      .limit(limit);

    return result.map((row) => ({
      ...row.thought,
      project: row.project,
    }));
  } catch (error) {
    console.error("Failed to get thoughts with projects:", error);
    return [];
  }
}

/**
 * Get thoughts that have a due date (for calendar view)
 */
export async function getThoughtsWithDueDates(): Promise<ThoughtWithProject[]> {
  const userId = await getCurrentUserId();

  try {
    const result = await db
      .select({
        thought: thoughts,
        project: projects,
      })
      .from(thoughts)
      .leftJoin(projects, eq(thoughts.projectId, projects.id))
      .where(
        and(
          eq(thoughts.userId, userId),
          eq(thoughts.isArchived, false),
          isNotNull(thoughts.dueDate)
        )
      )
      .orderBy(thoughts.dueDate);

    return result.map((row) => ({
      ...row.thought,
      project: row.project,
    }));
  } catch (error) {
    console.error("Failed to get thoughts with due dates:", error);
    return [];
  }
}

/**
 * Get thoughts due within a date range (for calendar views)
 */
export async function getThoughtsInDateRange(
  startDate: Date,
  endDate: Date
): Promise<ThoughtWithProject[]> {
  const userId = await getCurrentUserId();

  try {
    const result = await db
      .select({
        thought: thoughts,
        project: projects,
      })
      .from(thoughts)
      .leftJoin(projects, eq(thoughts.projectId, projects.id))
      .where(
        and(
          eq(thoughts.userId, userId),
          eq(thoughts.isArchived, false),
          gte(thoughts.dueDate, startDate),
          lte(thoughts.dueDate, endDate)
        )
      )
      .orderBy(thoughts.dueDate);

    return result.map((row) => ({
      ...row.thought,
      project: row.project,
    }));
  } catch (error) {
    console.error("Failed to get thoughts in date range:", error);
    return [];
  }
}

/**
 * Get thoughts due today
 */
export async function getThoughtsDueToday(): Promise<ThoughtWithProject[]> {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  return getThoughtsInDateRange(today, tomorrow);
}

/**
 * Get upcoming thoughts (due within next 7 days)
 */
export async function getUpcomingThoughts(): Promise<ThoughtWithProject[]> {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const nextWeek = new Date(today);
  nextWeek.setDate(nextWeek.getDate() + 7);

  return getThoughtsInDateRange(today, nextWeek);
}

/**
 * Get overdue thoughts
 */
export async function getOverdueThoughts(): Promise<ThoughtWithProject[]> {
  const userId = await getCurrentUserId();
  const now = new Date();

  try {
    const result = await db
      .select({
        thought: thoughts,
        project: projects,
      })
      .from(thoughts)
      .leftJoin(projects, eq(thoughts.projectId, projects.id))
      .where(
        and(
          eq(thoughts.userId, userId),
          eq(thoughts.isArchived, false),
          isNotNull(thoughts.dueDate),
          lte(thoughts.dueDate, now)
        )
      )
      .orderBy(thoughts.dueDate);

    return result.map((row) => ({
      ...row.thought,
      project: row.project,
    }));
  } catch (error) {
    console.error("Failed to get overdue thoughts:", error);
    return [];
  }
}

/**
 * Update due date for a thought
 */
export async function updateThoughtDueDate(
  id: string,
  dueDate: Date | null,
  dueDateText?: string | null
): Promise<void> {
  if (!id) {
    throw new Error("Thought ID is required");
  }

  const userId = await getCurrentUserId();

  try {
    await db
      .update(thoughts)
      .set({
        dueDate,
        dueDateText: dueDateText ?? null,
        updatedAt: new Date(),
      })
      .where(and(eq(thoughts.id, id), eq(thoughts.userId, userId)));

    revalidatePath("/");
    revalidatePath("/calendar");
  } catch (error) {
    console.error("Failed to update thought due date:", error);
    throw new Error("Failed to update due date");
  }
}
