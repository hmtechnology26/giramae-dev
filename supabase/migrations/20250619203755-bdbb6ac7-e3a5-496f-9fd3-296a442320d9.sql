
-- Corrigir funções SQL para resolver overflow e ambiguidade
DROP FUNCTION IF EXISTS public.obter_preco_emissao();
DROP FUNCTION IF EXISTS public.simular_preco_emissao();
DROP FUNCTION IF EXISTS public.ajustar_markup_emissao(NUMERIC);

-- Função corrigida para calcular preço de emissão
CREATE OR REPLACE FUNCTION public.obter_preco_emissao() 
RETURNS NUMERIC
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_cotacao_atual DECIMAL(10,4);
  v_preco_min DECIMAL(10,4);
  v_preco_max DECIMAL(10,4);
  v_markup_atual DECIMAL(10,2);
  v_markup_necessario DECIMAL(10,2);
  v_preco_final DECIMAL(10,4);
BEGIN
  -- Obter cotação real atual
  SELECT cg.cotacao_atual INTO v_cotacao_atual 
  FROM cotacao_girinhas cg 
  ORDER BY cg.updated_at DESC LIMIT 1;
  
  -- Se não há cotação, usar 1.0
  IF v_cotacao_atual IS NULL THEN
    v_cotacao_atual := 1.0000;
  END IF;
  
  -- Obter limites de preço da configuração
  SELECT (cs.valor->>'min')::DECIMAL, (cs.valor->>'max')::DECIMAL 
  INTO v_preco_min, v_preco_max
  FROM config_sistema cs WHERE cs.chave = 'cotacao_min_max';
  
  -- Obter markup atual
  SELECT (cs.valor->>'percentual')::DECIMAL INTO v_markup_atual 
  FROM config_sistema cs WHERE cs.chave = 'markup_emissao';
  
  -- Valores padrão se não configurados
  v_preco_min := COALESCE(v_preco_min, 0.80);
  v_preco_max := COALESCE(v_preco_max, 1.30);
  v_markup_atual := COALESCE(v_markup_atual, 30.0);
  
  -- Limitar markup para evitar overflow (máximo 5000%)
  v_markup_atual := LEAST(v_markup_atual, 5000.0);
  
  -- Calcular o preço com o markup atual
  v_preco_final := v_cotacao_atual * (1 + v_markup_atual / 100);
  
  -- Verificar se o preço está fora dos limites
  IF v_preco_final < v_preco_min THEN
    -- Calcular markup necessário para atingir o preço mínimo
    v_markup_necessario := ((v_preco_min / v_cotacao_atual) - 1) * 100;
    v_markup_necessario := LEAST(v_markup_necessario, 5000.0);
    v_preco_final := v_preco_min;
    
    -- Atualizar o markup no config_sistema
    UPDATE config_sistema 
    SET valor = jsonb_build_object('percentual', v_markup_necessario)
    WHERE chave = 'markup_emissao';
    
  ELSIF v_preco_final > v_preco_max THEN
    -- Calcular markup necessário para não ultrapassar o preço máximo
    v_markup_necessario := ((v_preco_max / v_cotacao_atual) - 1) * 100;
    v_markup_necessario := GREATEST(v_markup_necessario, -90.0);
    v_preco_final := v_preco_max;
    
    -- Atualizar o markup no config_sistema
    UPDATE config_sistema 
    SET valor = jsonb_build_object('percentual', v_markup_necessario)
    WHERE chave = 'markup_emissao';
    
  END IF;
  
  -- Retornar o preço final
  RETURN v_preco_final;
END;
$$;

-- Função corrigida para simulação
CREATE OR REPLACE FUNCTION public.simular_preco_emissao()
RETURNS TABLE (
  cotacao_atual NUMERIC,
  markup_atual NUMERIC,
  preco_com_markup_atual NUMERIC,
  preco_minimo NUMERIC,
  preco_maximo NUMERIC,
  precisa_ajuste BOOLEAN,
  markup_necessario NUMERIC,
  preco_final NUMERIC
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_cotacao DECIMAL(10,4);
  v_preco_min DECIMAL(10,4);
  v_preco_max DECIMAL(10,4);
  v_markup_atual DECIMAL(10,2);
  v_preco_calculado DECIMAL(10,4);
  v_markup_necessario DECIMAL(10,2);
  v_precisa_ajuste BOOLEAN := FALSE;
BEGIN
  -- Obter cotação atual
  SELECT cg.cotacao_atual INTO v_cotacao 
  FROM cotacao_girinhas cg 
  ORDER BY cg.updated_at DESC LIMIT 1;
  
  v_cotacao := COALESCE(v_cotacao, 1.0000);
  
  -- Obter configurações
  SELECT (cs.valor->>'min')::DECIMAL, (cs.valor->>'max')::DECIMAL 
  INTO v_preco_min, v_preco_max
  FROM config_sistema cs WHERE cs.chave = 'cotacao_min_max';
  
  SELECT (cs.valor->>'percentual')::DECIMAL INTO v_markup_atual 
  FROM config_sistema cs WHERE cs.chave = 'markup_emissao';
  
  -- Valores padrão
  v_preco_min := COALESCE(v_preco_min, 0.80);
  v_preco_max := COALESCE(v_preco_max, 1.30);
  v_markup_atual := COALESCE(v_markup_atual, 30.0);
  
  -- Limitar markup para evitar overflow
  v_markup_atual := LEAST(v_markup_atual, 5000.0);
  
  -- Calcular preço com markup atual
  v_preco_calculado := v_cotacao * (1 + v_markup_atual / 100);
  
  -- Verificar se precisa ajuste
  IF v_preco_calculado < v_preco_min THEN
    v_precisa_ajuste := TRUE;
    v_markup_necessario := ((v_preco_min / v_cotacao) - 1) * 100;
    v_markup_necessario := LEAST(v_markup_necessario, 5000.0);
    v_preco_calculado := v_preco_min;
  ELSIF v_preco_calculado > v_preco_max THEN
    v_precisa_ajuste := TRUE;
    v_markup_necessario := ((v_preco_max / v_cotacao) - 1) * 100;
    v_markup_necessario := GREATEST(v_markup_necessario, -90.0);
    v_preco_calculado := v_preco_max;
  ELSE
    v_markup_necessario := v_markup_atual;
  END IF;
  
  RETURN QUERY SELECT
    v_cotacao,
    v_markup_atual,
    v_cotacao * (1 + v_markup_atual / 100),
    v_preco_min,
    v_preco_max,
    v_precisa_ajuste,
    v_markup_necessario,
    v_preco_calculado;
END;
$$;

-- Função corrigida para ajustar markup
CREATE OR REPLACE FUNCTION public.ajustar_markup_emissao(novo_markup NUMERIC)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_resultado JSON;
  v_cotacao DECIMAL(10,4);
  v_preco_resultante DECIMAL(10,4);
  v_markup_anterior DECIMAL(10,2);
BEGIN
  -- Validar markup (entre -90% e 5000%)
  IF novo_markup < -90 OR novo_markup > 5000 THEN
    RAISE EXCEPTION 'Markup deve estar entre -90%% e 5000%%';
  END IF;
  
  -- Obter markup anterior
  SELECT (cs.valor->>'percentual')::DECIMAL INTO v_markup_anterior
  FROM config_sistema cs WHERE cs.chave = 'markup_emissao';
  
  -- Obter cotação atual
  SELECT cg.cotacao_atual INTO v_cotacao 
  FROM cotacao_girinhas cg 
  ORDER BY cg.updated_at DESC LIMIT 1;
  
  v_cotacao := COALESCE(v_cotacao, 1.0000);
  
  -- Calcular preço resultante
  v_preco_resultante := v_cotacao * (1 + novo_markup / 100);
  
  -- Atualizar configuração
  UPDATE config_sistema 
  SET valor = jsonb_build_object('percentual', novo_markup)
  WHERE chave = 'markup_emissao';
  
  -- Retornar informações
  SELECT json_build_object(
    'markup_anterior', COALESCE(v_markup_anterior, 30.0),
    'markup_novo', novo_markup,
    'cotacao_atual', v_cotacao,
    'preco_resultante', v_preco_resultante,
    'mensagem', 'Markup atualizado com sucesso'
  ) INTO v_resultado;
  
  RETURN v_resultado;
END;
$$;

-- Função de compra segura server-side
CREATE OR REPLACE FUNCTION public.processar_compra_segura(
  p_user_id UUID,
  p_quantidade NUMERIC,
  p_idempotency_key TEXT DEFAULT NULL
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_preco_atual DECIMAL(10,4);
  v_valor_total DECIMAL(10,2);
  v_saldo_atual DECIMAL(10,2);
  v_transacao_id UUID;
  v_resultado JSON;
  v_cotacao_atual DECIMAL(10,4);
BEGIN
  -- Verificar se já foi processada (idempotência)
  IF p_idempotency_key IS NOT NULL THEN
    IF EXISTS (
      SELECT 1 FROM transacoes 
      WHERE usuario_origem = p_idempotency_key 
      AND created_at > NOW() - INTERVAL '1 hour'
    ) THEN
      RAISE EXCEPTION 'Transação já processada (idempotency_key: %)', p_idempotency_key;
    END IF;
  END IF;
  
  -- Validar quantidade
  IF p_quantidade <= 0 OR p_quantidade > 999000 THEN
    RAISE EXCEPTION 'Quantidade inválida: %', p_quantidade;
  END IF;
  
  -- Obter preço atual server-side
  v_preco_atual := obter_preco_emissao();
  
  -- Calcular valor total
  v_valor_total := p_quantidade * v_preco_atual;
  
  -- Obter cotação para registro
  SELECT cotacao_atual INTO v_cotacao_atual 
  FROM cotacao_girinhas 
  ORDER BY updated_at DESC LIMIT 1;
  
  -- Criar transação
  INSERT INTO transacoes (
    user_id,
    tipo,
    valor,
    valor_real,
    descricao,
    cotacao_utilizada,
    quantidade_girinhas,
    usuario_origem
  )
  VALUES (
    p_user_id,
    'compra',
    p_quantidade,
    v_valor_total,
    format('Compra segura de %s Girinhas', p_quantidade),
    v_preco_atual,
    p_quantidade,
    COALESCE(p_idempotency_key, gen_random_uuid()::text)
  )
  RETURNING id INTO v_transacao_id;
  
  -- Atualizar carteira
  UPDATE carteiras 
  SET 
    saldo_atual = saldo_atual + p_quantidade,
    total_recebido = total_recebido + p_quantidade
  WHERE user_id = p_user_id;
  
  -- Recalcular cotação
  PERFORM calcular_cotacao_dinamica();
  
  -- Retornar resultado
  SELECT json_build_object(
    'transacao_id', v_transacao_id,
    'quantidade', p_quantidade,
    'preco_unitario', v_preco_atual,
    'valor_total', v_valor_total,
    'cotacao_mercado', v_cotacao_atual,
    'sucesso', true,
    'mensagem', format('Compra de %s Girinhas realizada com sucesso', p_quantidade)
  ) INTO v_resultado;
  
  RETURN v_resultado;
END;
$$;

-- Limpar dados corrompidos e resetar valores seguros
UPDATE cotacao_girinhas 
SET cotacao_atual = 1.0000, volume_24h = 0 
WHERE cotacao_atual < 0.0001 OR cotacao_atual > 10.0000;

-- Resetar markup para valor seguro
UPDATE config_sistema 
SET valor = jsonb_build_object('percentual', 30.0)
WHERE chave = 'markup_emissao' 
AND ((valor->>'percentual')::DECIMAL < -90 OR (valor->>'percentual')::DECIMAL > 5000);

-- Garantir configuração mínima
INSERT INTO config_sistema (chave, valor) VALUES 
  ('markup_emissao', '{"percentual": 30.0}'),
  ('cotacao_min_max', '{"min": 0.80, "max": 1.30}'),
  ('compra_girinhas_min', '{"quantidade": 10}'),
  ('compra_girinhas_max', '{"quantidade": 999000}')
ON CONFLICT (chave) DO UPDATE SET valor = EXCLUDED.valor
WHERE EXCLUDED.chave = 'markup_emissao' 
AND ((config_sistema.valor->>'percentual')::DECIMAL < -90 OR (config_sistema.valor->>'percentual')::DECIMAL > 5000);
