'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Plus, Play, Users, DollarSign, Skull, Trophy, Search } from 'lucide-react';
import { supabase } from '@/lib/supabase-client';
import { useEvento } from '@/lib/hooks';
import { useToast } from '@/components/toast';
import { Timer } from '@/components/timer';
import { BlindDisplay } from '@/components/blind-display';
import { PlayerCard } from '@/components/player-card';
import { ProgressBar } from '@/components/progress-bar';
import { ConfirmDialog } from '@/components/confirm-dialog';
import type { Player, BlindLevel } from '@/lib/types';
import { formatMoney, cn } from '@/lib/utils';

export default function EventoAoVivoPage() {
  const params = useParams();
  const eventoId = params.id as string;
  const router = useRouter();
  const { toast } = useToast();

  const {
    evento, participacoes, loading,
    totalJogadores, totalBuyIns, totalAddons, totalArrecadado, prizePool, rake, premiacao,
    pagos, todosPagos, ativos, eliminados,
    updateStatus, addPlayer, removePlayer, addRebuy, undoRebuy,
    toggleAddon, togglePago, eliminar, reativar, definirCampeao,
    atribuirPremios, updateTimer, publicarResultado,
  } = useEvento(eventoId);

  // Add player modal
  const [showAddPlayer, setShowAddPlayer] = useState(false);
  const [availablePlayers, setAvailablePlayers] = useState<Player[]>([]);
  const [playerSearch, setPlayerSearch] = useState('');
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean; title: string; message: string; onConfirm: () => void;
  }>({ open: false, title: '', message: '', onConfirm: () => {} });

  // New player inline form
  const [showNewPlayer, setShowNewPlayer] = useState(false);
  const [newNome, setNewNome] = useState('');
  const [newApelido, setNewApelido] = useState('');

  useEffect(() => {
    if (showAddPlayer) {
      (async () => {
        const { data } = await supabase.from('players').select('*').eq('ativo', true).order('apelido');
        const ids = new Set(participacoes.map((p) => p.player_id));
        setAvailablePlayers(((data as Player[]) || []).filter((p) => !ids.has(p.id)));
      })();
    }
  }, [showAddPlayer, participacoes]);

  if (loading || !evento) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-4 border-[#8b5cf6] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const blinds = (evento.estrutura_blinds || []) as BlindLevel[];
  const currentBlind = blinds.find((b) => b.level === evento.blind_level_atual);

  async function handleTimerPause() {
    await updateTimer({ timer_rodando: false });
  }

  async function handleTimerResume() {
    await updateTimer({ timer_rodando: true });
  }

  async function handleAddMinute() {
    await updateTimer({ timer_restante_ms: (evento!.timer_restante_ms || 0) + 60000 });
  }

  async function handleSubMinute() {
    const newMs = Math.max(0, (evento!.timer_restante_ms || 0) - 60000);
    await updateTimer({ timer_restante_ms: newMs });
  }

  async function handleNextBlind() {
    const nextLevel = evento!.blind_level_atual + 1;
    const nextBlind = blinds.find((b) => b.level === nextLevel);
    if (nextBlind) {
      await updateTimer({
        blind_level_atual: nextLevel,
        timer_restante_ms: nextBlind.duracao_minutos * 60 * 1000,
        timer_rodando: true,
      });
    } else {
      toast('Ultimo blind atingido!', 'info');
      await updateTimer({ timer_rodando: false });
    }
  }

  async function handleAddExistingPlayer(playerId: string) {
    await addPlayer(playerId);
    toast('Jogador adicionado!', 'success');
    setShowAddPlayer(false);
  }

  async function handleCreateAndAdd() {
    if (!newNome.trim()) return toast('Nome obrigatorio', 'error');
    const { data: newPlayer, error } = await supabase.from('players').insert({
      nome: newNome.trim(),
      apelido: newApelido.trim() || newNome.trim(),
      pix: '',
      ativo: true,
    }).select().single();
    if (error || !newPlayer) return toast('Erro ao criar jogador', 'error');
    await addPlayer(newPlayer.id);
    toast('Jogador criado e adicionado!', 'success');
    setNewNome('');
    setNewApelido('');
    setShowNewPlayer(false);
    setShowAddPlayer(false);
  }

  async function handleIniciarTorneio() {
    const firstBlind = blinds[0];
    await updateTimer({
      timer_restante_ms: firstBlind ? firstBlind.duracao_minutos * 60 * 1000 : evento!.timer_minutos * 60 * 1000,
      timer_rodando: true,
      blind_level_atual: firstBlind ? firstBlind.level : 1,
    });
    await updateStatus('rebuys');
    toast('Torneio iniciado!', 'success');
  }

  async function handleAbrirCobranca() {
    await updateTimer({ timer_rodando: false });
    await updateStatus('cobranca');
    toast('Fase de cobranca iniciada!', 'success');
  }

  async function handleIniciarEliminacao() {
    if (!todosPagos) return toast('Todos devem pagar antes!', 'error');
    await updateTimer({ timer_rodando: true });
    await updateStatus('eliminacao');
    toast('Eliminacao iniciada!', 'success');
  }

  async function handleEliminar(participacaoId: string) {
    const p = participacoes.find((x) => x.id === participacaoId);
    if (!p) return;
    await eliminar(p);

    // Check if only 1 player remains
    const ativosRestantes = ativos.filter((x) => x.id !== participacaoId);
    if (ativosRestantes.length === 1) {
      // Champion!
      await supabase.from('participacoes').update({ colocacao: 1 }).eq('id', ativosRestantes[0].id);
      await atribuirPremios();
      toast('Campeao definido!', 'success');
    }
  }

  async function handleFinalizar() {
    await publicarResultado();
    toast('Resultado publicado e ranking atualizado!', 'success');
  }

  const filteredAvailable = availablePlayers.filter((p) => {
    const q = playerSearch.toLowerCase();
    return p.nome.toLowerCase().includes(q) || p.apelido.toLowerCase().includes(q);
  });

  // Stats bar
  function StatsBar() {
    return (
      <div className="grid grid-cols-3 gap-2 mb-4">
        <div className="rounded-xl bg-[#141414] border border-[#2a2a2a] p-3 text-center">
          <p className="text-[#888] text-[10px] font-bold uppercase">Jogadores</p>
          <p className="text-[#f0f0f0] text-2xl font-black">{totalJogadores}</p>
        </div>
        <div className="rounded-xl bg-[#141414] border border-[#2a2a2a] p-3 text-center">
          <p className="text-[#888] text-[10px] font-bold uppercase">Buy-ins</p>
          <p className="text-[#8b5cf6] text-2xl font-black">{totalBuyIns}</p>
        </div>
        <div className="rounded-xl bg-[#141414] border border-[#2a2a2a] p-3 text-center">
          <p className="text-[#888] text-[10px] font-bold uppercase">Prize Pool</p>
          <p className="text-[#22c55e] text-2xl font-black">{formatMoney(prizePool)}</p>
        </div>
      </div>
    );
  }

  // Add player overlay
  function AddPlayerOverlay() {
    if (!showAddPlayer) return null;
    return (
      <div className="fixed inset-0 z-50 bg-[#0a0a0a]/95 flex flex-col">
        <div className="flex items-center gap-3 p-4 border-b border-[#2a2a2a]">
          <button onClick={() => setShowAddPlayer(false)} className="text-[#888]">
            <ArrowLeft size={24} />
          </button>
          <h2 className="text-xl font-black text-[#f0f0f0]">Adicionar Jogador</h2>
        </div>

        <div className="p-4">
          <div className="relative mb-4">
            <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#888]" />
            <input
              type="text"
              placeholder="Buscar..."
              value={playerSearch}
              onChange={(e) => setPlayerSearch(e.target.value)}
              className="w-full h-14 pl-12 pr-4 rounded-xl bg-[#141414] border border-[#2a2a2a] text-[#f0f0f0] text-lg placeholder:text-[#888] focus:outline-none focus:border-[#8b5cf6]"
            />
          </div>

          {/* New player inline */}
          {showNewPlayer ? (
            <div className="rounded-xl bg-[#141414] border border-[#8b5cf6]/30 p-4 mb-4">
              <input
                type="text"
                placeholder="Nome"
                value={newNome}
                onChange={(e) => setNewNome(e.target.value)}
                className="w-full h-12 px-4 rounded-xl bg-[#1e1e1e] border border-[#2a2a2a] text-[#f0f0f0] text-lg font-bold placeholder:text-[#888] focus:outline-none focus:border-[#8b5cf6] mb-2"
              />
              <input
                type="text"
                placeholder="Apelido (opcional)"
                value={newApelido}
                onChange={(e) => setNewApelido(e.target.value)}
                className="w-full h-12 px-4 rounded-xl bg-[#1e1e1e] border border-[#2a2a2a] text-[#f0f0f0] text-lg font-bold placeholder:text-[#888] focus:outline-none focus:border-[#8b5cf6] mb-3"
              />
              <div className="flex gap-2">
                <button onClick={handleCreateAndAdd} className="flex-1 h-14 rounded-xl bg-[#22c55e] text-[#0a0a0a] font-bold text-lg">
                  CRIAR E ADICIONAR
                </button>
                <button onClick={() => setShowNewPlayer(false)} className="w-14 h-14 rounded-xl bg-[#2a2a2a] text-[#888] flex items-center justify-center">
                  X
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setShowNewPlayer(true)}
              className="flex items-center justify-center gap-2 w-full h-14 rounded-xl bg-[#8b5cf6]/10 border border-[#8b5cf6]/30 text-[#8b5cf6] font-bold text-base mb-4"
            >
              <Plus size={20} /> NOVO JOGADOR
            </button>
          )}

          <div className="flex flex-col gap-2 max-h-[60vh] overflow-y-auto">
            {filteredAvailable.map((player) => (
              <button
                key={player.id}
                onClick={() => handleAddExistingPlayer(player.id)}
                className="flex items-center gap-3 rounded-xl bg-[#141414] border border-[#2a2a2a] p-4 min-h-[56px] hover:bg-[#1a1a1a] text-left"
              >
                <span className="text-[#f0f0f0] font-bold text-lg">{player.apelido}</span>
                {player.apelido !== player.nome && (
                  <span className="text-[#888] text-xs">{player.nome}</span>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-2">
        <Link href="/gerente" className="text-[#888]">
          <ArrowLeft size={24} />
        </Link>
        <div className="flex-1 min-w-0">
          <h1 className="text-xl font-black text-[#f0f0f0] truncate">{evento.nome}</h1>
          <p className="text-[#888] text-xs">
            {new Date(evento.data + 'T12:00:00').toLocaleDateString('pt-BR')} — {evento.status.toUpperCase()}
          </p>
        </div>
      </div>

      <StatsBar />

      {/* FASE 1 - CADASTRO */}
      {evento.status === 'cadastro' && (
        <div>
          <button
            onClick={() => setShowAddPlayer(true)}
            className="flex items-center justify-center gap-2 w-full min-h-[64px] rounded-xl bg-[#8b5cf6] text-white font-black text-lg mb-4"
          >
            <Plus size={24} /> JOGADOR
          </button>

          <div className="flex flex-col gap-2 mb-4">
            {participacoes.map((p) => (
              <PlayerCard
                key={p.id}
                participacao={p}
                variant="cadastro"
                onRemove={() => {
                  setConfirmDialog({
                    open: true,
                    title: 'Remover jogador',
                    message: `Remover ${p.player?.apelido || 'jogador'}?`,
                    onConfirm: async () => {
                      await removePlayer(p.id);
                      setConfirmDialog((prev) => ({ ...prev, open: false }));
                    },
                  });
                }}
              />
            ))}
          </div>

          {participacoes.length >= 2 && (
            <button
              onClick={handleIniciarTorneio}
              className="flex items-center justify-center gap-2 w-full min-h-[64px] rounded-xl bg-[#22c55e] text-[#0a0a0a] font-black text-xl"
            >
              <Play size={24} /> INICIAR TORNEIO
            </button>
          )}
        </div>
      )}

      {/* FASE 2 - REBUYS */}
      {evento.status === 'rebuys' && (
        <div>
          {/* Timer + Blinds */}
          <div className="mb-6">
            <Timer
              restanteMs={evento.timer_restante_ms || 0}
              rodando={evento.timer_rodando}
              onPause={handleTimerPause}
              onResume={handleTimerResume}
              onAddMinute={handleAddMinute}
              onSubMinute={handleSubMinute}
              onNextBlind={handleNextBlind}
            />
            <div className="mt-4">
              <BlindDisplay blinds={blinds} currentLevel={evento.blind_level_atual} />
            </div>
          </div>

          {/* Add late player */}
          <button
            onClick={() => setShowAddPlayer(true)}
            className="flex items-center justify-center gap-2 w-full h-12 rounded-xl bg-[#141414] border border-[#2a2a2a] text-[#888] font-bold text-sm mb-4"
          >
            <Plus size={16} /> Adicionar jogador atrasado
          </button>

          <div className="flex flex-col gap-2 mb-4">
            {participacoes.map((p) => (
              <PlayerCard
                key={p.id}
                participacao={p}
                variant="rebuy"
                onRebuy={() => addRebuy(p)}
              />
            ))}
          </div>

          <button
            onClick={handleAbrirCobranca}
            className="flex items-center justify-center gap-2 w-full min-h-[64px] rounded-xl bg-[#eab308] text-[#0a0a0a] font-black text-xl"
          >
            <DollarSign size={24} /> ABRIR ADDON / COBRANCA
          </button>
        </div>
      )}

      {/* FASE 3 - COBRANCA */}
      {evento.status === 'cobranca' && (
        <div>
          <div className="rounded-xl bg-[#eab308]/10 border border-[#eab308]/30 p-4 mb-4 text-center">
            <p className="text-[#eab308] text-2xl font-black">HORA DE ACERTAR</p>
            {evento.pix_banco && (
              <p className="text-[#f0f0f0] text-sm mt-2 font-mono break-all">
                Pix: {evento.pix_banco}
              </p>
            )}
          </div>

          <ProgressBar current={pagos} total={totalJogadores} label="Pagamentos" />

          <div className="flex flex-col gap-2 mt-4 mb-4">
            {/* Pendentes primeiro */}
            {participacoes
              .sort((a, b) => Number(a.pago) - Number(b.pago))
              .map((p) => (
                <PlayerCard
                  key={p.id}
                  participacao={p}
                  variant="cobranca"
                  onTogglePago={() => togglePago(p)}
                  onToggleAddon={() => toggleAddon(p)}
                />
              ))}
          </div>

          {todosPagos && (
            <button
              onClick={handleIniciarEliminacao}
              className="flex items-center justify-center gap-2 w-full min-h-[64px] rounded-xl bg-[#22c55e] text-[#0a0a0a] font-black text-xl"
            >
              <Skull size={24} /> INICIAR ELIMINACAO
            </button>
          )}

          {!todosPagos && (
            <div className="rounded-xl bg-[#ef4444]/10 border border-[#ef4444]/30 p-4 text-center">
              <p className="text-[#ef4444] font-bold text-sm">
                {totalJogadores - pagos} jogador(es) pendente(s). Todos devem pagar para continuar.
              </p>
            </div>
          )}
        </div>
      )}

      {/* FASE 4 - ELIMINACAO */}
      {evento.status === 'eliminacao' && (
        <div>
          <div className="mb-6">
            <Timer
              restanteMs={evento.timer_restante_ms || 0}
              rodando={evento.timer_rodando}
              onPause={handleTimerPause}
              onResume={handleTimerResume}
              onAddMinute={handleAddMinute}
              onSubMinute={handleSubMinute}
              onNextBlind={handleNextBlind}
            />
            <div className="mt-4">
              <BlindDisplay blinds={blinds} currentLevel={evento.blind_level_atual} />
            </div>
          </div>

          {/* ITM info */}
          {premiacao.length > 0 && (
            <div className="rounded-xl bg-[#22c55e]/10 border border-[#22c55e]/30 p-3 mb-4 text-center">
              <p className="text-[#22c55e] font-bold text-sm">
                Premios: {premiacao.map((v, i) => `${i + 1}o ${formatMoney(v)}`).join(' | ')}
              </p>
              {ativos.length <= premiacao.length && (
                <p className="text-[#eab308] font-black text-lg mt-1 animate-pulse">
                  BOLHA ITM! {ativos.length} restantes
                </p>
              )}
            </div>
          )}

          <div className="mb-2">
            <p className="text-[#888] text-xs font-bold uppercase mb-2">
              Ativos ({ativos.length})
            </p>
            <div className="flex flex-col gap-2">
              {ativos.map((p) => (
                <PlayerCard
                  key={p.id}
                  participacao={p}
                  variant="eliminacao"
                  onEliminar={() => handleEliminar(p.id)}
                />
              ))}
            </div>
          </div>

          {eliminados.length > 0 && (
            <div className="mt-4">
              <p className="text-[#888] text-xs font-bold uppercase mb-2">
                Eliminados ({eliminados.length})
              </p>
              <div className="flex flex-col gap-2">
                {eliminados.map((p) => (
                  <PlayerCard
                    key={p.id}
                    participacao={p}
                    variant="eliminacao"
                  />
                ))}
              </div>
            </div>
          )}

          {/* Auto-finish when 1 player remains */}
          {ativos.length <= 1 && participacoes.some((p) => p.colocacao === 1) && (
            <button
              onClick={handleFinalizar}
              className="flex items-center justify-center gap-2 w-full min-h-[64px] rounded-xl bg-[#22c55e] text-[#0a0a0a] font-black text-xl mt-4"
            >
              <Trophy size={24} /> PUBLICAR RESULTADO
            </button>
          )}
        </div>
      )}

      {/* FASE 5 - FINALIZADO */}
      {evento.status === 'finalizado' && (
        <div>
          <div className="rounded-xl bg-[#eab308]/10 border border-[#eab308]/30 p-6 mb-6 text-center">
            <Trophy size={48} className="text-[#eab308] mx-auto mb-2" />
            <p className="text-[#eab308] text-3xl font-black">
              {participacoes.find((p) => p.colocacao === 1)?.player?.apelido || 'CAMPEAO'}
            </p>
            <p className="text-[#888] text-sm mt-1">Campeao</p>
          </div>

          <div className="flex flex-col gap-2 mb-6">
            {participacoes
              .filter((p) => p.colocacao !== null)
              .sort((a, b) => (a.colocacao || 99) - (b.colocacao || 99))
              .map((p) => (
                <PlayerCard key={p.id} participacao={p} variant="resultado" />
              ))}
          </div>

          {/* Financial summary */}
          <div className="rounded-xl bg-[#141414] border border-[#2a2a2a] p-4">
            <h3 className="text-[#f0f0f0] font-bold text-lg mb-3">Resumo Financeiro</h3>
            <div className="flex flex-col gap-2 text-sm">
              <div className="flex justify-between">
                <span className="text-[#888]">Total arrecadado</span>
                <span className="text-[#f0f0f0] font-bold">{formatMoney(totalArrecadado)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#888]">Rake ({evento.rake_percent}%)</span>
                <span className="text-[#eab308] font-bold">{formatMoney(rake)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#888]">Prize Pool</span>
                <span className="text-[#22c55e] font-bold">{formatMoney(prizePool)}</span>
              </div>
              <hr className="border-[#2a2a2a]" />
              {premiacao.map((v, i) => (
                <div key={i} className="flex justify-between">
                  <span className="text-[#888]">{i + 1}o lugar</span>
                  <span className="text-[#f0f0f0] font-bold">{formatMoney(v)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <AddPlayerOverlay />

      <ConfirmDialog
        open={confirmDialog.open}
        title={confirmDialog.title}
        message={confirmDialog.message}
        onConfirm={confirmDialog.onConfirm}
        onCancel={() => setConfirmDialog((prev) => ({ ...prev, open: false }))}
      />
    </div>
  );
}
