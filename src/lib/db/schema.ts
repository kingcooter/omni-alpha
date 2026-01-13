import { sqliteTable, text, integer, index } from "drizzle-orm/sqlite-core";

// Thoughts - core capture functionality
export const thoughts = sqliteTable("thoughts", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id").notNull(),
  content: text("content").notNull(),
  projectId: text("project_id").references(() => projects.id),
  tags: text("tags", { mode: "json" }).$type<string[]>(),
  isPinned: integer("is_pinned", { mode: "boolean" }).default(false),
  isArchived: integer("is_archived", { mode: "boolean" }).default(false),
  // AI-extracted metadata for cross-referencing
  extractedKeywords: text("extracted_keywords", { mode: "json" }).$type<string[]>(),
  detectedIntent: text("detected_intent"), // "task" | "idea" | "question" | "reminder" | "note"
  // Time-aware fields
  dueDate: integer("due_date", { mode: "timestamp" }), // Extracted or manually set deadline
  dueDateText: text("due_date_text"), // Original text like "tomorrow", "next Friday"
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
}, (table) => [
  index("thoughts_user_id_idx").on(table.userId),
  index("thoughts_due_date_idx").on(table.dueDate),
]);

// Thought relations - links between related thoughts
export const thoughtRelations = sqliteTable("thought_relations", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  sourceThoughtId: text("source_thought_id").notNull().references(() => thoughts.id),
  targetThoughtId: text("target_thought_id").notNull().references(() => thoughts.id),
  relationType: text("relation_type").notNull(), // "similar" | "followup" | "reference"
  confidence: integer("confidence"), // 0-100
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

// Projects - organize thoughts
export const projects = sqliteTable("projects", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id").notNull(),
  name: text("name").notNull(),
  description: text("description"),
  color: text("color").default("#d4a574"),
  icon: text("icon").default("folder"),
  isArchived: integer("is_archived", { mode: "boolean" }).default(false),
  sortOrder: integer("sort_order").default(0),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
}, (table) => [
  index("projects_user_id_idx").on(table.userId),
]);

// Events - calendar functionality
export const events = sqliteTable("events", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id").notNull(),
  title: text("title").notNull(),
  description: text("description"),
  startAt: integer("start_at", { mode: "timestamp" }).notNull(),
  endAt: integer("end_at", { mode: "timestamp" }),
  allDay: integer("all_day", { mode: "boolean" }).default(false),
  location: text("location"),
  projectId: text("project_id").references(() => projects.id),
  externalId: text("external_id"),
  externalSource: text("external_source"), // "google_calendar"
  syncStatus: text("sync_status").default("synced"), // "synced" | "pending" | "error"
  lastSyncAt: integer("last_sync_at", { mode: "timestamp" }),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
}, (table) => [
  index("events_user_id_idx").on(table.userId),
  index("events_start_at_idx").on(table.startAt),
  index("events_external_id_idx").on(table.externalId),
]);

// Habits - daily habit definitions
export const habits = sqliteTable("habits", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id").notNull(),
  name: text("name").notNull(),
  description: text("description"),
  icon: text("icon").default("check"),
  color: text("color").default("#d4a574"),
  frequency: text("frequency").default("daily"), // "daily" | "weekly" | "custom"
  isArchived: integer("is_archived", { mode: "boolean" }).default(false),
  sortOrder: integer("sort_order").default(0),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
}, (table) => [
  index("habits_user_id_idx").on(table.userId),
]);

// Habit completions - daily check-offs
export const habitCompletions = sqliteTable("habit_completions", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  habitId: text("habit_id").notNull().references(() => habits.id, { onDelete: "cascade" }),
  userId: text("user_id").notNull(),
  completedDate: text("completed_date").notNull(), // "YYYY-MM-DD" format for easy querying
  completedAt: integer("completed_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
}, (table) => [
  index("habit_completions_habit_id_idx").on(table.habitId),
  index("habit_completions_user_id_idx").on(table.userId),
  index("habit_completions_date_idx").on(table.completedDate),
]);

// Agents - background automation
export const agents = sqliteTable("agents", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(),
  name: text("name").notNull(),
  description: text("description"),
  type: text("type").notNull(),
  enabled: integer("enabled", { mode: "boolean" }).default(true),
  schedule: text("schedule"),
  settings: text("settings", { mode: "json" }).$type<Record<string, unknown>>(),
  lastRunAt: integer("last_run_at", { mode: "timestamp" }),
  lastRunStatus: text("last_run_status"),
  lastError: text("last_error"),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
}, (table) => [
  index("agents_user_id_idx").on(table.userId),
]);

// Agent outputs - results from agent runs
export const agentOutputs = sqliteTable("agent_outputs", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id").notNull(),
  agentId: text("agent_id").notNull().references(() => agents.id),
  content: text("content").notNull(),
  summary: text("summary"),
  metadata: text("metadata", { mode: "json" }).$type<Record<string, unknown>>(),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
}, (table) => [
  index("agent_outputs_user_id_idx").on(table.userId),
]);

// Contacts - Rolodex / people management
export const contacts = sqliteTable("contacts", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id").notNull(),
  name: text("name").notNull(),
  email: text("email"),
  phone: text("phone"),
  company: text("company"),
  role: text("role"), // Job title/role
  avatar: text("avatar"), // URL to avatar image
  notes: text("notes"), // Freeform notes about the person
  tags: text("tags", { mode: "json" }).$type<string[]>(), // e.g. ["investor", "client", "friend"]
  // AI-extracted metadata
  context: text("context"), // AI-generated context summary
  interests: text("interests", { mode: "json" }).$type<string[]>(), // Inferred interests
  lastMentionedAt: integer("last_mentioned_at", { mode: "timestamp" }), // Last time mentioned in thoughts
  mentionCount: integer("mention_count").default(0), // How often mentioned
  // Social/contact links
  linkedIn: text("linkedin"),
  twitter: text("twitter"),
  website: text("website"),
  // Relationship tracking
  relationship: text("relationship"), // "professional" | "personal" | "acquaintance"
  lastContactAt: integer("last_contact_at", { mode: "timestamp" }),
  // Project association
  projectIds: text("project_ids", { mode: "json" }).$type<string[]>(), // Associated projects
  // Status
  isArchived: integer("is_archived", { mode: "boolean" }).default(false),
  isFavorite: integer("is_favorite", { mode: "boolean" }).default(false),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
}, (table) => [
  index("contacts_user_id_idx").on(table.userId),
]);

// Settings - app configuration (per-user)
export const settings = sqliteTable("settings", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id").notNull(),
  key: text("key").notNull(),
  value: text("value", { mode: "json" }),
  updatedAt: integer("updated_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
}, (table) => [
  index("settings_user_id_key_idx").on(table.userId, table.key),
]);

// Types for TypeScript
export type Thought = typeof thoughts.$inferSelect;
export type NewThought = typeof thoughts.$inferInsert;

export type Project = typeof projects.$inferSelect;
export type NewProject = typeof projects.$inferInsert;

export type Event = typeof events.$inferSelect;
export type NewEvent = typeof events.$inferInsert;

export type Habit = typeof habits.$inferSelect;
export type NewHabit = typeof habits.$inferInsert;

export type HabitCompletion = typeof habitCompletions.$inferSelect;
export type NewHabitCompletion = typeof habitCompletions.$inferInsert;

export type Agent = typeof agents.$inferSelect;
export type NewAgent = typeof agents.$inferInsert;

export type AgentOutput = typeof agentOutputs.$inferSelect;
export type NewAgentOutput = typeof agentOutputs.$inferInsert;

export type ThoughtRelation = typeof thoughtRelations.$inferSelect;
export type NewThoughtRelation = typeof thoughtRelations.$inferInsert;

export type Contact = typeof contacts.$inferSelect;
export type NewContact = typeof contacts.$inferInsert;

export type Setting = typeof settings.$inferSelect;
export type NewSetting = typeof settings.$inferInsert;

// =============================================================================
// PLAYER MENU (Life OS) - RPG-inspired personal operating system
// =============================================================================

// Contact tier types
export type ContactTier = "inner_circle" | "close" | "regular" | "acquaintance" | "dormant";
export type InteractionType = "call" | "meeting" | "text" | "email" | "coffee" | "event" | "intro" | "other";
export type QuestType = "main" | "side" | "daily" | "bounty" | "discovery";
export type QuestStatus = "active" | "completed" | "failed" | "abandoned";

// Metadata types for JSON fields
export interface PlayerContactMetadata {
  email?: string;
  phone?: string;
  company?: string;
  role?: string;
  tags?: string[];
  socialLinks?: { platform: string; url: string }[];
  notes?: string;
}

export interface QuestObjective {
  id: string;
  text: string;
  completed: boolean;
  completedAt?: string;
}

// Player Contacts - RPG-focused contact system with computed tiers
export const playerContacts = sqliteTable("player_contacts", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id").notNull(),

  // Core identity
  name: text("name").notNull(),
  photoUri: text("photo_uri"),
  source: text("source"), // "manual" | "import" | "ai_detected"

  // Relationship tier (computed from interactions, but cached)
  tier: text("tier").$type<ContactTier>().default("acquaintance"),
  tierScore: integer("tier_score").default(0), // 0-100 for precise ordering

  // Interaction tracking
  lastInteractionAt: integer("last_interaction_at", { mode: "timestamp" }),
  interactionCount: integer("interaction_count").default(0),
  totalInteractionMinutes: integer("total_interaction_minutes").default(0),

  // RPG flavor
  title: text("title"), // "The Mentor", "Ally in Arms"
  firstMetContext: text("first_met_context"), // "Met at YC Demo Day 2024"

  // Flexible metadata (company, role, tags, social links, notes)
  metadata: text("metadata", { mode: "json" }).$type<PlayerContactMetadata>(),

  // Status
  isArchived: integer("is_archived", { mode: "boolean" }).default(false),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
}, (table) => [
  index("player_contacts_user_idx").on(table.userId),
  index("player_contacts_tier_idx").on(table.tier),
  index("player_contacts_last_interaction_idx").on(table.lastInteractionAt),
]);

// Interactions - the primary data capture mechanism
export const interactions = sqliteTable("interactions", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id").notNull(),
  contactId: text("contact_id").notNull().references(() => playerContacts.id, { onDelete: "cascade" }),

  // Interaction details
  type: text("type").$type<InteractionType>().notNull(),
  occurredAt: integer("occurred_at", { mode: "timestamp" }).notNull(),
  durationMinutes: integer("duration_minutes"),

  // Raw input (user's voice/text capture)
  rawInput: text("raw_input"),

  // AI-parsed structured data
  summary: text("summary"), // AI-generated 1-liner
  topics: text("topics", { mode: "json" }).$type<string[]>(),
  sentiment: text("sentiment"), // "positive" | "neutral" | "negative"
  followUpNeeded: integer("follow_up_needed", { mode: "boolean" }).default(false),
  followUpNote: text("follow_up_note"),

  // Quest linkage
  questIds: text("quest_ids", { mode: "json" }).$type<string[]>(),

  // Location context
  location: text("location"),

  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
}, (table) => [
  index("interactions_user_idx").on(table.userId),
  index("interactions_contact_idx").on(table.contactId),
  index("interactions_occurred_idx").on(table.occurredAt),
]);

// Quests - goals and projects with RPG framing
export const quests = sqliteTable("quests", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id").notNull(),

  // Quest identity
  title: text("title").notNull(),
  description: text("description"),

  // Quest type determines UI treatment and behavior
  type: text("type").$type<QuestType>().notNull(),

  // Quest hierarchy
  parentQuestId: text("parent_quest_id"),
  chapterNumber: integer("chapter_number"), // For sub-quests of main quests

  // Status
  status: text("status").$type<QuestStatus>().default("active"),
  completedAt: integer("completed_at", { mode: "timestamp" }),

  // Progress tracking
  objectives: text("objectives", { mode: "json" }).$type<QuestObjective[]>(),
  progressPercent: integer("progress_percent").default(0),

  // Time bounds
  startedAt: integer("started_at", { mode: "timestamp" }),
  dueAt: integer("due_at", { mode: "timestamp" }),

  // Linked contacts
  contactIds: text("contact_ids", { mode: "json" }).$type<string[]>(),

  // Visual/flavor
  icon: text("icon").default("sword"),
  color: text("color").default("#d4a574"),

  // Ordering
  sortOrder: integer("sort_order").default(0),

  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
}, (table) => [
  index("quests_user_idx").on(table.userId),
  index("quests_type_idx").on(table.type),
  index("quests_status_idx").on(table.status),
  index("quests_parent_idx").on(table.parentQuestId),
]);

// Journal Entries - auto-generated narrative log
export const journalEntries = sqliteTable("journal_entries", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id").notNull(),

  // Polymorphic reference
  entityType: text("entity_type").notNull(), // "contact" | "quest" | "interaction" | "system"
  entityId: text("entity_id"), // null for system entries

  // Entry type for filtering/display
  entryType: text("entry_type").notNull(), // "interaction" | "milestone" | "tier_change" | "quest_start" | "quest_complete" | "insight" | "daily_summary"

  // Content
  content: text("content").notNull(), // The narrative text
  metadata: text("metadata", { mode: "json" }).$type<Record<string, unknown>>(),

  // AI generation tracking
  aiGenerated: integer("ai_generated", { mode: "boolean" }).default(false),

  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
}, (table) => [
  index("journal_user_idx").on(table.userId),
  index("journal_entity_idx").on(table.entityType, table.entityId),
  index("journal_type_idx").on(table.entryType),
  index("journal_created_idx").on(table.createdAt),
]);

// Character Profile - Player's character sheet with Drucker questions
export const characterProfile = sqliteTable("character_profile", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id").notNull().unique(),

  // Drucker's 5 Questions
  strengths: text("strengths", { mode: "json" }).$type<string[]>(),
  howYouPerform: text("how_you_perform"), // Learning style, work preferences
  values: text("values", { mode: "json" }).$type<string[]>(),
  whereBelong: text("where_belong"), // Type of organization/environment
  contribution: text("contribution"), // What you should contribute

  // Bio/flavor
  displayName: text("display_name"),
  title: text("title"), // "The Builder", "Quest Seeker"
  bio: text("bio"),

  // Stats (computed from activity)
  totalInteractions: integer("total_interactions").default(0),
  totalQuestsCompleted: integer("total_quests_completed").default(0),
  longestStreak: integer("longest_streak").default(0),
  currentStreak: integer("current_streak").default(0),

  updatedAt: integer("updated_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
}, (table) => [
  index("character_user_idx").on(table.userId),
]);

// Player Menu TypeScript types
export type PlayerContact = typeof playerContacts.$inferSelect;
export type NewPlayerContact = typeof playerContacts.$inferInsert;

export type Interaction = typeof interactions.$inferSelect;
export type NewInteraction = typeof interactions.$inferInsert;

export type Quest = typeof quests.$inferSelect;
export type NewQuest = typeof quests.$inferInsert;

export type JournalEntry = typeof journalEntries.$inferSelect;
export type NewJournalEntry = typeof journalEntries.$inferInsert;

export type CharacterProfile = typeof characterProfile.$inferSelect;
export type NewCharacterProfile = typeof characterProfile.$inferInsert;
