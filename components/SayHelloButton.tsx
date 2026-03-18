'use client';

// TODO: Phase 3 — wire up Claude API drafting
import { useState } from 'react';
import IntentSheet from './IntentSheet';

interface SayHelloButtonProps {
  personId: string;
  personName: string;
  personTitle: string;
  companyName: string;
  intent?: string;
  disabled?: boolean;
}

export default function SayHelloButton({
  personId,
  personName,
  personTitle,
  companyName,
  disabled = true, // Phase 2: disabled. Phase 3: set to false
}: SayHelloButtonProps) {
  const [sheetOpen, setSheetOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => !disabled && setSheetOpen(true)}
        disabled={disabled}
        className={`text-[12px] font-medium px-3 py-1.5 rounded-lg border transition-all ${
          disabled
            ? 'text-[#b0a898] border-[#e0d9d0] cursor-not-allowed'
            : 'text-[#1a1a1a] border-[#1a1a1a] hover:bg-[#1a1a1a] hover:text-[#f5f0e8]'
        }`}
      >
        Say hello ↗
      </button>

      {/* TODO: Phase 3 — open IntentSheet */}
      <IntentSheet
        open={sheetOpen}
        onClose={() => setSheetOpen(false)}
        personId={personId}
        personName={personName}
        personTitle={personTitle}
        companyName={companyName}
      />
    </>
  );
}
