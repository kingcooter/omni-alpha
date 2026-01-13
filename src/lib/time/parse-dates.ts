/**
 * Natural language date parsing utility
 * Converts expressions like "tomorrow", "next Friday", "in 2 days" to Date objects
 */

export interface ParsedDate {
  date: Date;
  originalText: string;
  confidence: number; // 0-1, how confident we are in the parse
}

// Common relative date patterns
const RELATIVE_PATTERNS: Array<{
  pattern: RegExp;
  resolver: (match: RegExpMatchArray) => Date | null;
}> = [
  // Today/now
  {
    pattern: /\b(today|now|tonight)\b/i,
    resolver: () => {
      const d = new Date();
      d.setHours(23, 59, 59, 999);
      return d;
    },
  },
  // Tomorrow
  {
    pattern: /\btomorrow\b/i,
    resolver: () => {
      const d = new Date();
      d.setDate(d.getDate() + 1);
      d.setHours(23, 59, 59, 999);
      return d;
    },
  },
  // Yesterday (for references, not usually due dates)
  {
    pattern: /\byesterday\b/i,
    resolver: () => {
      const d = new Date();
      d.setDate(d.getDate() - 1);
      d.setHours(23, 59, 59, 999);
      return d;
    },
  },
  // In X days/weeks/months
  {
    pattern: /\bin\s+(\d+)\s+(day|days|week|weeks|month|months)\b/i,
    resolver: (match) => {
      const amount = parseInt(match[1], 10);
      const unit = match[2].toLowerCase();
      const d = new Date();

      if (unit.startsWith("day")) {
        d.setDate(d.getDate() + amount);
      } else if (unit.startsWith("week")) {
        d.setDate(d.getDate() + amount * 7);
      } else if (unit.startsWith("month")) {
        d.setMonth(d.getMonth() + amount);
      }

      d.setHours(23, 59, 59, 999);
      return d;
    },
  },
  // X days/weeks from now
  {
    pattern: /\b(\d+)\s+(day|days|week|weeks)\s+(from\s+now|away)\b/i,
    resolver: (match) => {
      const amount = parseInt(match[1], 10);
      const unit = match[2].toLowerCase();
      const d = new Date();

      if (unit.startsWith("day")) {
        d.setDate(d.getDate() + amount);
      } else if (unit.startsWith("week")) {
        d.setDate(d.getDate() + amount * 7);
      }

      d.setHours(23, 59, 59, 999);
      return d;
    },
  },
  // Next week/month
  {
    pattern: /\bnext\s+(week|month)\b/i,
    resolver: (match) => {
      const unit = match[1].toLowerCase();
      const d = new Date();

      if (unit === "week") {
        d.setDate(d.getDate() + 7);
      } else if (unit === "month") {
        d.setMonth(d.getMonth() + 1);
      }

      d.setHours(23, 59, 59, 999);
      return d;
    },
  },
  // This week/month (end of)
  {
    pattern: /\b(this|end\s+of(\s+this)?)\s+(week|month)\b/i,
    resolver: (match) => {
      const unit = match[3].toLowerCase();
      const d = new Date();

      if (unit === "week") {
        // End of week (Sunday)
        const daysUntilSunday = 7 - d.getDay();
        d.setDate(d.getDate() + daysUntilSunday);
      } else if (unit === "month") {
        // End of month
        d.setMonth(d.getMonth() + 1, 0);
      }

      d.setHours(23, 59, 59, 999);
      return d;
    },
  },
  // By/before + relative
  {
    pattern: /\b(by|before)\s+(tomorrow|next\s+week)\b/i,
    resolver: (match) => {
      const target = match[2].toLowerCase();
      const d = new Date();

      if (target === "tomorrow") {
        d.setDate(d.getDate() + 1);
      } else if (target.includes("week")) {
        d.setDate(d.getDate() + 7);
      }

      d.setHours(23, 59, 59, 999);
      return d;
    },
  },
];

// Day of week patterns
const DAYS_OF_WEEK = [
  "sunday",
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
];

const DAY_OF_WEEK_PATTERN = new RegExp(
  `\\b(next\\s+)?(${DAYS_OF_WEEK.join("|")})\\b`,
  "i"
);

// Month patterns for specific dates
const MONTHS = [
  "january",
  "february",
  "march",
  "april",
  "may",
  "june",
  "july",
  "august",
  "september",
  "october",
  "november",
  "december",
];

const MONTH_DATE_PATTERN = new RegExp(
  `\\b(${MONTHS.join("|")})\\s+(\\d{1,2})(?:st|nd|rd|th)?(?:\\s*,?\\s*(\\d{4}))?\\b`,
  "i"
);

// Numeric date patterns (MM/DD, DD/MM based on locale - we'll use US format)
const NUMERIC_DATE_PATTERN = /\b(\d{1,2})\/(\d{1,2})(?:\/(\d{2,4}))?\b/;

/**
 * Parse a natural language date from text
 */
export function parseNaturalDate(text: string): ParsedDate | null {
  const lowerText = text.toLowerCase();

  // Try relative patterns first (highest confidence)
  for (const { pattern, resolver } of RELATIVE_PATTERNS) {
    const match = text.match(pattern);
    if (match) {
      const date = resolver(match);
      if (date) {
        return {
          date,
          originalText: match[0],
          confidence: 0.9,
        };
      }
    }
  }

  // Try day of week
  const dayMatch = text.match(DAY_OF_WEEK_PATTERN);
  if (dayMatch) {
    const isNext = !!dayMatch[1];
    const dayName = dayMatch[2].toLowerCase();
    const targetDay = DAYS_OF_WEEK.indexOf(dayName);

    if (targetDay !== -1) {
      const d = new Date();
      const currentDay = d.getDay();
      let daysUntil = targetDay - currentDay;

      // If the day has passed this week (or is today without "next"), go to next week
      if (daysUntil <= 0 || isNext) {
        daysUntil += 7;
      }

      d.setDate(d.getDate() + daysUntil);
      d.setHours(23, 59, 59, 999);

      return {
        date: d,
        originalText: dayMatch[0],
        confidence: 0.85,
      };
    }
  }

  // Try month + date
  const monthMatch = text.match(MONTH_DATE_PATTERN);
  if (monthMatch) {
    const monthName = monthMatch[1].toLowerCase();
    const day = parseInt(monthMatch[2], 10);
    const year = monthMatch[3]
      ? parseInt(monthMatch[3], 10)
      : new Date().getFullYear();

    const monthIndex = MONTHS.indexOf(monthName);
    if (monthIndex !== -1 && day >= 1 && day <= 31) {
      const d = new Date(year, monthIndex, day, 23, 59, 59, 999);

      // If the date is in the past, assume next year
      if (d < new Date() && !monthMatch[3]) {
        d.setFullYear(d.getFullYear() + 1);
      }

      return {
        date: d,
        originalText: monthMatch[0],
        confidence: 0.8,
      };
    }
  }

  // Try numeric date (MM/DD/YYYY)
  const numericMatch = text.match(NUMERIC_DATE_PATTERN);
  if (numericMatch) {
    const month = parseInt(numericMatch[1], 10) - 1;
    const day = parseInt(numericMatch[2], 10);
    let year = numericMatch[3]
      ? parseInt(numericMatch[3], 10)
      : new Date().getFullYear();

    // Handle 2-digit years
    if (year < 100) {
      year += 2000;
    }

    if (month >= 0 && month <= 11 && day >= 1 && day <= 31) {
      const d = new Date(year, month, day, 23, 59, 59, 999);

      return {
        date: d,
        originalText: numericMatch[0],
        confidence: 0.75,
      };
    }
  }

  return null;
}

/**
 * Extract all date references from text
 */
export function extractAllDates(text: string): ParsedDate[] {
  const dates: ParsedDate[] = [];
  const seen = new Set<string>();

  // Try all patterns
  const patterns = [
    ...RELATIVE_PATTERNS.map((p) => p.pattern),
    DAY_OF_WEEK_PATTERN,
    MONTH_DATE_PATTERN,
    NUMERIC_DATE_PATTERN,
  ];

  for (const pattern of patterns) {
    const globalPattern = new RegExp(pattern.source, pattern.flags + "g");
    let match;
    while ((match = globalPattern.exec(text)) !== null) {
      const matchText = match[0];
      if (!seen.has(matchText.toLowerCase())) {
        seen.add(matchText.toLowerCase());
        const parsed = parseNaturalDate(matchText);
        if (parsed) {
          dates.push(parsed);
        }
      }
    }
  }

  // Sort by confidence (highest first)
  return dates.sort((a, b) => b.confidence - a.confidence);
}

/**
 * Format a date for display
 */
export function formatRelativeDate(date: Date): string {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const target = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const diffDays = Math.round(
    (target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
  );

  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Tomorrow";
  if (diffDays === -1) return "Yesterday";
  if (diffDays > 0 && diffDays <= 7) {
    return DAYS_OF_WEEK[date.getDay()].charAt(0).toUpperCase() +
           DAYS_OF_WEEK[date.getDay()].slice(1);
  }
  if (diffDays > 7 && diffDays <= 14) return "Next week";

  // Default to date format
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: date.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
  });
}

/**
 * Check if a date is overdue
 */
export function isOverdue(date: Date): boolean {
  const now = new Date();
  return date < now;
}

/**
 * Check if a date is today
 */
export function isToday(date: Date): boolean {
  const now = new Date();
  return (
    date.getDate() === now.getDate() &&
    date.getMonth() === now.getMonth() &&
    date.getFullYear() === now.getFullYear()
  );
}

/**
 * Check if a date is within the next N days
 */
export function isWithinDays(date: Date, days: number): boolean {
  const now = new Date();
  const future = new Date(now);
  future.setDate(future.getDate() + days);
  return date >= now && date <= future;
}
