'use client';

// ── Dismissable popover behaviour ────────────────────────────────────────
// Shared by the two top-chrome dropdowns (industry layers, company types).
// Both open a panel over the map, and both need the same two escape hatches.
//
// Pointerdown rather than click, so the panel is already gone by the time a
// tap completes on the map behind it — otherwise the same gesture that closes
// the panel also drops a pin.

import { useEffect, type Dispatch, type RefObject, type SetStateAction } from 'react';

/** Close `open` on an outside pointerdown or the Escape key. `setOpen` must be
 *  the state setter itself (stable across renders), not an inline closure. */
export function useDismiss(
  open: boolean,
  ref: RefObject<HTMLElement | null>,
  setOpen: Dispatch<SetStateAction<boolean>>,
) {
  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: PointerEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open, ref, setOpen]);
}
