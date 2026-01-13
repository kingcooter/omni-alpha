"use server";

import { revalidatePath } from "next/cache";
import {
  db,
  journalEntries,
  type JournalEntry,
  type NewJournalEntry,
} from "@/lib/db";
import { desc, eq, and, gte, lte } from "drizzle-orm";
import { getCurrentUserId } from "@/lib/auth";

/**
 * Create a new journal entry
 */
export async function createJournalEntry(data: {
  entityType: string;
  entityId?: string | null;
  entryType: string;
  content: string;
  metadata?: Record<string, unknown>;
  aiGenerated?: boolean;
}): Promise<JournalEntry> {
  if (!data.content || data.content.trim().length === 0) {
    throw new Error("Content is required");
  }

  const userId = await getCurrentUserId();

  try {
    const newEntry: NewJournalEntry = {
      userId,
      entityType: data.entityType,
      entityId: data.entityId ?? null,
      entryType: data.entryType,
      content: data.content.trim(),
      metadata: data.metadata ?? null,
      aiGenerated: data.aiGenerated ?? false,
    };

    const [result] = await db.insert(journalEntries).values(newEntry).returning();

    revalidatePath("/player");
    revalidatePath("/player/journal");

    return result;
  } catch (error) {
    console.error("Failed to create journal entry:", error);
    throw new Error("Failed to create journal entry");
  }
}

/**
 * Get recent journal entries
 */
export async function getRecentJournalEntries(options?: {
  limit?: number;
  entryType?: string;
  entityType?: string;
}): Promise<JournalEntry[]> {
  const userId = await getCurrentUserId();

  try {
    const conditions = [eq(journalEntries.userId, userId)];

    if (options?.entryType) {
      conditions.push(eq(journalEntries.entryType, options.entryType));
    }

    if (options?.entityType) {
      conditions.push(eq(journalEntries.entityType, options.entityType));
    }

    const result = await db
      .select()
      .from(journalEntries)
      .where(and(...conditions))
      .orderBy(desc(journalEntries.createdAt))
      .limit(options?.limit ?? 50);

    return result;
  } catch (error) {
    console.error("Failed to get journal entries:", error);
    return [];
  }
}

/**
 * Get journal entries for a specific entity
 */
export async function getEntityJournalEntries(
  entityType: string,
  entityId: string,
  options?: { limit?: number }
): Promise<JournalEntry[]> {
  const userId = await getCurrentUserId();

  try {
    const result = await db
      .select()
      .from(journalEntries)
      .where(
        and(
          eq(journalEntries.userId, userId),
          eq(journalEntries.entityType, entityType),
          eq(journalEntries.entityId, entityId)
        )
      )
      .orderBy(desc(journalEntries.createdAt))
      .limit(options?.limit ?? 50);

    return result;
  } catch (error) {
    console.error("Failed to get entity journal entries:", error);
    return [];
  }
}

/**
 * Get journal entries in a date range
 */
export async function getJournalEntriesInDateRange(
  startDate: Date,
  endDate: Date
): Promise<JournalEntry[]> {
  const userId = await getCurrentUserId();

  try {
    const result = await db
      .select()
      .from(journalEntries)
      .where(
        and(
          eq(journalEntries.userId, userId),
          gte(journalEntries.createdAt, startDate),
          lte(journalEntries.createdAt, endDate)
        )
      )
      .orderBy(desc(journalEntries.createdAt));

    return result;
  } catch (error) {
    console.error("Failed to get journal entries in date range:", error);
    return [];
  }
}

/**
 * Get today's journal entries
 */
export async function getTodayJournalEntries(): Promise<JournalEntry[]> {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  return getJournalEntriesInDateRange(today, tomorrow);
}

/**
 * Delete a journal entry
 */
export async function deleteJournalEntry(id: string): Promise<void> {
  if (!id) {
    throw new Error("Journal entry ID is required");
  }

  const userId = await getCurrentUserId();

  try {
    await db
      .delete(journalEntries)
      .where(and(eq(journalEntries.id, id), eq(journalEntries.userId, userId)));

    revalidatePath("/player/journal");
  } catch (error) {
    console.error("Failed to delete journal entry:", error);
    throw new Error("Failed to delete journal entry");
  }
}

/**
 * Get journal entry counts by type (for stats)
 */
export async function getJournalEntryCounts(): Promise<Record<string, number>> {
  const entries = await getRecentJournalEntries({ limit: 1000 });

  const counts: Record<string, number> = {};
  for (const entry of entries) {
    counts[entry.entryType] = (counts[entry.entryType] ?? 0) + 1;
  }

  return counts;
}

/**
 * Create a manual note (user-written journal entry)
 */
export async function createManualNote(content: string): Promise<JournalEntry> {
  return createJournalEntry({
    entityType: "system",
    entryType: "insight",
    content,
    aiGenerated: false,
  });
}
