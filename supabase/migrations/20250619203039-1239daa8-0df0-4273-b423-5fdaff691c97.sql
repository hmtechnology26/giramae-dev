
-- Função para calcular e atualizar o markup dinamicamente
CREATE OR REPLACE FUNCTION public.obter_preco_emissao() 
RETURNS NUMERIC
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_cotacao_atual DECIMAL(10,4);
  v_preco_min DECIMAL(10,4);
  v_preco_max DECIMAL(10,4);
  v_markup_atual DECIMAL(5,2);
  v_markup_necessario DECIMAL(5,2);
  v_preco_final DECIMAL(10,4);
BEGIN
  -- Obter cotação real atual
  SELECT cotacao_atual INTO v_cotacao_atual 
  FROM cotacao_girinhas 
  ORDER BY updated_at DESC LIMIT 1;
  
  -- Se não há cotação, usar 1.0
  IF v_cotacao_atual IS NULL THEN
    v_cotacao_atual := 1.0000;
  END IF;
  
  -- Obter limites de preço da configuração
  SELECT (valor->>'min')::DECIMAL, (valor->>'max')::DECIMAL 
  INTO v_preco_min, v_preco_max
  FROM config_sistema WHERE chave = 'cotacao_min_max';
  
  -- Obter markup atual
  SELECT (valor->>'percentual')::DECIMAL INTO v_markup_atual 
  FROM config_sistema WHERE chave = 'markup_emissao';
  
  -- Valores padrão se não configurados
  v_preco_min := COALESCE(v_preco_min, 0.80);
  v_preco_max := COALESCE(v_preco_max, 1.30);
  v_markup_atual := COALESCE(v_markup_atual, 30.0);
  
  -- Calcular o preço com o markup atual
  v_preco_final := v_cotacao_atual * (1 + v_markup_atual / 100);
  
  -- Verificar se o preço está fora dos limites
  IF v_preco_final < v_preco_min THEN
    -- Calcular markup necessário para atingir o preço mínimo
    v_markup_necessario := ((v_preco_min / v_cotacao_atual) - 1) * 100;
    v_preco_final := v_preco_min;
    
    -- Atualizar o markup no config_sistema
    UPDATE config_sistema 
    SET valor = jsonb_build_object('percentual', v_markup_necessario)
    WHERE chave = 'markup_emissao';
    
  ELSIF v_preco_final > v_preco_max THEN
    -- Calcular markup necessário para não ultrapassar o preço máximo
    v_markup_necessario := ((v_preco_max / v_cotacao_atual) - 1) * 100;
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

-- Função para visualizar o cálculo sem alterar configurações
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
  v_markup_atual DECIMAL(5,2);
  v_preco_calculado DECIMAL(10,4);
  v_markup_necessario DECIMAL(5,2);
  v_precisa_ajuste BOOLEAN := FALSE;
BEGIN
  -- Obter cotação atual
  SELECT cotacao_atual INTO v_cotacao 
  FROM cotacao_girinhas 
  ORDER BY updated_at DESC LIMIT 1;
  
  v_cotacao := COALESCE(v_cotacao, 1.0000);
  
  -- Obter configurações
  SELECT (valor->>'min')::DECIMAL, (valor->>'max')::DECIMAL 
  INTO v_preco_min, v_preco_max
  FROM config_sistema WHERE chave = 'cotacao_min_max';
  
  SELECT (valor->>'percentual')::DECIMAL INTO v_markup_atual 
  FROM config_sistema WHERE chave = 'markup_emissao';
  
  -- Valores padrão
  v_preco_min := COALESCE(v_preco_min, 0.80);
  v_preco_max := COALESCE(v_preco_max, 1.30);
  v_markup_atual := COALESCE(v_markup_atual, 30.0);
  
  -- Calcular preço com markup atual
  v_preco_calculado := v_cotacao * (1 + v_markup_atual / 100);
  
  -- Verificar se precisa ajuste
  IF v_preco_calculado < v_preco_min THEN
    v_precisa_ajuste := TRUE;
    v_markup_necessario := ((v_preco_min / v_cotacao) - 1) * 100;
    v_preco_calculado := v_preco_min;
  ELSIF v_preco_calculado > v_preco_max THEN
    v_precisa_ajuste := TRUE;
    v_markup_necessario := ((v_preco_max / v_cotacao) - 1) * 100;
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

-- Função para ajustar markup manualmente (admin)
CREATE OR REPLACE FUNCTION public.ajustar_markup_emissao(novo_markup NUMERIC)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_resultado JSON;
  v_cotacao DECIMAL(10,4);
  v_preco_resultante DECIMAL(10,4);
BEGIN
  -- Validar markup (entre -90% e 1000%)
  IF novo_markup < -90 OR novo_markup > 1000 THEN
    RAISE EXCEPTION 'Markup deve estar entre -90%% e 1000%%';
  END IF;
  
  -- Obter cotação atual
  SELECT cotacao_atual INTO v_cotacao 
  FROM cotacao_girinhas 
  ORDER BY updated_at DESC LIMIT 1;
  
  v_cotacao := COALESCE(v_cotacao, 1.0000);
  
  -- Calcular preço resultante
  v_preco_resultante := v_cotacao * (1 + novo_markup / 100);
  
  -- Atualizar configuração
  UPDATE config_sistema 
  SET valor = jsonb_build_object('percentual', novo_markup)
  WHERE chave = 'markup_emissao';
  
  -- Retornar informações
  SELECT json_build_object(
    'markup_anterior', (SELECT (valor->>'percentual')::DECIMAL FROM config_sistema WHERE chave = 'markup_emissao'),
    'markup_novo', novo_markup,
    'cotacao_atual', v_cotacao,
    'preco_resultante', v_preco_resultante,
    'mensagem', 'Markup atualizado com sucesso'
  ) INTO v_resultado;
  
  RETURN v_resultado;
END;
$$;

-- Função para recalcular markup baseado em preço alvo
CREATE OR REPLACE FUNCTION public.calcular_markup_para_preco_alvo(preco_alvo NUMERIC)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_cotacao DECIMAL(10,4);
  v_markup_necessario DECIMAL(8,2);
  v_preco_min DECIMAL(10,4);
  v_preco_max DECIMAL(10,4);
  v_resultado JSON;
BEGIN
  -- Obter cotação atual
  SELECT cotacao_atual INTO v_cotacao 
  FROM cotacao_girinhas 
  ORDER BY updated_at DESC LIMIT 1;
  
  v_cotacao := COALESCE(v_cotacao, 1.0000);
  
  -- Obter limites
  SELECT (valor->>'min')::DECIMAL, (valor->>'max')::DECIMAL 
  INTO v_preco_min, v_preco_max
  FROM config_sistema WHERE chave = 'cotacao_min_max';
  
  -- Calcular markup necessário
  v_markup_necessario := ((preco_alvo / v_cotacao) - 1) * 100;
  
  -- Retornar análise
  SELECT json_build_object(
    'preco_alvo', preco_alvo,
    'cotacao_atual', v_cotacao,
    'markup_necessario', v_markup_necessario,
    'viavel', (preco_alvo >= v_preco_min AND preco_alvo <= v_preco_max),
    'limite_minimo', v_preco_min,
    'limite_maximo', v_preco_max,
    'recomendacao', CASE
      WHEN preco_alvo < v_preco_min THEN 'Preço alvo abaixo do mínimo permitido'
      WHEN preco_alvo > v_preco_max THEN 'Preço alvo acima do máximo permitido'
      ELSE 'Preço alvo dentro dos limites'
    END
  ) INTO v_resultado;
  
  RETURN v_resultado;
END;
$$;
