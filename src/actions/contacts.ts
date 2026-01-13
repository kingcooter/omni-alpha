"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { contacts } from "@/lib/db/schema";
import { eq, desc, asc, like, or, and } from "drizzle-orm";
import type { Contact, NewContact } from "@/lib/db/schema";
import { getCurrentUserId } from "@/lib/auth";

export async function getContacts(options?: {
  search?: string;
  tag?: string;
  favoritesOnly?: boolean;
  limit?: number;
}): Promise<Contact[]> {
  const userId = await getCurrentUserId();

  try {
    const conditions = [eq(contacts.userId, userId), eq(contacts.isArchived, false)];

    if (options?.favoritesOnly) {
      conditions.push(eq(contacts.isFavorite, true));
    }

    if (options?.search) {
      const searchTerm = `%${options.search}%`;
      conditions.push(
        or(
          like(contacts.name, searchTerm),
          like(contacts.email, searchTerm),
          like(contacts.company, searchTerm),
          like(contacts.notes, searchTerm)
        )!
      );
    }

    const results = await db
      .select()
      .from(contacts)
      .where(and(...conditions))
      .orderBy(desc(contacts.isFavorite), asc(contacts.name))
      .limit(options?.limit ?? 100);

    // Filter by tag if specified (JSON array filtering)
    if (options?.tag) {
      return results.filter((c) => c.tags?.includes(options.tag!));
    }

    return results;
  } catch (error) {
    console.error("Failed to get contacts:", error);
    return [];
  }
}

export async function getContact(id: string): Promise<Contact | null> {
  const userId = await getCurrentUserId();

  try {
    const result = await db
      .select()
      .from(contacts)
      .where(and(eq(contacts.id, id), eq(contacts.userId, userId)))
      .limit(1);
    return result[0] ?? null;
  } catch (error) {
    console.error("Failed to get contact:", error);
    return null;
  }
}

export async function createContact(data: {
  name: string;
  email?: string;
  phone?: string;
  company?: string;
  role?: string;
  notes?: string;
  tags?: string[];
  relationship?: string;
  linkedIn?: string;
  twitter?: string;
  website?: string;
  projectIds?: string[];
}): Promise<Contact> {
  const userId = await getCurrentUserId();

  const newContact: NewContact = {
    userId,
    name: data.name,
    email: data.email,
    phone: data.phone,
    company: data.company,
    role: data.role,
    notes: data.notes,
    tags: data.tags,
    relationship: data.relationship,
    linkedIn: data.linkedIn,
    twitter: data.twitter,
    website: data.website,
    projectIds: data.projectIds,
  };

  const result = await db.insert(contacts).values(newContact).returning();
  revalidatePath("/people");
  return result[0];
}

export async function updateContact(
  id: string,
  data: Partial<{
    name: string;
    email: string;
    phone: string;
    company: string;
    role: string;
    avatar: string;
    notes: string;
    tags: string[];
    context: string;
    interests: string[];
    relationship: string;
    lastContactAt: Date;
    linkedIn: string;
    twitter: string;
    website: string;
    projectIds: string[];
    isFavorite: boolean;
  }>
): Promise<void> {
  const userId = await getCurrentUserId();

  await db
    .update(contacts)
    .set({
      ...data,
      updatedAt: new Date(),
    })
    .where(and(eq(contacts.id, id), eq(contacts.userId, userId)));
  revalidatePath("/people");
  revalidatePath(`/people/${id}`);
}

export async function archiveContact(id: string): Promise<void> {
  const userId = await getCurrentUserId();

  await db
    .update(contacts)
    .set({
      isArchived: true,
      updatedAt: new Date(),
    })
    .where(and(eq(contacts.id, id), eq(contacts.userId, userId)));
  revalidatePath("/people");
}

export async function deleteContact(id: string): Promise<void> {
  const userId = await getCurrentUserId();

  await db.delete(contacts).where(and(eq(contacts.id, id), eq(contacts.userId, userId)));
  revalidatePath("/people");
}

export async function toggleFavorite(id: string, isFavorite: boolean): Promise<void> {
  const userId = await getCurrentUserId();

  await db
    .update(contacts)
    .set({
      isFavorite,
      updatedAt: new Date(),
    })
    .where(and(eq(contacts.id, id), eq(contacts.userId, userId)));
  revalidatePath("/people");
}

export async function recordContactMention(id: string): Promise<void> {
  const userId = await getCurrentUserId();
  const contact = await getContact(id);
  if (!contact) return;

  await db
    .update(contacts)
    .set({
      mentionCount: (contact.mentionCount ?? 0) + 1,
      lastMentionedAt: new Date(),
      updatedAt: new Date(),
    })
    .where(and(eq(contacts.id, id), eq(contacts.userId, userId)));
}

export async function getContactsByProject(projectId: string): Promise<Contact[]> {
  const userId = await getCurrentUserId();

  try {
    const allContacts = await db
      .select()
      .from(contacts)
      .where(and(eq(contacts.userId, userId), eq(contacts.isArchived, false)));

    // Filter contacts that have this project in their projectIds array
    return allContacts.filter((c) => c.projectIds?.includes(projectId));
  } catch (error) {
    console.error("Failed to get contacts by project:", error);
    return [];
  }
}

export async function getContactTags(): Promise<string[]> {
  const userId = await getCurrentUserId();

  try {
    const allContacts = await db
      .select({ tags: contacts.tags })
      .from(contacts)
      .where(and(eq(contacts.userId, userId), eq(contacts.isArchived, false)));

    // Extract unique tags
    const tagSet = new Set<string>();
    allContacts.forEach((c) => {
      c.tags?.forEach((tag) => tagSet.add(tag));
    });

    return Array.from(tagSet).sort();
  } catch (error) {
    console.error("Failed to get contact tags:", error);
    return [];
  }
}

// AI-powered: Extract potential contacts from thought content
export async function extractContactsFromText(text: string): Promise<Array<{
  name: string;
  context: string;
}>> {
  // Simple pattern matching for names (capitalized words that look like names)
  // In production, this would use AI/NLP
  const namePattern = /\b([A-Z][a-z]+(?:\s+[A-Z][a-z]+)+)\b/g;
  const matches = text.matchAll(namePattern);

  const results: Array<{ name: string; context: string }> = [];
  const seen = new Set<string>();

  for (const match of matches) {
    const name = match[0];
    if (!seen.has(name.toLowerCase())) {
      seen.add(name.toLowerCase());
      // Get surrounding context
      const startIndex = Math.max(0, match.index! - 50);
      const endIndex = Math.min(text.length, match.index! + name.length + 50);
      const context = text.slice(startIndex, endIndex).trim();
      results.push({ name, context });
    }
  }

  return results;
}
