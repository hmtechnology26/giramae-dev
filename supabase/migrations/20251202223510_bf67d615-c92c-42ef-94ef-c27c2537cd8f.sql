-- =====================================================
-- SISTEMA DE JORNADAS GAMIFICADAS
-- =====================================================

-- 1. Tabela de definições de jornadas
CREATE TABLE IF NOT EXISTS jornadas_definicoes (
  id TEXT PRIMARY KEY,
  titulo TEXT NOT NULL,
  descricao TEXT NOT NULL,
  icone TEXT DEFAULT '🎯',
  tipo TEXT DEFAULT 'tour' CHECK (tipo IN ('tour', 'acao', 'sequencia')),
  categoria TEXT DEFAULT 'geral',
  recompensa_girinhas INTEGER DEFAULT 1,
  ordem INTEGER DEFAULT 0,
  rota_destino TEXT,
  tour_id TEXT,
  acao_validacao TEXT,
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Progresso do usuário nas jornadas
CREATE TABLE IF NOT EXISTS jornadas_progresso (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  jornada_id TEXT NOT NULL REFERENCES jornadas_definicoes(id) ON DELETE CASCADE,
  concluida BOOLEAN DEFAULT false,
  data_conclusao TIMESTAMPTZ,
  recompensa_coletada BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, jornada_id)
);

-- 3. Adicionar coluna no profiles para toggle
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS jornada_ativa BOOLEAN DEFAULT true;

-- 4. Índices para performance
CREATE INDEX IF NOT EXISTS idx_jornadas_progresso_user ON jornadas_progresso(user_id);
CREATE INDEX IF NOT EXISTS idx_jornadas_progresso_jornada ON jornadas_progresso(jornada_id);
CREATE INDEX IF NOT EXISTS idx_jornadas_definicoes_ordem ON jornadas_definicoes(ordem);

-- 5. RLS para jornadas_definicoes (leitura pública)
ALTER TABLE jornadas_definicoes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Jornadas visíveis para todos autenticados"
ON jornadas_definicoes FOR SELECT
TO authenticated
USING (ativo = true);

-- 6. RLS para jornadas_progresso (usuário só vê o próprio)
ALTER TABLE jornadas_progresso ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuário vê próprio progresso"
ON jornadas_progresso FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Usuário insere próprio progresso"
ON jornadas_progresso FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuário atualiza próprio progresso"
ON jornadas_progresso FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

-- 7. Inserir tipo de transação para bônus de jornada
INSERT INTO transacao_config (
  tipo, sinal, descricao_pt, icone, cor_hex, 
  ativo, validade_dias, valor_padrao, categoria, ordem_exibicao
) VALUES (
  'bonus_jornada',
  1,
  'Jornada concluída',
  '🗺️',
  '#EC4899',
  true,
  30,
  1,
  'bonus',
  25
) ON CONFLICT (tipo) DO NOTHING;

-- 8. Função para concluir jornada e dar recompensa
CREATE OR REPLACE FUNCTION concluir_jornada(
  p_user_id UUID,
  p_jornada_id TEXT
) RETURNS JSONB AS $$
DECLARE
  v_jornada RECORD;
  v_progresso RECORD;
  v_transacao_id UUID;
BEGIN
  -- Buscar definição da jornada
  SELECT * INTO v_jornada 
  FROM jornadas_definicoes 
  WHERE id = p_jornada_id AND ativo = true;
  
  IF NOT FOUND THEN
    RETURN jsonb_build_object('sucesso', false, 'erro', 'Jornada não encontrada');
  END IF;
  
  -- Verificar se já coletou recompensa
  SELECT * INTO v_progresso 
  FROM jornadas_progresso 
  WHERE user_id = p_user_id AND jornada_id = p_jornada_id;
  
  IF v_progresso.recompensa_coletada = true THEN
    RETURN jsonb_build_object('sucesso', false, 'erro', 'Recompensa já coletada');
  END IF;
  
  -- Criar ou atualizar progresso
  INSERT INTO jornadas_progresso (user_id, jornada_id, concluida, data_conclusao, recompensa_coletada)
  VALUES (p_user_id, p_jornada_id, true, NOW(), true)
  ON CONFLICT (user_id, jornada_id) 
  DO UPDATE SET 
    concluida = true, 
    data_conclusao = NOW(),
    recompensa_coletada = true;
  
  -- Dar recompensa via ledger
  v_transacao_id := ledger_processar_bonus(
    p_user_id,
    'bonus_jornada',
    v_jornada.recompensa_girinhas,
    'Jornada: ' || v_jornada.titulo
  );
  
  RETURN jsonb_build_object(
    'sucesso', true,
    'recompensa', v_jornada.recompensa_girinhas,
    'titulo', v_jornada.titulo,
    'icone', v_jornada.icone,
    'transacao_id', v_transacao_id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 9. Função para marcar progresso sem recompensa (para tracking)
CREATE OR REPLACE FUNCTION marcar_progresso_jornada(
  p_user_id UUID,
  p_jornada_id TEXT
) RETURNS BOOLEAN AS $$
BEGIN
  INSERT INTO jornadas_progresso (user_id, jornada_id, concluida, data_conclusao)
  VALUES (p_user_id, p_jornada_id, true, NOW())
  ON CONFLICT (user_id, jornada_id) 
  DO UPDATE SET 
    concluida = true, 
    data_conclusao = COALESCE(jornadas_progresso.data_conclusao, NOW());
  
  RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 10. Inserir jornadas iniciais
INSERT INTO jornadas_definicoes (id, titulo, descricao, icone, tipo, categoria, ordem, rota_destino, tour_id) VALUES
-- Tours guiados
('tour-feed', 'Conhecer o Feed', 'Aprenda a navegar pelo feed de itens', '🏠', 'tour', 'tours', 1, '/feed', 'feed-tour'),
('tour-carteira', 'Explorar a Carteira', 'Descubra como funcionam suas Girinhas', '💰', 'tour', 'tours', 2, '/carteira', 'carteira-tour'),
('tour-reservas', 'Entender Reservas', 'Saiba como gerenciar suas trocas', '📦', 'tour', 'tours', 3, '/reservas', 'reservas-tour'),

-- Ações de engajamento - Favoritos
('acao-favorito', 'Favoritar um Item', 'Adicione um item aos seus favoritos', '❤️', 'acao', 'favoritos', 10, '/feed', NULL),
('acao-ver-favoritos', 'Ver Favoritos', 'Acesse sua lista de favoritos', '📋', 'acao', 'favoritos', 11, '/favoritos', NULL),

-- Ações de engajamento - Social
('acao-seguir-mae', 'Seguir uma Mãe', 'Siga uma mãe da comunidade', '👥', 'acao', 'social', 12, '/feed', NULL),
('acao-ver-seguidas', 'Ver Mães Seguidas', 'Acesse suas mães favoritas', '👀', 'acao', 'social', 13, '/maes-seguidas', NULL),

-- Ações de engajamento - Girinhas
('acao-bonus-diario', 'Coletar Bônus Diário', 'Colete seu primeiro bônus diário', '🎁', 'acao', 'girinhas', 20, '/carteira', NULL),
('acao-indicacoes', 'Conhecer Indicações', 'Veja como indicar amigas', '📢', 'acao', 'girinhas', 21, '/indicacoes', NULL),

-- Ações de engajamento - Publicação
('acao-publicar-item', 'Publicar um Item', 'Publique seu primeiro item', '📸', 'acao', 'publicacao', 30, '/publicar', NULL),
('acao-missoes', 'Conhecer Missões', 'Explore as missões disponíveis', '🎯', 'acao', 'publicacao', 31, '/missoes', NULL),

-- Ações de engajamento - Perfil
('acao-completar-perfil', 'Completar Perfil', 'Adicione foto e informações', '✨', 'acao', 'perfil', 40, '/perfil/editar', NULL)
ON CONFLICT (id) DO NOTHING;