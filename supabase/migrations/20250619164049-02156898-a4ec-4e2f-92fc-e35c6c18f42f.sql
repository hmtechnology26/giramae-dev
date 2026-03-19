
-- Corrigir função processar_reserva para usar saldo da tabela carteiras
CREATE OR REPLACE FUNCTION public.processar_reserva(p_item_id uuid, p_usuario_reservou uuid, p_valor numeric)
 RETURNS uuid
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
DECLARE
  v_saldo_atual DECIMAL(10,2);
  v_usuario_item UUID;
  v_reserva_id UUID;
BEGIN
  -- Verificar saldo na tabela carteiras
  SELECT saldo_atual INTO v_saldo_atual
  FROM public.carteiras
  WHERE user_id = p_usuario_reservou;
  
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
  
  -- Bloquear Girinhas (criar transação de débito)
  INSERT INTO public.transacoes (user_id, tipo, valor, descricao, item_id)
  VALUES (p_usuario_reservou, 'gasto', p_valor, 'Reserva - Girinhas bloqueadas', p_item_id);
  
  -- Criar reserva
  INSERT INTO public.reservas (
    item_id, 
    usuario_reservou, 
    usuario_item, 
    valor_girinhas
  )
  VALUES (p_item_id, p_usuario_reservou, v_usuario_item, p_valor)
  RETURNING id INTO v_reserva_id;
  
  -- Marcar item como reservado
  UPDATE public.itens SET status = 'reservado' WHERE id = p_item_id;
  
  RETURN v_reserva_id;
END;
$function$;

-- Corrigir função processar_proximo_fila para usar saldo da tabela carteiras
CREATE OR REPLACE FUNCTION public.processar_proximo_fila(p_item_id uuid)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
DECLARE
  v_proximo_usuario UUID;
  v_valor_item NUMERIC;
  v_saldo_usuario DECIMAL(10,2);
BEGIN
  -- Buscar próximo da fila
  SELECT usuario_id INTO v_proximo_usuario
  FROM public.fila_espera
  WHERE item_id = p_item_id
  ORDER BY posicao ASC
  LIMIT 1;
  
  IF v_proximo_usuario IS NOT NULL THEN
    -- Buscar valor do item
    SELECT valor_girinhas INTO v_valor_item
    FROM public.itens
    WHERE id = p_item_id;
    
    -- Verificar saldo do próximo usuário na tabela carteiras
    SELECT saldo_atual INTO v_saldo_usuario
    FROM public.carteiras
    WHERE user_id = v_proximo_usuario;
    
    -- Se tem saldo suficiente, processar reserva
    IF v_saldo_usuario >= v_valor_item THEN
      -- Remover da fila
      DELETE FROM public.fila_espera
      WHERE item_id = p_item_id AND usuario_id = v_proximo_usuario;
      
      -- Reordenar fila
      UPDATE public.fila_espera
      SET posicao = posicao - 1
      WHERE item_id = p_item_id AND posicao > 1;
      
      -- Processar reserva
      PERFORM public.processar_reserva(p_item_id, v_proximo_usuario, v_valor_item);
    ELSE
      -- Se não tem saldo, remover da fila e tentar próximo
      DELETE FROM public.fila_espera
      WHERE item_id = p_item_id AND usuario_id = v_proximo_usuario;
      
      -- Reordenar fila
      UPDATE public.fila_espera
      SET posicao = posicao - 1
      WHERE item_id = p_item_id AND posicao > 1;
      
      -- Tentar próximo recursivamente
      PERFORM public.processar_proximo_fila(p_item_id);
    END IF;
  END IF;
END;
$function$;
