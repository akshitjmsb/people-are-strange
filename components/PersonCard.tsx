'use client';

import type { Person } from '@/lib/types';
import { ROLE_BADGE_COLORS, getInitials } from '@/lib/types';
import SayHelloButton from './SayHelloButton';

interface PersonCardProps {
  person: Person;
  companyName: string;
}

const ROLE_LABELS: Record<string, string> = {
  founder: 'Founder',
  recruiter: 'Recruiter',
  hiring_manager: 'Hiring Manager',
  team_lead: 'Team Lead',
  investor: 'Investor',
};

// Avatar colors per role type
const ROLE_AVATAR: Record<string, { bg: string; text: string }> = {
  founder:        { bg: '#1a1a1a', text: '#f5f0e8' },
  recruiter:      { bg: '#e8f5e9', text: '#1b5e20' },
  hiring_manager: { bg: '#e3f2fd', text: '#0d47a1' },
  team_lead:      { bg: '#EEEDFE', text: '#3C3489' },
  investor:       { bg: '#FAEEDA', text: '#633806' },
};

export default function PersonCard({ person, companyName }: PersonCardProps) {
  const initials = person.avatar_initials ?? getInitials(person.name);
  const roleType = person.role_type ?? 'team_lead';
  const avatarColors = ROLE_AVATAR[roleType] ?? { bg: '#f5f0e8', text: '#6a6055' };
  const badgeColors = ROLE_BADGE_COLORS[roleType as keyof typeof ROLE_BADGE_COLORS] ?? { bg: '#f5f0e8', text: '#6a6055' };

  return (
    <div className="bg-white rounded-2xl border border-[#ece7df] p-4 mb-3">
      <div className="flex items-start gap-3">
        {/* Avatar */}
        <div className="relative flex-shrink-0">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center text-[12px] font-semibold"
            style={{ backgroundColor: avatarColors.bg, color: avatarColors.text }}
          >
            {initials}
          </div>
          {person.is_active_signal && (
            <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-white" />
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="text-[14px] font-semibold text-[#1a1a1a] truncate">{person.name}</p>
              {person.title && (
                <p className="text-[12px] text-[#6a6055] truncate">{person.title}</p>
              )}
              <p className="text-[11px] text-[#b0a898] truncate">{companyName}</p>
            </div>
            <span
              className="flex-shrink-0 text-[10px] font-semibold px-2 py-0.5 rounded-full mt-0.5"
              style={{ backgroundColor: badgeColors.bg, color: badgeColors.text }}
            >
              {ROLE_LABELS[roleType] ?? roleType}
            </span>
          </div>

          {person.last_active_note && (
            <p className="text-[11px] text-[#6a6055] mt-1.5 italic">{person.last_active_note}</p>
          )}

          <div className="mt-2.5">
            <SayHelloButton
              personId={person.id}
              personName={person.name}
              personTitle={person.title ?? ''}
              companyName={companyName}
              disabled
            />
          </div>
        </div>
      </div>
    </div>
  );
}
