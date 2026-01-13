import type { ContactTier } from "@/lib/db/schema";

/**
 * Tier Calculator
 * Computes relationship tier based on interaction frequency and recency.
 *
 * Philosophy: Relationships decay over time without contact.
 * Recent interactions are weighted more heavily than old ones.
 */

export interface TierConfig {
  /** Base points per interaction */
  interactionWeight: number;
  /** Weekly decay factor (0.95 = 5% decay per week) */
  recencyDecay: number;
  /** Duration bonus multiplier (per hour, capped at 2 hours) */
  durationBonusMultiplier: number;
  /** Score thresholds for each tier */
  thresholds: Record<ContactTier, number>;
}

export const DEFAULT_TIER_CONFIG: TierConfig = {
  interactionWeight: 10,
  recencyDecay: 0.95,
  durationBonusMultiplier: 0.5,
  thresholds: {
    inner_circle: 80,
    close: 60,
    regular: 40,
    acquaintance: 20,
    dormant: 0,
  },
};

export interface InteractionForScoring {
  occurredAt: Date;
  durationMinutes: number | null;
}

/**
 * Compute tier score from interactions.
 * Score is based on interaction count, recency, and duration.
 *
 * @param interactions - Array of interactions with dates and durations
 * @param config - Tier configuration (optional, uses defaults)
 * @returns Score from 0-100
 */
export function computeTierScore(
  interactions: InteractionForScoring[],
  config: TierConfig = DEFAULT_TIER_CONFIG
): number {
  if (interactions.length === 0) {
    return 0;
  }

  const now = new Date();
  let score = 0;

  for (const interaction of interactions) {
    // Calculate weeks since interaction
    const msPerWeek = 7 * 24 * 60 * 60 * 1000;
    const weeksAgo = (now.getTime() - interaction.occurredAt.getTime()) / msPerWeek;

    // Apply exponential decay based on recency
    const decayFactor = Math.pow(config.recencyDecay, Math.max(0, weeksAgo));

    // Duration bonus: longer interactions count more (capped at 2 hours)
    const durationMinutes = interaction.durationMinutes ?? 15; // Default 15 min
    const cappedDuration = Math.min(durationMinutes, 120);
    const durationBonus = 1 + (cappedDuration / 60) * config.durationBonusMultiplier;

    // Add to score
    score += config.interactionWeight * decayFactor * durationBonus;
  }

  // Cap at 100
  return Math.min(100, Math.round(score));
}

/**
 * Convert a tier score to a tier name.
 *
 * @param score - Score from 0-100
 * @param config - Tier configuration (optional)
 * @returns The tier name
 */
export function scoreToTier(
  score: number,
  config: TierConfig = DEFAULT_TIER_CONFIG
): ContactTier {
  if (score >= config.thresholds.inner_circle) return "inner_circle";
  if (score >= config.thresholds.close) return "close";
  if (score >= config.thresholds.regular) return "regular";
  if (score >= config.thresholds.acquaintance) return "acquaintance";
  return "dormant";
}

/**
 * Compute both score and tier in one call.
 */
export function computeTier(
  interactions: InteractionForScoring[],
  config: TierConfig = DEFAULT_TIER_CONFIG
): { score: number; tier: ContactTier } {
  const score = computeTierScore(interactions, config);
  const tier = scoreToTier(score, config);
  return { score, tier };
}

/**
 * Get display name for a tier.
 */
export function getTierDisplayName(tier: ContactTier): string {
  const names: Record<ContactTier, string> = {
    inner_circle: "Inner Circle",
    close: "Close",
    regular: "Regular",
    acquaintance: "Acquaintance",
    dormant: "Dormant",
  };
  return names[tier];
}

/**
 * Get CSS class for a tier badge.
 */
export function getTierClass(tier: ContactTier): string {
  return `tier-${tier.replace("_", "-")}`;
}
