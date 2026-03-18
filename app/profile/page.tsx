'use client';

// TODO: Phase 3+ — user profile, saved companies, outreach history

export default function ProfilePage() {
  return (
    <div className="flex flex-col min-h-screen bg-[#f5f0e8]">
      {/* Dark header */}
      <header className="bg-[#1a1a1a] px-4 pt-5 pb-4">
        <p className="text-[10px] tracking-widest text-[#6a6055] uppercase mb-1">
          Montréal · Downtown
        </p>
        <h1 className="font-serif text-[22px] text-[#f5f0e8] leading-tight">
          People Are <em>Strange</em>
        </h1>
        <p className="text-[12px] italic text-[#6a6055] mt-1">Your profile</p>
      </header>

      <div className="flex flex-col items-center justify-center flex-1 text-center px-8 pb-24">
        <div className="w-16 h-16 rounded-2xl bg-[#2a2a2a] flex items-center justify-center mb-4">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#6a6055" strokeWidth="1.5">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
          </svg>
        </div>
        <p className="font-serif text-[18px] text-[#1a1a1a] italic mb-2">Coming soon.</p>
        <p className="text-[13px] text-[#6a6055] leading-relaxed">
          Saved companies, outreach history, and your personal settings will live here in Phase 3.
        </p>
      </div>
    </div>
  );
}
