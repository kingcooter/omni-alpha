import type { Project } from "@/lib/db/schema";

export type IntentType = "task" | "idea" | "question" | "reminder" | "note";

export interface EnhancedSuggestion {
  // Intent detection
  intent: IntentType;
  intentConfidence: number;

  // Project match (null if no good match)
  projectMatch: {
    projectId: string;
    confidence: number;
    reason: string;
  } | null;

  // Suggest creating a new project (when no match > 0.4)
  suggestNewProject: {
    name: string;
    reason: string;
  } | null;

  // Extracted entities
  entities: {
    dates: string[];
    people: string[];
    actions: string[];
  };

  // Related thought IDs (filled in by backend)
  relatedThoughtIds: string[];
}

/**
 * Build the enhanced suggestion prompt for Llama 4 Scout
 */
export function buildEnhancedPrompt(
  content: string,
  projects: Project[],
  recentThoughtSnippets: { id: string; content: string }[] = []
): string {
  const projectList = projects
    .map(
      (p) =>
        `- ID: "${p.id}", Name: "${p.name}", Description: "${p.description || "No description"}"`
    )
    .join("\n");

  const recentThoughts =
    recentThoughtSnippets.length > 0
      ? recentThoughtSnippets
          .map((t) => `- ID: "${t.id}", Content: "${t.content.slice(0, 100)}..."`)
          .join("\n")
      : "None available";

  return `You are analyzing a thought/note for a personal productivity app called Omni.

PROJECTS AVAILABLE:
${projectList || "No projects yet"}

RECENT THOUGHTS (for cross-referencing):
${recentThoughts}

USER'S NEW THOUGHT: "${content}"

Analyze this thought and return ONLY valid JSON (no markdown, no explanation) with this exact structure:
{
  "intent": "task" | "idea" | "question" | "reminder" | "note",
  "intentConfidence": 0.0-1.0,
  "projectMatch": {
    "projectId": "exact-id-from-above",
    "confidence": 0.0-1.0,
    "reason": "3-5 word explanation"
  } or null if no good match (confidence < 0.4),
  "suggestNewProject": {
    "name": "Short Project Name",
    "reason": "why this thought deserves a new project"
  } or null if existing project matches well,
  "entities": {
    "dates": ["extracted date references like 'tomorrow', 'next week'"],
    "people": ["names mentioned"],
    "actions": ["verbs like 'call', 'buy', 'send', 'review'"]
  },
  "relatedThoughtIds": ["ids of related thoughts from recent list, max 2"]
}

INTENT GUIDE:
- "task": Action item, something to do (contains verbs like call, buy, send, fix, review)
- "idea": Creative thought, concept, or possibility to explore
- "question": Something to research or find out
- "reminder": Time-sensitive, needs to be remembered for a specific moment
- "note": General information capture, reference material

Return ONLY the JSON object.`;
}

/**
 * Parse the AI response into an EnhancedSuggestion
 */
export function parseEnhancedResponse(
  responseText: string,
  projects: Project[]
): EnhancedSuggestion | null {
  try {
    // Handle potential markdown code blocks
    let jsonText = responseText.trim();
    if (jsonText.startsWith("```")) {
      jsonText = jsonText.replace(/```json?\n?/g, "").replace(/```/g, "").trim();
    }

    const parsed = JSON.parse(jsonText);

    // Validate and sanitize the response
    const result: EnhancedSuggestion = {
      intent: isValidIntent(parsed.intent) ? parsed.intent : "note",
      intentConfidence: clamp(parsed.intentConfidence ?? 0.5, 0, 1),
      projectMatch: null,
      suggestNewProject: null,
      entities: {
        dates: Array.isArray(parsed.entities?.dates) ? parsed.entities.dates : [],
        people: Array.isArray(parsed.entities?.people) ? parsed.entities.people : [],
        actions: Array.isArray(parsed.entities?.actions) ? parsed.entities.actions : [],
      },
      relatedThoughtIds: Array.isArray(parsed.relatedThoughtIds)
        ? parsed.relatedThoughtIds.slice(0, 2)
        : [],
    };

    // Validate project match
    if (parsed.projectMatch?.projectId) {
      const project = projects.find((p) => p.id === parsed.projectMatch.projectId);
      if (project && parsed.projectMatch.confidence >= 0.4) {
        result.projectMatch = {
          projectId: parsed.projectMatch.projectId,
          confidence: clamp(parsed.projectMatch.confidence, 0, 1),
          reason: parsed.projectMatch.reason || "matches content",
        };
      }
    }

    // Include new project suggestion if no good match
    if (!result.projectMatch && parsed.suggestNewProject?.name) {
      result.suggestNewProject = {
        name: parsed.suggestNewProject.name.slice(0, 30),
        reason: parsed.suggestNewProject.reason || "new category detected",
      };
    }

    return result;
  } catch (error) {
    console.error("Failed to parse enhanced AI response:", error);
    return null;
  }
}

function isValidIntent(intent: unknown): intent is IntentType {
  return ["task", "idea", "question", "reminder", "note"].includes(intent as string);
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}
