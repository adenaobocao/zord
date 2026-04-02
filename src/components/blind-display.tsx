import type { BlindLevel } from '@/lib/types';

interface BlindDisplayProps {
  blinds: BlindLevel[];
  currentLevel: number;
}

function formatChips(value: number): string {
  if (value >= 1000) return `${value / 1000}K`;
  return String(value);
}

export function BlindDisplay({ blinds, currentLevel }: BlindDisplayProps) {
  const current = blinds.find((b) => b.level === currentLevel);
  const nextLevel = currentLevel + 1;
  const next = blinds.find((b) => b.level === nextLevel);

  if (!current) {
    return (
      <div className="text-center">
        <p className="text-[#888] text-lg font-bold">Sem blinds configurados</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-2">
      <p className="text-[#888] text-sm font-bold uppercase tracking-wider">
        Nivel {current.level}
      </p>

      <div className="text-center">
        <p className="text-[#f0f0f0] text-3xl md:text-5xl font-black tabular-nums">
          {formatChips(current.small_blind)} / {formatChips(current.big_blind)}
        </p>
        {current.ante > 0 && (
          <p className="text-[#eab308] text-xl md:text-2xl font-bold mt-1">
            Ante {formatChips(current.ante)}
          </p>
        )}
      </div>

      {next && (
        <div className="text-center mt-2">
          <p className="text-[#888] text-xs font-bold uppercase tracking-wider">
            Proximo
          </p>
          <p className="text-[#888] text-lg font-bold tabular-nums">
            {formatChips(next.small_blind)} / {formatChips(next.big_blind)}
            {next.ante > 0 && ` (ante ${formatChips(next.ante)})`}
          </p>
        </div>
      )}

      {!next && (
        <p className="text-[#888] text-sm font-bold mt-2">Ultimo nivel</p>
      )}
    </div>
  );
}
