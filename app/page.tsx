import { redirect } from 'next/navigation';
import { DEFAULT_CITY_ID } from '@/lib/cities';

// `/` is not a city. Send it to the default one — NEXT_PUBLIC_CITY still
// picks which, so an existing deployment keeps landing where it always did.
export default function RootPage() {
  redirect(`/${DEFAULT_CITY_ID}`);
}
