'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, UserPlus, X, MapPin, Clock, AlertTriangle } from 'lucide-react';
import { supabase } from '@/lib/supabase-client';
import { cn } from '@/lib/utils';

interface Inscricao {
  id: string;
  nome: string;
  criado_em: string;
}

const CONFIRMADOS_INICIAIS = [
  'Trupel',
  'D.Jayme',
  'Matheus',
  'Euller',
  'Rany',
  'Dex',
  'Nelsinho',
  'Iofe',
  'Regulski',
];

const MIN_JOGADORES = 9;
const MAX_JOGADORES = 12;

export default function InscricaoPage() {
  const [inscricoes, setInscricoes] = useState<Inscricao[]>([]);
  const [nome, setNome] = useState('');
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);

  async function load() {
    const { data } = await supabase
      .from('inscricoes')
      .select('*')
      .order('criado_em');
    setInscricoes((data as Inscricao[]) || []);
    setLoading(false);
  }

  useEffect(() => {
    load();

    const channel = supabase
      .channel('inscricoes-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'inscricoes' }, () => {
        load();
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  async function handleInscrever() {
    const trimmed = nome.trim();
    if (!trimmed) return;

    // Check duplicates
    const allNames = [
      ...CONFIRMADOS_INICIAIS.map((n) => n.toLowerCase()),
      ...inscricoes.map((i) => i.nome.toLowerCase()),
    ];
    if (allNames.includes(trimmed.toLowerCase())) return;

    setAdding(true);
    await supabase.from('inscricoes').insert({ nome: trimmed });
    setNome('');
    setAdding(false);
  }

  async function handleRemover(id: string) {
    await supabase.from('inscricoes').delete().eq('id', id);
  }

  const totalConfirmados = CONFIRMADOS_INICIAIS.length + inscricoes.length;
  const vagasRestantes = MAX_JOGADORES - totalConfirmados;
  const minimoAtingido = totalConfirmados >= MIN_JOGADORES;

  return (
    <div className="min-h-screen px-4 py-6 max-w-lg mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Link href="/publico" className="text-[#888]">
          <ArrowLeft size={24} />
        </Link>
      </div>

      {/* Event Banner */}
      <div className="rounded-2xl bg-gradient-to-br from-[#8b5cf6]/20 to-[#22c55e]/10 border border-[#8b5cf6]/30 p-6 mb-6">
        <h1 className="text-3xl font-black text-[#f0f0f0] leading-tight">
          POKER HELLOW PEOPLE
        </h1>
        <p className="text-[#8b5cf6] font-bold text-lg mt-1">02/04</p>

        <div className="flex flex-col gap-2 mt-4">
          <div className="flex items-center gap-2 text-[#f0f0f0]">
            <MapPin size={16} className="text-[#8b5cf6] shrink-0" />
            <span className="font-bold text-sm">Casa do Trupelzord</span>
          </div>
          <div className="flex items-center gap-2 text-[#f0f0f0]">
            <Clock size={16} className="text-[#8b5cf6] shrink-0" />
            <span className="font-bold text-sm">Inicio: A DEFINIR</span>
          </div>
        </div>
      </div>

      {/* Buy-in Structure */}
      <div className="rounded-xl bg-[#141414] border border-[#2a2a2a] p-4 mb-6">
        <h2 className="text-[#888] text-xs font-bold uppercase tracking-wider mb-3">Estrutura</h2>
        <div className="flex flex-col gap-2 text-sm">
          <div className="flex justify-between">
            <span className="text-[#f0f0f0] font-bold">Buy-in</span>
            <span className="text-[#22c55e] font-bold">R$50 (R$40+10) - 25K fichas</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[#f0f0f0] font-bold">Rebuy</span>
            <span className="text-[#22c55e] font-bold">R$40 - 25K fichas</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[#f0f0f0] font-bold">Duplo</span>
            <span className="text-[#eab308] font-bold">R$80 - 50K + 10K bonus</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[#f0f0f0] font-bold">Add-on</span>
            <span className="text-[#8b5cf6] font-bold">R$50 - 80K fichas</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[#f0f0f0] font-bold">Super Add-on</span>
            <span className="text-[#ef4444] font-bold">R$100 - 160K fichas</span>
          </div>
        </div>
      </div>

      {/* Minimum warning */}
      <div className={cn(
        'rounded-xl border p-4 mb-6 flex items-center gap-3',
        minimoAtingido
          ? 'bg-[#22c55e]/10 border-[#22c55e]/30'
          : 'bg-[#eab308]/10 border-[#eab308]/30'
      )}>
        <AlertTriangle size={20} className={minimoAtingido ? 'text-[#22c55e]' : 'text-[#eab308]'} />
        <p className={cn('font-bold text-sm', minimoAtingido ? 'text-[#22c55e]' : 'text-[#eab308]')}>
          {minimoAtingido
            ? `Minimo atingido! ${totalConfirmados} confirmados`
            : `Precisamos de ${MIN_JOGADORES} nomes para o jogo acontecer! (${totalConfirmados}/${MIN_JOGADORES})`
          }
        </p>
      </div>

      {/* Confirmed List */}
      <div className="mb-6">
        <h2 className="text-[#f0f0f0] font-black text-xl mb-3">
          CONFIRMADOS ({totalConfirmados}/{MAX_JOGADORES})
        </h2>

        <div className="flex flex-col gap-2">
          {/* Fixed initial players */}
          {CONFIRMADOS_INICIAIS.map((playerName, i) => (
            <div
              key={`fixed-${i}`}
              className="flex items-center gap-3 rounded-xl bg-[#141414] border border-[#2a2a2a] p-4 min-h-[56px]"
            >
              <span className="w-8 h-8 rounded-lg bg-[#22c55e]/15 text-[#22c55e] font-black text-sm flex items-center justify-center shrink-0">
                {i + 1}
              </span>
              <span className="text-[#f0f0f0] font-bold text-lg">{playerName}</span>
            </div>
          ))}

          {/* Dynamic inscricoes from DB */}
          {inscricoes.map((insc, i) => (
            <div
              key={insc.id}
              className="flex items-center gap-3 rounded-xl bg-[#8b5cf6]/5 border border-[#8b5cf6]/20 p-4 min-h-[56px]"
            >
              <span className="w-8 h-8 rounded-lg bg-[#8b5cf6]/15 text-[#8b5cf6] font-black text-sm flex items-center justify-center shrink-0">
                {CONFIRMADOS_INICIAIS.length + i + 1}
              </span>
              <span className="text-[#f0f0f0] font-bold text-lg flex-1">{insc.nome}</span>
              <button
                onClick={() => handleRemover(insc.id)}
                className="w-10 h-10 rounded-lg text-[#ef4444]/60 hover:text-[#ef4444] hover:bg-[#ef4444]/10 flex items-center justify-center transition-colors"
                title="Remover"
              >
                <X size={18} />
              </button>
            </div>
          ))}

          {/* Empty slots */}
          {vagasRestantes > 0 && Array.from({ length: vagasRestantes }).map((_, i) => (
            <div
              key={`vaga-${i}`}
              className="flex items-center gap-3 rounded-xl border border-dashed border-[#2a2a2a] p-4 min-h-[56px]"
            >
              <span className="w-8 h-8 rounded-lg bg-[#2a2a2a] text-[#888] font-black text-sm flex items-center justify-center shrink-0">
                {totalConfirmados + i + 1}
              </span>
              <span className="text-[#888] text-lg italic">Vaga aberta</span>
            </div>
          ))}
        </div>
      </div>

      {/* Sign up form */}
      {vagasRestantes > 0 && (
        <div className="sticky bottom-4 rounded-2xl bg-[#141414] border border-[#2a2a2a] p-4 shadow-2xl">
          <div className="flex gap-3">
            <input
              type="text"
              placeholder="Seu nome / apelido"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleInscrever()}
              className="flex-1 h-14 px-4 rounded-xl bg-[#1e1e1e] border border-[#2a2a2a] text-[#f0f0f0] text-lg font-bold placeholder:text-[#888] focus:outline-none focus:border-[#8b5cf6]"
            />
            <button
              onClick={handleInscrever}
              disabled={adding || !nome.trim()}
              className="flex items-center justify-center gap-2 min-w-[56px] h-14 px-5 rounded-xl bg-[#22c55e] text-[#0a0a0a] font-bold text-base hover:bg-[#1ea550] active:bg-[#198a43] transition-colors disabled:opacity-50"
            >
              <UserPlus size={20} />
            </button>
          </div>
        </div>
      )}

      {vagasRestantes <= 0 && (
        <div className="rounded-xl bg-[#ef4444]/10 border border-[#ef4444]/30 p-4 text-center">
          <p className="text-[#ef4444] font-bold text-sm">Mesa cheia!</p>
        </div>
      )}
    </div>
  );
}
