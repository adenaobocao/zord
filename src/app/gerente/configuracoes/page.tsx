'use client';

import { useEffect, useState } from 'react';
import { Save, Plus, Trash2 } from 'lucide-react';
import { supabase } from '@/lib/supabase-client';
import { useToast } from '@/components/toast';
import type { BlindLevel, ConfigGerente } from '@/lib/types';

export default function ConfiguracoesPage() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [configId, setConfigId] = useState<string>('');
  const [nomeBanco, setNomeBanco] = useState('');
  const [pixBanco, setPixBanco] = useState('');
  const [buyInPadrao, setBuyInPadrao] = useState(50);
  const [rebuyPadrao, setRebuyPadrao] = useState(50);
  const [addonPadrao, setAddonPadrao] = useState(50);
  const [rakeValorPadrao, setRakeValorPadrao] = useState(10);
  const [tabelaPontos, setTabelaPontos] = useState('1:100,2:70,3:50,4:40,5:30,6:25,7:20,8:15,9:10');
  const [premiacao, setPremiacao] = useState('50,30,20');
  const [blinds, setBlinds] = useState<BlindLevel[]>([]);

  useEffect(() => {
    async function load() {
      const { data } = await supabase.from('config_gerente').select('*').limit(1).single();
      if (data) {
        const config = data as ConfigGerente;
        setConfigId(config.id);
        setNomeBanco(config.nome_banco);
        setPixBanco(config.pix_banco);
        setBuyInPadrao(config.buy_in_padrao);
        setRebuyPadrao(config.rebuy_padrao);
        setAddonPadrao(config.addon_padrao);
        setRakeValorPadrao(config.rake_valor_padrao ?? config.rake_padrao ?? 10);

        // Parse tabela pontos
        const tp = config.tabela_pontos as Record<string, number>;
        setTabelaPontos(
          Object.entries(tp)
            .sort(([a], [b]) => Number(a) - Number(b))
            .map(([k, v]) => `${k}:${v}`)
            .join(',')
        );

        // Parse premiacao
        const prem = config.estrutura_premiacao_padrao as number[];
        setPremiacao(prem.join(','));

        // Parse blinds
        const bl = config.estrutura_blinds_padrao as BlindLevel[];
        setBlinds(bl);
      }
      setLoading(false);
    }
    load();
  }, []);

  async function handleSave() {
    setSaving(true);

    // Parse tabela pontos back to object
    const tp: Record<string, number> = {};
    tabelaPontos.split(',').forEach((pair) => {
      const [k, v] = pair.split(':').map((s) => s.trim());
      if (k && v) tp[k] = Number(v);
    });

    // Parse premiacao
    const prem = premiacao.split(',').map((s) => Number(s.trim())).filter((n) => !isNaN(n) && n > 0);

    const { error } = await supabase.from('config_gerente').update({
      nome_banco: nomeBanco,
      pix_banco: pixBanco,
      buy_in_padrao: buyInPadrao,
      rebuy_padrao: rebuyPadrao,
      addon_padrao: addonPadrao,
      rake_valor_padrao: rakeValorPadrao,
      tabela_pontos: tp,
      estrutura_premiacao_padrao: prem,
      estrutura_blinds_padrao: blinds,
    }).eq('id', configId);

    if (error) {
      toast('Erro ao salvar', 'error');
    } else {
      toast('Configuracoes salvas!', 'success');
    }
    setSaving(false);
  }

  function updateBlind(index: number, field: keyof BlindLevel, value: number) {
    setBlinds((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
  }

  function addBlind() {
    const last = blinds[blinds.length - 1];
    setBlinds((prev) => [...prev, {
      level: (last?.level || 0) + 1,
      small_blind: (last?.small_blind || 100) * 2,
      big_blind: (last?.big_blind || 200) * 2,
      ante: last?.ante || 0,
      duracao_minutos: last?.duracao_minutos || 15,
    }]);
  }

  function removeBlind(index: number) {
    setBlinds((prev) => prev.filter((_, i) => i !== index));
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-4 border-[#8b5cf6] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-black text-[#f0f0f0] mb-6">Configuracoes</h1>

      <div className="flex flex-col gap-6">
        {/* Dados do banco */}
        <section className="rounded-xl bg-[#141414] border border-[#2a2a2a] p-4">
          <h2 className="text-[#f0f0f0] font-bold text-lg mb-3">Dados do Banco</h2>
          <div className="flex flex-col gap-3">
            <div>
              <label className="text-[#888] text-xs font-bold uppercase mb-1 block">Nome</label>
              <input
                type="text"
                value={nomeBanco}
                onChange={(e) => setNomeBanco(e.target.value)}
                placeholder="Seu nome"
                className="w-full h-14 px-4 rounded-xl bg-[#1e1e1e] border border-[#2a2a2a] text-[#f0f0f0] text-lg font-bold placeholder:text-[#888] focus:outline-none focus:border-[#8b5cf6]"
              />
            </div>
            <div>
              <label className="text-[#888] text-xs font-bold uppercase mb-1 block">Chave Pix</label>
              <input
                type="text"
                value={pixBanco}
                onChange={(e) => setPixBanco(e.target.value)}
                placeholder="Sua chave Pix"
                className="w-full h-14 px-4 rounded-xl bg-[#1e1e1e] border border-[#2a2a2a] text-[#f0f0f0] text-lg font-bold placeholder:text-[#888] focus:outline-none focus:border-[#8b5cf6]"
              />
            </div>
          </div>
        </section>

        {/* Valores padrao */}
        <section className="rounded-xl bg-[#141414] border border-[#2a2a2a] p-4">
          <h2 className="text-[#f0f0f0] font-bold text-lg mb-3">Valores Padrao</h2>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[#888] text-xs font-bold uppercase mb-1 block">Buy-in (R$)</label>
              <input type="number" value={buyInPadrao} onChange={(e) => setBuyInPadrao(Number(e.target.value))}
                className="w-full h-14 px-4 rounded-xl bg-[#1e1e1e] border border-[#2a2a2a] text-[#f0f0f0] text-lg font-bold focus:outline-none focus:border-[#8b5cf6]" />
            </div>
            <div>
              <label className="text-[#888] text-xs font-bold uppercase mb-1 block">Rebuy (R$)</label>
              <input type="number" value={rebuyPadrao} onChange={(e) => setRebuyPadrao(Number(e.target.value))}
                className="w-full h-14 px-4 rounded-xl bg-[#1e1e1e] border border-[#2a2a2a] text-[#f0f0f0] text-lg font-bold focus:outline-none focus:border-[#8b5cf6]" />
            </div>
            <div>
              <label className="text-[#888] text-xs font-bold uppercase mb-1 block">Addon (R$)</label>
              <input type="number" value={addonPadrao} onChange={(e) => setAddonPadrao(Number(e.target.value))}
                className="w-full h-14 px-4 rounded-xl bg-[#1e1e1e] border border-[#2a2a2a] text-[#f0f0f0] text-lg font-bold focus:outline-none focus:border-[#8b5cf6]" />
            </div>
            <div>
              <label className="text-[#888] text-xs font-bold uppercase mb-1 block">Rake por buy-in (R$)</label>
              <input type="number" value={rakeValorPadrao} onChange={(e) => setRakeValorPadrao(Number(e.target.value))}
                className="w-full h-14 px-4 rounded-xl bg-[#1e1e1e] border border-[#2a2a2a] text-[#f0f0f0] text-lg font-bold focus:outline-none focus:border-[#8b5cf6]" />
            </div>
          </div>
        </section>

        {/* Premiacao */}
        <section className="rounded-xl bg-[#141414] border border-[#2a2a2a] p-4">
          <h2 className="text-[#f0f0f0] font-bold text-lg mb-3">Estrutura de Premiacao</h2>
          <label className="text-[#888] text-xs font-bold mb-1 block">% por colocacao (ex: 50,30,20)</label>
          <input
            type="text"
            value={premiacao}
            onChange={(e) => setPremiacao(e.target.value)}
            className="w-full h-14 px-4 rounded-xl bg-[#1e1e1e] border border-[#2a2a2a] text-[#f0f0f0] text-lg font-bold focus:outline-none focus:border-[#8b5cf6]"
          />
        </section>

        {/* Tabela de pontos */}
        <section className="rounded-xl bg-[#141414] border border-[#2a2a2a] p-4">
          <h2 className="text-[#f0f0f0] font-bold text-lg mb-3">Tabela de Pontos</h2>
          <label className="text-[#888] text-xs font-bold mb-1 block">
            colocacao:pontos (ex: 1:100,2:70,3:50...)
          </label>
          <input
            type="text"
            value={tabelaPontos}
            onChange={(e) => setTabelaPontos(e.target.value)}
            className="w-full h-14 px-4 rounded-xl bg-[#1e1e1e] border border-[#2a2a2a] text-[#f0f0f0] text-lg font-bold font-mono focus:outline-none focus:border-[#8b5cf6]"
          />
        </section>

        {/* Estrutura de Blinds */}
        <section className="rounded-xl bg-[#141414] border border-[#2a2a2a] p-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-[#f0f0f0] font-bold text-lg">Estrutura de Blinds</h2>
            <button onClick={addBlind} className="flex items-center gap-1 px-3 py-2 rounded-lg bg-[#8b5cf6] text-white text-sm font-bold">
              <Plus size={16} /> Nivel
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-[#888] text-xs uppercase">
                  <th className="text-left py-2 px-2">Lvl</th>
                  <th className="text-left py-2 px-2">SB</th>
                  <th className="text-left py-2 px-2">BB</th>
                  <th className="text-left py-2 px-2">Ante</th>
                  <th className="text-left py-2 px-2">Min</th>
                  <th className="py-2 px-2"></th>
                </tr>
              </thead>
              <tbody>
                {blinds.map((blind, i) => (
                  <tr key={i} className="border-t border-[#2a2a2a]">
                    <td className="py-2 px-2 text-[#888] font-bold">{blind.level}</td>
                    <td className="py-2 px-2">
                      <input type="number" value={blind.small_blind} onChange={(e) => updateBlind(i, 'small_blind', Number(e.target.value))}
                        className="w-16 h-10 px-2 rounded-lg bg-[#1e1e1e] border border-[#2a2a2a] text-[#f0f0f0] font-bold text-sm focus:outline-none focus:border-[#8b5cf6]" />
                    </td>
                    <td className="py-2 px-2">
                      <input type="number" value={blind.big_blind} onChange={(e) => updateBlind(i, 'big_blind', Number(e.target.value))}
                        className="w-16 h-10 px-2 rounded-lg bg-[#1e1e1e] border border-[#2a2a2a] text-[#f0f0f0] font-bold text-sm focus:outline-none focus:border-[#8b5cf6]" />
                    </td>
                    <td className="py-2 px-2">
                      <input type="number" value={blind.ante} onChange={(e) => updateBlind(i, 'ante', Number(e.target.value))}
                        className="w-16 h-10 px-2 rounded-lg bg-[#1e1e1e] border border-[#2a2a2a] text-[#f0f0f0] font-bold text-sm focus:outline-none focus:border-[#8b5cf6]" />
                    </td>
                    <td className="py-2 px-2">
                      <input type="number" value={blind.duracao_minutos} onChange={(e) => updateBlind(i, 'duracao_minutos', Number(e.target.value))}
                        className="w-14 h-10 px-2 rounded-lg bg-[#1e1e1e] border border-[#2a2a2a] text-[#f0f0f0] font-bold text-sm focus:outline-none focus:border-[#8b5cf6]" />
                    </td>
                    <td className="py-2 px-2">
                      <button onClick={() => removeBlind(i)} className="text-[#ef4444] hover:bg-[#ef4444]/10 rounded-lg p-2">
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center justify-center gap-2 min-h-[64px] rounded-xl bg-[#22c55e] text-[#0a0a0a] font-black text-xl hover:bg-[#1ea550] transition-colors disabled:opacity-50"
        >
          <Save size={24} />
          {saving ? 'SALVANDO...' : 'SALVAR CONFIGURACOES'}
        </button>
      </div>
    </div>
  );
}
