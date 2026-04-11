CREATE TABLE IF NOT EXISTS "Task" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "projectId" uuid NOT NULL,
  "title" text NOT NULL,
  "description" text,
  "dueDate" timestamp,
  "status" varchar DEFAULT 'todo' NOT NULL,
  "priority" varchar DEFAULT 'medium' NOT NULL,
  "createdAt" timestamp DEFAULT now() NOT NULL,
  "updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "Memory" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "userId" uuid NOT NULL,
  "projectId" uuid,
  "content" text NOT NULL,
  "type" varchar DEFAULT 'manual' NOT NULL,
  "createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "Task" ADD CONSTRAINT "Task_projectId_Project_id_fk" FOREIGN KEY ("projectId") REFERENCES "public"."Project"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "Memory" ADD CONSTRAINT "Memory_userId_User_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "Memory" ADD CONSTRAINT "Memory_projectId_Project_id_fk" FOREIGN KEY ("projectId") REFERENCES "public"."Project"("id") ON DELETE set null ON UPDATE no action;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "task_project_idx" ON "Task" ("projectId");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "memory_user_project_idx" ON "Memory" ("userId", "projectId");
