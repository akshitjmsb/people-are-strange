import type { JobPosting } from '@/lib/types';

interface JobCardProps {
  job: JobPosting;
}

const REMOTE_LABELS = {
  onsite: 'On-site',
  hybrid: 'Hybrid',
  remote: 'Remote',
};

const REMOTE_COLORS = {
  onsite: { bg: '#f5f0e8', text: '#6a6055' },
  hybrid: { bg: '#e3f2fd', text: '#0d47a1' },
  remote: { bg: '#e8f5e9', text: '#1b5e20' },
};

export default function JobCard({ job }: JobCardProps) {
  const remoteType = job.remote_type ?? 'onsite';
  const colors = REMOTE_COLORS[remoteType];

  const postedDate = job.posted_at
    ? new Date(job.posted_at).toLocaleDateString('en-CA', {
        month: 'short',
        day: 'numeric',
      })
    : null;

  return (
    <div className="bg-white rounded-2xl border border-[#ece7df] p-4 mb-3">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-[14px] font-semibold text-[#1a1a1a]">{job.title}</p>
          {job.department && (
            <p className="text-[12px] text-[#6a6055] mt-0.5">{job.department}</p>
          )}
          {job.location && (
            <p className="text-[11px] text-[#b0a898] mt-0.5">{job.location}</p>
          )}
        </div>

        <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
          <span
            className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
            style={{ backgroundColor: colors.bg, color: colors.text }}
          >
            {REMOTE_LABELS[remoteType]}
          </span>
          {postedDate && (
            <span className="text-[10px] text-[#b0a898]">{postedDate}</span>
          )}
        </div>
      </div>

      {job.source_url && (
        <a
          href={job.source_url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block mt-3 text-[12px] font-medium text-[#1a1a1a] border border-[#d4cdc3] px-3 py-1.5 rounded-lg hover:bg-[#1a1a1a] hover:text-[#f5f0e8] transition-colors"
        >
          View posting ↗
        </a>
      )}
    </div>
  );
}
