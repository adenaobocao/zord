'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Calendar, ChevronRight } from 'lucide-react';
import { supabase } from '@/lib/supabase-client';
import type { Evento } from '@/lib/types';

export default function PublicoPage() {
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

  const ativo = eventos.find((e) => e.status !== 'finalizado');

  return (
    <div className="min-h-screen flex flex-col items-center px-4 py-8">
      <div className="text-center mb-8">
        <h1 className="text-4xl md:text-6xl font-black text-[#f0f0f0]">ZORD</h1>
        <p className="text-xl font-bold text-[#8b5cf6]">POKER PIRAI</p>
      </div>

      {loading ? (
        <div className="w-8 h-8 border-4 border-[#8b5cf6] border-t-transparent rounded-full animate-spin" />
      ) : ativo ? (
        <div className="w-full max-w-lg">
          <p className="text-[#22c55e] text-sm font-bold uppercase mb-2 animate-pulse">Ao vivo</p>
          <Link
            href={`/publico/${ativo.id}`}
            className="flex items-center gap-4 rounded-xl bg-[#141414] border border-[#22c55e]/30 p-6 hover:bg-[#1a1a1a] transition-colors"
          >
            <div className="flex-1">
              <h2 className="text-[#f0f0f0] font-black text-2xl">{ativo.nome}</h2>
              <p className="text-[#888] text-sm mt-1">
                {new Date(ativo.data + 'T12:00:00').toLocaleDateString('pt-BR')} — {ativo.status.toUpperCase()}
              </p>
            </div>
            <ChevronRight size={24} className="text-[#22c55e]" />
          </Link>
        </div>
      ) : (
        <div className="text-center py-12">
          <Calendar size={48} className="text-[#2a2a2a] mx-auto mb-4" />
          <p className="text-[#888] text-lg">Nenhum evento ao vivo</p>
        </div>
      )}

      <div className="w-full max-w-lg mt-8 flex flex-col gap-3">
        <Link
          href="/publico/inscricao"
          className="flex items-center justify-center gap-2 w-full h-14 rounded-xl bg-[#8b5cf6] text-white font-bold hover:bg-[#7c3aed] transition-colors"
        >
          Proximo Evento - Inscreva-se!
        </Link>
        <Link
          href="/publico/ranking"
          className="flex items-center justify-center gap-2 w-full h-14 rounded-xl bg-[#141414] border border-[#2a2a2a] text-[#f0f0f0] font-bold hover:bg-[#1a1a1a] transition-colors"
        >
          Ranking do Circuito
        </Link>
      </div>
    </div>
  );
}
