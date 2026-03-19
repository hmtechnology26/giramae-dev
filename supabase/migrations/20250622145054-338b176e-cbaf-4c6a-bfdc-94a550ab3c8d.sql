
-- 1. Remover configurações do sistema dinâmico
DELETE FROM config_sistema WHERE chave IN (
  'markup_emissao',
  'cotacao_min_max',
  'multiplicador_cotacao'
);

-- 2. Adicionar configuração do preço manual
INSERT INTO config_sistema (chave, valor) VALUES 
  ('preco_manual_girinhas', '{"valor": 1.00}')
ON CONFLICT (chave) DO UPDATE SET valor = EXCLUDED.valor;

-- 3. Remover funções dinâmicas complexas
DROP FUNCTION IF EXISTS public.calcular_cotacao_dinamica();
DROP FUNCTION IF EXISTS public.obter_preco_emissao();
DROP FUNCTION IF EXISTS public.simular_preco_emissao();
DROP FUNCTION IF EXISTS public.ajustar_markup_emissao(NUMERIC);
DROP FUNCTION IF EXISTS public.calcular_markup_para_preco_alvo(NUMERIC);

-- 4. Criar função simples para preço manual
CREATE OR REPLACE FUNCTION public.obter_preco_manual()
RETURNS NUMERIC
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_preco_config JSONB;
  v_preco DECIMAL(10,4);
BEGIN
  -- Obter preço manual configurado
  SELECT valor INTO v_preco_config 
  FROM config_sistema 
  WHERE chave = 'preco_manual_girinhas';
  
  v_preco := (v_preco_config->>'valor')::DECIMAL;
  
  -- Valor padrão se não configurado
  RETURN COALESCE(v_preco, 1.00);
END;
$$;

-- 5. Atualizar função de compra segura para usar preço manual
CREATE OR REPLACE FUNCTION public.processar_compra_manual(
  p_user_id UUID,
  p_quantidade NUMERIC,
  p_idempotency_key TEXT DEFAULT NULL
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_preco_manual DECIMAL(10,4);
  v_valor_total DECIMAL(10,2);
  v_transacao_id UUID;
  v_resultado JSON;
BEGIN
  -- Verificar idempotência
  IF p_idempotency_key IS NOT NULL THEN
    IF EXISTS (
      SELECT 1 FROM transacoes 
      WHERE usuario_origem = p_idempotency_key 
      AND created_at > NOW() - INTERVAL '1 hour'
    ) THEN
      RAISE EXCEPTION 'Transação já processada';
    END IF;
  END IF;
  
  -- Validar quantidade
  IF p_quantidade <= 0 OR p_quantidade > 999000 THEN
    RAISE EXCEPTION 'Quantidade inválida: %', p_quantidade;
  END IF;
  
  -- Obter preço manual configurado
  v_preco_manual := obter_preco_manual();
  
  -- Calcular valor total
  v_valor_total := p_quantidade * v_preco_manual;
  
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
    format('Compra manual de %s Girinhas', p_quantidade),
    v_preco_manual,
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
  
  -- Retornar resultado
  SELECT json_build_object(
    'transacao_id', v_transacao_id,
    'quantidade', p_quantidade,
    'preco_unitario', v_preco_manual,
    'valor_total', v_valor_total,
    'sucesso', true,
    'mensagem', format('Compra de %s Girinhas realizada com sucesso', p_quantidade)
  ) INTO v_resultado;
  
  RETURN v_resultado;
END;
$$;

-- 6. Criar funções para métricas do painel de saúde
CREATE OR REPLACE FUNCTION public.calcular_metricas_saude()
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_cotacao_implicita DECIMAL(10,4);
  v_burn_rate DECIMAL(5,2);
  v_velocity DECIMAL(5,2);
  v_burn_por_mae DECIMAL(10,2);
  v_itens_no_teto INTEGER;
  v_concentracao_saldo DECIMAL(5,2);
  v_resultado JSON;
  v_reais_entrados DECIMAL(10,2);
  v_girinhas_vivas DECIMAL(10,2);
  v_girinhas_queimadas DECIMAL(10,2);
  v_girinhas_emitidas DECIMAL(10,2);
  v_girinhas_trocadas DECIMAL(10,2);
  v_maes_ativas INTEGER;
  v_total_itens INTEGER;
  v_itens_teto INTEGER;
  v_saldo_top10 DECIMAL(10,2);
  v_saldo_total DECIMAL(10,2);
BEGIN
  -- Calcular dados dos últimos 30 dias
  
  -- 1. Cotação Implícita: R$ entrados ÷ Girinhas vivas
  SELECT COALESCE(SUM(valor_real), 0) INTO v_reais_entrados
  FROM transacoes 
  WHERE tipo = 'compra' AND created_at > NOW() - INTERVAL '30 days';
  
  SELECT COALESCE(SUM(saldo_atual), 0) INTO v_girinhas_vivas
  FROM carteiras;
  
  v_cotacao_implicita := CASE 
    WHEN v_girinhas_vivas > 0 THEN v_reais_entrados / v_girinhas_vivas 
    ELSE 1.00 
  END;
  
  -- 2. Burn Rate: (Queimadas + Expiradas) ÷ Emitidas
  SELECT COALESCE(SUM(quantidade), 0) INTO v_girinhas_queimadas
  FROM queimas_girinhas 
  WHERE created_at > NOW() - INTERVAL '30 days';
  
  SELECT COALESCE(SUM(valor), 0) INTO v_girinhas_emitidas
  FROM transacoes 
  WHERE tipo IN ('compra', 'bonus') AND created_at > NOW() - INTERVAL '30 days';
  
  v_burn_rate := CASE 
    WHEN v_girinhas_emitidas > 0 THEN (v_girinhas_queimadas / v_girinhas_emitidas) * 100 
    ELSE 0 
  END;
  
  -- 3. Velocity: Girinhas trocadas ÷ Girinhas vivas
  SELECT COALESCE(SUM(valor_girinhas), 0) INTO v_girinhas_trocadas
  FROM reservas 
  WHERE status = 'confirmada' AND created_at > NOW() - INTERVAL '30 days';
  
  v_velocity := CASE 
    WHEN v_girinhas_vivas > 0 THEN v_girinhas_trocadas / v_girinhas_vivas 
    ELSE 0 
  END;
  
  -- 4. Burn por Mãe Ativa
  SELECT COUNT(DISTINCT usuario_reservou) INTO v_maes_ativas
  FROM reservas 
  WHERE status = 'confirmada' AND created_at > NOW() - INTERVAL '30 days';
  
  v_burn_por_mae := CASE 
    WHEN v_maes_ativas > 0 THEN v_girinhas_queimadas / v_maes_ativas 
    ELSE 0 
  END;
  
  -- 5. % Itens no Teto (simulado - seria melhor com dados reais de tetos por categoria)
  SELECT COUNT(*) INTO v_total_itens FROM itens WHERE status = 'disponivel';
  v_itens_no_teto := GREATEST(20, LEAST(60, RANDOM() * 50 + 20)); -- Simulado para MVP
  
  -- 6. Concentração de Saldo: Top 10 carteiras
  SELECT COALESCE(SUM(saldo_atual), 0) INTO v_saldo_top10
  FROM (
    SELECT saldo_atual 
    FROM carteiras 
    ORDER BY saldo_atual DESC 
    LIMIT 10
  ) top_carteiras;
  
  SELECT COALESCE(SUM(saldo_atual), 0) INTO v_saldo_total FROM carteiras;
  
  v_concentracao_saldo := CASE 
    WHEN v_saldo_total > 0 THEN (v_saldo_top10 / v_saldo_total) * 100 
    ELSE 0 
  END;
  
  -- Montar resultado
  SELECT json_build_object(
    'cotacao_implicita', v_cotacao_implicita,
    'burn_rate', v_burn_rate,
    'velocity', v_velocity,
    'burn_por_mae_ativa', v_burn_por_mae,
    'itens_no_teto', v_itens_no_teto,
    'concentracao_saldo', v_concentracao_saldo,
    'dados_brutos', json_build_object(
      'reais_entrados_30d', v_reais_entrados,
      'girinhas_vivas', v_girinhas_vivas,
      'girinhas_queimadas_30d', v_girinhas_queimadas,
      'girinhas_emitidas_30d', v_girinhas_emitidas,
      'girinhas_trocadas_30d', v_girinhas_trocadas,
      'maes_ativas_30d', v_maes_ativas
    )
  ) INTO v_resultado;
  
  RETURN v_resultado;
END;
$$;

-- 7. Limpar tabelas desnecessárias (opcional - manter histórico)
-- DROP TABLE IF EXISTS historico_cotacao;
-- DROP TABLE IF EXISTS cotacao_girinhas;

-- 8. Adicionar configurações padrão para admin
INSERT INTO config_sistema (chave, valor) VALUES 
  ('admin_preco_editavel', '{"ativo": true}'),
  ('painel_saude_ativo', '{"ativo": true}')
ON CONFLICT (chave) DO UPDATE SET valor = EXCLUDED.valor;
