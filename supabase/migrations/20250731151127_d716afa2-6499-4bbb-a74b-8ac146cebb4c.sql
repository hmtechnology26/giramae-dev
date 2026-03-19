-- Corrigir função cancelar_reserva_v2 removendo inserção em tabela inexistente
CREATE OR REPLACE FUNCTION public.cancelar_reserva_v2(
    p_reserva_id UUID,
    p_usuario_id UUID,
    p_motivo_codigo TEXT,
    p_observacoes TEXT DEFAULT NULL
) RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_reserva RECORD;
    v_novo_status_item TEXT;
    v_transacao_id UUID;
BEGIN
    -- Buscar dados da reserva
    SELECT * INTO v_reserva 
    FROM reservas 
    WHERE id = p_reserva_id 
    AND usuario_item = p_usuario_id 
    AND status = 'pendente';
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Reserva não encontrada ou não pode ser cancelada';
    END IF;
    
    -- Determinar novo status do item baseado no motivo
    IF p_motivo_codigo = 'remover_item' THEN
        v_novo_status_item := 'inativo';
    ELSE
        v_novo_status_item := 'disponivel';
    END IF;
    
    -- Criar transação de reembolso total
    INSERT INTO transacoes (
        user_id, tipo, valor, descricao, 
        item_id, reserva_id
    ) VALUES (
        v_reserva.usuario_reservou, 
        'reembolso', 
        v_reserva.valor_total,
        format('Reembolso por cancelamento: %s', p_motivo_codigo),
        v_reserva.item_id, 
        p_reserva_id
    ) RETURNING id INTO v_transacao_id;
    
    -- Atualizar saldo da carteira
    UPDATE carteiras 
    SET saldo_atual = saldo_atual + v_reserva.valor_total,
        total_gasto = total_gasto - v_reserva.valor_total
    WHERE user_id = v_reserva.usuario_reservou;
    
    -- Atualizar status do item
    UPDATE itens 
    SET status = v_novo_status_item 
    WHERE id = v_reserva.item_id;
    
    -- Marcar reserva como cancelada
    UPDATE reservas 
    SET 
        status = 'cancelada',
        motivo_cancelamento = p_motivo_codigo,
        observacoes_cancelamento = p_observacoes,
        cancelada_em = NOW(),
        cancelada_por = p_usuario_id
    WHERE id = p_reserva_id;
    
    -- Criar notificação para o comprador
    PERFORM create_notification(
        v_reserva.usuario_reservou,
        'reserva_cancelada',
        'Reserva cancelada',
        'Sua reserva foi cancelada pelo vendedor. O valor foi reembolsado.',
        jsonb_build_object(
            'reserva_id', p_reserva_id,
            'item_id', v_reserva.item_id,
            'motivo', p_motivo_codigo,
            'valor_reembolsado', v_reserva.valor_total
        )
    );
    
    RETURN TRUE;
    
EXCEPTION
    WHEN OTHERS THEN
        RAISE EXCEPTION 'Erro ao cancelar reserva: %', SQLERRM;
END;
$$;