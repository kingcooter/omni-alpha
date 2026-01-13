"use server";

import { revalidatePath } from "next/cache";
import {
  db,
  interactions,
  playerContacts,
  type Interaction,
  type NewInteraction,
  type InteractionType,
  type PlayerContact,
} from "@/lib/db";
import { desc, eq, and, gte, lte } from "drizzle-orm";
import { getCurrentUserId } from "@/lib/auth";
import { updateContactStats } from "./player-contacts";
import { createJournalEntry } from "./player-journal";

/**
 * Log a new interaction with a contact
 */
export async function logInteraction(data: {
  contactId: string;
  type: InteractionType;
  occurredAt?: Date;
  durationMinutes?: number;
  rawInput?: string;
  summary?: string;
  topics?: string[];
  sentiment?: string;
  followUpNeeded?: boolean;
  followUpNote?: string;
  questIds?: string[];
  location?: string;
}): Promise<Interaction> {
  if (!data.contactId) {
    throw new Error("Contact ID is required");
  }

  const userId = await getCurrentUserId();

  try {
    // Verify contact exists and belongs to user
    const [contact] = await db
      .select()
      .from(playerContacts)
      .where(
        and(
          eq(playerContacts.id, data.contactId),
          eq(playerContacts.userId, userId)
        )
      )
      .limit(1);

    if (!contact) {
      throw new Error("Contact not found");
    }

    // Create the interaction
    const newInteraction: NewInteraction = {
      userId,
      contactId: data.contactId,
      type: data.type,
      occurredAt: data.occurredAt ?? new Date(),
      durationMinutes: data.durationMinutes ?? null,
      rawInput: data.rawInput ?? null,
      summary: data.summary ?? null,
      topics: data.topics ?? null,
      sentiment: data.sentiment ?? null,
      followUpNeeded: data.followUpNeeded ?? false,
      followUpNote: data.followUpNote ?? null,
      questIds: data.questIds ?? null,
      location: data.location ?? null,
    };

    const [result] = await db.insert(interactions).values(newInteraction).returning();

    // Trigger cascade: update contact stats
    const previousTier = contact.tier;
    const { tier: newTier } = await updateContactStats(data.contactId);

    // Create journal entry for the interaction
    const interactionDescription = getInteractionDescription(data.type, contact.name);
    await createJournalEntry({
      entityType: "interaction",
      entityId: result.id,
      entryType: "interaction",
      content: data.summary ?? interactionDescription,
      metadata: {
        contactId: data.contactId,
        contactName: contact.name,
        type: data.type,
        durationMinutes: data.durationMinutes,
      },
    });

    // If tier changed, create a tier change journal entry
    if (newTier !== previousTier) {
      await createJournalEntry({
        entityType: "contact",
        entityId: data.contactId,
        entryType: "tier_change",
        content: `${contact.name} moved from ${formatTier(previousTier)} to ${formatTier(newTier)}`,
        aiGenerated: true,
        metadata: {
          previousTier,
          newTier,
        },
      });
    }

    revalidatePath("/player");
    revalidatePath("/player/contacts");
    revalidatePath(`/player/contacts/${data.contactId}`);
    revalidatePath("/player/journal");

    return result;
  } catch (error) {
    console.error("Failed to log interaction:", error);
    throw new Error("Failed to log interaction");
  }
}

/**
 * Get interactions for a specific contact
 */
export async function getContactInteractions(
  contactId: string,
  options?: { limit?: number }
): Promise<Interaction[]> {
  if (!contactId) {
    return [];
  }

  const userId = await getCurrentUserId();

  try {
    const result = await db
      .select()
      .from(interactions)
      .where(
        and(
          eq(interactions.contactId, contactId),
          eq(interactions.userId, userId)
        )
      )
      .orderBy(desc(interactions.occurredAt))
      .limit(options?.limit ?? 50);

    return result;
  } catch (error) {
    console.error("Failed to get contact interactions:", error);
    return [];
  }
}

/**
 * Get recent interactions across all contacts
 */
export async function getRecentInteractions(options?: {
  limit?: number;
  type?: InteractionType;
}): Promise<(Interaction & { contact: PlayerContact })[]> {
  const userId = await getCurrentUserId();

  try {
    const conditions = [eq(interactions.userId, userId)];

    if (options?.type) {
      conditions.push(eq(interactions.type, options.type));
    }

    const result = await db
      .select({
        interaction: interactions,
        contact: playerContacts,
      })
      .from(interactions)
      .innerJoin(playerContacts, eq(interactions.contactId, playerContacts.id))
      .where(and(...conditions))
      .orderBy(desc(interactions.occurredAt))
      .limit(options?.limit ?? 20);

    return result.map((row) => ({
      ...row.interaction,
      contact: row.contact,
    }));
  } catch (error) {
    console.error("Failed to get recent interactions:", error);
    return [];
  }
}

/**
 * Get interactions in a date range
 */
export async function getInteractionsInDateRange(
  startDate: Date,
  endDate: Date
): Promise<Interaction[]> {
  const userId = await getCurrentUserId();

  try {
    const result = await db
      .select()
      .from(interactions)
      .where(
        and(
          eq(interactions.userId, userId),
          gte(interactions.occurredAt, startDate),
          lte(interactions.occurredAt, endDate)
        )
      )
      .orderBy(desc(interactions.occurredAt));

    return result;
  } catch (error) {
    console.error("Failed to get interactions in date range:", error);
    return [];
  }
}

/**
 * Update an existing interaction
 */
export async function updateInteraction(
  id: string,
  data: Partial<{
    summary: string;
    topics: string[];
    sentiment: string;
    followUpNeeded: boolean;
    followUpNote: string;
    questIds: string[];
  }>
): Promise<Interaction> {
  if (!id) {
    throw new Error("Interaction ID is required");
  }

  const userId = await getCurrentUserId();

  try {
    const [result] = await db
      .update(interactions)
      .set(data)
      .where(and(eq(interactions.id, id), eq(interactions.userId, userId)))
      .returning();

    if (!result) {
      throw new Error("Interaction not found");
    }

    revalidatePath("/player");
    revalidatePath(`/player/contacts/${result.contactId}`);

    return result;
  } catch (error) {
    console.error("Failed to update interaction:", error);
    throw new Error("Failed to update interaction");
  }
}

/**
 * Delete an interaction
 */
export async function deleteInteraction(id: string): Promise<void> {
  if (!id) {
    throw new Error("Interaction ID is required");
  }

  const userId = await getCurrentUserId();

  try {
    // Get the interaction first to know the contact
    const [interaction] = await db
      .select()
      .from(interactions)
      .where(and(eq(interactions.id, id), eq(interactions.userId, userId)))
      .limit(1);

    if (!interaction) {
      throw new Error("Interaction not found");
    }

    // Delete the interaction
    await db
      .delete(interactions)
      .where(and(eq(interactions.id, id), eq(interactions.userId, userId)));

    // Recalculate contact stats
    await updateContactStats(interaction.contactId);

    revalidatePath("/player");
    revalidatePath(`/player/contacts/${interaction.contactId}`);
  } catch (error) {
    console.error("Failed to delete interaction:", error);
    throw new Error("Failed to delete interaction");
  }
}

/**
 * Get interactions that need follow-up
 */
export async function getFollowUpNeeded(): Promise<(Interaction & { contact: PlayerContact })[]> {
  const userId = await getCurrentUserId();

  try {
    const result = await db
      .select({
        interaction: interactions,
        contact: playerContacts,
      })
      .from(interactions)
      .innerJoin(playerContacts, eq(interactions.contactId, playerContacts.id))
      .where(
        and(
          eq(interactions.userId, userId),
          eq(interactions.followUpNeeded, true)
        )
      )
      .orderBy(desc(interactions.occurredAt));

    return result.map((row) => ({
      ...row.interaction,
      contact: row.contact,
    }));
  } catch (error) {
    console.error("Failed to get follow-up needed:", error);
    return [];
  }
}

// Helper functions
function getInteractionDescription(type: InteractionType, contactName: string): string {
  const descriptions: Record<InteractionType, string> = {
    call: `Had a call with ${contactName}`,
    meeting: `Met with ${contactName}`,
    text: `Texted with ${contactName}`,
    email: `Emailed ${contactName}`,
    coffee: `Had coffee with ${contactName}`,
    event: `Attended an event with ${contactName}`,
    intro: `Was introduced to ${contactName}`,
    other: `Interacted with ${contactName}`,
  };
  return descriptions[type] ?? `Interacted with ${contactName}`;
}

function formatTier(tier: string | null): string {
  if (!tier) return "Unknown";
  return tier
    .replace("_", " ")
    .replace(/\b\w/g, (l) => l.toUpperCase());
}
