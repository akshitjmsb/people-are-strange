ALTER TABLE "companies" ADD COLUMN "funding_stage" text;--> statement-breakpoint
ALTER TABLE "companies" ADD COLUMN "people" jsonb;--> statement-breakpoint
ALTER TABLE "companies" ADD COLUMN "story" text;--> statement-breakpoint
ALTER TABLE "companies" ADD COLUMN "notable_clients" text[];