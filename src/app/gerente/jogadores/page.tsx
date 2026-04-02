'use client';

import { useEffect, useState } from 'react';
import { Plus, Search, Edit2, UserCheck, UserX, Eye, EyeOff, Save, X } from 'lucide-react';
import { supabase } from '@/lib/supabase-client';
import { useToast } from '@/components/toast';
import type { Player } from '@/lib/types';

export default function JogadoresPage() {
  const { toast } = useToast();
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [revealPix, setRevealPix] = useState<Set<string>>(new Set());

  // Form state
  const [formNome, setFormNome] = useState('');
  const [formApelido, setFormApelido] = useState('');
  const [formPix, setFormPix] = useState('');

  async function load() {
    const { data } = await supabase
      .from('players')
      .select('*')
      .order('nome');
    setPlayers((data as Player[]) || []);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  function resetForm() {
    setFormNome('');
    setFormApelido('');
    setFormPix('');
    setShowForm(false);
    setEditingId(null);
  }

  async function handleCreate() {
    if (!formNome.trim()) return toast('Nome obrigatorio', 'error');
    const { error } = await supabase.from('players').insert({
      nome: formNome.trim(),
      apelido: formApelido.trim() || formNome.trim(),
      pix: formPix.trim(),
      ativo: true,
    });
    if (error) return toast('Erro ao criar jogador', 'error');
    toast('Jogador criado!', 'success');
    resetForm();
    load();
  }

  async function handleUpdate(id: string) {
    if (!formNome.trim()) return toast('Nome obrigatorio', 'error');
    const { error } = await supabase.from('players').update({
      nome: formNome.trim(),
      apelido: formApelido.trim() || formNome.trim(),
      pix: formPix.trim(),
    }).eq('id', id);
    if (error) return toast('Erro ao atualizar', 'error');
    toast('Jogador atualizado!', 'success');
    resetForm();
    load();
  }

  async function toggleAtivo(player: Player) {
    await supabase.from('players').update({ ativo: !player.ativo }).eq('id', player.id);
    toast(player.ativo ? 'Jogador desativado' : 'Jogador ativado', 'success');
    load();
  }

  function startEdit(player: Player) {
    setEditingId(player.id);
    setFormNome(player.nome);
    setFormApelido(player.apelido);
    setFormPix(player.pix);
    setShowForm(false);
  }

  function togglePixVisibility(id: string) {
    setRevealPix((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }

  const filtered = players.filter((p) => {
    const q = search.toLowerCase();
    return p.nome.toLowerCase().includes(q) || p.apelido.toLowerCase().includes(q);
  });

  const ativos = filtered.filter((p) => p.ativo);
  const inativos = filtered.filter((p) => !p.ativo);

  function PlayerForm({ isEdit, playerId }: { isEdit: boolean; playerId?: string }) {
    return (
      <div className="rounded-xl bg-[#141414] border border-[#8b5cf6]/30 p-4 mb-4">
        <div className="flex flex-col gap-3">
          <input
            type="text"
            placeholder="Nome completo"
            value={formNome}
            onChange={(e) => setFormNome(e.target.value)}
            className="w-full h-14 px-4 rounded-xl bg-[#1e1e1e] border border-[#2a2a2a] text-[#f0f0f0] text-lg font-bold placeholder:text-[#888] focus:outline-none focus:border-[#8b5cf6]"
          />
          <input
            type="text"
            placeholder="Apelido (exibido no app)"
            value={formApelido}
            onChange={(e) => setFormApelido(e.target.value)}
            className="w-full h-14 px-4 rounded-xl bg-[#1e1e1e] border border-[#2a2a2a] text-[#f0f0f0] text-lg font-bold placeholder:text-[#888] focus:outline-none focus:border-[#8b5cf6]"
          />
          <input
            type="text"
            placeholder="Chave Pix (tel, email, cpf...)"
            value={formPix}
            onChange={(e) => setFormPix(e.target.value)}
            className="w-full h-14 px-4 rounded-xl bg-[#1e1e1e] border border-[#2a2a2a] text-[#f0f0f0] text-lg font-bold placeholder:text-[#888] focus:outline-none focus:border-[#8b5cf6]"
          />
          <div className="flex gap-3">
            <button
              onClick={isEdit ? () => handleUpdate(playerId!) : handleCreate}
              className="flex-1 flex items-center justify-center gap-2 min-h-[56px] rounded-xl bg-[#22c55e] text-[#0a0a0a] font-bold text-lg hover:bg-[#1ea550] transition-colors"
            >
              <Save size={20} />
              {isEdit ? 'SALVAR' : 'CRIAR'}
            </button>
            <button
              onClick={resetForm}
              className="flex items-center justify-center min-w-[56px] min-h-[56px] rounded-xl bg-[#2a2a2a] text-[#888] hover:bg-[#333] transition-colors"
            >
              <X size={24} />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-black text-[#f0f0f0]">Jogadores</h1>
        <button
          onClick={() => { resetForm(); setShowForm(true); }}
          className="flex items-center gap-2 min-h-[56px] px-6 rounded-xl bg-[#8b5cf6] text-white font-bold text-base hover:bg-[#7c3aed] transition-colors"
        >
          <Plus size={20} />
          NOVO
        </button>
      </div>

      {/* Search */}
      <div className="relative mb-4">
        <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#888]" />
        <input
          type="text"
          placeholder="Buscar jogador..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full h-14 pl-12 pr-4 rounded-xl bg-[#141414] border border-[#2a2a2a] text-[#f0f0f0] text-lg placeholder:text-[#888] focus:outline-none focus:border-[#8b5cf6]"
        />
      </div>

      {showForm && <PlayerForm isEdit={false} />}

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-4 border-[#8b5cf6] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <>
          <div className="flex flex-col gap-2">
            {ativos.map((player) => (
              <div key={player.id}>
                {editingId === player.id ? (
                  <PlayerForm isEdit={true} playerId={player.id} />
                ) : (
                  <div className="flex items-center gap-3 rounded-xl bg-[#141414] border border-[#2a2a2a] p-4">
                    <div className="flex-1 min-w-0">
                      <p className="text-[#f0f0f0] font-bold text-lg truncate">{player.apelido}</p>
                      {player.apelido !== player.nome && (
                        <p className="text-[#888] text-xs truncate">{player.nome}</p>
                      )}
                      {revealPix.has(player.id) && player.pix && (
                        <p className="text-[#8b5cf6] text-xs mt-1 font-mono">{player.pix}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      {player.pix && (
                        <button
                          onClick={() => togglePixVisibility(player.id)}
                          className="flex items-center justify-center w-11 h-11 rounded-lg text-[#888] hover:bg-[#1e1e1e] transition-colors"
                        >
                          {revealPix.has(player.id) ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                      )}
                      <button
                        onClick={() => startEdit(player)}
                        className="flex items-center justify-center w-11 h-11 rounded-lg text-[#888] hover:bg-[#1e1e1e] transition-colors"
                      >
                        <Edit2 size={18} />
                      </button>
                      <button
                        onClick={() => toggleAtivo(player)}
                        className="flex items-center justify-center w-11 h-11 rounded-lg text-[#22c55e] hover:bg-[#22c55e]/10 transition-colors"
                      >
                        <UserCheck size={18} />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {inativos.length > 0 && (
            <div className="mt-8">
              <h2 className="text-[#888] text-sm font-bold uppercase tracking-wider mb-3">
                Inativos ({inativos.length})
              </h2>
              <div className="flex flex-col gap-2">
                {inativos.map((player) => (
                  <div
                    key={player.id}
                    className="flex items-center gap-3 rounded-xl bg-[#141414] border border-[#2a2a2a] p-4 opacity-50"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-[#888] font-bold text-lg truncate">{player.apelido}</p>
                    </div>
                    <button
                      onClick={() => toggleAtivo(player)}
                      className="flex items-center justify-center w-11 h-11 rounded-lg text-[#888] hover:bg-[#1e1e1e] transition-colors"
                    >
                      <UserX size={18} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
