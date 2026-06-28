// ── Database client (Neon serverless + Drizzle) ──────────────────────────────
// Lazy-initialised behind a Proxy so that merely importing `db` never touches
// DATABASE_URL. The connection is created on first actual query, which means
// `next build` and any code path that doesn't hit the DB works without the env
// var being present. (Same lazy-proxy approach used in Liberty Cherie.)

import { neon } from '@neondatabase/serverless';
import { drizzle, type NeonHttpDatabase } from 'drizzle-orm/neon-http';

import * as schema from './schema';

export type DB = NeonHttpDatabase<typeof schema>;

let cached: DB | null = null;

function getDb(): DB {
  if (cached) return cached;
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error(
      'DATABASE_URL is not set. Add it to .env.local (run `vercel env pull`) before querying the database.',
    );
  }
  cached = drizzle(neon(url), { schema });
  return cached;
}

export const db = new Proxy({} as DB, {
  get(_target, prop, receiver) {
    const real = getDb();
    const value = Reflect.get(real as object, prop, receiver);
    return typeof value === 'function' ? value.bind(real) : value;
  },
});

export { schema };
