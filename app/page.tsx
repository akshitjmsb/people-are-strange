import { redirect } from 'next/navigation';
import { DEFAULT_CITY_ID } from '@/lib/cities';

// Render per request so `redirect()` becomes a real HTTP 307 with a Location
// header. DEFAULT_CITY_ID is a build-time constant, so without this Next
// statically prerenders `/` into an error-page shell whose redirect only runs
// client-side after hydration — curl, crawlers and no-JS clients get a 307
// that goes nowhere. Forcing dynamic keeps the redirect at the HTTP layer.
export const dynamic = 'force-dynamic';

// `/` is not a city. Send it to the default one — NEXT_PUBLIC_CITY still
// picks which, so an existing deployment keeps landing where it always did.
export default function RootPage() {
  redirect(`/${DEFAULT_CITY_ID}`);
}
