'use client';

import { useEffect, useState } from 'react';
import { Trophy, Medal, TrendingUp } from 'lucide-react';
import { supabase } from '@/lib/supabase-client';
import type { Pontuacao, Player } from '@/lib/types';
import { cn } from '@/lib/utils';

interface RankingEntry {
  player: Player;
  pontosTotal: number;
  eventosJogados: number;
  vitorias: number;
  melhorResultado: number;
}

export default function RankingPage() {
  const [ranking, setRanking] = useState<RankingEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const { data: pontuacoes } = await supabase
        .from('pontuacao')
        .select('*, player:players(*)');

      if (!pontuacoes) { setLoading(false); return; }

      const byPlayer = new Map<string, { player: Player; pontos: number[]; colocacoes: number[] }>();

      for (const p of pontuacoes as (Pontuacao & { player: Player })[]) {
        if (!p.player) continue;
        if (!byPlayer.has(p.player_id)) {
          byPlayer.set(p.player_id, { player: p.player, pontos: [], colocacoes: [] });
        }
        const entry = byPlayer.get(p.player_id)!;
        entry.pontos.push(p.pontos);
        entry.colocacoes.push(p.colocacao);
      }

      const entries: RankingEntry[] = [];
      for (const [, value] of byPlayer) {
        entries.push({
          player: value.player,
          pontosTotal: value.pontos.reduce((a, b) => a + b, 0),
          eventosJogados: value.pontos.length,
          vitorias: value.colocacoes.filter((c) => c === 1).length,
          melhorResultado: Math.min(...value.colocacoes),
        });
      }

      // Sort: pontos desc, then vitorias desc, then melhor resultado asc
      entries.sort((a, b) => {
        if (b.pontosTotal !== a.pontosTotal) return b.pontosTotal - a.pontosTotal;
        if (b.vitorias !== a.vitorias) return b.vitorias - a.vitorias;
        return a.melhorResultado - b.melhorResultado;
      });

      setRanking(entries);
      setLoading(false);
    }
    load();
  }, []);

  return (
    <div className="p-4 md:p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-black text-[#f0f0f0] mb-6 flex items-center gap-2">
        <Trophy size={28} className="text-[#eab308]" /> Ranking do Circuito
      </h1>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-4 border-[#8b5cf6] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : ranking.length === 0 ? (
        <div className="text-center py-20">
          <Medal size={48} className="text-[#2a2a2a] mx-auto mb-4" />
          <p className="text-[#888] text-lg">Nenhum resultado registrado</p>
          <p className="text-[#888] text-sm">Finalize um evento para ver o ranking</p>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {ranking.map((entry, index) => {
            const pos = index + 1;
            return (
              <div
                key={entry.player.id}
                className={cn(
                  'flex items-center gap-4 rounded-xl border p-4',
                  pos === 1 ? 'bg-[#eab308]/10 border-[#eab308]/30' :
                  pos === 2 ? 'bg-[#888]/5 border-[#888]/30' :
                  pos === 3 ? 'bg-[#cd7f32]/5 border-[#cd7f32]/30' :
                  'bg-[#141414] border-[#2a2a2a]'
                )}
              >
                <span className={cn(
                  'w-10 h-10 rounded-lg flex items-center justify-center font-black text-lg shrink-0',
                  pos === 1 ? 'bg-[#eab308]/20 text-[#eab308]' :
                  pos === 2 ? 'bg-[#888]/20 text-[#888]' :
                  pos === 3 ? 'bg-[#cd7f32]/20 text-[#cd7f32]' :
                  'bg-[#2a2a2a] text-[#888]'
                )}>
                  {pos}
                </span>

                <div className="flex-1 min-w-0">
                  <p className="text-[#f0f0f0] font-bold text-lg truncate">{entry.player.apelido}</p>
                  <div className="flex items-center gap-3 text-[#888] text-xs">
                    <span>{entry.eventosJogados} eventos</span>
                    <span>{entry.vitorias} vitoria(s)</span>
                    <span>Melhor: {entry.melhorResultado}o</span>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <p className="text-[#8b5cf6] font-black text-2xl">{entry.pontosTotal}</p>
                  <p className="text-[#888] text-[10px] font-bold uppercase">pts</p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
