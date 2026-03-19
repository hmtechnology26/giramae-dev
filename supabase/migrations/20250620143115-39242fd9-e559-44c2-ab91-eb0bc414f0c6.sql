
-- Adicionar configurações para extensão de validade
INSERT INTO config_sistema (chave, valor) VALUES 
  ('extensao_validade_ativa', '{"ativo": true}'),
  ('extensao_validade_percentual', '{"percentual": 20}'),
  ('extensao_validade_dias', '{"dias": 30}')
ON CONFLICT (chave) DO UPDATE SET valor = EXCLUDED.valor;

-- Adicionar o tipo 'extensao_validade' à constraint de tipos da tabela transacoes
ALTER TABLE transacoes DROP CONSTRAINT IF EXISTS transacoes_tipo_check;

ALTER TABLE transacoes ADD CONSTRAINT transacoes_tipo_check 
CHECK (tipo IN (
  'recebido', 
  'gasto', 
  'bonus', 
  'compra', 
  'queima', 
  'transferencia_p2p_saida', 
  'transferencia_p2p_entrada', 
  'taxa',
  'missao_recompensa',
  'missao',
  'extensao_validade'
));

-- Função para estender validade de Girinhas
CREATE OR REPLACE FUNCTION estender_validade_girinhas(
  p_user_id UUID,
  p_valor_expirando DECIMAL(10,2),
  p_nova_data_expiracao DATE
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_config_percentual DECIMAL(5,2);
  v_custo_extensao DECIMAL(10,2);
  v_saldo_atual DECIMAL(10,2);
  v_config_ativa BOOLEAN;
BEGIN
  -- Verificar se a extensão está ativa
  SELECT (valor->>'ativo')::BOOLEAN INTO v_config_ativa
  FROM config_sistema WHERE chave = 'extensao_validade_ativa';
  
  IF NOT COALESCE(v_config_ativa, false) THEN
    RETURN FALSE;
  END IF;
  
  -- Obter configuração do percentual
  SELECT (valor->>'percentual')::DECIMAL INTO v_config_percentual
  FROM config_sistema WHERE chave = 'extensao_validade_percentual';
  
  v_config_percentual := COALESCE(v_config_percentual, 20.0);
  
  -- Calcular custo (mínimo 1 Girinha)
  v_custo_extensao := GREATEST(
    ROUND(p_valor_expirando * (v_config_percentual / 100), 2),
    1.00
  );
  
  -- Verificar saldo
  SELECT saldo_atual INTO v_saldo_atual
  FROM carteiras WHERE user_id = p_user_id;
  
  IF v_saldo_atual < v_custo_extensao THEN
    RETURN FALSE;
  END IF;
  
  -- Debitar custo da extensão
  INSERT INTO transacoes (user_id, tipo, valor, descricao)
  VALUES (p_user_id, 'extensao_validade', v_custo_extensao, 
          'Extensão de validade: +30 dias para ' || (p_valor_expirando - v_custo_extensao) || ' Girinhas');
  
  -- Atualizar carteira
  UPDATE carteiras 
  SET 
    saldo_atual = saldo_atual - v_custo_extensao,
    total_gasto = total_gasto + v_custo_extensao
  WHERE user_id = p_user_id;
  
  -- Atualizar data de expiração das Girinhas expirando em 7 dias ou menos
  UPDATE transacoes 
  SET data_expiracao = p_nova_data_expiracao
  WHERE user_id = p_user_id 
    AND tipo = 'compra'
    AND data_expiracao BETWEEN CURRENT_DATE AND CURRENT_DATE + INTERVAL '7 days'
    AND NOT EXISTS (
      SELECT 1 FROM queimas_girinhas q 
      WHERE q.transacao_id = transacoes.id 
      AND q.motivo = 'expiracao'
    );
  
  -- Registrar queima das Girinhas usadas para extensão
  INSERT INTO queimas_girinhas (user_id, quantidade, motivo)
  VALUES (p_user_id, v_custo_extensao, 'extensao_validade');
  
  RETURN TRUE;
END;
$$;

-- Função para calcular custo de extensão (para uso na UI)
CREATE OR REPLACE FUNCTION calcular_custo_extensao(
  p_valor_expirando DECIMAL(10,2)
)
RETURNS DECIMAL(10,2)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_config_percentual DECIMAL(5,2);
BEGIN
  -- Obter configuração do percentual
  SELECT (valor->>'percentual')::DECIMAL INTO v_config_percentual
  FROM config_sistema WHERE chave = 'extensao_validade_percentual';
  
  v_config_percentual := COALESCE(v_config_percentual, 20.0);
  
  -- Retornar custo (mínimo 1 Girinha)
  RETURN GREATEST(
    ROUND(p_valor_expirando * (v_config_percentual / 100), 2),
    1.00
  );
END;
$$;
