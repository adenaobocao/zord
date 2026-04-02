'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Save } from 'lucide-react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase-client';
import { useToast } from '@/components/toast';
import type { Player, BlindLevel } from '@/lib/types';

const DEFAULT_BLINDS: BlindLevel[] = [
  { level: 1, small_blind: 25, big_blind: 50, ante: 0, duracao_minutos: 15 },
  { level: 2, small_blind: 50, big_blind: 100, ante: 0, duracao_minutos: 15 },
  { level: 3, small_blind: 75, big_blind: 150, ante: 0, duracao_minutos: 15 },
  { level: 4, small_blind: 100, big_blind: 200, ante: 25, duracao_minutos: 15 },
  { level: 5, small_blind: 150, big_blind: 300, ante: 25, duracao_minutos: 15 },
  { level: 6, small_blind: 200, big_blind: 400, ante: 50, duracao_minutos: 15 },
  { level: 7, small_blind: 300, big_blind: 600, ante: 75, duracao_minutos: 15 },
  { level: 8, small_blind: 400, big_blind: 800, ante: 100, duracao_minutos: 15 },
  { level: 9, small_blind: 500, big_blind: 1000, ante: 100, duracao_minutos: 15 },
  { level: 10, small_blind: 600, big_blind: 1200, ante: 200, duracao_minutos: 15 },
];

export default function NovoEventoPage() {
  const router = useRouter();
  const { toast } = useToast();

  const [nome, setNome] = useState('');
  const [data, setData] = useState(new Date().toISOString().split('T')[0]);
  const [buyIn, setBuyIn] = useState(50);
  const [rebuyValor, setRebuyValor] = useState(50);
  const [addonValor, setAddonValor] = useState(50);
  const [rakeValor, setRakeValor] = useState(10);
  const [timerMinutos, setTimerMinutos] = useState(15);
  const [pixBanco, setPixBanco] = useState('');
  const [premiacao, setPremiacao] = useState([50, 30, 20]);

  const [players, setPlayers] = useState<Player[]>([]);
  const [selectedPlayers, setSelectedPlayers] = useState<Set<string>>(new Set());
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function load() {
      // Load config defaults
      const { data: config } = await supabase.from('config_gerente').select('*').limit(1).single();
      if (config) {
        setBuyIn(config.buy_in_padrao);
        setRebuyValor(config.rebuy_padrao);
        setAddonValor(config.addon_padrao);
        setRakeValor(config.rake_valor_padrao ?? config.rake_padrao ?? 10);
        setPixBanco(config.pix_banco);
        if (Array.isArray(config.estrutura_premiacao_padrao)) {
          setPremiacao(config.estrutura_premiacao_padrao as number[]);
        }
      }
      // Load players
      const { data: playersData } = await supabase
        .from('players')
        .select('*')
        .eq('ativo', true)
        .order('apelido');
      setPlayers((playersData as Player[]) || []);
    }
    load();
  }, []);

  function togglePlayer(id: string) {
    setSelectedPlayers((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }

  async function handleCreate() {
    if (!nome.trim()) return toast('Nome do evento obrigatorio', 'error');
    if (selectedPlayers.size === 0) return toast('Selecione pelo menos 1 jogador', 'error');

    setSaving(true);
    const { data: evento, error } = await supabase.from('eventos').insert({
      nome: nome.trim(),
      data,
      buy_in: buyIn,
      rebuy_valor: rebuyValor,
      addon_valor: addonValor,
      rake_valor: rakeValor,
      rake_percent: 0,
      status: 'cadastro' as const,
      timer_minutos: timerMinutos,
      timer_restante_ms: timerMinutos * 60 * 1000,
      timer_rodando: false,
      blind_level_atual: 1,
      estrutura_blinds: DEFAULT_BLINDS,
      estrutura_premiacao: premiacao,
      pix_banco: pixBanco,
    }).select().single();

    if (error || !evento) {
      toast('Erro ao criar evento', 'error');
      setSaving(false);
      return;
    }

    // Create participacoes for selected players
    const participacoes = Array.from(selectedPlayers).map((playerId) => ({
      evento_id: evento.id,
      player_id: playerId,
      buy_ins: 1,
      addon: false,
      total_devido: buyIn,
      pago: false,
      eliminado: false,
    }));

    const { error: pError } = await supabase.from('participacoes').insert(participacoes);
    if (pError) {
      toast('Erro ao adicionar jogadores', 'error');
      setSaving(false);
      return;
    }

    toast('Evento criado!', 'success');
    router.push(`/gerente/evento/${evento.id}`);
  }

  return (
    <div className="p-4 md:p-6 max-w-2xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <Link
          href="/gerente"
          className="flex items-center justify-center w-11 h-11 rounded-lg text-[#888] hover:bg-[#141414] transition-colors"
        >
          <ArrowLeft size={24} />
        </Link>
        <h1 className="text-2xl font-black text-[#f0f0f0]">Novo Evento</h1>
      </div>

      <div className="flex flex-col gap-4">
        <input
          type="text"
          placeholder='Nome (ex: "Zord #42 — Sexta Especial")'
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          className="w-full h-14 px-4 rounded-xl bg-[#141414] border border-[#2a2a2a] text-[#f0f0f0] text-lg font-bold placeholder:text-[#888] focus:outline-none focus:border-[#8b5cf6]"
        />

        <input
          type="date"
          value={data}
          onChange={(e) => setData(e.target.value)}
          className="w-full h-14 px-4 rounded-xl bg-[#141414] border border-[#2a2a2a] text-[#f0f0f0] text-lg font-bold focus:outline-none focus:border-[#8b5cf6]"
        />

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-[#888] text-xs font-bold uppercase mb-1 block">Buy-in (R$)</label>
            <input
              type="number"
              value={buyIn}
              onChange={(e) => setBuyIn(Number(e.target.value))}
              className="w-full h-14 px-4 rounded-xl bg-[#141414] border border-[#2a2a2a] text-[#f0f0f0] text-lg font-bold focus:outline-none focus:border-[#8b5cf6]"
            />
          </div>
          <div>
            <label className="text-[#888] text-xs font-bold uppercase mb-1 block">Rebuy (R$)</label>
            <input
              type="number"
              value={rebuyValor}
              onChange={(e) => setRebuyValor(Number(e.target.value))}
              className="w-full h-14 px-4 rounded-xl bg-[#141414] border border-[#2a2a2a] text-[#f0f0f0] text-lg font-bold focus:outline-none focus:border-[#8b5cf6]"
            />
          </div>
          <div>
            <label className="text-[#888] text-xs font-bold uppercase mb-1 block">Addon (R$)</label>
            <input
              type="number"
              value={addonValor}
              onChange={(e) => setAddonValor(Number(e.target.value))}
              className="w-full h-14 px-4 rounded-xl bg-[#141414] border border-[#2a2a2a] text-[#f0f0f0] text-lg font-bold focus:outline-none focus:border-[#8b5cf6]"
            />
          </div>
          <div>
            <label className="text-[#888] text-xs font-bold uppercase mb-1 block">Rake por buy-in (R$)</label>
            <input
              type="number"
              value={rakeValor}
              onChange={(e) => setRakeValor(Number(e.target.value))}
              className="w-full h-14 px-4 rounded-xl bg-[#141414] border border-[#2a2a2a] text-[#f0f0f0] text-lg font-bold focus:outline-none focus:border-[#8b5cf6]"
            />
          </div>
        </div>

        <div>
          <label className="text-[#888] text-xs font-bold uppercase mb-1 block">Timer por blind (min)</label>
          <input
            type="number"
            value={timerMinutos}
            onChange={(e) => setTimerMinutos(Number(e.target.value))}
            className="w-full h-14 px-4 rounded-xl bg-[#141414] border border-[#2a2a2a] text-[#f0f0f0] text-lg font-bold focus:outline-none focus:border-[#8b5cf6]"
          />
        </div>

        <div>
          <label className="text-[#888] text-xs font-bold uppercase mb-1 block">Chave Pix do banco</label>
          <input
            type="text"
            value={pixBanco}
            onChange={(e) => setPixBanco(e.target.value)}
            placeholder="Chave Pix para receber pagamentos"
            className="w-full h-14 px-4 rounded-xl bg-[#141414] border border-[#2a2a2a] text-[#f0f0f0] text-lg font-bold placeholder:text-[#888] focus:outline-none focus:border-[#8b5cf6]"
          />
        </div>

        <div>
          <label className="text-[#888] text-xs font-bold uppercase mb-1 block">
            Premiacao (% separados por virgula, ex: 50,30,20)
          </label>
          <input
            type="text"
            value={premiacao.join(',')}
            onChange={(e) => {
              const parts = e.target.value.split(',').map((s) => Number(s.trim())).filter((n) => !isNaN(n) && n > 0);
              if (parts.length > 0) setPremiacao(parts);
            }}
            className="w-full h-14 px-4 rounded-xl bg-[#141414] border border-[#2a2a2a] text-[#f0f0f0] text-lg font-bold focus:outline-none focus:border-[#8b5cf6]"
          />
        </div>

        {/* Player selection */}
        <div>
          <label className="text-[#888] text-xs font-bold uppercase mb-2 block">
            Jogadores ({selectedPlayers.size} selecionados)
          </label>
          <div className="flex flex-col gap-2">
            {players.map((player) => {
              const selected = selectedPlayers.has(player.id);
              return (
                <button
                  key={player.id}
                  onClick={() => togglePlayer(player.id)}
                  className={`flex items-center gap-3 rounded-xl border p-4 min-h-[56px] transition-colors text-left ${
                    selected
                      ? 'bg-[#8b5cf6]/10 border-[#8b5cf6]/30'
                      : 'bg-[#141414] border-[#2a2a2a] hover:bg-[#1a1a1a]'
                  }`}
                >
                  <div className={`w-6 h-6 rounded-md border-2 flex items-center justify-center transition-colors ${
                    selected ? 'bg-[#8b5cf6] border-[#8b5cf6]' : 'border-[#2a2a2a]'
                  }`}>
                    {selected && <span className="text-white text-xs font-black">V</span>}
                  </div>
                  <span className="text-[#f0f0f0] font-bold text-lg">{player.apelido}</span>
                  {player.apelido !== player.nome && (
                    <span className="text-[#888] text-xs">{player.nome}</span>
                  )}
                </button>
              );
            })}
            {players.length === 0 && (
              <p className="text-[#888] text-sm py-4 text-center">
                Nenhum jogador cadastrado. Cadastre jogadores primeiro.
              </p>
            )}
          </div>
        </div>

        <button
          onClick={handleCreate}
          disabled={saving}
          className="flex items-center justify-center gap-2 min-h-[64px] rounded-xl bg-[#22c55e] text-[#0a0a0a] font-black text-xl hover:bg-[#1ea550] active:bg-[#198a43] transition-colors disabled:opacity-50"
        >
          <Save size={24} />
          {saving ? 'CRIANDO...' : 'CRIAR EVENTO'}
        </button>
      </div>
    </div>
  );
}
