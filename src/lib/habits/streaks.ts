import { format, subDays, parseISO, isBefore, differenceInDays } from "date-fns";

export interface StreakData {
  currentStreak: number;
  longestStreak: number;
  lastCompletedDate: string | null;
  isCompletedToday: boolean;
  isStreakAtRisk: boolean; // True if streak is active but not done today
}

/**
 * Calculate streak from completion dates (sorted descending)
 * Rules:
 * - Streak counts consecutive days of completion
 * - Missing a day resets the streak to 0
 * - Today counts if completed, otherwise check yesterday (streak still alive)
 */
export function calculateStreak(completionDates: string[]): StreakData {
  if (completionDates.length === 0) {
    return {
      currentStreak: 0,
      longestStreak: 0,
      lastCompletedDate: null,
      isCompletedToday: false,
      isStreakAtRisk: false,
    };
  }

  // Sort dates descending (most recent first)
  const sortedDates = [...completionDates].sort((a, b) => b.localeCompare(a));
  const today = format(new Date(), "yyyy-MM-dd");
  const yesterday = format(subDays(new Date(), 1), "yyyy-MM-dd");

  const isCompletedToday = sortedDates[0] === today;
  const lastCompletedDate = sortedDates[0];

  // Calculate current streak
  let currentStreak = 0;

  // Streak is alive if done today OR done yesterday (still have today to continue)
  const streakStartDate = isCompletedToday ? today : yesterday;
  const streakIsAlive = sortedDates[0] === today || sortedDates[0] === yesterday;

  if (streakIsAlive) {
    let expectedDate = streakStartDate;

    for (const dateStr of sortedDates) {
      if (dateStr === expectedDate) {
        currentStreak++;
        expectedDate = format(subDays(parseISO(expectedDate), 1), "yyyy-MM-dd");
      } else if (isBefore(parseISO(dateStr), parseISO(expectedDate))) {
        // Gap found - dates are not consecutive
        break;
      }
    }
  }

  // Calculate longest streak
  let longestStreak = 0;
  let tempStreak = 1;

  for (let i = 1; i < sortedDates.length; i++) {
    const prevDate = parseISO(sortedDates[i - 1]);
    const currDate = parseISO(sortedDates[i]);
    const dayDiff = differenceInDays(prevDate, currDate);

    if (dayDiff === 1) {
      tempStreak++;
    } else {
      longestStreak = Math.max(longestStreak, tempStreak);
      tempStreak = 1;
    }
  }
  longestStreak = Math.max(longestStreak, tempStreak);

  // Streak is at risk if we had a streak yesterday but haven't done it today
  const isStreakAtRisk = !isCompletedToday && sortedDates[0] === yesterday && currentStreak > 0;

  return {
    currentStreak,
    longestStreak,
    lastCompletedDate,
    isCompletedToday,
    isStreakAtRisk,
  };
}

/**
 * Format streak for display
 */
export function formatStreak(streak: number): string {
  if (streak === 0) return "No streak";
  if (streak === 1) return "1 day";
  return `${streak} days`;
}

/**
 * Get streak milestone (for badges/celebrations)
 */
export function getStreakMilestone(streak: number): {
  milestone: number | null;
  nextMilestone: number;
} {
  const milestones = [7, 14, 30, 60, 90, 100, 180, 365];

  let currentMilestone: number | null = null;
  let nextMilestone = 7;

  for (let i = 0; i < milestones.length; i++) {
    if (streak >= milestones[i]) {
      currentMilestone = milestones[i];
      nextMilestone = milestones[i + 1] ?? milestones[i] * 2;
    } else {
      nextMilestone = milestones[i];
      break;
    }
  }

  return { milestone: currentMilestone, nextMilestone };
}

/**
 * Get streak intensity level for color coding
 * 0 = no streak, 1 = starting (1-7), 2 = building (8-30), 3 = strong (30+)
 */
export function getStreakIntensity(streak: number): 0 | 1 | 2 | 3 {
  if (streak === 0) return 0;
  if (streak <= 7) return 1;
  if (streak <= 30) return 2;
  return 3;
}

/**
 * Check if today is a completion date
 */
export function isToday(dateStr: string): boolean {
  return dateStr === format(new Date(), "yyyy-MM-dd");
}

/**
 * Get today's date as "YYYY-MM-DD"
 */
export function getTodayString(): string {
  return format(new Date(), "yyyy-MM-dd");
}
