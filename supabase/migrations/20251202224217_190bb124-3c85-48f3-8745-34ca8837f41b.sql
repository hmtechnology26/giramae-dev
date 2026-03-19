-- Corrigir função concluir_jornada para usar TEXT em vez de UUID para transacao_id
CREATE OR REPLACE FUNCTION concluir_jornada(
  p_user_id UUID,
  p_jornada_id TEXT
) RETURNS JSONB AS $$
DECLARE
  v_jornada RECORD;
  v_progresso RECORD;
  v_transacao_id TEXT;  -- Corrigido: TEXT em vez de UUID
BEGIN
  -- Buscar definição da jornada
  SELECT * INTO v_jornada 
  FROM jornadas_definicoes 
  WHERE id = p_jornada_id AND ativo = true;
  
  IF NOT FOUND THEN
    RETURN jsonb_build_object('sucesso', false, 'erro', 'Jornada não encontrada');
  END IF;
  
  -- Verificar se já foi concluída e recompensa coletada
  SELECT * INTO v_progresso 
  FROM jornadas_progresso 
  WHERE user_id = p_user_id AND jornada_id = p_jornada_id;
  
  IF v_progresso.recompensa_coletada THEN
    RETURN jsonb_build_object('sucesso', false, 'erro', 'Recompensa já coletada');
  END IF;
  
  -- Criar ou atualizar progresso
  INSERT INTO jornadas_progresso (user_id, jornada_id, concluida, data_conclusao, recompensa_coletada)
  VALUES (p_user_id, p_jornada_id, true, NOW(), true)
  ON CONFLICT (user_id, jornada_id) 
  DO UPDATE SET 
    concluida = true, 
    data_conclusao = NOW(),
    recompensa_coletada = true;
  
  -- Dar recompensa via ledger
  v_transacao_id := ledger_processar_bonus(
    p_user_id,
    'bonus_jornada',
    v_jornada.recompensa_girinhas,
    'Jornada: ' || v_jornada.titulo
  );
  
  RETURN jsonb_build_object(
    'sucesso', true,
    'recompensa', v_jornada.recompensa_girinhas,
    'titulo', v_jornada.titulo,
    'icone', v_jornada.icone,
    'transacao_id', v_transacao_id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;