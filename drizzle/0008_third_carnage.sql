CREATE TABLE "job_postings" (
	"id" text PRIMARY KEY NOT NULL,
	"external_id" text NOT NULL,
	"company_id" text NOT NULL,
	"city" text NOT NULL,
	"provider" text NOT NULL,
	"title" text NOT NULL,
	"location" text NOT NULL,
	"locality" text NOT NULL,
	"url" text NOT NULL,
	"description" text,
	"department" text,
	"employment_type" text,
	"workplace_type" text,
	"published_at" text,
	"first_seen_at" text NOT NULL,
	"last_seen_at" text NOT NULL,
	"closed_at" text,
	"active" boolean DEFAULT true NOT NULL
);
--> statement-breakpoint
ALTER TABLE "job_postings" ADD CONSTRAINT "job_postings_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "job_postings_city_active_idx" ON "job_postings" USING btree ("city","active");--> statement-breakpoint
CREATE INDEX "job_postings_company_active_idx" ON "job_postings" USING btree ("company_id","active");--> statement-breakpoint
CREATE INDEX "job_postings_last_seen_idx" ON "job_postings" USING btree ("last_seen_at");