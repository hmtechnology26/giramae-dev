
-- Verificar e corrigir a função entrar_fila_espera uma vez mais
-- Garantindo que ela use apenas a tabela carteiras para verificação de saldo
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
  v_reserva_id UUID;
BEGIN
  -- DEBUG: Log dos parâmetros recebidos
  RAISE NOTICE 'DEBUG entrar_fila_espera - Item: %, Usuario: %, Valor: %', p_item_id, p_usuario_id, p_valor_girinhas;
  
  -- Verificar saldo do usuário APENAS na tabela carteiras
  SELECT saldo_atual INTO v_saldo_atual
  FROM public.carteiras
  WHERE user_id = p_usuario_id;
  
  -- DEBUG: Log do saldo encontrado
  RAISE NOTICE 'DEBUG - Saldo encontrado na carteira: %', v_saldo_atual;
  
  IF v_saldo_atual IS NULL THEN
    RAISE EXCEPTION 'Carteira não encontrada para o usuário';
  END IF;
  
  IF v_saldo_atual < p_valor_girinhas THEN
    RAISE EXCEPTION 'Saldo insuficiente para entrar na fila. Saldo atual: %, Necessário: %', v_saldo_atual, p_valor_girinhas;
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
    -- Usar função existente de processar reserva e capturar o UUID retornado
    SELECT public.processar_reserva(p_item_id, p_usuario_id, p_valor_girinhas) INTO v_reserva_id;
    RETURN json_build_object('tipo', 'reserva_direta', 'reserva_id', v_reserva_id);
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
$function$;
