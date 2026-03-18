'use client';

const INDUSTRIES = [
  'All',
  'Tech & AI',
  'Finance & Fintech',
  'Gaming & Creative',
  'Health & Life Sciences',
  'Aerospace & Engineering',
  'Retail & Consumer',
  'Telecom & Infrastructure',
];

interface FilterChipsProps {
  selected: string;
  onChange: (industry: string) => void;
}

export default function FilterChips({ selected, onChange }: FilterChipsProps) {
  return (
    <div className="flex gap-2 px-4 py-3 overflow-x-auto scrollbar-hide">
      {INDUSTRIES.map((industry) => {
        const active = selected === industry;
        return (
          <button
            key={industry}
            onClick={() => onChange(industry)}
            className={`flex-shrink-0 px-3 py-1.5 rounded-full text-[12px] font-medium transition-all border ${
              active
                ? 'bg-[#1a1a1a] text-[#f5f0e8] border-[#1a1a1a]'
                : 'bg-transparent text-[#6a6055] border-[#d4cdc3] hover:border-[#1a1a1a]'
            }`}
          >
            {industry}
          </button>
        );
      })}
    </div>
  );
}
