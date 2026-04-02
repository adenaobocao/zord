'use client';

import { useEffect, useState, useCallback } from 'react';
import { supabase } from './supabase-client';
import type { Evento, Participacao, Player } from './types';
import { calcTotalDevido, calcPrizePool, calcPremiacao } from './utils';

export function useEvento(eventoId: string) {
  const [evento, setEvento] = useState<Evento | null>(null);
  const [participacoes, setParticipacoes] = useState<Participacao[]>([]);
  const [loading, setLoading] = useState(true);

  const loadEvento = useCallback(async () => {
    const { data } = await supabase.from('eventos').select('*').eq('id', eventoId).single();
    if (data) setEvento(data as Evento);
  }, [eventoId]);

  const loadParticipacoes = useCallback(async () => {
    const { data } = await supabase
      .from('participacoes')
      .select('*, player:players(*)')
      .eq('evento_id', eventoId)
      .order('criado_em');
    if (data) setParticipacoes(data as Participacao[]);
  }, [eventoId]);

  const load = useCallback(async () => {
    await Promise.all([loadEvento(), loadParticipacoes()]);
    setLoading(false);
  }, [loadEvento, loadParticipacoes]);

  // Initial load
  useEffect(() => { load(); }, [load]);

  // Realtime subscriptions
  useEffect(() => {
    const channel = supabase
      .channel(`evento-${eventoId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'eventos', filter: `id=eq.${eventoId}` }, () => {
        loadEvento();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'participacoes', filter: `evento_id=eq.${eventoId}` }, () => {
        loadParticipacoes();
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [eventoId, loadEvento, loadParticipacoes]);

  // Computed values
  const totalJogadores = participacoes.length;
  const totalBuyIns = participacoes.reduce((acc, p) => acc + p.buy_ins, 0);
  const totalAddons = participacoes.filter((p) => p.addon).length;
  const totalArrecadado = participacoes.reduce((acc, p) => acc + p.total_devido, 0);
  const prizePool = evento ? calcPrizePool(totalArrecadado, evento.rake_percent) : 0;
  const rake = totalArrecadado - prizePool;
  const premiacao = evento ? calcPremiacao(prizePool, evento.estrutura_premiacao as number[]) : [];
  const pagos = participacoes.filter((p) => p.pago).length;
  const todosPagos = pagos === totalJogadores && totalJogadores > 0;
  const ativos = participacoes.filter((p) => !p.eliminado);
  const eliminados = participacoes.filter((p) => p.eliminado).sort((a, b) => (b.colocacao || 0) - (a.colocacao || 0));

  // Actions
  async function updateStatus(status: Evento['status']) {
    await supabase.from('eventos').update({ status }).eq('id', eventoId);
  }

  async function addPlayer(playerId: string) {
    if (!evento) return;
    await supabase.from('participacoes').insert({
      evento_id: eventoId,
      player_id: playerId,
      buy_ins: 1,
      addon: false,
      total_devido: evento.buy_in,
      pago: false,
      eliminado: false,
    });
  }

  async function removePlayer(participacaoId: string) {
    await supabase.from('participacoes').delete().eq('id', participacaoId);
  }

  async function addRebuy(participacao: Participacao) {
    if (!evento) return;
    const newBuyIns = participacao.buy_ins + 1;
    const newTotal = calcTotalDevido(newBuyIns, evento.rebuy_valor, participacao.addon, evento.addon_valor, evento.buy_in);
    await supabase.from('participacoes').update({
      buy_ins: newBuyIns,
      total_devido: newTotal,
    }).eq('id', participacao.id);
  }

  async function undoRebuy(participacao: Participacao) {
    if (!evento || participacao.buy_ins <= 1) return;
    const newBuyIns = participacao.buy_ins - 1;
    const newTotal = calcTotalDevido(newBuyIns, evento.rebuy_valor, participacao.addon, evento.addon_valor, evento.buy_in);
    await supabase.from('participacoes').update({
      buy_ins: newBuyIns,
      total_devido: newTotal,
    }).eq('id', participacao.id);
  }

  async function toggleAddon(participacao: Participacao) {
    if (!evento) return;
    const newAddon = !participacao.addon;
    const newTotal = calcTotalDevido(participacao.buy_ins, evento.rebuy_valor, newAddon, evento.addon_valor, evento.buy_in);
    await supabase.from('participacoes').update({
      addon: newAddon,
      total_devido: newTotal,
    }).eq('id', participacao.id);
  }

  async function togglePago(participacao: Participacao) {
    const newPago = !participacao.pago;
    await supabase.from('participacoes').update({
      pago: newPago,
      pago_em: newPago ? new Date().toISOString() : null,
    }).eq('id', participacao.id);
  }

  async function eliminar(participacao: Participacao) {
    const ativosAtual = participacoes.filter((p) => !p.eliminado);
    const colocacao = ativosAtual.length; // last active gets highest position number
    await supabase.from('participacoes').update({
      eliminado: true,
      colocacao,
    }).eq('id', participacao.id);
  }

  async function reativar(participacao: Participacao) {
    await supabase.from('participacoes').update({
      eliminado: false,
      colocacao: null,
    }).eq('id', participacao.id);
  }

  async function definirCampeao() {
    // The last active player is the champion
    const ativosAtual = participacoes.filter((p) => !p.eliminado);
    if (ativosAtual.length === 1) {
      await supabase.from('participacoes').update({
        eliminado: false,
        colocacao: 1,
      }).eq('id', ativosAtual[0].id);
    }
  }

  async function atribuirPremios() {
    if (!evento) return;
    const premiacaoList = calcPremiacao(prizePool, evento.estrutura_premiacao as number[]);
    const ordenados = [...participacoes]
      .filter((p) => p.colocacao !== null)
      .sort((a, b) => (a.colocacao || 99) - (b.colocacao || 99));

    for (let i = 0; i < ordenados.length; i++) {
      const premio = i < premiacaoList.length ? premiacaoList[i] : 0;
      await supabase.from('participacoes').update({ premio }).eq('id', ordenados[i].id);
    }
  }

  async function marcarPremioPago(participacaoId: string) {
    // We reuse the pago field for premio payment tracking in finalizado phase
    // Actually let's just track it client-side or add a field. For now, toast only.
  }

  async function updateTimer(updates: Partial<Pick<Evento, 'timer_restante_ms' | 'timer_rodando' | 'blind_level_atual'>>) {
    await supabase.from('eventos').update(updates).eq('id', eventoId);
  }

  async function publicarResultado() {
    if (!evento) return;
    // Calculate points for each player
    const { data: config } = await supabase.from('config_gerente').select('*').limit(1).single();
    const tabela = (config?.tabela_pontos as Record<string, number>) || {};

    const comColocacao = participacoes.filter((p) => p.colocacao !== null);
    for (const p of comColocacao) {
      const key = String(p.colocacao);
      const pontos = tabela[key] || tabela['9'] || 10;
      await supabase.from('pontuacao').upsert({
        player_id: p.player_id,
        evento_id: eventoId,
        colocacao: p.colocacao!,
        pontos,
      }, { onConflict: 'evento_id,player_id' });
    }

    await updateStatus('finalizado');
  }

  return {
    evento, participacoes, loading,
    totalJogadores, totalBuyIns, totalAddons, totalArrecadado, prizePool, rake, premiacao,
    pagos, todosPagos, ativos, eliminados,
    updateStatus, addPlayer, removePlayer, addRebuy, undoRebuy,
    toggleAddon, togglePago, eliminar, reativar, definirCampeao,
    atribuirPremios, updateTimer, publicarResultado, load,
  };
}
