'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import type { Signal } from '@/lib/types';
import SignalCard from '@/components/SignalCard';

interface GroupedSignals {
  today: Signal[];
  yesterday: Signal[];
  thisWeek: Signal[];
  older: Signal[];
}

function groupSignals(signals: Signal[]): GroupedSignals {
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterdayStart = new Date(todayStart.getTime() - 86400000);
  const weekStart = new Date(todayStart.getTime() - 6 * 86400000);

  const groups: GroupedSignals = { today: [], yesterday: [], thisWeek: [], older: [] };

  for (const signal of signals) {
    const d = new Date(signal.detected_at);
    if (d >= todayStart) groups.today.push(signal);
    else if (d >= yesterdayStart) groups.yesterday.push(signal);
    else if (d >= weekStart) groups.thisWeek.push(signal);
    else groups.older.push(signal);
  }

  return groups;
}

function SectionHeader({ label, count }: { label: string; count: number }) {
  if (count === 0) return null;
  return (
    <div className="flex items-center gap-3 mb-3 mt-5 first:mt-0">
      <p className="text-[11px] font-semibold tracking-widest text-[#6a6055] uppercase">
        {label}
      </p>
      <div className="flex-1 h-px bg-[#ece7df]" />
    </div>
  );
}

export default function SignalsPage() {
  const [signals, setSignals] = useState<Signal[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchSignals() {
      const { data, error } = await supabase
        .from('signals')
        .select(`
          *,
          company:companies(name, slug, industry)
        `)
        .order('detected_at', { ascending: false })
        .limit(100);

      if (!error && data) setSignals(data as Signal[]);
      setLoading(false);
    }
    fetchSignals();
  }, []);

  const groups = groupSignals(signals);

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
        <p className="text-[12px] italic text-[#6a6055] mt-1">Signals feed</p>
      </header>

      <div className="px-4 pt-4 pb-1">
        <h2 className="text-[17px] font-semibold text-[#1a1a1a]">What&apos;s happening</h2>
      </div>

      <div className="flex-1 px-4 pb-24 mt-3">
        {loading ? (
          <div className="flex flex-col gap-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl border border-[#ece7df] p-4 h-20 animate-pulse" />
            ))}
          </div>
        ) : signals.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <p className="font-serif text-[18px] text-[#1a1a1a] italic mb-2">All quiet.</p>
            <p className="text-[13px] text-[#6a6055]">
              Signals will appear here once companies are active.
            </p>
          </div>
        ) : (
          <>
            <SectionHeader label="Today" count={groups.today.length} />
            {groups.today.map((s) => <SignalCard key={s.id} signal={s} showCompany />)}

            <SectionHeader label="Yesterday" count={groups.yesterday.length} />
            {groups.yesterday.map((s) => <SignalCard key={s.id} signal={s} showCompany />)}

            <SectionHeader label="This Week" count={groups.thisWeek.length} />
            {groups.thisWeek.map((s) => <SignalCard key={s.id} signal={s} showCompany />)}

            <SectionHeader label="Older" count={groups.older.length} />
            {groups.older.map((s) => <SignalCard key={s.id} signal={s} showCompany />)}
          </>
        )}
      </div>
    </div>
  );
}
