CREATE TABLE "refresh_runs" (
	"id" text PRIMARY KEY NOT NULL,
	"kind" text DEFAULT 'roles' NOT NULL,
	"status" text NOT NULL,
	"trigger" text NOT NULL,
	"started_at" text NOT NULL,
	"finished_at" text,
	"companies_refreshed" integer DEFAULT 0 NOT NULL,
	"boards_ok" integer DEFAULT 0 NOT NULL,
	"boards_failed" integer DEFAULT 0 NOT NULL,
	"roles_delta" integer,
	"summary" jsonb,
	"error" text
);
--> statement-breakpoint
CREATE INDEX "refresh_runs_kind_started_idx" ON "refresh_runs" USING btree ("kind","started_at");