ALTER TABLE "companies" ADD COLUMN "city" text DEFAULT 'montreal' NOT NULL;--> statement-breakpoint
CREATE INDEX "companies_city_idx" ON "companies" USING btree ("city");