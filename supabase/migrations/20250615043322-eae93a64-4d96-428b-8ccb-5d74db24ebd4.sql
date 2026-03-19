
-- Função para sair da fila de espera
CREATE OR REPLACE FUNCTION public.sair_fila_espera(p_item_id uuid, p_usuario_id uuid)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
DECLARE
  v_posicao_removida INTEGER;
BEGIN
  -- Buscar a posição do usuário na fila
  SELECT posicao INTO v_posicao_removida
  FROM public.fila_espera
  WHERE item_id = p_item_id AND usuario_id = p_usuario_id;
  
  IF v_posicao_removida IS NULL THEN
    RAISE EXCEPTION 'Usuário não está na fila para este item';
  END IF;
  
  -- Remover usuário da fila
  DELETE FROM public.fila_espera
  WHERE item_id = p_item_id AND usuario_id = p_usuario_id;
  
  -- Reordenar fila (diminuir posição de todos que estavam após o usuário removido)
  UPDATE public.fila_espera
  SET posicao = posicao - 1
  WHERE item_id = p_item_id AND posicao > v_posicao_removida;
  
  RETURN true;
END;
$function$
