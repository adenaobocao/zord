-- Players
CREATE TABLE players (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL,
  apelido TEXT NOT NULL,
  pix TEXT NOT NULL DEFAULT '',
  ativo BOOLEAN NOT NULL DEFAULT true,
  criado_em TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Eventos
CREATE TABLE eventos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL,
  data DATE NOT NULL DEFAULT CURRENT_DATE,
  buy_in NUMERIC NOT NULL DEFAULT 50,
  rebuy_valor NUMERIC NOT NULL DEFAULT 50,
  addon_valor NUMERIC NOT NULL DEFAULT 50,
  rake_percent NUMERIC NOT NULL DEFAULT 10,
  status TEXT NOT NULL DEFAULT 'cadastro' CHECK (status IN ('cadastro', 'rebuys', 'cobranca', 'eliminacao', 'finalizado')),
  timer_minutos INTEGER NOT NULL DEFAULT 15,
  timer_restante_ms BIGINT,
  timer_rodando BOOLEAN NOT NULL DEFAULT false,
  blind_level_atual INTEGER NOT NULL DEFAULT 0,
  estrutura_blinds JSONB NOT NULL DEFAULT '[]',
  estrutura_premiacao JSONB NOT NULL DEFAULT '[50, 30, 20]',
  pix_banco TEXT NOT NULL DEFAULT '',
  criado_em TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Participacoes
CREATE TABLE participacoes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  evento_id UUID NOT NULL REFERENCES eventos(id) ON DELETE CASCADE,
  player_id UUID NOT NULL REFERENCES players(id) ON DELETE CASCADE,
  buy_ins INTEGER NOT NULL DEFAULT 1,
  addon BOOLEAN NOT NULL DEFAULT false,
  total_devido NUMERIC NOT NULL DEFAULT 0,
  pago BOOLEAN NOT NULL DEFAULT false,
  pago_em TIMESTAMPTZ,
  colocacao INTEGER,
  premio NUMERIC,
  eliminado BOOLEAN NOT NULL DEFAULT false,
  criado_em TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(evento_id, player_id)
);

-- Pontuacao
CREATE TABLE pontuacao (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id UUID NOT NULL REFERENCES players(id) ON DELETE CASCADE,
  evento_id UUID NOT NULL REFERENCES eventos(id) ON DELETE CASCADE,
  colocacao INTEGER NOT NULL,
  pontos INTEGER NOT NULL DEFAULT 0,
  UNIQUE(evento_id, player_id)
);

-- Config Gerente
CREATE TABLE config_gerente (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome_banco TEXT NOT NULL DEFAULT '',
  pix_banco TEXT NOT NULL DEFAULT '',
  buy_in_padrao NUMERIC NOT NULL DEFAULT 50,
  rebuy_padrao NUMERIC NOT NULL DEFAULT 50,
  addon_padrao NUMERIC NOT NULL DEFAULT 50,
  rake_padrao NUMERIC NOT NULL DEFAULT 10,
  tabela_pontos JSONB NOT NULL DEFAULT '{"1":100,"2":70,"3":50,"4":40,"5":30,"6":25,"7":20,"8":15,"9":10}',
  estrutura_premiacao_padrao JSONB NOT NULL DEFAULT '[50, 30, 20]',
  estrutura_blinds_padrao JSONB NOT NULL DEFAULT '[
    {"level":1,"small_blind":25,"big_blind":50,"ante":0,"duracao_minutos":15},
    {"level":2,"small_blind":50,"big_blind":100,"ante":0,"duracao_minutos":15},
    {"level":3,"small_blind":75,"big_blind":150,"ante":0,"duracao_minutos":15},
    {"level":4,"small_blind":100,"big_blind":200,"ante":25,"duracao_minutos":15},
    {"level":5,"small_blind":150,"big_blind":300,"ante":25,"duracao_minutos":15},
    {"level":6,"small_blind":200,"big_blind":400,"ante":50,"duracao_minutos":15},
    {"level":7,"small_blind":300,"big_blind":600,"ante":75,"duracao_minutos":15},
    {"level":8,"small_blind":400,"big_blind":800,"ante":100,"duracao_minutos":15},
    {"level":9,"small_blind":500,"big_blind":1000,"ante":100,"duracao_minutos":15},
    {"level":10,"small_blind":600,"big_blind":1200,"ante":200,"duracao_minutos":15}
  ]'
);

-- Enable Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE eventos;
ALTER PUBLICATION supabase_realtime ADD TABLE participacoes;
ALTER PUBLICATION supabase_realtime ADD TABLE pontuacao;

-- RLS (Row Level Security) - leitura publica, escrita autenticada
ALTER TABLE players ENABLE ROW LEVEL SECURITY;
ALTER TABLE eventos ENABLE ROW LEVEL SECURITY;
ALTER TABLE participacoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE pontuacao ENABLE ROW LEVEL SECURITY;
ALTER TABLE config_gerente ENABLE ROW LEVEL SECURITY;

-- Policies de leitura publica
CREATE POLICY "Leitura publica players" ON players FOR SELECT USING (true);
CREATE POLICY "Leitura publica eventos" ON eventos FOR SELECT USING (true);
CREATE POLICY "Leitura publica participacoes" ON participacoes FOR SELECT USING (true);
CREATE POLICY "Leitura publica pontuacao" ON pontuacao FOR SELECT USING (true);

-- Policies de escrita (autenticado)
CREATE POLICY "Gerente modifica players" ON players FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Gerente modifica eventos" ON eventos FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Gerente modifica participacoes" ON participacoes FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Gerente modifica pontuacao" ON pontuacao FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Gerente modifica config" ON config_gerente FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Leitura config" ON config_gerente FOR SELECT USING (true);

-- Insert default config
INSERT INTO config_gerente (nome_banco, pix_banco) VALUES ('', '');
