"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { projects, thoughts } from "@/lib/db/schema";
import { eq, desc, asc, count, and } from "drizzle-orm";
import type { Project, NewProject } from "@/lib/db/schema";
import { getCurrentUserId } from "@/lib/auth";

export async function getProjects(): Promise<Project[]> {
  const userId = await getCurrentUserId();

  try {
    return await db
      .select()
      .from(projects)
      .where(and(eq(projects.userId, userId), eq(projects.isArchived, false)))
      .orderBy(asc(projects.sortOrder), desc(projects.createdAt));
  } catch (error) {
    console.error("Failed to get projects:", error);
    return [];
  }
}

export async function getProjectsWithCounts(): Promise<(Project & { thoughtCount: number })[]> {
  const userId = await getCurrentUserId();

  try {
    const projectList = await db
      .select()
      .from(projects)
      .where(and(eq(projects.userId, userId), eq(projects.isArchived, false)))
      .orderBy(asc(projects.sortOrder), desc(projects.createdAt));

    // Get thought counts for each project
    const projectsWithCounts = await Promise.all(
      projectList.map(async (project) => {
        const result = await db
          .select({ count: count() })
          .from(thoughts)
          .where(and(eq(thoughts.projectId, project.id), eq(thoughts.isArchived, false)));
        return {
          ...project,
          thoughtCount: result[0]?.count ?? 0,
        };
      })
    );

    return projectsWithCounts;
  } catch (error) {
    console.error("Failed to get projects with counts:", error);
    return [];
  }
}

export async function getProject(id: string): Promise<Project | null> {
  const userId = await getCurrentUserId();

  try {
    const result = await db
      .select()
      .from(projects)
      .where(and(eq(projects.id, id), eq(projects.userId, userId)))
      .limit(1);
    return result[0] ?? null;
  } catch (error) {
    console.error("Failed to get project:", error);
    return null;
  }
}

export async function createProject(data: {
  name: string;
  description?: string;
  color?: string;
  icon?: string;
}): Promise<Project> {
  const userId = await getCurrentUserId();

  const newProject: NewProject = {
    userId,
    name: data.name,
    description: data.description,
    color: data.color ?? "#d4a574",
    icon: data.icon ?? "folder",
  };

  const result = await db.insert(projects).values(newProject).returning();
  revalidatePath("/projects");
  revalidatePath("/");
  return result[0];
}

export async function updateProject(
  id: string,
  data: {
    name?: string;
    description?: string;
    color?: string;
    icon?: string;
  }
): Promise<void> {
  const userId = await getCurrentUserId();

  await db
    .update(projects)
    .set({
      ...data,
      updatedAt: new Date(),
    })
    .where(and(eq(projects.id, id), eq(projects.userId, userId)));
  revalidatePath("/projects");
  revalidatePath("/");
}

export async function archiveProject(id: string): Promise<void> {
  const userId = await getCurrentUserId();

  await db
    .update(projects)
    .set({
      isArchived: true,
      updatedAt: new Date(),
    })
    .where(and(eq(projects.id, id), eq(projects.userId, userId)));
  revalidatePath("/projects");
  revalidatePath("/");
}

export async function deleteProject(id: string): Promise<void> {
  const userId = await getCurrentUserId();

  // First, unlink any thoughts from this project (only user's thoughts)
  await db
    .update(thoughts)
    .set({ projectId: null })
    .where(and(eq(thoughts.projectId, id), eq(thoughts.userId, userId)));

  // Then delete the project
  await db.delete(projects).where(and(eq(projects.id, id), eq(projects.userId, userId)));
  revalidatePath("/projects");
  revalidatePath("/");
}

export async function reorderProjects(orderedIds: string[]): Promise<void> {
  const userId = await getCurrentUserId();

  await Promise.all(
    orderedIds.map((id, index) =>
      db
        .update(projects)
        .set({ sortOrder: index })
        .where(and(eq(projects.id, id), eq(projects.userId, userId)))
    )
  );
  revalidatePath("/projects");
}
