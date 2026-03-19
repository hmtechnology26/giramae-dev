
-- Verificar e corrigir também a função processar_reserva para usar saldo da tabela carteiras
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
  -- DEBUG: Log da função processar_reserva
  RAISE NOTICE 'DEBUG processar_reserva - Item: %, Usuario: %, Valor: %', p_item_id, p_usuario_reservou, p_valor;
  
  -- Verificar saldo na tabela carteiras (NÃO na profiles)
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
