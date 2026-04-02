export type EventoStatus = 'cadastro' | 'rebuys' | 'cobranca' | 'eliminacao' | 'finalizado';

export interface Player {
  id: string;
  nome: string;
  apelido: string;
  pix: string;
  ativo: boolean;
  criado_em: string;
}

export interface Evento {
  id: string;
  nome: string;
  data: string;
  buy_in: number;
  rebuy_valor: number;
  addon_valor: number;
  rake_percent: number;
  status: EventoStatus;
  timer_minutos: number;
  timer_restante_ms: number | null;
  timer_rodando: boolean;
  blind_level_atual: number;
  estrutura_blinds: BlindLevel[];
  estrutura_premiacao: number[];
  pix_banco: string;
  criado_em: string;
}

export interface Participacao {
  id: string;
  evento_id: string;
  player_id: string;
  buy_ins: number;
  addon: boolean;
  total_devido: number;
  pago: boolean;
  pago_em: string | null;
  colocacao: number | null;
  premio: number | null;
  eliminado: boolean;
  criado_em: string;
  player?: Player;
}

export interface Pontuacao {
  id: string;
  player_id: string;
  evento_id: string;
  colocacao: number;
  pontos: number;
  player?: Player;
  evento?: Evento;
}

export interface BlindLevel {
  level: number;
  small_blind: number;
  big_blind: number;
  ante: number;
  duracao_minutos: number;
}

export interface ConfigGerente {
  id: string;
  nome_banco: string;
  pix_banco: string;
  buy_in_padrao: number;
  rebuy_padrao: number;
  addon_padrao: number;
  rake_padrao: number;
  tabela_pontos: Record<string, number>;
  estrutura_premiacao_padrao: number[];
  estrutura_blinds_padrao: BlindLevel[];
}

export interface Database {
  public: {
    Tables: {
      players: {
        Row: Player;
        Insert: Record<string, unknown>;
        Update: Record<string, unknown>;
      };
      eventos: {
        Row: Evento;
        Insert: Record<string, unknown>;
        Update: Record<string, unknown>;
      };
      participacoes: {
        Row: Participacao;
        Insert: Record<string, unknown>;
        Update: Record<string, unknown>;
      };
      pontuacao: {
        Row: Pontuacao;
        Insert: Record<string, unknown>;
        Update: Record<string, unknown>;
      };
      config_gerente: {
        Row: ConfigGerente;
        Insert: Record<string, unknown>;
        Update: Record<string, unknown>;
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
  };
}
