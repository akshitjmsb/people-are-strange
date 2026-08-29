'use client';

import { useEffect } from 'react';

const UPDATE_INTERVAL_MS = 30 * 60 * 1000;

/**
 * Keeps long-running installed PWAs on the current deployment. Updates are
 * downloaded in the background and applied when the user next returns to the
 * app, avoiding a disruptive reload in the middle of an active session.
 */
export default function ServiceWorkerUpdateManager() {
  useEffect(() => {
    if (!('serviceWorker' in navigator)) return;

    let hadController = Boolean(navigator.serviceWorker.controller);
    let updateReady = false;
    let reloadStarted = false;

    const markUpdatedWorkerReady = () => {
      // The first controller on a brand-new install does not make the current
      // page stale. Only defer a refresh when an existing controller changes.
      if (!hadController) {
        hadController = true;
        return;
      }

      updateReady = true;
    };

    const applyQuietUpdate = () => {
      if (!updateReady) return false;
      if (reloadStarted) return true;
      reloadStarted = true;
      window.location.reload();
      return true;
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

    const checkWhenActive = () => {
      if (document.visibilityState !== 'visible') return;
      if (!applyQuietUpdate()) void checkForUpdate();
    };

    navigator.serviceWorker.addEventListener('controllerchange', markUpdatedWorkerReady);
    window.addEventListener('online', checkForUpdate);
    window.addEventListener('focus', checkWhenActive);
    window.addEventListener('pageshow', checkWhenActive);
    document.addEventListener('visibilitychange', checkWhenActive);

    void checkForUpdate();
    const interval = window.setInterval(checkForUpdate, UPDATE_INTERVAL_MS);

    return () => {
      window.clearInterval(interval);
      navigator.serviceWorker.removeEventListener('controllerchange', markUpdatedWorkerReady);
      window.removeEventListener('online', checkForUpdate);
      window.removeEventListener('focus', checkWhenActive);
      window.removeEventListener('pageshow', checkWhenActive);
      document.removeEventListener('visibilitychange', checkWhenActive);
    };
  }, []);

  return null;
}
