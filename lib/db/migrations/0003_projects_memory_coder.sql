CREATE TABLE IF NOT EXISTS "ProjectTask" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "userId" uuid NOT NULL,
  "projectId" uuid NOT NULL,
  "title" text NOT NULL,
  "description" text,
  "dueDate" timestamp,
  "status" varchar DEFAULT 'todo' NOT NULL,
  "priority" varchar DEFAULT 'normal' NOT NULL,
  "createdByAi" boolean DEFAULT false NOT NULL,
  "createdAt" timestamp DEFAULT now() NOT NULL,
  "updatedAt" timestamp DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "MemoryEntry" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "userId" uuid NOT NULL,
  "projectId" uuid,
  "content" text NOT NULL,
  "source" varchar DEFAULT 'manual' NOT NULL,
  "ignored" boolean DEFAULT false NOT NULL,
  "createdAt" timestamp DEFAULT now() NOT NULL,
  "updatedAt" timestamp DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "CoderProject" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "userId" uuid NOT NULL,
  "projectId" uuid,
  "name" text NOT NULL,
  "language" varchar DEFAULT 'html' NOT NULL,
  "files" json DEFAULT '{}'::json NOT NULL,
  "createdAt" timestamp DEFAULT now() NOT NULL,
  "updatedAt" timestamp DEFAULT now() NOT NULL
);

ALTER TABLE "ProjectTask" ADD CONSTRAINT "ProjectTask_userId_User_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "ProjectTask" ADD CONSTRAINT "ProjectTask_projectId_Project_id_fk" FOREIGN KEY ("projectId") REFERENCES "public"."Project"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "MemoryEntry" ADD CONSTRAINT "MemoryEntry_userId_User_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "MemoryEntry" ADD CONSTRAINT "MemoryEntry_projectId_Project_id_fk" FOREIGN KEY ("projectId") REFERENCES "public"."Project"("id") ON DELETE set null ON UPDATE no action;
ALTER TABLE "CoderProject" ADD CONSTRAINT "CoderProject_userId_User_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "CoderProject" ADD CONSTRAINT "CoderProject_projectId_Project_id_fk" FOREIGN KEY ("projectId") REFERENCES "public"."Project"("id") ON DELETE set null ON UPDATE no action;
