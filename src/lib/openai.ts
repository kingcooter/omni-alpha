import OpenAI from "openai";
import type { Project } from "@/lib/db/schema";
import {
  buildEnhancedPrompt,
  parseEnhancedResponse,
  type EnhancedSuggestion,
  type IntentType,
} from "@/lib/ai/prompts";

// Initialize Groq client (OpenAI-compatible API)
const groq = new OpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: "https://api.groq.com/openai/v1",
});

// Re-export types
export type { EnhancedSuggestion, IntentType };

export interface ProjectSuggestion {
  projectId: string;
  projectName: string;
  projectColor: string;
  confidence: number;
  reason: string;
  // Enhanced fields
  intent?: IntentType;
  intentConfidence?: number;
  suggestNewProject?: { name: string; reason: string } | null;
  entities?: { dates: string[]; people: string[]; actions: string[] };
  relatedThoughtIds?: string[];
}

/**
 * Suggest matching projects for a thought using AI
 * Uses Llama 4 Scout via Groq for speed and cost efficiency
 */
export async function suggestProjectsForThought(
  content: string,
  projects: Project[]
): Promise<ProjectSuggestion[]> {
  // Don't call AI for very short content
  if (content.length < 10 || projects.length === 0) {
    return [];
  }

  const projectList = projects
    .map((p) => `- ID: ${p.id}, Name: "${p.name}", Description: "${p.description || "No description"}"`)
    .join("\n");

  const prompt = `You are helping categorize a thought into existing projects.

Projects available:
${projectList}

User's thought: "${content}"

Analyze the thought and suggest up to 3 matching projects, ranked by relevance.
Only suggest projects where confidence > 0.5.
If no projects match well, return an empty array.

Return ONLY valid JSON (no markdown, no explanation), in this exact format:
[{ "projectId": "...", "confidence": 0.0-1.0, "reason": "brief 3-5 word explanation" }]`;

  try {
    const response = await groq.chat.completions.create({
      model: "meta-llama/llama-4-scout-17b-16e-instruct",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.3,
      max_tokens: 200,
    });

    const text = response.choices[0]?.message?.content?.trim() || "[]";

    // Parse response - handle potential markdown code blocks
    let jsonText = text;
    if (text.startsWith("```")) {
      jsonText = text.replace(/```json?\n?/g, "").replace(/```/g, "").trim();
    }

    const suggestions = JSON.parse(jsonText) as Array<{
      projectId: string;
      confidence: number;
      reason: string;
    }>;

    // Enrich with project data and filter valid
    return suggestions
      .filter((s) => s.confidence > 0.5)
      .map((s) => {
        const project = projects.find((p) => p.id === s.projectId);
        if (!project) return null;
        return {
          projectId: s.projectId,
          projectName: project.name,
          projectColor: project.color ?? "#d4a574",
          confidence: s.confidence,
          reason: s.reason,
        };
      })
      .filter((s): s is ProjectSuggestion => s !== null)
      .slice(0, 3);
  } catch (error) {
    console.error("AI suggestion error:", error);
    return [];
  }
}

/**
 * Enhanced suggestion with intent detection, entity extraction, and cross-referencing
 * Returns richer data for the hero feature experience
 */
export async function getEnhancedSuggestion(
  content: string,
  projects: Project[],
  recentThoughts: { id: string; content: string }[] = []
): Promise<ProjectSuggestion[]> {
  // Don't call AI for very short content
  if (content.length < 10) {
    return [];
  }

  const prompt = buildEnhancedPrompt(content, projects, recentThoughts);

  try {
    const response = await groq.chat.completions.create({
      model: "meta-llama/llama-4-scout-17b-16e-instruct",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.3,
      max_tokens: 400,
    });

    const text = response.choices[0]?.message?.content?.trim() || "{}";
    const enhanced = parseEnhancedResponse(text, projects);

    if (!enhanced) {
      return [];
    }

    const suggestions: ProjectSuggestion[] = [];

    // Add project match if exists
    if (enhanced.projectMatch) {
      const project = projects.find((p) => p.id === enhanced.projectMatch!.projectId);
      if (project) {
        suggestions.push({
          projectId: project.id,
          projectName: project.name,
          projectColor: project.color ?? "#d4a574",
          confidence: enhanced.projectMatch.confidence,
          reason: enhanced.projectMatch.reason,
          intent: enhanced.intent,
          intentConfidence: enhanced.intentConfidence,
          suggestNewProject: enhanced.suggestNewProject,
          entities: enhanced.entities,
          relatedThoughtIds: enhanced.relatedThoughtIds,
        });
      }
    }

    // If no project match but we have a new project suggestion, include it
    if (suggestions.length === 0 && enhanced.suggestNewProject) {
      suggestions.push({
        projectId: "__new__",
        projectName: enhanced.suggestNewProject.name,
        projectColor: "#d4a574", // Default gold for new projects
        confidence: 0.7,
        reason: enhanced.suggestNewProject.reason,
        intent: enhanced.intent,
        intentConfidence: enhanced.intentConfidence,
        suggestNewProject: enhanced.suggestNewProject,
        entities: enhanced.entities,
        relatedThoughtIds: enhanced.relatedThoughtIds,
      });
    }

    // Even if no project suggestions, return intent data
    if (suggestions.length === 0 && enhanced.intent) {
      suggestions.push({
        projectId: "__none__",
        projectName: "",
        projectColor: "",
        confidence: 0,
        reason: "",
        intent: enhanced.intent,
        intentConfidence: enhanced.intentConfidence,
        entities: enhanced.entities,
        relatedThoughtIds: enhanced.relatedThoughtIds,
      });
    }

    return suggestions;
  } catch (error) {
    console.error("Enhanced AI suggestion error:", error);
    return [];
  }
}
