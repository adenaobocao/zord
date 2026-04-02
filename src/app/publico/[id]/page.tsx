'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Trophy, Crown } from 'lucide-react';
import { useEvento } from '@/lib/hooks';
import { Timer } from '@/components/timer';
import { BlindDisplay } from '@/components/blind-display';
import { ProgressBar } from '@/components/progress-bar';
import type { BlindLevel } from '@/lib/types';
import { formatMoney, cn } from '@/lib/utils';

export default function PublicoEventoPage() {
  const params = useParams();
  const eventoId = params.id as string;

  const {
    evento, participacoes, loading,
    totalJogadores, totalBuyIns, prizePool, premiacao,
    pagos, todosPagos, ativos, eliminados,
  } = useEvento(eventoId);

  if (loading || !evento) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-4 border-[#8b5cf6] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const blinds = (evento.estrutura_blinds || []) as BlindLevel[];

  return (
    <div className="min-h-screen px-4 py-6 max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <Link href="/publico" className="text-[#888]">
          <ArrowLeft size={24} />
        </Link>
        <div>
          <h1 className="text-2xl font-black text-[#f0f0f0]">{evento.nome}</h1>
          <p className="text-[#888] text-xs">{evento.status.toUpperCase()}</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-2 mb-6">
        <div className="rounded-xl bg-[#141414] border border-[#2a2a2a] p-3 text-center">
          <p className="text-[#888] text-[10px] font-bold uppercase">Jogadores</p>
          <p className="text-[#f0f0f0] text-3xl font-black">{totalJogadores}</p>
        </div>
        <div className="rounded-xl bg-[#141414] border border-[#2a2a2a] p-3 text-center">
          <p className="text-[#888] text-[10px] font-bold uppercase">Buy-ins</p>
          <p className="text-[#8b5cf6] text-3xl font-black">{totalBuyIns}</p>
        </div>
        <div className="rounded-xl bg-[#141414] border border-[#2a2a2a] p-3 text-center">
          <p className="text-[#888] text-[10px] font-bold uppercase">Prize Pool</p>
          <p className="text-[#22c55e] text-3xl font-black">{formatMoney(prizePool)}</p>
        </div>
      </div>

      {/* CADASTRO */}
      {evento.status === 'cadastro' && (
        <div>
          <div className="text-center py-8">
            <h2 className="text-[#f0f0f0] text-4xl font-black mb-2">ZORD POKER PIRAI</h2>
            <p className="text-[#888] text-lg">Aguardando inicio...</p>
          </div>
          <div className="flex flex-col gap-2">
            {participacoes.map((p) => (
              <div key={p.id} className="flex items-center gap-3 rounded-xl bg-[#141414] border border-[#2a2a2a] p-4">
                <span className="text-[#f0f0f0] font-bold text-lg">{p.player?.apelido || 'Jogador'}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* REBUYS */}
      {evento.status === 'rebuys' && (
        <div>
          <div className="mb-6">
            <Timer
              restanteMs={evento.timer_restante_ms || 0}
              rodando={evento.timer_rodando}
              onPause={() => {}}
              onResume={() => {}}
              onAddMinute={() => {}}
              onSubMinute={() => {}}
              onNextBlind={() => {}}
            />
            <div className="mt-4">
              <BlindDisplay blinds={blinds} currentLevel={evento.blind_level_atual} />
            </div>
          </div>
          <div className="flex flex-col gap-2">
            {participacoes.map((p) => (
              <div key={p.id} className="flex items-center justify-between rounded-xl bg-[#141414] border border-[#2a2a2a] p-4">
                <span className="text-[#f0f0f0] font-bold text-lg">{p.player?.apelido || 'Jogador'}</span>
                <span className="text-[#8b5cf6] font-black text-lg">{p.buy_ins}x</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* COBRANCA */}
      {evento.status === 'cobranca' && (
        <div>
          <div className="rounded-xl bg-[#eab308]/10 border border-[#eab308]/30 p-6 mb-6 text-center">
            <p className="text-[#eab308] text-4xl font-black">HORA DE ACERTAR</p>
            {evento.pix_banco && (
              <div className="mt-3 p-3 rounded-lg bg-[#0a0a0a] border border-[#2a2a2a]">
                <p className="text-[#888] text-xs uppercase font-bold mb-1">Pix do banco</p>
                <p className="text-[#f0f0f0] text-lg font-mono break-all select-all">{evento.pix_banco}</p>
              </div>
            )}
          </div>

          <ProgressBar current={pagos} total={totalJogadores} label="Pagamentos" />

          <div className="flex flex-col gap-2 mt-4">
            {participacoes
              .sort((a, b) => Number(a.pago) - Number(b.pago))
              .map((p) => {
                const isPendente = !p.pago;
                const isLastFew = !p.pago && (totalJogadores - pagos) <= 2;
                return (
                  <div
                    key={p.id}
                    className={cn(
                      'flex items-center justify-between rounded-xl border p-4 transition-all',
                      p.pago
                        ? 'bg-[#22c55e]/5 border-[#22c55e]/30'
                        : 'bg-[#141414] border-[#2a2a2a]',
                      isLastFew && 'animate-pulse-red border-[#ef4444]/50'
                    )}
                  >
                    <div>
                      <span className={cn(
                        'font-bold',
                        isLastFew ? 'text-[#ef4444] text-2xl' : 'text-[#f0f0f0] text-lg'
                      )}>
                        {p.player?.apelido || 'Jogador'}
                      </span>
                      <p className="text-[#888] text-sm">{formatMoney(p.total_devido)}</p>
                    </div>
                    <span className={cn(
                      'font-black text-sm px-3 py-1 rounded-lg',
                      p.pago ? 'bg-[#22c55e] text-[#0a0a0a]' : 'bg-[#ef4444]/20 text-[#ef4444]'
                    )}>
                      {p.pago ? 'PAGO' : 'PENDENTE'}
                    </span>
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {/* ELIMINACAO */}
      {evento.status === 'eliminacao' && (
        <div>
          <div className="mb-6">
            <Timer
              restanteMs={evento.timer_restante_ms || 0}
              rodando={evento.timer_rodando}
              onPause={() => {}}
              onResume={() => {}}
              onAddMinute={() => {}}
              onSubMinute={() => {}}
              onNextBlind={() => {}}
            />
            <div className="mt-4">
              <BlindDisplay blinds={blinds} currentLevel={evento.blind_level_atual} />
            </div>
          </div>

          {premiacao.length > 0 && (
            <div className="rounded-xl bg-[#22c55e]/10 border border-[#22c55e]/30 p-4 mb-4 text-center">
              <p className="text-[#22c55e] font-bold">
                {premiacao.map((v, i) => `${i + 1}o: ${formatMoney(v)}`).join(' | ')}
              </p>
              {ativos.length <= premiacao.length && (
                <p className="text-[#eab308] font-black text-2xl mt-2 animate-pulse">
                  BOLHA ITM!
                </p>
              )}
            </div>
          )}

          <div className="mb-4">
            <p className="text-[#22c55e] text-sm font-bold uppercase mb-2">Restantes ({ativos.length})</p>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {ativos.map((p) => (
                <div key={p.id} className="rounded-xl bg-[#141414] border border-[#2a2a2a] p-4 text-center">
                  <span className="text-[#f0f0f0] font-black text-xl">{p.player?.apelido}</span>
                </div>
              ))}
            </div>
          </div>

          {eliminados.length > 0 && (
            <div>
              <p className="text-[#888] text-sm font-bold uppercase mb-2">Eliminados</p>
              <div className="flex flex-col gap-1">
                {eliminados.map((p) => (
                  <div key={p.id} className="flex items-center justify-between rounded-lg bg-[#141414] border border-[#2a2a2a] p-3 opacity-60">
                    <span className="text-[#888] font-bold">{p.player?.apelido}</span>
                    <span className="text-[#eab308] font-black">#{p.colocacao}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* FINALIZADO */}
      {evento.status === 'finalizado' && (
        <div>
          <div className="text-center py-8">
            <Crown size={64} className="text-[#eab308] mx-auto mb-4" />
            <p className="text-[#eab308] text-5xl font-black mb-1">
              {participacoes.find((p) => p.colocacao === 1)?.player?.apelido}
            </p>
            <p className="text-[#888] text-lg">CAMPEAO</p>
          </div>

          <div className="flex flex-col gap-2">
            {participacoes
              .filter((p) => p.colocacao !== null)
              .sort((a, b) => (a.colocacao || 99) - (b.colocacao || 99))
              .map((p) => (
                <div
                  key={p.id}
                  className={cn(
                    'flex items-center justify-between rounded-xl border p-4',
                    p.colocacao === 1 ? 'bg-[#eab308]/10 border-[#eab308]/30' :
                    p.colocacao === 2 ? 'bg-[#888]/5 border-[#888]/30' :
                    p.colocacao === 3 ? 'bg-[#cd7f32]/5 border-[#cd7f32]/30' :
                    'bg-[#141414] border-[#2a2a2a]'
                  )}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl font-black text-[#888] w-8">{p.colocacao}</span>
                    <span className="text-[#f0f0f0] font-bold text-lg">{p.player?.apelido}</span>
                  </div>
                  {p.premio && p.premio > 0 && (
                    <span className="text-[#22c55e] font-black text-lg">{formatMoney(p.premio)}</span>
                  )}
                </div>
              ))}
          </div>

          <Link
            href="/publico/ranking"
            className="flex items-center justify-center gap-2 w-full h-14 rounded-xl bg-[#8b5cf6] text-white font-bold mt-6"
          >
            <Trophy size={20} /> Ver Ranking do Circuito
          </Link>
        </div>
      )}
    </div>
  );
}
