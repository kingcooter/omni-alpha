"use server";

import { revalidatePath } from "next/cache";
import { db, thoughts, type NewThought, type Thought } from "@/lib/db";
import { desc, eq } from "drizzle-orm";

export async function createThought(content: string): Promise<Thought> {
  const newThought: NewThought = {
    content,
  };

  const [result] = await db.insert(thoughts).values(newThought).returning();

  revalidatePath("/");

  return result;
}

export async function getRecentThoughts(limit = 10): Promise<Thought[]> {
  const result = await db
    .select()
    .from(thoughts)
    .where(eq(thoughts.isArchived, false))
    .orderBy(desc(thoughts.createdAt))
    .limit(limit);

  return result;
}

export async function archiveThought(id: string): Promise<void> {
  await db
    .update(thoughts)
    .set({ isArchived: true, updatedAt: new Date() })
    .where(eq(thoughts.id, id));

  revalidatePath("/");
}

export async function pinThought(id: string, isPinned: boolean): Promise<void> {
  await db
    .update(thoughts)
    .set({ isPinned, updatedAt: new Date() })
    .where(eq(thoughts.id, id));

  revalidatePath("/");
}

export async function deleteThought(id: string): Promise<void> {
  await db.delete(thoughts).where(eq(thoughts.id, id));

  revalidatePath("/");
}
