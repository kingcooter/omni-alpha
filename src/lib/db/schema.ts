import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";

// Thoughts - core capture functionality
export const thoughts = sqliteTable("thoughts", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  content: text("content").notNull(),
  projectId: text("project_id").references(() => projects.id),
  tags: text("tags", { mode: "json" }).$type<string[]>(),
  isPinned: integer("is_pinned", { mode: "boolean" }).default(false),
  isArchived: integer("is_archived", { mode: "boolean" }).default(false),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

// Projects - organize thoughts
export const projects = sqliteTable("projects", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  name: text("name").notNull(),
  description: text("description"),
  color: text("color").default("#d4a574"),
  icon: text("icon").default("folder"),
  isArchived: integer("is_archived", { mode: "boolean" }).default(false),
  sortOrder: integer("sort_order").default(0),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

// Events - calendar functionality
export const events = sqliteTable("events", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  title: text("title").notNull(),
  description: text("description"),
  startAt: integer("start_at", { mode: "timestamp" }).notNull(),
  endAt: integer("end_at", { mode: "timestamp" }),
  allDay: integer("all_day", { mode: "boolean" }).default(false),
  location: text("location"),
  projectId: text("project_id").references(() => projects.id),
  externalId: text("external_id"),
  externalSource: text("external_source"),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

// Agents - background automation
export const agents = sqliteTable("agents", {
  id: text("id").primaryKey(),
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
});

// Agent outputs - results from agent runs
export const agentOutputs = sqliteTable("agent_outputs", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  agentId: text("agent_id").notNull().references(() => agents.id),
  content: text("content").notNull(),
  summary: text("summary"),
  metadata: text("metadata", { mode: "json" }).$type<Record<string, unknown>>(),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

// Settings - app configuration
export const settings = sqliteTable("settings", {
  key: text("key").primaryKey(),
  value: text("value", { mode: "json" }),
  updatedAt: integer("updated_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

// Types for TypeScript
export type Thought = typeof thoughts.$inferSelect;
export type NewThought = typeof thoughts.$inferInsert;

export type Project = typeof projects.$inferSelect;
export type NewProject = typeof projects.$inferInsert;

export type Event = typeof events.$inferSelect;
export type NewEvent = typeof events.$inferInsert;

export type Agent = typeof agents.$inferSelect;
export type NewAgent = typeof agents.$inferInsert;

export type AgentOutput = typeof agentOutputs.$inferSelect;
export type NewAgentOutput = typeof agentOutputs.$inferInsert;
