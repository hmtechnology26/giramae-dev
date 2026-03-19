-- Correção: Função cancelar_reserva_v2 com status correto para itens

CREATE OR REPLACE FUNCTION cancelar_reserva_v2(
  p_reserva_id UUID,
  p_usuario_id UUID,
  p_motivo_codigo TEXT,
  p_observacoes TEXT DEFAULT NULL
) RETURNS JSONB AS $$
DECLARE
  v_reserva RECORD;
  v_motivo RECORD;
  v_novo_status_item TEXT;
  v_transacao_id UUID;
  v_resultado JSONB;
BEGIN
  -- 🔒 SEGURANÇA: Verificar se reserva existe e pertence ao usuário
  SELECT * INTO v_reserva FROM reservas 
  WHERE id = p_reserva_id 
  AND (usuario_item = p_usuario_id OR usuario_reservou = p_usuario_id)
  AND status = 'pendente'
  FOR UPDATE;
  
  IF NOT FOUND THEN
    RETURN jsonb_build_object('sucesso', false, 'erro', 'Reserva não encontrada ou sem permissão');
  END IF;
  
  -- 🔒 SEGURANÇA: Verificar se motivo existe e está ativo
  SELECT * INTO v_motivo FROM motivos_cancelamento 
  WHERE codigo = p_motivo_codigo AND ativo = true;
  
  IF NOT FOUND THEN
    RETURN jsonb_build_object('sucesso', false, 'erro', 'Motivo de cancelamento inválido');
  END IF;
  
  -- ✅ CORREÇÃO: Determinar status correto do item baseado no motivo
  CASE p_motivo_codigo
    WHEN 'remover_item' THEN
      v_novo_status_item := 'excluido';  -- ✅ CORRIGIDO: era 'disponivel'
    WHEN 'trocar_comprador' THEN
      v_novo_status_item := 'disponivel';
    WHEN 'item_vendido_fora' THEN
      v_novo_status_item := 'excluido';
    WHEN 'item_defeituoso' THEN
      v_novo_status_item := 'excluido';
    WHEN 'preco_incorreto' THEN
      v_novo_status_item := 'disponivel';
    WHEN 'sem_interesse' THEN
      v_novo_status_item := 'disponivel';
    WHEN 'outro' THEN
      v_novo_status_item := 'disponivel';  -- Padrão conservador
    ELSE
      v_novo_status_item := 'disponivel';  -- Fallback seguro
  END CASE;
  
  -- 🔄 REEMBOLSO: Criar transação de reembolso TOTAL
  INSERT INTO transacoes (
    user_id, tipo, valor, descricao, 
    item_id, reserva_id, metadados
  ) VALUES (
    v_reserva.usuario_reservou, 'reembolso', v_reserva.valor_total,
    'Reembolso por cancelamento: ' || v_motivo.nome,
    v_reserva.item_id, p_reserva_id,
    jsonb_build_object(
      'motivo_codigo', p_motivo_codigo,
      'motivo_nome', v_motivo.nome,
      'observacoes', p_observacoes,
      'valor_item', v_reserva.valor_girinhas,
      'valor_taxa', v_reserva.valor_taxa
    )
  ) RETURNING id INTO v_transacao_id;
  
  -- 💰 CARTEIRA: Creditar valor total de volta
  UPDATE carteiras 
  SET saldo_atual = saldo_atual + v_reserva.valor_total
  WHERE user_id = v_reserva.usuario_reservou;
  
  -- 📦 ITEM: Atualizar status conforme motivo
  UPDATE itens 
  SET status = v_novo_status_item,
      updated_at = now()
  WHERE id = v_reserva.item_id;
  
  -- 🔄 RESERVA: Cancelar reserva
  UPDATE reservas 
  SET status = 'cancelada',
      motivo_cancelamento = p_motivo_codigo,
      observacoes_cancelamento = p_observacoes,
      cancelada_em = now(),
      cancelada_por = p_usuario_id
  WHERE id = p_reserva_id;
  
  -- 📊 MÉTRICAS: Registrar cancelamento
  INSERT INTO reservation_cancel_metrics (
    reserva_id, motivo_codigo, cancelado_por_tipo,
    valor_reembolsado, observacoes
  ) VALUES (
    p_reserva_id, p_motivo_codigo,
    CASE WHEN v_reserva.usuario_item = p_usuario_id THEN 'vendedor' ELSE 'comprador' END,
    v_reserva.valor_total, p_observacoes
  );
  
  -- 🔔 NOTIFICAÇÕES: Criar notificação para a outra parte
  PERFORM create_notification(
    CASE WHEN v_reserva.usuario_item = p_usuario_id 
         THEN v_reserva.usuario_reservou 
         ELSE v_reserva.usuario_item END,
    'reserva_cancelada',
    'Reserva cancelada',
    'Uma reserva foi cancelada: ' || v_motivo.nome,
    jsonb_build_object(
      'reserva_id', p_reserva_id,
      'item_id', v_reserva.item_id,
      'motivo', v_motivo.nome
    )
  );
  
  -- ✅ SUCESSO: Retornar resultado
  RETURN jsonb_build_object(
    'sucesso', true,
    'transacao_reembolso_id', v_transacao_id,
    'valor_reembolsado', v_reserva.valor_total,
    'novo_status_item', v_novo_status_item,
    'motivo', v_motivo.nome
  );
  
EXCEPTION
  WHEN OTHERS THEN
    RETURN jsonb_build_object('sucesso', false, 'erro', SQLERRM);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;