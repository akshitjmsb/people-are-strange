'use client';

import { useEffect } from 'react';

/** Last-resort error boundary — a graceful card instead of a white screen. */
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('[app] unhandled error:', error);
  }, [error]);

  return (
    <main className="flex h-full w-full items-center justify-center bg-snow-white px-6">
      <div className="max-w-sm rounded-3xl border border-black/5 bg-white p-6 text-center shadow-xl">
        <div aria-hidden className="mtl-hairline mx-auto mb-4 h-1 w-16 rounded-full" />
        <h2 className="font-display text-lg font-extrabold text-asphalt">
          The map hit a pothole
        </h2>
        <p className="mt-1.5 text-sm text-asphalt/60">
          Something went wrong while rendering. Your data is safe — a reload
          usually fixes it.
        </p>
        <button
          onClick={reset}
          className="mt-4 rounded-full bg-asphalt px-5 py-2 text-sm font-bold text-snow-white transition hover:opacity-90"
        >
          Try again
        </button>
      </div>
    </main>
  );
}
