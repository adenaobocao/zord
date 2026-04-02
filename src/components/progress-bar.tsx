import { cn } from '@/lib/utils';

interface ProgressBarProps {
  current: number;
  total: number;
  label?: string;
}

export function ProgressBar({ current, total, label }: ProgressBarProps) {
  const pct = total > 0 ? Math.min(100, Math.round((current / total) * 100)) : 0;
  const isComplete = current >= total && total > 0;

  return (
    <div className="w-full">
      {(label || total > 0) && (
        <div className="flex items-center justify-between mb-2">
          {label && (
            <span className="text-[#f0f0f0] text-sm font-bold">{label}</span>
          )}
          <span className="text-[#888] text-sm font-bold tabular-nums ml-auto">
            {current} / {total}
          </span>
        </div>
      )}

      <div className="w-full h-4 rounded-full bg-[#2a2a2a] overflow-hidden">
        <div
          className={cn(
            'h-full rounded-full transition-all duration-500 ease-out',
            isComplete ? 'bg-[#22c55e]' : 'bg-[#8b5cf6]'
          )}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
