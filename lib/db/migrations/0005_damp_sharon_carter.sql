ALTER TABLE "Chat" ADD COLUMN "tags" json DEFAULT '[]'::json;--> statement-breakpoint
ALTER TABLE "User" ADD COLUMN "globalTags" json DEFAULT '[]'::json;