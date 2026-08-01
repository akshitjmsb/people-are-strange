// Applies the generated SQL migrations in ./drizzle to the Neon database.
// Runs by hand (`npm run db:migrate`) and automatically as a pre-build step on
// production deploys, so a committed migration and the schema it assumes can't
// drift apart — the failure that shipped the `city` column and left production
// red until it was applied by hand.
import { config } from 'dotenv';
config({ path: '.env.local' });

import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import { migrate } from 'drizzle-orm/neon-http/migrator';

async function main() {
  // Same guard, and for the same reason, as scripts/seed.ts: `npm run build`
  // passes --on-deploy so schema changes land on a production Vercel build and
  // nowhere else. Preview builds share this database, so without the guard a
  // work-in-progress branch would migrate the live schema out from under the
  // running production deploy. A bare `npm run db:migrate` always applies.
  if (process.argv.includes('--on-deploy')) {
    const vercelEnv = process.env.VERCEL_ENV;
    if (vercelEnv !== 'production') {
      console.log(`↷ not a production deploy (VERCEL_ENV=${vercelEnv ?? 'unset'}) — skipping migrations.`);
      return;
    }
  }

  const url = process.env.DATABASE_URL;
  if (!url) throw new Error('DATABASE_URL is not set.');
  const db = drizzle(neon(url));
  await migrate(db, { migrationsFolder: './drizzle' });
  console.log('✓ Migrations applied.');
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
