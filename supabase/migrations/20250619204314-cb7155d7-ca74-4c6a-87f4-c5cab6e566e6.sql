
-- Adicionar a coluna valor_real na tabela transacoes
ALTER TABLE transacoes 
ADD COLUMN IF NOT EXISTS valor_real DECIMAL(10,2);

-- Corrigir a função processar_compra_segura para não usar valor_real se não necessário
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
  
  -- Criar transação (sem valor_real por enquanto)
  INSERT INTO transacoes (
    user_id,
    tipo,
    valor,
    descricao,
    cotacao_utilizada,
    quantidade_girinhas,
    usuario_origem
  )
  VALUES (
    p_user_id,
    'compra',
    p_quantidade,
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
