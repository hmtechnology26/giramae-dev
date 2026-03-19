
-- 1. Adicionar coluna para código de confirmação nas reservas
ALTER TABLE reservas ADD COLUMN IF NOT EXISTS codigo_confirmacao TEXT;

-- 2. Criar função para finalizar troca com código de confirmação
CREATE OR REPLACE FUNCTION finalizar_troca_com_codigo(
  p_reserva_id UUID,
  p_codigo TEXT,
  p_usuario_vendedor UUID
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_reserva RECORD;
  v_codigo_correto TEXT;
  v_valor_credito DECIMAL(10,2);
  v_queima_config JSONB;
  v_quantidade_queima DECIMAL(10,2);
BEGIN
  -- Buscar dados da reserva
  SELECT * INTO v_reserva 
  FROM reservas 
  WHERE id = p_reserva_id 
    AND usuario_item = p_usuario_vendedor
    AND status = 'pendente';
  
  IF NOT FOUND THEN
    RETURN jsonb_build_object(
      'sucesso', false, 
      'erro', 'Reserva não encontrada ou você não é o vendedor'
    );
  END IF;
  
  -- Verificar código de confirmação
  IF v_reserva.codigo_confirmacao != p_codigo THEN
    RETURN jsonb_build_object(
      'sucesso', false, 
      'erro', 'Código de confirmação inválido'
    );
  END IF;
  
  -- Obter configuração de queima por transação
  SELECT valor INTO v_queima_config 
  FROM config_sistema 
  WHERE chave = 'queima_por_transacao';
  
  v_quantidade_queima := COALESCE((v_queima_config->>'quantidade')::DECIMAL, 1.0);
  
  -- Calcular valor que o vendedor receberá (valor total da reserva)
  v_valor_credito := v_reserva.valor_girinhas;
  
  -- 1. Creditar vendedor
  INSERT INTO transacoes (user_id, tipo, valor, descricao, item_id)
  VALUES (
    v_reserva.usuario_item,
    'recebido',
    v_valor_credito,
    'Venda confirmada com código',
    v_reserva.item_id
  );
  
  UPDATE carteiras 
  SET 
    saldo_atual = saldo_atual + v_valor_credito,
    total_recebido = total_recebido + v_valor_credito
  WHERE user_id = v_reserva.usuario_item;
  
  -- 2. Queimar Girinhas do comprador (taxa do marketplace)
  PERFORM queimar_girinhas(
    v_reserva.usuario_reservou, 
    v_quantidade_queima, 
    'taxa_marketplace'
  );
  
  -- 3. Marcar reserva como confirmada
  UPDATE reservas 
  SET 
    status = 'confirmada',
    updated_at = now()
  WHERE id = p_reserva_id;
  
  -- 4. Marcar item como vendido
  UPDATE itens 
  SET status = 'vendido' 
  WHERE id = v_reserva.item_id;
  
  -- 5. Processar próximo da fila se existir
  PERFORM processar_proximo_fila(v_reserva.item_id);
  
  RETURN jsonb_build_object(
    'sucesso', true,
    'valor_creditado', v_valor_credito,
    'taxa_queimada', v_quantidade_queima,
    'mensagem', 'Troca finalizada com sucesso!'
  );
  
EXCEPTION
  WHEN OTHERS THEN
    RETURN jsonb_build_object(
      'sucesso', false, 
      'erro', 'Erro interno: ' || SQLERRM
    );
END;
$$;

-- 3. Atualizar função processar_reserva para gerar código
CREATE OR REPLACE FUNCTION processar_reserva(p_item_id uuid, p_usuario_reservou uuid, p_valor numeric)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $$
DECLARE
  v_saldo_atual DECIMAL(10,2);
  v_usuario_item UUID;
  v_reserva_id UUID;
  v_codigo_confirmacao TEXT;
BEGIN
  -- DEBUG: Log da função processar_reserva
  RAISE NOTICE 'DEBUG processar_reserva - Item: %, Usuario: %, Valor: %', p_item_id, p_usuario_reservou, p_valor;
  
  -- Verificar saldo na tabela carteiras
  SELECT saldo_atual INTO v_saldo_atual
  FROM public.carteiras
  WHERE user_id = p_usuario_reservou;
  
  -- DEBUG: Log do saldo encontrado
  RAISE NOTICE 'DEBUG processar_reserva - Saldo encontrado: %', v_saldo_atual;
  
  IF v_saldo_atual < p_valor THEN
    RAISE EXCEPTION 'Saldo insuficiente';
  END IF;
  
  -- Verificar se item está disponível
  SELECT publicado_por INTO v_usuario_item
  FROM public.itens
  WHERE id = p_item_id AND status = 'disponivel';
  
  IF v_usuario_item IS NULL THEN
    RAISE EXCEPTION 'Item não disponível';
  END IF;
  
  -- Verificar se já existe reserva ativa
  IF EXISTS (
    SELECT 1 FROM public.reservas 
    WHERE item_id = p_item_id 
    AND status IN ('pendente', 'confirmada')
  ) THEN
    RAISE EXCEPTION 'Item já reservado';
  END IF;
  
  -- Gerar código de confirmação único (6 dígitos)
  v_codigo_confirmacao := SUBSTRING(MD5(RANDOM()::text), 1, 6);
  
  -- Bloquear Girinhas (debitar da carteira)
  UPDATE public.carteiras 
  SET saldo_atual = saldo_atual - p_valor
  WHERE user_id = p_usuario_reservou;
  
  -- Registrar transação de bloqueio
  INSERT INTO public.transacoes (user_id, tipo, valor, descricao, item_id)
  VALUES (p_usuario_reservou, 'bloqueio', p_valor, 'Girinhas bloqueadas para reserva', p_item_id);
  
  -- Criar reserva com código
  INSERT INTO public.reservas (
    item_id, 
    usuario_reservou, 
    usuario_item, 
    valor_girinhas,
    codigo_confirmacao
  )
  VALUES (p_item_id, p_usuario_reservou, v_usuario_item, p_valor, v_codigo_confirmacao)
  RETURNING id INTO v_reserva_id;
  
  -- Marcar item como reservado
  UPDATE public.itens SET status = 'reservado' WHERE id = p_item_id;
  
  RETURN v_reserva_id;
END;
$$;

-- 4. Melhorar função cancelar_reserva para estorno seguro
CREATE OR REPLACE FUNCTION cancelar_reserva(p_reserva_id uuid, p_usuario_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $$
DECLARE
  v_reserva RECORD;
  v_pode_cancelar BOOLEAN := false;
BEGIN
  -- Buscar reserva
  SELECT * INTO v_reserva 
  FROM public.reservas 
  WHERE id = p_reserva_id 
    AND status = 'pendente';
  
  IF NOT FOUND THEN
    RETURN false;
  END IF;
  
  -- Verificar se usuário pode cancelar (comprador ou vendedor)
  IF v_reserva.usuario_reservou = p_usuario_id OR v_reserva.usuario_item = p_usuario_id THEN
    v_pode_cancelar := true;
  END IF;
  
  IF NOT v_pode_cancelar THEN
    RETURN false;
  END IF;
  
  -- Estornar Girinhas para o comprador
  UPDATE public.carteiras 
  SET saldo_atual = saldo_atual + v_reserva.valor_girinhas
  WHERE user_id = v_reserva.usuario_reservou;
  
  -- Registrar transação de estorno
  INSERT INTO public.transacoes (user_id, tipo, valor, descricao, item_id)
  VALUES (
    v_reserva.usuario_reservou, 
    'estorno', 
    v_reserva.valor_girinhas, 
    'Estorno por cancelamento de reserva', 
    v_reserva.item_id
  );
  
  -- Cancelar reserva
  UPDATE public.reservas 
  SET 
    status = 'cancelada',
    updated_at = now()
  WHERE id = p_reserva_id;
  
  -- Liberar item
  UPDATE public.itens 
  SET status = 'disponivel' 
  WHERE id = v_reserva.item_id;
  
  -- Processar próximo da fila
  PERFORM public.processar_proximo_fila(v_reserva.item_id);
  
  RETURN true;
  
EXCEPTION
  WHEN OTHERS THEN
    RETURN false;
END;
$$;
