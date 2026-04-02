'use client';

import { useEffect, useRef, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Trophy, Crown, Skull, DollarSign } from 'lucide-react';
import { useEvento } from '@/lib/hooks';
import { BlindDisplay } from '@/components/blind-display';
import { formatTimer, formatMoney, cn } from '@/lib/utils';
import type { BlindLevel } from '@/lib/types';

export default function PublicoGamePage() {
  const params = useParams();
  const eventoId = params.id as string;

  const {
    evento, participacoes, loading,
    totalJogadores, totalBuyIns, prizePool, premiacao,
    pagos, todosPagos, ativos, eliminados,
  } = useEvento(eventoId);

  // Local timer
  const [localMs, setLocalMs] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (evento) setLocalMs(evento.timer_restante_ms || 0);
  }, [evento?.timer_restante_ms]);

  useEffect(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (!evento?.timer_rodando) return;

    intervalRef.current = setInterval(() => {
      setLocalMs((prev) => Math.max(0, prev - 100));
    }, 100);

    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [evento?.timer_rodando]);

  if (loading || !evento) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#0a0a0a]">
        <div className="text-center">
          <h1 className="text-4xl font-black text-[#f0f0f0] mb-4">ZORD POKER</h1>
          <div className="w-8 h-8 border-4 border-[#8b5cf6] border-t-transparent rounded-full animate-spin mx-auto" />
        </div>
      </div>
    );
  }

  const blinds = (evento.estrutura_blinds || []) as BlindLevel[];
  const isLow = localMs > 0 && localMs <= 30000;
  const isZero = localMs <= 0;

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex flex-col">
      {/* Top bar - mobile back + branding */}
      <div className="flex items-center justify-between px-4 lg:px-8 py-3 border-b border-[#2a2a2a]">
        <Link href="/publico" className="lg:hidden text-[#888]">
          <ArrowLeft size={24} />
        </Link>
        <div className="flex items-center gap-3">
          <span className="text-xl font-black text-[#f0f0f0]">ZORD</span>
          <span className="text-sm font-bold text-[#8b5cf6]">POKER</span>
          <span className="text-[#2a2a2a]">|</span>
          <span className="text-[#f0f0f0] font-bold text-sm truncate">{evento.nome}</span>
        </div>
        <div className="flex items-center gap-4 text-sm">
          <div className="text-center">
            <p className="text-[#888] text-[10px] font-bold uppercase">Jogadores</p>
            <p className="text-[#f0f0f0] text-xl lg:text-2xl font-black">{totalJogadores}</p>
          </div>
          <div className="text-center">
            <p className="text-[#888] text-[10px] font-bold uppercase">Buy-ins</p>
            <p className="text-[#8b5cf6] text-xl lg:text-2xl font-black">{totalBuyIns}</p>
          </div>
          <div className="text-center">
            <p className="text-[#888] text-[10px] font-bold uppercase">Prize Pool</p>
            <p className="text-[#22c55e] text-xl lg:text-2xl font-black">{formatMoney(prizePool)}</p>
          </div>
        </div>
      </div>

      {/* CADASTRO */}
      {evento.status === 'cadastro' && (
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="text-center">
            <h2 className="text-5xl lg:text-8xl font-black text-[#f0f0f0] mb-4">ZORD POKER PIRAI</h2>
            <p className="text-[#888] text-xl lg:text-3xl font-bold">Aguardando inicio...</p>
            <div className="flex flex-wrap justify-center gap-3 mt-8 max-w-4xl mx-auto">
              {participacoes.map((p) => (
                <div key={p.id} className="px-5 py-3 rounded-xl bg-[#141414] border border-[#2a2a2a]">
                  <span className="text-[#f0f0f0] font-bold text-lg lg:text-2xl">{p.player?.apelido}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* REBUYS */}
      {evento.status === 'rebuys' && (
        <div className="flex-1 flex flex-col lg:flex-row">
          {/* Left: Timer + Blinds */}
          <div className="lg:flex-1 flex flex-col items-center justify-center p-6 lg:p-12 lg:border-r lg:border-[#2a2a2a]">
            <div className={cn(
              'font-mono font-black tabular-nums tracking-tight mb-6',
              'text-7xl lg:text-[12rem] leading-none',
              isZero && 'text-[#ef4444] animate-pulse',
              isLow && !isZero && 'text-[#eab308]',
              !isLow && !isZero && 'text-[#f0f0f0]'
            )}>
              {formatTimer(localMs)}
            </div>
            <BlindDisplay blinds={blinds} currentLevel={evento.blind_level_atual} />
          </div>

          {/* Right: Players */}
          <div className="lg:w-[400px] xl:w-[480px] p-4 lg:p-6 overflow-y-auto max-h-[calc(100vh-80px)]">
            <div className="grid grid-cols-2 lg:grid-cols-1 gap-2">
              {participacoes.map((p) => (
                <div key={p.id} className="flex items-center justify-between rounded-xl bg-[#141414] border border-[#2a2a2a] px-4 py-3">
                  <span className="text-[#f0f0f0] font-bold text-base lg:text-lg truncate">{p.player?.apelido}</span>
                  <span className="text-[#8b5cf6] font-black text-base lg:text-lg shrink-0 ml-2">{p.buy_ins}x</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* COBRANCA */}
      {evento.status === 'cobranca' && (
        <div className="flex-1 flex flex-col">
          {/* Big header */}
          <div className="bg-[#eab308]/10 border-b border-[#eab308]/30 px-6 py-6 lg:py-10 text-center">
            <p className="text-[#eab308] text-4xl lg:text-7xl font-black">HORA DE ACERTAR</p>
            {evento.pix_banco && (
              <div className="mt-4 inline-block px-6 py-3 rounded-xl bg-[#0a0a0a] border border-[#2a2a2a]">
                <p className="text-[#888] text-xs uppercase font-bold mb-1">Pix do banco</p>
                <p className="text-[#f0f0f0] text-lg lg:text-2xl font-mono select-all">{evento.pix_banco}</p>
              </div>
            )}
          </div>

          {/* Progress */}
          <div className="px-6 lg:px-12 py-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[#f0f0f0] font-bold text-lg lg:text-2xl">Pagamentos</span>
              <span className={cn(
                'font-black text-2xl lg:text-4xl',
                todosPagos ? 'text-[#22c55e]' : 'text-[#f0f0f0]'
              )}>
                {pagos}/{totalJogadores}
              </span>
            </div>
            <div className="w-full h-4 lg:h-6 rounded-full bg-[#2a2a2a] overflow-hidden">
              <div
                className={cn(
                  'h-full rounded-full transition-all duration-500',
                  todosPagos ? 'bg-[#22c55e]' : 'bg-[#8b5cf6]'
                )}
                style={{ width: `${totalJogadores > 0 ? (pagos / totalJogadores) * 100 : 0}%` }}
              />
            </div>
          </div>

          {/* Player grid */}
          <div className="flex-1 px-4 lg:px-12 pb-6 overflow-y-auto">
            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2 lg:gap-3">
              {participacoes
                .sort((a, b) => Number(a.pago) - Number(b.pago))
                .map((p) => {
                  const isPendente = !p.pago;
                  const isLastFew = isPendente && (totalJogadores - pagos) <= 3;
                  return (
                    <div
                      key={p.id}
                      className={cn(
                        'rounded-xl border p-3 lg:p-4 transition-all',
                        p.pago
                          ? 'bg-[#22c55e]/10 border-[#22c55e]/30'
                          : 'bg-[#141414] border-[#2a2a2a]',
                        isLastFew && 'animate-pulse-red border-[#ef4444]/50 bg-[#ef4444]/5'
                      )}
                    >
                      <p className={cn(
                        'font-bold truncate',
                        isLastFew ? 'text-[#ef4444] text-xl lg:text-3xl' : 'text-[#f0f0f0] text-base lg:text-xl'
                      )}>
                        {p.player?.apelido}
                      </p>
                      <div className="flex items-center justify-between mt-1">
                        <span className="text-[#888] text-xs lg:text-sm">{formatMoney(p.total_devido)}</span>
                        <span className={cn(
                          'font-black text-xs lg:text-sm px-2 py-0.5 rounded-md',
                          p.pago ? 'bg-[#22c55e] text-[#0a0a0a]' : 'bg-[#ef4444]/20 text-[#ef4444]'
                        )}>
                          {p.pago ? 'PAGO' : 'DEVE'}
                        </span>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        </div>
      )}

      {/* ELIMINACAO */}
      {evento.status === 'eliminacao' && (
        <div className="flex-1 flex flex-col lg:flex-row">
          {/* Left: Timer + Blinds + Prize */}
          <div className="lg:flex-1 flex flex-col items-center justify-center p-6 lg:p-12 lg:border-r lg:border-[#2a2a2a]">
            <div className={cn(
              'font-mono font-black tabular-nums tracking-tight mb-6',
              'text-7xl lg:text-[12rem] leading-none',
              isZero && 'text-[#ef4444] animate-pulse',
              isLow && !isZero && 'text-[#eab308]',
              !isLow && !isZero && 'text-[#f0f0f0]'
            )}>
              {formatTimer(localMs)}
            </div>
            <BlindDisplay blinds={blinds} currentLevel={evento.blind_level_atual} />

            {/* Prize info */}
            {premiacao.length > 0 && (
              <div className="mt-6 flex flex-wrap justify-center gap-3">
                {premiacao.map((v, i) => (
                  <div key={i} className="px-4 py-2 rounded-xl bg-[#22c55e]/10 border border-[#22c55e]/30">
                    <span className="text-[#888] text-xs font-bold">{i + 1}o </span>
                    <span className="text-[#22c55e] font-black text-lg">{formatMoney(v)}</span>
                  </div>
                ))}
              </div>
            )}

            {ativos.length <= premiacao.length && ativos.length > 1 && (
              <p className="text-[#eab308] font-black text-3xl lg:text-5xl mt-6 animate-pulse">
                BOLHA ITM!
              </p>
            )}
          </div>

          {/* Right: Players */}
          <div className="lg:w-[400px] xl:w-[480px] p-4 lg:p-6 overflow-y-auto max-h-[calc(100vh-80px)]">
            <p className="text-[#22c55e] text-xs font-bold uppercase tracking-wider mb-3">
              <Skull size={14} className="inline mr-1" />
              Restantes ({ativos.length})
            </p>
            <div className="grid grid-cols-2 lg:grid-cols-1 gap-2 mb-6">
              {ativos.map((p) => (
                <div key={p.id} className="rounded-xl bg-[#141414] border border-[#2a2a2a] px-4 py-3 lg:py-4 text-center lg:text-left">
                  <span className="text-[#f0f0f0] font-black text-lg lg:text-2xl">{p.player?.apelido}</span>
                </div>
              ))}
            </div>

            {eliminados.length > 0 && (
              <>
                <p className="text-[#888] text-xs font-bold uppercase tracking-wider mb-2">Eliminados</p>
                <div className="flex flex-col gap-1">
                  {eliminados.map((p) => (
                    <div key={p.id} className="flex items-center justify-between rounded-lg bg-[#141414]/50 border border-[#2a2a2a]/50 px-3 py-2 opacity-50">
                      <span className="text-[#888] font-bold text-sm">{p.player?.apelido}</span>
                      <span className="text-[#eab308] font-black text-sm">#{p.colocacao}</span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* FINALIZADO */}
      {evento.status === 'finalizado' && (
        <div className="flex-1 flex items-center justify-center p-6 lg:p-12">
          <div className="w-full max-w-3xl">
            <div className="text-center mb-8 lg:mb-12">
              <Crown size={64} className="text-[#eab308] mx-auto mb-4 lg:w-24 lg:h-24" />
              <p className="text-[#eab308] text-5xl lg:text-8xl font-black">
                {participacoes.find((p) => p.colocacao === 1)?.player?.apelido}
              </p>
              <p className="text-[#888] text-xl lg:text-2xl font-bold mt-2">CAMPEAO</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 lg:gap-4">
              {participacoes
                .filter((p) => p.colocacao !== null && p.colocacao <= 3)
                .sort((a, b) => (a.colocacao || 99) - (b.colocacao || 99))
                .map((p) => (
                  <div
                    key={p.id}
                    className={cn(
                      'rounded-2xl border p-6 text-center',
                      p.colocacao === 1 ? 'bg-[#eab308]/10 border-[#eab308]/30' :
                      p.colocacao === 2 ? 'bg-[#888]/5 border-[#888]/30' :
                      'bg-[#cd7f32]/5 border-[#cd7f32]/30'
                    )}
                  >
                    <p className="text-4xl lg:text-6xl font-black text-[#888] mb-2">{p.colocacao}o</p>
                    <p className="text-[#f0f0f0] font-black text-xl lg:text-3xl">{p.player?.apelido}</p>
                    {p.premio && p.premio > 0 && (
                      <p className="text-[#22c55e] font-black text-lg lg:text-2xl mt-2">{formatMoney(p.premio)}</p>
                    )}
                  </div>
                ))}
            </div>

            {/* Rest of placements */}
            <div className="mt-6 grid grid-cols-2 lg:grid-cols-4 gap-2">
              {participacoes
                .filter((p) => p.colocacao !== null && p.colocacao > 3)
                .sort((a, b) => (a.colocacao || 99) - (b.colocacao || 99))
                .map((p) => (
                  <div key={p.id} className="flex items-center gap-2 rounded-xl bg-[#141414] border border-[#2a2a2a] px-3 py-2">
                    <span className="text-[#888] font-black">{p.colocacao}o</span>
                    <span className="text-[#f0f0f0] font-bold text-sm truncate">{p.player?.apelido}</span>
                  </div>
                ))}
            </div>

            <div className="text-center mt-8">
              <Link
                href="/publico/ranking"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#8b5cf6] text-white font-bold hover:bg-[#7c3aed] transition-colors"
              >
                <Trophy size={18} /> Ver Ranking do Circuito
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
