'use client';

import { Trash2, Plus, CircleDollarSign, Trophy, X, Coffee } from 'lucide-react';
import type { Participacao } from '@/lib/types';
import { formatMoney, cn } from '@/lib/utils';

type PlayerCardVariant = 'cadastro' | 'rebuy' | 'cobranca' | 'eliminacao' | 'resultado';

interface PlayerCardBaseProps {
  participacao: Participacao;
  variant: PlayerCardVariant;
}

interface CadastroProps extends PlayerCardBaseProps {
  variant: 'cadastro';
  onRemove?: () => void;
}

interface RebuyProps extends PlayerCardBaseProps {
  variant: 'rebuy';
  onRebuy?: () => void;
}

interface CobrancaProps extends PlayerCardBaseProps {
  variant: 'cobranca';
  onTogglePago?: () => void;
  onToggleAddon?: () => void;
}

interface EliminacaoProps extends PlayerCardBaseProps {
  variant: 'eliminacao';
  onEliminar?: () => void;
}

interface ResultadoProps extends PlayerCardBaseProps {
  variant: 'resultado';
}

type PlayerCardProps =
  | CadastroProps
  | RebuyProps
  | CobrancaProps
  | EliminacaoProps
  | ResultadoProps;

function PlayerName({ participacao }: { participacao: Participacao }) {
  const player = participacao.player;
  if (!player) return <span className="text-[#888]">Jogador desconhecido</span>;

  return (
    <div className="flex flex-col min-w-0">
      <span className="text-[#f0f0f0] font-black text-lg truncate">
        {player.apelido || player.nome}
      </span>
      {player.apelido && player.nome !== player.apelido && (
        <span className="text-[#888] text-xs truncate">{player.nome}</span>
      )}
    </div>
  );
}

function CadastroCard({ participacao, onRemove }: CadastroProps) {
  return (
    <div className="flex items-center gap-3 rounded-xl bg-[#141414] border border-[#2a2a2a] p-4 min-h-[56px]">
      <PlayerName participacao={participacao} />
      <div className="ml-auto shrink-0">
        {onRemove && (
          <button
            onClick={onRemove}
            className="flex items-center justify-center w-[56px] h-[56px] rounded-xl bg-[#ef4444]/10 text-[#ef4444] hover:bg-[#ef4444]/20 active:bg-[#ef4444]/30 transition-colors"
            aria-label="Remover jogador"
          >
            <Trash2 size={22} />
          </button>
        )}
      </div>
    </div>
  );
}

function RebuyCard({ participacao, onRebuy }: RebuyProps) {
  return (
    <div className="flex items-center gap-3 rounded-xl bg-[#141414] border border-[#2a2a2a] p-4 min-h-[56px]">
      <PlayerName participacao={participacao} />

      <div className="ml-auto flex items-center gap-3 shrink-0">
        <span className="inline-flex items-center justify-center min-w-[36px] h-9 rounded-lg bg-[#8b5cf6]/15 text-[#8b5cf6] font-black text-base px-2 tabular-nums">
          {participacao.buy_ins}x
        </span>

        {onRebuy && (
          <button
            onClick={onRebuy}
            className="flex items-center justify-center w-[56px] h-[56px] rounded-xl bg-[#8b5cf6] text-white font-bold hover:bg-[#7c3aed] active:bg-[#6d28d9] transition-colors"
            aria-label="Adicionar rebuy"
          >
            <Plus size={24} />
          </button>
        )}
      </div>
    </div>
  );
}

function CobrancaCard({ participacao, onTogglePago, onToggleAddon }: CobrancaProps) {
  const isPago = participacao.pago;

  return (
    <div
      className={cn(
        'flex items-center gap-3 rounded-xl border p-4 min-h-[56px] transition-colors',
        isPago
          ? 'bg-[#22c55e]/5 border-[#22c55e]/30'
          : 'bg-[#141414] border-[#2a2a2a]'
      )}
    >
      <PlayerName participacao={participacao} />

      <div className="ml-auto flex items-center gap-2 shrink-0">
        {onToggleAddon && (
          <button
            onClick={onToggleAddon}
            className={cn(
              'flex items-center justify-center w-[48px] h-[48px] rounded-xl transition-colors',
              participacao.addon
                ? 'bg-[#eab308]/15 text-[#eab308]'
                : 'bg-[#2a2a2a] text-[#888] hover:bg-[#333]'
            )}
            aria-label={participacao.addon ? 'Remover addon' : 'Adicionar addon'}
            title="Addon"
          >
            <Coffee size={20} />
          </button>
        )}

        <span className="text-[#f0f0f0] font-bold text-sm tabular-nums whitespace-nowrap">
          {formatMoney(participacao.total_devido)}
        </span>

        {onTogglePago && (
          <button
            onClick={onTogglePago}
            className={cn(
              'flex items-center justify-center min-w-[90px] h-[56px] rounded-xl font-bold text-sm transition-colors',
              isPago
                ? 'bg-[#22c55e] text-[#0a0a0a] hover:bg-[#1ea550]'
                : 'bg-[#ef4444]/10 text-[#ef4444] hover:bg-[#ef4444]/20'
            )}
          >
            <CircleDollarSign size={18} className="mr-1.5" />
            {isPago ? 'PAGO' : 'PENDENTE'}
          </button>
        )}
      </div>
    </div>
  );
}

function EliminacaoCard({ participacao, onEliminar }: EliminacaoProps) {
  const isEliminado = participacao.eliminado;

  return (
    <div
      className={cn(
        'flex items-center gap-3 rounded-xl border p-4 min-h-[56px] transition-colors',
        isEliminado
          ? 'bg-[#ef4444]/5 border-[#ef4444]/30 opacity-60'
          : 'bg-[#141414] border-[#2a2a2a]'
      )}
    >
      <PlayerName participacao={participacao} />

      <div className="ml-auto flex items-center gap-3 shrink-0">
        <span className="text-[#888] text-sm font-bold tabular-nums">
          {participacao.buy_ins}x buy-in
        </span>

        {isEliminado && participacao.colocacao !== null && (
          <span className="inline-flex items-center justify-center min-w-[40px] h-9 rounded-lg bg-[#eab308]/15 text-[#eab308] font-black text-base px-2">
            #{participacao.colocacao}
          </span>
        )}

        {!isEliminado && onEliminar && (
          <button
            onClick={onEliminar}
            className="flex items-center justify-center w-[56px] h-[56px] rounded-xl bg-[#ef4444] text-white font-bold hover:bg-[#dc2626] active:bg-[#b91c1c] transition-colors"
            aria-label="Eliminar jogador"
          >
            <X size={24} />
          </button>
        )}
      </div>
    </div>
  );
}

function ResultadoCard({ participacao }: ResultadoProps) {
  const colocacao = participacao.colocacao;
  const premio = participacao.premio;

  const medalColor =
    colocacao === 1
      ? 'text-[#eab308] bg-[#eab308]/15'
      : colocacao === 2
        ? 'text-[#888] bg-[#888]/15'
        : colocacao === 3
          ? 'text-[#cd7f32] bg-[#cd7f32]/15'
          : 'text-[#888] bg-[#2a2a2a]';

  return (
    <div className="flex items-center gap-3 rounded-xl bg-[#141414] border border-[#2a2a2a] p-4 min-h-[56px]">
      {colocacao !== null && (
        <span
          className={cn(
            'inline-flex items-center justify-center w-10 h-10 rounded-lg font-black text-lg shrink-0',
            medalColor
          )}
        >
          {colocacao}
        </span>
      )}

      <PlayerName participacao={participacao} />

      <div className="ml-auto flex items-center gap-2 shrink-0">
        {colocacao !== null && colocacao <= 3 && (
          <Trophy
            size={20}
            className={
              colocacao === 1
                ? 'text-[#eab308]'
                : colocacao === 2
                  ? 'text-[#888]'
                  : 'text-[#cd7f32]'
            }
          />
        )}
        {premio !== null && premio > 0 && (
          <span className="text-[#22c55e] font-black text-lg tabular-nums">
            {formatMoney(premio)}
          </span>
        )}
      </div>
    </div>
  );
}

export function PlayerCard(props: PlayerCardProps) {
  switch (props.variant) {
    case 'cadastro':
      return <CadastroCard {...props} />;
    case 'rebuy':
      return <RebuyCard {...props} />;
    case 'cobranca':
      return <CobrancaCard {...props} />;
    case 'eliminacao':
      return <EliminacaoCard {...props} />;
    case 'resultado':
      return <ResultadoCard {...props} />;
  }
}
