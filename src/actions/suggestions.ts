"use server";

import { getEnhancedSuggestion, type ProjectSuggestion } from "@/lib/openai";
import { getProjects } from "@/actions/projects";
import { getRecentThoughts } from "@/actions/thoughts";

/**
 * Get AI-powered enhanced suggestions for a thought
 * Includes intent detection, entity extraction, and cross-referencing
 */
export async function getSuggestions(content: string): Promise<ProjectSuggestion[]> {
  // Validate content
  if (!content || content.trim().length < 10) {
    return [];
  }

  try {
    // Fetch available projects and recent thoughts in parallel
    const [projects, recentThoughts] = await Promise.all([
      getProjects(),
      getRecentThoughtsForContext(),
    ]);

    // Get enhanced AI suggestions (works even with no projects for intent detection)
    const suggestions = await getEnhancedSuggestion(
      content.trim(),
      projects,
      recentThoughts
    );

    return suggestions;
  } catch (error) {
    console.error("Failed to get suggestions:", error);
    return [];
  }
}

/**
 * Get recent thoughts formatted for cross-reference context
 */
async function getRecentThoughtsForContext(): Promise<{ id: string; content: string }[]> {
  try {
    const thoughts = await getRecentThoughts(10); // Last 10 thoughts
    return thoughts.map((t) => ({
      id: t.id,
      content: t.content,
    }));
  } catch {
    return [];
  }
}
