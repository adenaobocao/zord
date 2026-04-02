'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Tv, Calendar } from 'lucide-react';
import { supabase } from '@/lib/supabase-client';
import type { Evento } from '@/lib/types';

export default function GameIndexPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [noEvent, setNoEvent] = useState(false);

  useEffect(() => {
    async function find() {
      const { data } = await supabase
        .from('eventos')
        .select('*')
        .neq('status', 'finalizado')
        .order('criado_em', { ascending: false })
        .limit(1);

      if (data && data.length > 0) {
        router.replace(`/publico/game/${data[0].id}`);
      } else {
        setNoEvent(true);
        setLoading(false);
      }
    }
    find();
  }, [router]);

  if (loading && !noEvent) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <Tv size={48} className="text-[#2a2a2a] mx-auto mb-4" />
          <p className="text-[#888] font-bold">Buscando evento ao vivo...</p>
          <div className="w-8 h-8 border-4 border-[#8b5cf6] border-t-transparent rounded-full animate-spin mx-auto mt-4" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-[60vh] px-4">
      <div className="text-center">
        <Calendar size={48} className="text-[#2a2a2a] mx-auto mb-4" />
        <h2 className="text-[#f0f0f0] text-xl font-bold mb-2">Nenhum jogo ao vivo</h2>
        <p className="text-[#888] text-sm">
          Quando o gerente iniciar um torneio, a tela do jogo aparece aqui automaticamente.
        </p>
      </div>
    </div>
  );
}
