'use client';

import { useEffect } from 'react';

const UPDATE_INTERVAL_MS = 30 * 60 * 1000;

/**
 * Keeps long-running installed PWAs on the current deployment. Serwist claims
 * clients immediately, but an already-open page must reload before it can use
 * the newly precached JavaScript bundle.
 */
export default function ServiceWorkerUpdateManager() {
  useEffect(() => {
    if (!('serviceWorker' in navigator)) return;

    let hadController = Boolean(navigator.serviceWorker.controller);
    let reloadStarted = false;

    const reloadForUpdatedWorker = () => {
      // The first controller on a brand-new install does not make the current
      // page stale. Only reload when an existing controller is replaced.
      if (!hadController) {
        hadController = true;
        return;
      }

      if (reloadStarted) return;
      reloadStarted = true;
      window.location.reload();
    };

    const checkForUpdate = async () => {
      if (!navigator.onLine) return;

      try {
        const registration = await navigator.serviceWorker.register('/sw.js', {
          scope: '/',
          updateViaCache: 'none',
        });
        await registration.update();
      } catch {
        // Updates are best-effort. The current app remains usable offline or
        // during a transient registration/network failure.
      }
    };

    const checkWhenVisible = () => {
      if (document.visibilityState === 'visible') void checkForUpdate();
    };

    navigator.serviceWorker.addEventListener('controllerchange', reloadForUpdatedWorker);
    window.addEventListener('online', checkForUpdate);
    window.addEventListener('focus', checkForUpdate);
    document.addEventListener('visibilitychange', checkWhenVisible);

    void checkForUpdate();
    const interval = window.setInterval(checkForUpdate, UPDATE_INTERVAL_MS);

    return () => {
      window.clearInterval(interval);
      navigator.serviceWorker.removeEventListener('controllerchange', reloadForUpdatedWorker);
      window.removeEventListener('online', checkForUpdate);
      window.removeEventListener('focus', checkForUpdate);
      document.removeEventListener('visibilitychange', checkWhenVisible);
    };
  }, []);

  return null;
}
