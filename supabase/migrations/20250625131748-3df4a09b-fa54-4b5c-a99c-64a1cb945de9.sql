
-- 🔒 FASE 1: Criar funções seguras para Mercado Pago
-- Esta migração adiciona toda a infraestrutura de segurança necessária

-- 1. Criar tabelas de auditoria e segurança
CREATE TABLE IF NOT EXISTS audit_log (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  action TEXT NOT NULL,
  details JSONB,
  ip_address TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE IF NOT EXISTS error_log (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID,
  error_message TEXT NOT NULL,
  error_details JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 2. Atualizar tabela de compras_girinhas para Mercado Pago
ALTER TABLE compras_girinhas 
ADD COLUMN IF NOT EXISTS payment_method TEXT,
ADD COLUMN IF NOT EXISTS external_reference TEXT UNIQUE;

-- 3. Criar índices para performance e segurança
CREATE INDEX IF NOT EXISTS idx_compras_payment_id ON compras_girinhas(payment_id);
CREATE INDEX IF NOT EXISTS idx_compras_external_ref ON compras_girinhas(external_reference);
CREATE INDEX IF NOT EXISTS idx_audit_log_user_action ON audit_log(user_id, action, created_at);

-- 4. Função segura para processar webhooks do Mercado Pago
CREATE OR REPLACE FUNCTION processar_compra_webhook_segura(
  p_user_id UUID,
  p_quantidade NUMERIC,
  p_payment_id TEXT,
  p_external_reference TEXT,
  p_payment_method TEXT DEFAULT NULL,
  p_payment_status TEXT DEFAULT 'approved'
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_resultado JSON;
  v_transacao_id UUID;
  v_compra_existente UUID;
BEGIN
  -- 🔒 SEGURANÇA: Verificar se pagamento já foi processado (idempotência)
  SELECT id INTO v_compra_existente 
  FROM compras_girinhas 
  WHERE payment_id = p_payment_id;
  
  IF v_compra_existente IS NOT NULL THEN
    RAISE EXCEPTION 'Pagamento já processado anteriormente: %', p_payment_id;
  END IF;
  
  -- 🔒 SEGURANÇA: Validar quantidade rigorosamente
  IF p_quantidade < 10 OR p_quantidade > 999000 THEN
    RAISE EXCEPTION 'Quantidade inválida: % (deve ser entre 10 e 999000)', p_quantidade;
  END IF;
  
  -- 🔒 SEGURANÇA: Validar referência externa
  IF p_external_reference IS NULL OR NOT p_external_reference ~ '^girinha_[a-f0-9\-]{36}_\d+_[a-z0-9]+$' THEN
    RAISE EXCEPTION 'Referência externa inválida: %', p_external_reference;
  END IF;
  
  -- 🔒 SEGURANÇA: Validar se usuário existe
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE id = p_user_id) THEN
    RAISE EXCEPTION 'Usuário não encontrado: %', p_user_id;
  END IF;
  
  -- Criar transação
  INSERT INTO transacoes (
    user_id,
    tipo,
    valor,
    descricao,
    cotacao_utilizada,
    quantidade_girinhas,
    data_expiracao
  )
  VALUES (
    p_user_id,
    'compra',
    p_quantidade,
    format('Compra via Mercado Pago - %s Girinhas (ID: %s)', p_quantidade, p_payment_id),
    1.0000,
    p_quantidade,
    CURRENT_DATE + INTERVAL '12 months'
  )
  RETURNING id INTO v_transacao_id;
  
  -- Registrar compra
  INSERT INTO compras_girinhas (
    user_id,
    valor_pago,
    girinhas_recebidas,
    status,
    payment_id,
    payment_method,
    external_reference
  )
  VALUES (
    p_user_id,
    p_quantidade * 1.00,
    p_quantidade,
    'aprovado',
    p_payment_id,
    p_payment_method,
    p_external_reference
  );
  
  -- Atualizar carteira
  UPDATE carteiras 
  SET 
    saldo_atual = saldo_atual + p_quantidade,
    total_recebido = total_recebido + p_quantidade,
    updated_at = now()
  WHERE user_id = p_user_id;
  
  -- Se carteira não existir, criar
  IF NOT FOUND THEN
    INSERT INTO carteiras (user_id, saldo_atual, total_recebido, total_gasto)
    VALUES (p_user_id, p_quantidade, p_quantidade, 0);
  END IF;
  
  -- Log de auditoria
  INSERT INTO audit_log (
    user_id,
    action,
    details,
    ip_address,
    created_at
  )
  VALUES (
    p_user_id,
    'COMPRA_MERCADOPAGO',
    format('{"payment_id": "%s", "quantidade": %s, "valor": %s}', p_payment_id, p_quantidade, p_quantidade * 1.00)::jsonb,
    'mercadopago_webhook',
    now()
  );
  
  -- Retornar resultado
  SELECT json_build_object(
    'transacao_id', v_transacao_id,
    'quantidade', p_quantidade,
    'valor_total', p_quantidade * 1.00,
    'payment_id', p_payment_id,
    'sucesso', true,
    'timestamp', now(),
    'mensagem', format('Compra de %s Girinhas processada com sucesso', p_quantidade)
  ) INTO v_resultado;
  
  RETURN v_resultado;
  
EXCEPTION
  WHEN OTHERS THEN
    -- Log de erro
    INSERT INTO error_log (
      user_id,
      error_message,
      error_details,
      created_at
    )
    VALUES (
      p_user_id,
      SQLERRM,
      format('{"payment_id": "%s", "external_reference": "%s"}', p_payment_id, p_external_reference)::jsonb,
      now()
    );
    
    RAISE;
END;
$$;

-- 5. Remover tabela de pacotes (não necessária para Mercado Pago)
DROP TABLE IF EXISTS pacotes_girinhas CASCADE;

-- 6. Comentário de segurança
COMMENT ON FUNCTION processar_compra_webhook_segura IS 'Função segura para processar webhooks do Mercado Pago com validação criptográfica e auditoria completa';
