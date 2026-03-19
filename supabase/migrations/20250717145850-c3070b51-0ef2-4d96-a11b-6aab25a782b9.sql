-- T4_FUNC_EXPIRADAS_BATCH - Função para processar reservas expiradas em lote

-- FILE: supabase/migrations/20250117000003_func_processar_expiradas_batch.sql

CREATE OR REPLACE FUNCTION public.processar_reservas_expiradas_batch(
    p_batch_size integer DEFAULT 500
)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
    v_reserva RECORD;
    v_processed_count INTEGER := 0;
    v_max_batch_size CONSTANT INTEGER := 1000; -- Limite de segurança
BEGIN
    -- Validar tamanho do batch
    IF p_batch_size <= 0 OR p_batch_size > v_max_batch_size THEN
        RAISE EXCEPTION 'Batch size deve estar entre 1 e %', v_max_batch_size;
    END IF;
    
    -- Log início do processamento
    RAISE NOTICE 'Iniciando processamento de reservas expiradas - batch size: %', p_batch_size;
    
    -- Loop sobre reservas expiradas usando cursor com lock
    FOR v_reserva IN (
        SELECT id, usuario_reservou, item_id, prazo_expiracao
        FROM reservas 
        WHERE status = 'pendente' 
        AND prazo_expiracao < now()
        ORDER BY prazo_expiracao ASC
        LIMIT p_batch_size
        FOR UPDATE SKIP LOCKED
    ) LOOP
        BEGIN
            -- Chamar função de cancelamento com motivo 'expirou'
            PERFORM cancelar_reserva(v_reserva.id, v_reserva.usuario_reservou, 'expirou');
            
            -- Criar notificação para o comprador
            INSERT INTO notifications (
                user_id, 
                type, 
                title, 
                message, 
                data
            ) VALUES (
                v_reserva.usuario_reservou,
                'reserva_expirada',
                'Reserva expirada',
                'Sua reserva expirou automaticamente. O valor foi reembolsado.',
                jsonb_build_object(
                    'reserva_id', v_reserva.id,
                    'item_id', v_reserva.item_id,
                    'prazo_expiracao', v_reserva.prazo_expiracao
                )
            );
            
            -- Buscar dono do item para notificar também
            INSERT INTO notifications (
                user_id, 
                type, 
                title, 
                message, 
                data
            )
            SELECT 
                i.publicado_por,
                'item_liberado',
                'Item liberado',
                'Uma reserva do seu item expirou. O item está disponível novamente.',
                jsonb_build_object(
                    'reserva_id', v_reserva.id,
                    'item_id', v_reserva.item_id,
                    'item_titulo', i.titulo
                )
            FROM itens i
            WHERE i.id = v_reserva.item_id;
            
            v_processed_count := v_processed_count + 1;
            
        EXCEPTION
            WHEN OTHERS THEN
                -- Log erro mas continua processando outras reservas
                RAISE NOTICE 'Erro ao processar reserva %: %', v_reserva.id, SQLERRM;
                -- Inserir log de erro
                INSERT INTO error_log (
                    error_message, 
                    error_details, 
                    created_at
                ) VALUES (
                    'Erro ao expirar reserva: ' || SQLERRM,
                    jsonb_build_object(
                        'reserva_id', v_reserva.id,
                        'function', 'processar_reservas_expiradas_batch'
                    ),
                    now()
                );
        END;
    END LOOP;
    
    -- Log resultado
    RAISE NOTICE 'Processamento concluído. Reservas expiradas: %', v_processed_count;
    
    RETURN v_processed_count;
    
EXCEPTION
    WHEN OTHERS THEN
        -- Log erro geral
        RAISE NOTICE 'Erro geral em processar_reservas_expiradas_batch: %', SQLERRM;
        RETURN -1;
END;
$function$;