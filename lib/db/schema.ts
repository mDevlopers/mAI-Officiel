import type { InferSelectModel } from "drizzle-orm";
import {
  boolean,
  foreignKey,
  integer,
  json,
  pgTable,
  primaryKey,
  text,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

export const user = pgTable("User", {
  id: uuid("id").primaryKey().notNull().defaultRandom(),
  email: varchar("email", { length: 64 }).notNull(),
  password: varchar("password", { length: 64 }),
  name: text("name"),
  emailVerified: boolean("emailVerified").notNull().default(false),
  image: text("image"),
  isAnonymous: boolean("isAnonymous").notNull().default(false),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
  updatedAt: timestamp("updatedAt").notNull().defaultNow(),
});

export type User = InferSelectModel<typeof user>;

export const chat = pgTable("Chat", {
  id: uuid("id").primaryKey().notNull().defaultRandom(),
  createdAt: timestamp("createdAt").notNull(),
  title: text("title").notNull(),
  userId: uuid("userId")
    .notNull()
    .references(() => user.id),
  visibility: varchar("visibility", { enum: ["public", "private"] })
    .notNull()
    .default("private"),
  agentId: uuid("agentId").references(() => agent.id),
  projectId: uuid("projectId").references(() => project.id),
});

export type Chat = InferSelectModel<typeof chat>;

export const message = pgTable("Message_v2", {
  id: uuid("id").primaryKey().notNull().defaultRandom(),
  chatId: uuid("chatId")
    .notNull()
    .references(() => chat.id),
  role: varchar("role").notNull(),
  parts: json("parts").notNull(),
  attachments: json("attachments").notNull(),
  createdAt: timestamp("createdAt").notNull(),
});

export type DBMessage = InferSelectModel<typeof message>;

export const vote = pgTable(
  "Vote_v2",
  {
    chatId: uuid("chatId")
      .notNull()
      .references(() => chat.id),
    messageId: uuid("messageId")
      .notNull()
      .references(() => message.id),
    isUpvoted: boolean("isUpvoted").notNull(),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.chatId, table.messageId] }),
  })
);

export type Vote = InferSelectModel<typeof vote>;

export const document = pgTable(
  "Document",
  {
    id: uuid("id").notNull().defaultRandom(),
    createdAt: timestamp("createdAt").notNull(),
    title: text("title").notNull(),
    content: text("content"),
    kind: varchar("text", { enum: ["text", "code", "image", "sheet"] })
      .notNull()
      .default("text"),
    userId: uuid("userId")
      .notNull()
      .references(() => user.id),
    tags: json("tags").$type<string[]>().default([]),
    folderId: uuid("folderId"),
    size: integer("size").default(0),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.id, table.createdAt] }),
  })
);

export type Document = InferSelectModel<typeof document>;

export const suggestion = pgTable(
  "Suggestion",
  {
    id: uuid("id").notNull().defaultRandom(),
    documentId: uuid("documentId").notNull(),
    documentCreatedAt: timestamp("documentCreatedAt").notNull(),
    originalText: text("originalText").notNull(),
    suggestedText: text("suggestedText").notNull(),
    description: text("description"),
    isResolved: boolean("isResolved").notNull().default(false),
    userId: uuid("userId")
      .notNull()
      .references(() => user.id),
    createdAt: timestamp("createdAt").notNull(),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.id] }),
    documentRef: foreignKey({
      columns: [table.documentId, table.documentCreatedAt],
      foreignColumns: [document.id, document.createdAt],
    }),
  })
);

export type Suggestion = InferSelectModel<typeof suggestion>;

export const stream = pgTable(
  "Stream",
  {
    id: uuid("id").notNull().defaultRandom(),
    chatId: uuid("chatId").notNull(),
    createdAt: timestamp("createdAt").notNull(),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.id] }),
    chatRef: foreignKey({
      columns: [table.chatId],
      foreignColumns: [chat.id],
    }),
  })
);

export type Stream = InferSelectModel<typeof stream>;

export const agent = pgTable("Agent", {
  id: uuid("id").primaryKey().notNull().defaultRandom(),
  userId: uuid("userId")
    .notNull()
    .references(() => user.id),
  name: text("name").notNull(),
  description: text("description"),
  systemPrompt: text("systemPrompt"),
  memory: text("memory"), // plain text knowledge
  files: json("files").default([]), // uploaded files metadata
  image: text("image"), // logo url
  baseModel: varchar("baseModel").default("gpt-4o"),
  tone: integer("tone").default(50),
  conciseness: integer("conciseness").default(50),
  languageRegister: integer("languageRegister").default(50),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
  updatedAt: timestamp("updatedAt").notNull().defaultNow(),
  usageCount: integer("usageCount").notNull().default(0),
  shareToken: varchar("shareToken", { length: 32 }).unique(),
});

export type Agent = InferSelectModel<typeof agent>;

export const project = pgTable("Project", {
  id: uuid("id").primaryKey().notNull().defaultRandom(),
  userId: uuid("userId")
    .notNull()
    .references(() => user.id),
  name: text("name").notNull(),
  description: text("description"),
  image: text("image"),
  color: varchar("color", { length: 7 }).default("#3b82f6"),
  icon: varchar("icon", { length: 4 }).default("📁"),
  archived: boolean("archived").notNull().default(false),
  pinnedNote: text("pinnedNote"),
  instructions: text("instructions"),
  memory: text("memory"), // plain text knowledge/sources
  files: json("files").default([]), // uploaded files metadata
  createdAt: timestamp("createdAt").notNull().defaultNow(),
  updatedAt: timestamp("updatedAt").notNull().defaultNow(),
});

export type Project = InferSelectModel<typeof project>;

export const task = pgTable("Task", {
  id: uuid("id").primaryKey().notNull().defaultRandom(),
  projectId: uuid("projectId")
    .notNull()
    .references(() => project.id),
  title: text("title").notNull(),
  description: text("description"),
  dueDate: timestamp("dueDate"),
  status: varchar("status", { enum: ["todo", "doing", "done"] })
    .notNull()
    .default("todo"),
  priority: varchar("priority", { enum: ["low", "medium", "high"] })
    .notNull()
    .default("medium"),
  repeatType: varchar("repeatType", {
    enum: ["none", "daily", "weekly", "monthly", "custom"],
  })
    .notNull()
    .default("none"),
  repeatInterval: integer("repeatInterval"),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
  updatedAt: timestamp("updatedAt").notNull().defaultNow(),
});

export type Task = InferSelectModel<typeof task>;

export const subtask = pgTable("Subtask", {
  id: uuid("id").primaryKey().notNull().defaultRandom(),
  taskId: uuid("taskId")
    .notNull()
    .references(() => task.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  status: varchar("status", { enum: ["todo", "done"] })
    .notNull()
    .default("todo"),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
});

export type Subtask = InferSelectModel<typeof subtask>;

export const memoryEntry = pgTable("Memory", {
  id: uuid("id").primaryKey().notNull().defaultRandom(),
  userId: uuid("userId")
    .notNull()
    .references(() => user.id),
  projectId: uuid("projectId").references(() => project.id),
  content: text("content").notNull(),
  type: varchar("type", { enum: ["auto", "manual"] })
    .notNull()
    .default("manual"),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
});

export type MemoryEntry = InferSelectModel<typeof memoryEntry>;

export const codeSnippet = pgTable("CodeSnippet", {
  id: uuid("id").primaryKey().notNull().defaultRandom(),
  userId: uuid("userId")
    .notNull()
    .references(() => user.id),
  title: text("title").notNull(),
  code: text("code").notNull(),
  language: varchar("language", { length: 32 }).notNull().default("python"),
  description: text("description"),
  tags: json("tags").default([]),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
  updatedAt: timestamp("updatedAt").notNull().defaultNow(),
  runCount: integer("runCount").notNull().default(0),
});

export type CodeSnippet = InferSelectModel<typeof codeSnippet>;

export const codeExecutionHistory = pgTable("CodeExecutionHistory", {
  id: uuid("id").primaryKey().notNull().defaultRandom(),
  userId: uuid("userId")
    .notNull()
    .references(() => user.id),
  code: text("code").notNull(),
  language: varchar("language", { length: 32 }).notNull(),
  input: text("input"),
  output: text("output"),
  error: text("error"),
  exitCode: integer("exitCode"),
  success: boolean("success").notNull(),
  runtime: varchar("runtime", { length: 32 }),
  durationMs: integer("durationMs"),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
});

export type CodeExecutionHistory = InferSelectModel<typeof codeExecutionHistory>;

export const speechGeneration = pgTable("SpeechGeneration", {
  id: uuid("id").primaryKey().notNull().defaultRandom(),
  userId: uuid("userId")
    .notNull()
    .references(() => user.id),
  text: text("text").notNull(),
  language: varchar("language", { length: 2 }).notNull(),
  voice: varchar("voice", { length: 32 }).notNull(),
  voiceStyle: varchar("voiceStyle", { enum: ["narratif", "conversationnel", "énergique"] }).notNull(),
  voiceGender: varchar("voiceGender", { enum: ["homme", "femme"] }).notNull(),
  rate: numeric("rate", { precision: 4, scale: 2 }).notNull(),
  tone: integer("tone").notNull(),
  audioUrl: text("audioUrl").notNull(),
  audioDuration: integer("audioDuration"),
  provider: varchar("provider", { length: 32 }).notNull(),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
});

export type SpeechGeneration = InferSelectModel<typeof speechGeneration>;

export const voicePreset = pgTable("VoicePreset", {
  id: uuid("id").primaryKey().notNull().defaultRandom(),
  userId: uuid("userId")
    .notNull()
    .references(() => user.id),
  name: varchar("name", { length: 64 }).notNull(),
  language: varchar("language", { length: 2 }).notNull(),
  voice: varchar("voice", { length: 32 }).notNull(),
  voiceStyle: varchar("voiceStyle", { enum: ["narratif", "conversationnel", "énergique"] }).notNull(),
  voiceGender: varchar("voiceGender", { enum: ["homme", "femme"] }).notNull(),
  rate: numeric("rate", { precision: 4, scale: 2 }).notNull(),
  tone: integer("tone").notNull(),
  isFavorite: boolean("isFavorite").notNull().default(false),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
  updatedAt: timestamp("updatedAt").notNull().defaultNow(),
});

export type VoicePreset = InferSelectModel<typeof voicePreset>;
