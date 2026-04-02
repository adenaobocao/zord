'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { UserPlus, X, MapPin, Clock, AlertTriangle, Trophy, Tv, ChevronRight } from 'lucide-react';
import { supabase } from '@/lib/supabase-client';
import type { Evento } from '@/lib/types';
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
const MAX_JOGADORES = 27;

export default function PublicoPage() {
  const [inscricoes, setInscricoes] = useState<Inscricao[]>([]);
  const [nome, setNome] = useState('');
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [eventoAtivo, setEventoAtivo] = useState<Evento | null>(null);

  async function loadInscricoes() {
    const { data } = await supabase
      .from('inscricoes')
      .select('*')
      .order('criado_em');
    setInscricoes((data as Inscricao[]) || []);
  }

  useEffect(() => {
    async function init() {
      await loadInscricoes();
      const { data } = await supabase
        .from('eventos')
        .select('*')
        .neq('status', 'finalizado')
        .order('criado_em', { ascending: false })
        .limit(1);
      if (data && data.length > 0) setEventoAtivo(data[0] as Evento);
      setLoading(false);
    }
    init();

    const channel = supabase
      .channel('inscricoes-pub')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'inscricoes' }, () => {
        loadInscricoes();
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  async function handleInscrever() {
    const trimmed = nome.trim();
    if (!trimmed) return;
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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-4 border-[#8b5cf6] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <div className="bg-gradient-to-b from-[#8b5cf6]/15 to-transparent px-4 pt-8 pb-6">
        <div className="max-w-lg mx-auto text-center">
          <h1 className="text-4xl font-black text-[#f0f0f0] leading-tight">
            ZORD POKER
          </h1>
          <p className="text-[#8b5cf6] font-bold text-sm tracking-widest mt-1">PIRAI DO SUL</p>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 pb-8">
        {/* Live game banner */}
        {eventoAtivo && eventoAtivo.status !== 'cadastro' && (
          <Link
            href={`/publico/game/${eventoAtivo.id}`}
            className="flex items-center gap-4 rounded-2xl bg-[#22c55e]/10 border border-[#22c55e]/30 p-4 mb-6 hover:bg-[#22c55e]/15 transition-colors"
          >
            <div className="w-12 h-12 rounded-xl bg-[#22c55e]/20 flex items-center justify-center shrink-0">
              <Tv size={24} className="text-[#22c55e]" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[#22c55e] text-xs font-bold uppercase animate-pulse">Ao vivo</p>
              <p className="text-[#f0f0f0] font-bold text-lg truncate">{eventoAtivo.nome}</p>
            </div>
            <ChevronRight size={20} className="text-[#22c55e] shrink-0" />
          </Link>
        )}

        {/* Event Info Card */}
        <div className="rounded-2xl bg-[#141414] border border-[#2a2a2a] overflow-hidden mb-6">
          <div className="bg-gradient-to-r from-[#8b5cf6]/20 to-[#22c55e]/10 p-5">
            <h2 className="text-2xl font-black text-[#f0f0f0]">POKER HELLOW PEOPLE</h2>
            <p className="text-[#8b5cf6] font-bold mt-1">02/04</p>
            <div className="flex flex-col gap-1.5 mt-3">
              <div className="flex items-center gap-2">
                <MapPin size={14} className="text-[#8b5cf6] shrink-0" />
                <span className="text-[#f0f0f0] text-sm font-bold">Casa do Trupelzord</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock size={14} className="text-[#8b5cf6] shrink-0" />
                <span className="text-[#f0f0f0] text-sm font-bold">Inicio: A DEFINIR</span>
              </div>
            </div>
          </div>

          {/* Buy-in structure */}
          <div className="p-5">
            <div className="grid grid-cols-1 gap-2 text-sm">
              <div className="flex items-center justify-between py-2 border-b border-[#2a2a2a]">
                <span className="text-[#f0f0f0] font-bold">Buy-in</span>
                <div className="text-right">
                  <span className="text-[#22c55e] font-bold">R$50</span>
                  <span className="text-[#888] text-xs ml-2">(R$40+10) 25K</span>
                </div>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-[#2a2a2a]">
                <span className="text-[#f0f0f0] font-bold">Rebuy</span>
                <div className="text-right">
                  <span className="text-[#22c55e] font-bold">R$40</span>
                  <span className="text-[#888] text-xs ml-2">25K</span>
                </div>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-[#2a2a2a]">
                <span className="text-[#f0f0f0] font-bold">Duplo</span>
                <div className="text-right">
                  <span className="text-[#eab308] font-bold">R$80</span>
                  <span className="text-[#888] text-xs ml-2">50K + 10K bonus</span>
                </div>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-[#2a2a2a]">
                <span className="text-[#f0f0f0] font-bold">Add-on</span>
                <div className="text-right">
                  <span className="text-[#8b5cf6] font-bold">R$50</span>
                  <span className="text-[#888] text-xs ml-2">80K</span>
                </div>
              </div>
              <div className="flex items-center justify-between py-2">
                <span className="text-[#f0f0f0] font-bold">Super Add-on</span>
                <div className="text-right">
                  <span className="text-[#ef4444] font-bold">R$100</span>
                  <span className="text-[#888] text-xs ml-2">160K</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Status bar */}
        <div className={cn(
          'rounded-2xl border p-4 mb-4 flex items-center gap-3',
          minimoAtingido
            ? 'bg-[#22c55e]/10 border-[#22c55e]/30'
            : 'bg-[#eab308]/10 border-[#eab308]/30'
        )}>
          <AlertTriangle size={18} className={minimoAtingido ? 'text-[#22c55e] shrink-0' : 'text-[#eab308] shrink-0'} />
          <p className={cn('font-bold text-sm', minimoAtingido ? 'text-[#22c55e]' : 'text-[#eab308]')}>
            {minimoAtingido
              ? `Jogo confirmado! ${totalConfirmados} jogadores`
              : `Precisamos de ${MIN_JOGADORES} nomes! (${totalConfirmados}/${MIN_JOGADORES})`
            }
          </p>
        </div>

        {/* Sign up form - sticky and prominent */}
        {vagasRestantes > 0 && (
          <div className="rounded-2xl bg-[#8b5cf6]/10 border border-[#8b5cf6]/30 p-4 mb-6">
            <p className="text-[#8b5cf6] text-xs font-bold uppercase tracking-wider mb-3">Entrar na lista</p>
            <div className="flex gap-3">
              <input
                type="text"
                placeholder="Seu nome / apelido"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleInscrever()}
                className="flex-1 h-14 px-4 rounded-xl bg-[#0a0a0a] border border-[#2a2a2a] text-[#f0f0f0] text-lg font-bold placeholder:text-[#888] focus:outline-none focus:border-[#8b5cf6]"
              />
              <button
                onClick={handleInscrever}
                disabled={adding || !nome.trim()}
                className="flex items-center justify-center gap-2 h-14 px-6 rounded-xl bg-[#22c55e] text-[#0a0a0a] font-black text-base hover:bg-[#1ea550] active:bg-[#198a43] transition-colors disabled:opacity-50"
              >
                <UserPlus size={20} />
              </button>
            </div>
          </div>
        )}

        {/* Confirmed list */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-[#f0f0f0] font-black text-xl">CONFIRMADOS</h2>
            <span className="text-[#888] font-bold text-sm">{totalConfirmados}/{MAX_JOGADORES}</span>
          </div>

          {/* Progress */}
          <div className="w-full h-2 rounded-full bg-[#2a2a2a] mb-4 overflow-hidden">
            <div
              className={cn(
                'h-full rounded-full transition-all duration-500',
                minimoAtingido ? 'bg-[#22c55e]' : 'bg-[#eab308]'
              )}
              style={{ width: `${Math.min(100, (totalConfirmados / MAX_JOGADORES) * 100)}%` }}
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            {/* Fixed initial players */}
            {CONFIRMADOS_INICIAIS.map((playerName, i) => (
              <div
                key={`fixed-${i}`}
                className="flex items-center gap-2.5 rounded-xl bg-[#141414] border border-[#2a2a2a] px-3 py-3"
              >
                <span className="w-7 h-7 rounded-lg bg-[#22c55e]/15 text-[#22c55e] font-black text-xs flex items-center justify-center shrink-0">
                  {i + 1}
                </span>
                <span className="text-[#f0f0f0] font-bold text-sm truncate">{playerName}</span>
              </div>
            ))}

            {/* Dynamic inscricoes */}
            {inscricoes.map((insc, i) => (
              <div
                key={insc.id}
                className="flex items-center gap-2.5 rounded-xl bg-[#8b5cf6]/5 border border-[#8b5cf6]/20 px-3 py-3"
              >
                <span className="w-7 h-7 rounded-lg bg-[#8b5cf6]/15 text-[#8b5cf6] font-black text-xs flex items-center justify-center shrink-0">
                  {CONFIRMADOS_INICIAIS.length + i + 1}
                </span>
                <span className="text-[#f0f0f0] font-bold text-sm truncate flex-1">{insc.nome}</span>
                <button
                  onClick={() => handleRemover(insc.id)}
                  className="w-7 h-7 rounded-lg text-[#ef4444]/40 hover:text-[#ef4444] hover:bg-[#ef4444]/10 flex items-center justify-center transition-colors shrink-0"
                >
                  <X size={14} />
                </button>
              </div>
            ))}
          </div>

          {vagasRestantes > 0 && vagasRestantes <= 5 && (
            <p className="text-[#888] text-xs text-center mt-3">
              {vagasRestantes} vaga{vagasRestantes > 1 ? 's' : ''} restante{vagasRestantes > 1 ? 's' : ''}
            </p>
          )}

          {vagasRestantes <= 0 && (
            <div className="rounded-xl bg-[#ef4444]/10 border border-[#ef4444]/30 p-3 text-center mt-3">
              <p className="text-[#ef4444] font-bold text-sm">Mesa cheia!</p>
            </div>
          )}
        </div>

        {/* Footer links */}
        <div className="flex flex-col gap-3">
          <Link
            href="/publico/ranking"
            className="flex items-center justify-center gap-2 w-full h-12 rounded-xl bg-[#141414] border border-[#2a2a2a] text-[#888] font-bold text-sm hover:bg-[#1a1a1a] transition-colors"
          >
            <Trophy size={16} /> Ranking do Circuito
          </Link>
        </div>
      </div>
    </div>
  );
}
