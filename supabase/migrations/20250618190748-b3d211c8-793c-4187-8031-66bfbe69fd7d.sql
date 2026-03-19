
-- Fase 1: Criar tabelas do sistema de cotação
CREATE TABLE cotacao_girinhas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cotacao_atual DECIMAL(10,4) NOT NULL DEFAULT 1.0000,
  volume_24h INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Histórico de cotações
CREATE TABLE historico_cotacao (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cotacao DECIMAL(10,4) NOT NULL,
  volume_periodo INTEGER DEFAULT 0,
  evento TEXT, -- 'compra', 'queima', 'transferencia'
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Sistema de Transferências P2P
CREATE TABLE transferencias_girinhas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  remetente_id UUID REFERENCES profiles(id),
  destinatario_id UUID REFERENCES profiles(id),
  quantidade DECIMAL(10,2) NOT NULL,
  taxa_cobrada DECIMAL(10,2) DEFAULT 0,
  status TEXT DEFAULT 'concluida', -- 'pendente', 'concluida', 'cancelada'
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Sistema de Queima
CREATE TABLE queimas_girinhas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id),
  quantidade DECIMAL(10,2) NOT NULL,
  motivo TEXT, -- 'transacao', 'transferencia', 'expiracao'
  transacao_id UUID, -- referência opcional
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Modificações no banco atual
ALTER TABLE transacoes 
ADD COLUMN IF NOT EXISTS cotacao_utilizada DECIMAL(10,4),
ADD COLUMN IF NOT EXISTS quantidade_girinhas DECIMAL(10,2);

ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS ultimo_calculo_cotacao TIMESTAMPTZ;

-- Configurações do sistema
CREATE TABLE config_sistema (
  chave TEXT PRIMARY KEY,
  valor JSONB
);

-- Inserir configurações iniciais
INSERT INTO cotacao_girinhas (cotacao_atual) VALUES (1.0000);

INSERT INTO config_sistema VALUES 
  ('cotacao_min_max', '{"min": 0.80, "max": 1.30}'),
  ('taxa_transferencia', '{"percentual": 1.0}'),
  ('queima_por_transacao', '{"quantidade": 1.0}');

-- Funções do sistema de cotação
CREATE OR REPLACE FUNCTION calcular_cotacao_dinamica()
RETURNS DECIMAL(10,4)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_volume_24h INTEGER;
  v_queima_24h DECIMAL(10,2);
  v_cotacao_atual DECIMAL(10,4);
  v_nova_cotacao DECIMAL(10,4);
  v_config JSONB;
BEGIN
  -- Obter configurações
  SELECT valor INTO v_config FROM config_sistema WHERE chave = 'cotacao_min_max';
  
  -- Calcular volume das últimas 24h
  SELECT COALESCE(SUM(quantidade_girinhas), 0) INTO v_volume_24h
  FROM transacoes 
  WHERE tipo = 'compra' AND created_at > now() - interval '24 hours';
  
  -- Calcular queimas das últimas 24h
  SELECT COALESCE(SUM(quantidade), 0) INTO v_queima_24h
  FROM queimas_girinhas 
  WHERE created_at > now() - interval '24 hours';
  
  -- Obter cotação atual
  SELECT cotacao_atual INTO v_cotacao_atual FROM cotacao_girinhas ORDER BY updated_at DESC LIMIT 1;
  
  -- Calcular nova cotação
  -- Fórmula: base + (volume - queima) * 0.001
  v_nova_cotacao := 1.0000 + ((v_volume_24h - v_queima_24h) * 0.001);
  
  -- Aplicar limites
  v_nova_cotacao := GREATEST(v_nova_cotacao, (v_config->>'min')::DECIMAL);
  v_nova_cotacao := LEAST(v_nova_cotacao, (v_config->>'max')::DECIMAL);
  
  -- Atualizar cotação
  UPDATE cotacao_girinhas SET 
    cotacao_atual = v_nova_cotacao,
    volume_24h = v_volume_24h,
    updated_at = now();
  
  -- Registrar no histórico
  INSERT INTO historico_cotacao (cotacao, volume_periodo, evento)
  VALUES (v_nova_cotacao, v_volume_24h, 'calculo_automatico');
  
  RETURN v_nova_cotacao;
END;
$$;

-- Função para queimar Girinhas
CREATE OR REPLACE FUNCTION queimar_girinhas(p_user_id UUID, p_quantidade DECIMAL(10,2), p_motivo TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_saldo_atual DECIMAL(10,2);
BEGIN
  -- Verificar saldo
  SELECT saldo_atual INTO v_saldo_atual FROM carteiras WHERE user_id = p_user_id;
  
  IF v_saldo_atual < p_quantidade THEN
    RETURN FALSE;
  END IF;
  
  -- Registrar queima
  INSERT INTO queimas_girinhas (user_id, quantidade, motivo)
  VALUES (p_user_id, p_quantidade, p_motivo);
  
  -- Debitar da carteira
  UPDATE carteiras 
  SET saldo_atual = saldo_atual - p_quantidade,
      total_gasto = total_gasto + p_quantidade
  WHERE user_id = p_user_id;
  
  -- Registrar transação
  INSERT INTO transacoes (user_id, tipo, valor, descricao)
  VALUES (p_user_id, 'queima', p_quantidade, 'Queima de Girinhas - ' || p_motivo);
  
  -- Recalcular cotação
  PERFORM calcular_cotacao_dinamica();
  
  RETURN TRUE;
END;
$$;

-- Função para transferir Girinhas P2P
CREATE OR REPLACE FUNCTION transferir_girinhas_p2p(
  p_remetente_id UUID, 
  p_destinatario_id UUID, 
  p_quantidade DECIMAL(10,2)
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_taxa DECIMAL(10,2);
  v_valor_liquido DECIMAL(10,2);
  v_saldo_remetente DECIMAL(10,2);
  v_transferencia_id UUID;
  v_config JSONB;
BEGIN
  -- Obter configurações
  SELECT valor INTO v_config FROM config_sistema WHERE chave = 'taxa_transferencia';
  
  -- Calcular taxa (1%)
  v_taxa := p_quantidade * ((v_config->>'percentual')::DECIMAL / 100);
  v_valor_liquido := p_quantidade - v_taxa;
  
  -- Verificar saldo do remetente
  SELECT saldo_atual INTO v_saldo_remetente FROM carteiras WHERE user_id = p_remetente_id;
  
  IF v_saldo_remetente < p_quantidade THEN
    RAISE EXCEPTION 'Saldo insuficiente';
  END IF;
  
  -- Debitar do remetente
  UPDATE carteiras 
  SET saldo_atual = saldo_atual - p_quantidade,
      total_gasto = total_gasto + p_quantidade
  WHERE user_id = p_remetente_id;
  
  -- Creditar ao destinatário
  UPDATE carteiras 
  SET saldo_atual = saldo_atual + v_valor_liquido,
      total_recebido = total_recebido + v_valor_liquido
  WHERE user_id = p_destinatario_id;
  
  -- Registrar transferência
  INSERT INTO transferencias_girinhas (remetente_id, destinatario_id, quantidade, taxa_cobrada)
  VALUES (p_remetente_id, p_destinatario_id, p_quantidade, v_taxa)
  RETURNING id INTO v_transferencia_id;
  
  -- Registrar transações
  INSERT INTO transacoes (user_id, tipo, valor, descricao)
  VALUES 
    (p_remetente_id, 'transferencia_p2p_saida', p_quantidade, 'Transferência P2P enviada'),
    (p_destinatario_id, 'transferencia_p2p_entrada', v_valor_liquido, 'Transferência P2P recebida');
  
  -- Queimar taxa
  IF v_taxa > 0 THEN
    INSERT INTO queimas_girinhas (user_id, quantidade, motivo)
    VALUES (p_remetente_id, v_taxa, 'taxa_transferencia');
  END IF;
  
  -- Recalcular cotação
  PERFORM calcular_cotacao_dinamica();
  
  RETURN v_transferencia_id;
END;
$$;

-- Função para processar queima em transações
CREATE OR REPLACE FUNCTION processar_queima_transacao()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_queima_config JSONB;
  v_quantidade_queima DECIMAL(10,2);
BEGIN
  -- Aplicar queima apenas em reservas confirmadas
  IF NEW.status = 'confirmada' AND OLD.status != 'confirmada' THEN
    -- Obter configuração de queima
    SELECT valor INTO v_queima_config FROM config_sistema WHERE chave = 'queima_por_transacao';
    v_quantidade_queima := (v_queima_config->>'quantidade')::DECIMAL;
    
    -- Queimar Girinhas do comprador
    PERFORM queimar_girinhas(NEW.usuario_reservou, v_quantidade_queima, 'transacao_marketplace');
  END IF;
  
  RETURN NEW;
END;
$$;

-- Trigger para queima automática
CREATE TRIGGER trigger_queima_transacao
  AFTER UPDATE ON reservas
  FOR EACH ROW
  EXECUTE FUNCTION processar_queima_transacao();

-- Políticas RLS para novas tabelas
ALTER TABLE cotacao_girinhas ENABLE ROW LEVEL SECURITY;
ALTER TABLE historico_cotacao ENABLE ROW LEVEL SECURITY;
ALTER TABLE transferencias_girinhas ENABLE ROW LEVEL SECURITY;
ALTER TABLE queimas_girinhas ENABLE ROW LEVEL SECURITY;
ALTER TABLE config_sistema ENABLE ROW LEVEL SECURITY;

-- Políticas para cotação (leitura pública)
CREATE POLICY "Cotação é pública" ON cotacao_girinhas FOR SELECT USING (true);
CREATE POLICY "Histórico é público" ON historico_cotacao FOR SELECT USING (true);
CREATE POLICY "Configurações são públicas" ON config_sistema FOR SELECT USING (true);

-- Políticas para transferências (usuário vê suas próprias)
CREATE POLICY "Ver transferências próprias" ON transferencias_girinhas 
  FOR SELECT USING (auth.uid() = remetente_id OR auth.uid() = destinatario_id);

-- Políticas para queimas (usuário vê suas próprias)
CREATE POLICY "Ver queimas próprias" ON queimas_girinhas 
  FOR SELECT USING (auth.uid() = user_id);
