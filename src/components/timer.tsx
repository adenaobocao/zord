'use client';

import { useEffect, useRef, useState } from 'react';
import { Pause, Play, SkipForward, Minus, Plus } from 'lucide-react';
import { formatTimer, cn } from '@/lib/utils';

interface TimerProps {
  restanteMs: number;
  rodando: boolean;
  onPause: () => void;
  onResume: () => void;
  onAddMinute: () => void;
  onSubMinute: () => void;
  onNextBlind: () => void;
}

export function Timer({
  restanteMs,
  rodando,
  onPause,
  onResume,
  onAddMinute,
  onSubMinute,
  onNextBlind,
}: TimerProps) {
  const [localMs, setLocalMs] = useState(restanteMs);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const calledNextRef = useRef(false);

  // Sync with external restanteMs
  useEffect(() => {
    setLocalMs(restanteMs);
    calledNextRef.current = false;
  }, [restanteMs]);

  // Local countdown
  useEffect(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    if (!rodando) return;

    const tick = 100;
    intervalRef.current = setInterval(() => {
      setLocalMs((prev) => {
        const next = prev - tick;
        if (next <= 0) {
          if (!calledNextRef.current) {
            calledNextRef.current = true;
            // Defer to avoid setState during render
            setTimeout(onNextBlind, 0);
          }
          return 0;
        }
        return next;
      });
    }, tick);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [rodando, onNextBlind]);

  const isLow = localMs > 0 && localMs <= 30000;
  const isZero = localMs <= 0;

  return (
    <div className="flex flex-col items-center gap-6">
      <div
        className={cn(
          'font-mono font-black tabular-nums tracking-tight',
          'text-6xl md:text-8xl',
          isZero && 'text-[#ef4444] animate-pulse',
          isLow && !isZero && 'text-[#eab308]',
          !isLow && !isZero && 'text-[#f0f0f0]'
        )}
      >
        {formatTimer(localMs)}
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={onSubMinute}
          className="flex items-center justify-center min-w-[56px] min-h-[56px] rounded-xl bg-[#141414] border border-[#2a2a2a] text-[#f0f0f0] font-bold text-lg hover:bg-[#1e1e1e] active:bg-[#2a2a2a] transition-colors"
          aria-label="Remover 1 minuto"
        >
          <Minus size={24} />
        </button>

        <button
          onClick={rodando ? onPause : onResume}
          className={cn(
            'flex items-center justify-center min-w-[72px] min-h-[56px] rounded-xl font-bold text-lg transition-colors',
            rodando
              ? 'bg-[#eab308] text-[#0a0a0a] hover:bg-[#ca9a06] active:bg-[#a37d05]'
              : 'bg-[#22c55e] text-[#0a0a0a] hover:bg-[#1ea550] active:bg-[#198a43]'
          )}
          aria-label={rodando ? 'Pausar' : 'Continuar'}
        >
          {rodando ? <Pause size={28} /> : <Play size={28} />}
        </button>

        <button
          onClick={onAddMinute}
          className="flex items-center justify-center min-w-[56px] min-h-[56px] rounded-xl bg-[#141414] border border-[#2a2a2a] text-[#f0f0f0] font-bold text-lg hover:bg-[#1e1e1e] active:bg-[#2a2a2a] transition-colors"
          aria-label="Adicionar 1 minuto"
        >
          <Plus size={24} />
        </button>

        <button
          onClick={onNextBlind}
          className="flex items-center justify-center min-w-[56px] min-h-[56px] rounded-xl bg-[#8b5cf6] text-white font-bold text-lg hover:bg-[#7c3aed] active:bg-[#6d28d9] transition-colors"
          aria-label="Proximo blind"
        >
          <SkipForward size={24} />
        </button>
      </div>
    </div>
  );
}
