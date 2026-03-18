'use client';

// TODO: Phase 3 — Add Claude API call to draft LinkedIn outreach message

interface IntentSheetProps {
  open: boolean;
  onClose: () => void;
  personId: string;
  personName: string;
  personTitle: string;
  companyName: string;
}

const INTENT_OPTIONS = [
  {
    id: 'job_seeker',
    label: 'Job Seeker',
    description: "I'm looking for opportunities",
    emoji: '🎯',
  },
  {
    id: 'networking',
    label: 'Networking',
    description: 'I want to connect and learn',
    emoji: '🤝',
  },
  {
    id: 'bd',
    label: 'Business Dev',
    description: 'I have something to offer',
    emoji: '💼',
  },
];

export default function IntentSheet({
  open,
  onClose,
  personName,
  companyName,
}: IntentSheetProps) {
  // TODO: Phase 3 — handle intent selection and trigger Claude API draft
  if (!open) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 z-40"
        onClick={onClose}
      />

      {/* Sheet */}
      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[390px] z-50 bg-[#f5f0e8] rounded-t-2xl p-6 pb-10">
        <div className="w-10 h-1 bg-[#d4cdc3] rounded-full mx-auto mb-6" />

        <p className="text-[11px] tracking-widest text-[#6a6055] uppercase mb-1">
          Reaching out to
        </p>
        <h3 className="font-serif text-[18px] text-[#1a1a1a] mb-1">{personName}</h3>
        <p className="text-[13px] text-[#6a6055] mb-6">at {companyName}</p>

        <p className="text-[13px] font-medium text-[#1a1a1a] mb-3">
          What&apos;s your intent?
        </p>

        <div className="flex flex-col gap-2">
          {INTENT_OPTIONS.map((option) => (
            <button
              key={option.id}
              className="flex items-center gap-3 px-4 py-3 rounded-xl border border-[#d4cdc3] bg-white text-left hover:border-[#1a1a1a] transition-colors opacity-50 cursor-not-allowed"
              disabled
              title="Coming in Phase 3"
            >
              <span className="text-xl">{option.emoji}</span>
              <div>
                <p className="text-[14px] font-medium text-[#1a1a1a]">{option.label}</p>
                <p className="text-[12px] text-[#6a6055]">{option.description}</p>
              </div>
            </button>
          ))}
        </div>

        <p className="text-center text-[11px] text-[#6a6055] mt-4">
          AI-drafted message coming in Phase 3
        </p>
      </div>
    </>
  );
}
