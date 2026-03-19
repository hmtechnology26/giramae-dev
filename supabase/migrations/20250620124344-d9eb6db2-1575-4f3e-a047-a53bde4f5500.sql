
-- Corrigir a constraint para incluir o tipo 'missao' que está sendo usado
ALTER TABLE transacoes DROP CONSTRAINT IF EXISTS transacoes_tipo_check;

ALTER TABLE transacoes ADD CONSTRAINT transacoes_tipo_check 
CHECK (tipo IN (
  'recebido', 
  'gasto', 
  'bonus', 
  'compra', 
  'queima', 
  'transferencia_p2p_saida', 
  'transferencia_p2p_entrada', 
  'taxa',
  'missao_recompensa',
  'missao'
));

-- Criar a função coletar_recompensa_missao que está faltando
CREATE OR REPLACE FUNCTION coletar_recompensa_missao(p_user_id UUID, p_missao_id UUID)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_missao RECORD;
  v_usuario_missao RECORD;
  v_limite_record RECORD;
  v_nova_transacao_id UUID;
  v_resultado JSON;
BEGIN
  -- Buscar dados da missão
  SELECT * INTO v_missao FROM missoes WHERE id = p_missao_id AND ativo = true;
  
  IF NOT FOUND THEN
    RETURN json_build_object('sucesso', false, 'erro', 'Missão não encontrada');
  END IF;
  
  -- Buscar progresso do usuário na missão
  SELECT * INTO v_usuario_missao 
  FROM missoes_usuarios 
  WHERE user_id = p_user_id AND missao_id = p_missao_id AND status = 'completa';
  
  IF NOT FOUND THEN
    RETURN json_build_object('sucesso', false, 'erro', 'Missão não está completa');
  END IF;
  
  -- Verificar se já foi coletada
  IF v_usuario_missao.status = 'coletada' THEN
    RETURN json_build_object('sucesso', false, 'erro', 'Recompensa já foi coletada');
  END IF;
  
  -- Buscar ou criar limite do usuário
  SELECT * INTO v_limite_record FROM limites_missoes_usuarios WHERE user_id = p_user_id;
  
  IF NOT FOUND THEN
    INSERT INTO limites_missoes_usuarios (user_id, total_girinhas_coletadas, limite_maximo)
    VALUES (p_user_id, 0, 300)
    RETURNING * INTO v_limite_record;
  END IF;
  
  -- Verificar limite mensal
  IF v_limite_record.total_girinhas_coletadas + v_missao.recompensa_girinhas > v_limite_record.limite_maximo THEN
    RETURN json_build_object('sucesso', false, 'erro', 'Limite mensal de Girinhas excedido');
  END IF;
  
  -- Criar transação de recompensa
  INSERT INTO transacoes (user_id, tipo, valor, descricao, data_expiracao)
  VALUES (
    p_user_id, 
    'missao', 
    v_missao.recompensa_girinhas, 
    'Recompensa: ' || v_missao.titulo,
    CURRENT_DATE + (v_missao.validade_recompensa_meses || ' months')::INTERVAL
  )
  RETURNING id INTO v_nova_transacao_id;
  
  -- Atualizar carteira
  UPDATE carteiras 
  SET 
    saldo_atual = saldo_atual + v_missao.recompensa_girinhas,
    total_recebido = total_recebido + v_missao.recompensa_girinhas
  WHERE user_id = p_user_id;
  
  -- Marcar missão como coletada
  UPDATE missoes_usuarios 
  SET 
    status = 'coletada',
    data_coletada = now()
  WHERE user_id = p_user_id AND missao_id = p_missao_id;
  
  -- Atualizar limite do usuário
  UPDATE limites_missoes_usuarios 
  SET total_girinhas_coletadas = total_girinhas_coletadas + v_missao.recompensa_girinhas
  WHERE user_id = p_user_id;
  
  -- Registrar recompensa coletada
  INSERT INTO recompensas_missoes (
    user_id, 
    missao_id, 
    girinhas_recebidas, 
    transacao_id,
    data_expiracao_girinhas
  )
  VALUES (
    p_user_id, 
    p_missao_id, 
    v_missao.recompensa_girinhas, 
    v_nova_transacao_id,
    CURRENT_DATE + (v_missao.validade_recompensa_meses || ' months')::INTERVAL
  );
  
  RETURN json_build_object(
    'sucesso', true, 
    'girinhas_recebidas', v_missao.recompensa_girinhas
  );
  
EXCEPTION
  WHEN OTHERS THEN
    RETURN json_build_object('sucesso', false, 'erro', SQLERRM);
END;
$$;
