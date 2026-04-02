'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Plus, Calendar, Users, ChevronRight } from 'lucide-react';
import { supabase } from '@/lib/supabase-client';
import type { Evento } from '@/lib/types';
import { formatMoney } from '@/lib/utils';

const statusLabels: Record<string, { label: string; color: string }> = {
  cadastro: { label: 'Cadastro', color: 'bg-[#888]/20 text-[#888]' },
  rebuys: { label: 'Rebuys', color: 'bg-[#8b5cf6]/20 text-[#8b5cf6]' },
  cobranca: { label: 'Cobranca', color: 'bg-[#eab308]/20 text-[#eab308]' },
  eliminacao: { label: 'Eliminacao', color: 'bg-[#ef4444]/20 text-[#ef4444]' },
  finalizado: { label: 'Finalizado', color: 'bg-[#22c55e]/20 text-[#22c55e]' },
};

export default function DashboardPage() {
  const [eventos, setEventos] = useState<Evento[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from('eventos')
        .select('*')
        .order('data', { ascending: false })
        .limit(20);
      setEventos((data as Evento[]) || []);
      setLoading(false);
    }
    load();
  }, []);

  return (
    <div className="p-4 md:p-6 max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-black text-[#f0f0f0]">Dashboard</h1>
        <Link
          href="/gerente/evento/novo"
          className="flex items-center gap-2 min-h-[56px] px-6 rounded-xl bg-[#8b5cf6] text-white font-bold text-base hover:bg-[#7c3aed] active:bg-[#6d28d9] transition-colors"
        >
          <Plus size={20} />
          NOVO EVENTO
        </Link>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-4 border-[#8b5cf6] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : eventos.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <Calendar size={48} className="text-[#2a2a2a] mb-4" />
          <p className="text-[#888] text-lg font-bold">Nenhum evento ainda</p>
          <p className="text-[#888] text-sm mt-1">Crie seu primeiro torneio!</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {eventos.map((evento) => {
            const status = statusLabels[evento.status] || statusLabels.cadastro;
            const isActive = evento.status !== 'finalizado';
            return (
              <Link
                key={evento.id}
                href={`/gerente/evento/${evento.id}`}
                className="flex items-center gap-4 rounded-xl bg-[#141414] border border-[#2a2a2a] p-4 hover:bg-[#1a1a1a] active:bg-[#1e1e1e] transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h2 className="text-[#f0f0f0] font-bold text-lg truncate">
                      {evento.nome}
                    </h2>
                    {isActive && (
                      <span className="shrink-0 w-2 h-2 rounded-full bg-[#22c55e] animate-pulse" />
                    )}
                  </div>
                  <div className="flex items-center gap-3 text-[#888] text-sm">
                    <span>{new Date(evento.data + 'T12:00:00').toLocaleDateString('pt-BR')}</span>
                    <span>Buy-in: {formatMoney(evento.buy_in)}</span>
                  </div>
                </div>
                <span className={`shrink-0 px-3 py-1 rounded-lg text-xs font-bold ${status.color}`}>
                  {status.label}
                </span>
                <ChevronRight size={20} className="text-[#2a2a2a] shrink-0" />
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
