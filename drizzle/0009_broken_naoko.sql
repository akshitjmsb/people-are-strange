CREATE TABLE "google_drive_connections" (
	"id" text PRIMARY KEY DEFAULT 'primary' NOT NULL,
	"owner_email" text NOT NULL,
	"encrypted_refresh_token" text NOT NULL,
	"token_iv" text NOT NULL,
	"token_auth_tag" text NOT NULL,
	"scopes" text[] NOT NULL,
	"connected_at" text NOT NULL,
	"updated_at" text NOT NULL,
	"last_error" text
);
--> statement-breakpoint
CREATE TABLE "resume_profiles" (
	"id" text PRIMARY KEY DEFAULT 'primary' NOT NULL,
	"drive_file_id" text NOT NULL,
	"drive_revision_id" text NOT NULL,
	"profile" jsonb NOT NULL,
	"status" text DEFAULT 'current' NOT NULL,
	"synced_at" text NOT NULL,
	"checked_at" text NOT NULL,
	"last_error" text
);
