
-- Corrigir função entrar_fila_espera para verificar saldo na tabela carteiras
CREATE OR REPLACE FUNCTION public.entrar_fila_espera(p_item_id uuid, p_usuario_id uuid, p_valor_girinhas numeric)
 RETURNS json
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
DECLARE
  v_saldo_atual DECIMAL(10,2);
  v_item_status TEXT;
  v_nova_posicao INTEGER;
  v_resultado JSON;
BEGIN
  -- Verificar saldo do usuário na tabela carteiras
  SELECT saldo_atual INTO v_saldo_atual
  FROM public.carteiras
  WHERE user_id = p_usuario_id;
  
  IF v_saldo_atual IS NULL THEN
    RAISE EXCEPTION 'Carteira não encontrada para o usuário';
  END IF;
  
  IF v_saldo_atual < p_valor_girinhas THEN
    RAISE EXCEPTION 'Saldo insuficiente para entrar na fila';
  END IF;
  
  -- Verificar se o item existe e não está vendido
  SELECT status INTO v_item_status
  FROM public.itens
  WHERE id = p_item_id;
  
  IF v_item_status IS NULL THEN
    RAISE EXCEPTION 'Item não encontrado';
  END IF;
  
  IF v_item_status = 'vendido' THEN
    RAISE EXCEPTION 'Item já foi vendido';
  END IF;
  
  -- Verificar se usuário já está na fila
  IF EXISTS (
    SELECT 1 FROM public.fila_espera 
    WHERE item_id = p_item_id AND usuario_id = p_usuario_id
  ) THEN
    RAISE EXCEPTION 'Usuário já está na fila para este item';
  END IF;
  
  -- Se item está disponível, fazer reserva direta
  IF v_item_status = 'disponivel' THEN
    -- Usar função existente de processar reserva
    SELECT public.processar_reserva(p_item_id, p_usuario_id, p_valor_girinhas) INTO v_resultado;
    RETURN json_build_object('tipo', 'reserva_direta', 'reserva_id', v_resultado);
  END IF;
  
  -- Se item está reservado, adicionar à fila
  -- Calcular próxima posição
  SELECT COALESCE(MAX(posicao), 0) + 1 INTO v_nova_posicao
  FROM public.fila_espera
  WHERE item_id = p_item_id;
  
  -- Inserir na fila
  INSERT INTO public.fila_espera (item_id, usuario_id, posicao)
  VALUES (p_item_id, p_usuario_id, v_nova_posicao);
  
  RETURN json_build_object(
    'tipo', 'fila_espera', 
    'posicao', v_nova_posicao,
    'total_fila', v_nova_posicao
  );
END;
$function$
