-- T3_FUNC_CANCELAR_RESERVA_PATCH - Estender função cancelar_reserva com motivo

-- FILE: supabase/migrations/20250117000002_patch_cancelar_reserva_motivo.sql

-- Backup da função atual (comentário para referência)
-- A função cancelar_reserva já existe e retorna boolean
-- Vamos criar uma versão que aceita o parâmetro p_motivo

-- TODO: HUMANO CONFIRMAR - Verificar assinatura atual da função antes de aplicar
-- Execute: \df public.cancelar_reserva para ver assinatura atual

CREATE OR REPLACE FUNCTION public.cancelar_reserva(
    p_reserva_id uuid, 
    p_usuario_id uuid, 
    p_motivo text DEFAULT NULL
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
    v_reserva RECORD;
    v_item RECORD;
    v_saldo_atual DECIMAL(10,2);
    v_valor_reembolso DECIMAL(10,2);
    v_novo_status TEXT;
BEGIN
    -- Buscar dados da reserva com lock
    SELECT * INTO v_reserva
    FROM reservas 
    WHERE id = p_reserva_id
    FOR UPDATE;
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Reserva não encontrada';
    END IF;
    
    -- Verificar se o usuário tem direito de cancelar
    IF v_reserva.usuario_reservou != p_usuario_id AND v_reserva.usuario_item != p_usuario_id THEN
        RAISE EXCEPTION 'Usuário não tem permissão para cancelar esta reserva';
    END IF;
    
    -- Verificar se a reserva pode ser cancelada
    IF v_reserva.status != 'pendente' THEN
        RAISE EXCEPTION 'Só é possível cancelar reservas pendentes';
    END IF;
    
    -- Buscar dados do item
    SELECT * INTO v_item
    FROM itens 
    WHERE id = v_reserva.item_id;
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Item não encontrado';
    END IF;
    
    -- Calcular valor de reembolso (valor total pago)
    v_valor_reembolso := v_reserva.valor_total;
    
    -- Determinar status baseado no motivo
    v_novo_status := CASE 
        WHEN p_motivo = 'expirou' THEN 'expirada'
        ELSE 'cancelada'
    END;
    
    -- Atualizar status da reserva com motivo
    UPDATE reservas 
    SET 
        status = v_novo_status,
        motivo_cancelamento = p_motivo,
        updated_at = now()
    WHERE id = p_reserva_id;
    
    -- Reembolsar o valor para o comprador (quem reservou)
    IF v_valor_reembolso > 0 THEN
        -- Atualizar carteira
        UPDATE carteiras 
        SET 
            saldo_atual = saldo_atual + v_valor_reembolso,
            total_gasto = total_gasto - v_valor_reembolso,
            updated_at = now()
        WHERE user_id = v_reserva.usuario_reservou;
        
        -- Criar transação de reembolso
        INSERT INTO transacoes (
            user_id, 
            tipo, 
            valor, 
            descricao, 
            item_id
        ) VALUES (
            v_reserva.usuario_reservou,
            'reembolso',
            v_valor_reembolso,
            'Reembolso por cancelamento: ' || COALESCE(p_motivo, 'cancelamento'),
            v_reserva.item_id
        );
    END IF;
    
    -- Liberar o item (tornar disponível novamente)
    UPDATE itens 
    SET status = 'disponivel'
    WHERE id = v_reserva.item_id;
    
    -- Processar próximo da fila de espera
    PERFORM processar_proximo_fila(v_reserva.item_id);
    
    -- TODO: HUMANO CONFIRMAR - Implementar penalidades de reputação se necessário
    -- Aplicar penalidades baseadas no motivo (se configurado)
    -- Esta parte será implementada em fase posterior
    
    -- Registrar métrica de cancelamento (opcional)
    INSERT INTO reservation_cancel_metrics (dt, motivo, total)
    VALUES (CURRENT_DATE, COALESCE(p_motivo, 'sem_motivo'), 1)
    ON CONFLICT (dt, motivo) 
    DO UPDATE SET total = reservation_cancel_metrics.total + 1;
    
    RETURN TRUE;
    
EXCEPTION
    WHEN OTHERS THEN
        -- Log do erro
        RAISE NOTICE 'Erro ao cancelar reserva %: %', p_reserva_id, SQLERRM;
        RETURN FALSE;
END;
$function$;