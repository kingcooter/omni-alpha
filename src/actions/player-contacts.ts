"use server";

import { revalidatePath } from "next/cache";
import {
  db,
  playerContacts,
  interactions,
  type PlayerContact,
  type NewPlayerContact,
  type PlayerContactMetadata,
  type ContactTier,
} from "@/lib/db";
import { desc, eq, and, like, or } from "drizzle-orm";
import { getCurrentUserId } from "@/lib/auth";
import { computeTier } from "@/lib/player/tier-calculator";

/**
 * Create a new player contact
 */
export async function createPlayerContact(data: {
  name: string;
  photoUri?: string | null;
  source?: string;
  title?: string | null;
  firstMetContext?: string | null;
  metadata?: PlayerContactMetadata;
}): Promise<PlayerContact> {
  if (!data.name || data.name.trim().length === 0) {
    throw new Error("Name is required");
  }

  const userId = await getCurrentUserId();

  try {
    const newContact: NewPlayerContact = {
      userId,
      name: data.name.trim(),
      photoUri: data.photoUri ?? null,
      source: data.source ?? "manual",
      title: data.title ?? null,
      firstMetContext: data.firstMetContext ?? null,
      metadata: data.metadata ?? null,
      tier: "acquaintance",
      tierScore: 0,
    };

    const [result] = await db.insert(playerContacts).values(newContact).returning();

    revalidatePath("/player");
    revalidatePath("/player/contacts");

    return result;
  } catch (error) {
    console.error("Failed to create player contact:", error);
    throw new Error("Failed to create contact");
  }
}

/**
 * Update a player contact
 */
export async function updatePlayerContact(
  id: string,
  data: Partial<{
    name: string;
    photoUri: string | null;
    title: string | null;
    firstMetContext: string | null;
    metadata: PlayerContactMetadata;
    isArchived: boolean;
  }>
): Promise<PlayerContact> {
  if (!id) {
    throw new Error("Contact ID is required");
  }

  const userId = await getCurrentUserId();

  try {
    const [result] = await db
      .update(playerContacts)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(and(eq(playerContacts.id, id), eq(playerContacts.userId, userId)))
      .returning();

    if (!result) {
      throw new Error("Contact not found");
    }

    revalidatePath("/player");
    revalidatePath("/player/contacts");
    revalidatePath(`/player/contacts/${id}`);

    return result;
  } catch (error) {
    console.error("Failed to update player contact:", error);
    throw new Error("Failed to update contact");
  }
}

/**
 * Archive a player contact (soft delete)
 */
export async function archivePlayerContact(id: string): Promise<void> {
  if (!id) {
    throw new Error("Contact ID is required");
  }

  const userId = await getCurrentUserId();

  try {
    await db
      .update(playerContacts)
      .set({ isArchived: true, updatedAt: new Date() })
      .where(and(eq(playerContacts.id, id), eq(playerContacts.userId, userId)));

    revalidatePath("/player");
    revalidatePath("/player/contacts");
  } catch (error) {
    console.error("Failed to archive player contact:", error);
    throw new Error("Failed to archive contact");
  }
}

/**
 * Delete a player contact permanently
 */
export async function deletePlayerContact(id: string): Promise<void> {
  if (!id) {
    throw new Error("Contact ID is required");
  }

  const userId = await getCurrentUserId();

  try {
    await db
      .delete(playerContacts)
      .where(and(eq(playerContacts.id, id), eq(playerContacts.userId, userId)));

    revalidatePath("/player");
    revalidatePath("/player/contacts");
  } catch (error) {
    console.error("Failed to delete player contact:", error);
    throw new Error("Failed to delete contact");
  }
}

/**
 * Get a single player contact by ID
 */
export async function getPlayerContact(id: string): Promise<PlayerContact | null> {
  if (!id) {
    return null;
  }

  const userId = await getCurrentUserId();

  try {
    const [result] = await db
      .select()
      .from(playerContacts)
      .where(and(eq(playerContacts.id, id), eq(playerContacts.userId, userId)))
      .limit(1);

    return result ?? null;
  } catch (error) {
    console.error("Failed to get player contact:", error);
    return null;
  }
}

/**
 * Get all player contacts for the current user
 */
export async function getPlayerContacts(options?: {
  includeArchived?: boolean;
  tier?: ContactTier;
  limit?: number;
}): Promise<PlayerContact[]> {
  const userId = await getCurrentUserId();

  try {
    const conditions = [eq(playerContacts.userId, userId)];

    if (!options?.includeArchived) {
      conditions.push(eq(playerContacts.isArchived, false));
    }

    if (options?.tier) {
      conditions.push(eq(playerContacts.tier, options.tier));
    }

    const result = await db
      .select()
      .from(playerContacts)
      .where(and(...conditions))
      .orderBy(desc(playerContacts.tierScore), desc(playerContacts.lastInteractionAt))
      .limit(options?.limit ?? 100);

    return result;
  } catch (error) {
    console.error("Failed to get player contacts:", error);
    return [];
  }
}

/**
 * Search player contacts by name or metadata
 */
export async function searchPlayerContacts(
  query: string,
  options?: { limit?: number }
): Promise<PlayerContact[]> {
  if (!query || query.trim().length === 0) {
    return getPlayerContacts(options);
  }

  const userId = await getCurrentUserId();
  const searchTerm = `%${query.trim()}%`;

  try {
    const result = await db
      .select()
      .from(playerContacts)
      .where(
        and(
          eq(playerContacts.userId, userId),
          eq(playerContacts.isArchived, false),
          like(playerContacts.name, searchTerm)
        )
      )
      .orderBy(desc(playerContacts.tierScore))
      .limit(options?.limit ?? 50);

    return result;
  } catch (error) {
    console.error("Failed to search player contacts:", error);
    return [];
  }
}

/**
 * Update contact stats and tier based on interactions
 * This is called by the trigger system after logging an interaction
 */
export async function updateContactStats(contactId: string): Promise<{
  tier: ContactTier;
  tierScore: number;
}> {
  const userId = await getCurrentUserId();

  try {
    // Get all interactions for this contact
    const contactInteractions = await db
      .select({
        occurredAt: interactions.occurredAt,
        durationMinutes: interactions.durationMinutes,
      })
      .from(interactions)
      .where(
        and(
          eq(interactions.contactId, contactId),
          eq(interactions.userId, userId)
        )
      );

    // Compute new tier
    const { tier, score } = computeTier(
      contactInteractions.map((i) => ({
        occurredAt: i.occurredAt,
        durationMinutes: i.durationMinutes,
      }))
    );

    // Calculate totals
    const interactionCount = contactInteractions.length;
    const totalMinutes = contactInteractions.reduce(
      (sum, i) => sum + (i.durationMinutes ?? 0),
      0
    );
    const lastInteraction = contactInteractions.length > 0
      ? contactInteractions.reduce((latest, i) =>
          i.occurredAt > latest ? i.occurredAt : latest,
          contactInteractions[0].occurredAt
        )
      : null;

    // Update contact
    await db
      .update(playerContacts)
      .set({
        tier,
        tierScore: score,
        interactionCount,
        totalInteractionMinutes: totalMinutes,
        lastInteractionAt: lastInteraction,
        updatedAt: new Date(),
      })
      .where(and(eq(playerContacts.id, contactId), eq(playerContacts.userId, userId)));

    revalidatePath("/player");
    revalidatePath("/player/contacts");
    revalidatePath(`/player/contacts/${contactId}`);

    return { tier, tierScore: score };
  } catch (error) {
    console.error("Failed to update contact stats:", error);
    throw new Error("Failed to update contact stats");
  }
}

/**
 * Get contacts grouped by tier
 */
export async function getContactsByTier(): Promise<Record<ContactTier, PlayerContact[]>> {
  const contacts = await getPlayerContacts();

  const grouped: Record<ContactTier, PlayerContact[]> = {
    inner_circle: [],
    close: [],
    regular: [],
    acquaintance: [],
    dormant: [],
  };

  for (const contact of contacts) {
    const tier = contact.tier as ContactTier;
    grouped[tier].push(contact);
  }

  return grouped;
}

/**
 * Get contact count by tier (for stats display)
 */
export async function getContactCountsByTier(): Promise<Record<ContactTier, number>> {
  const contacts = await getPlayerContacts();

  const counts: Record<ContactTier, number> = {
    inner_circle: 0,
    close: 0,
    regular: 0,
    acquaintance: 0,
    dormant: 0,
  };

  for (const contact of contacts) {
    const tier = contact.tier as ContactTier;
    counts[tier]++;
  }

  return counts;
}
