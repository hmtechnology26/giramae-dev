-- Fase 1: Correções Críticas do Sistema de Cancelamento
-- Migration 001: Fix constraint issues e sistema de motivos robusto

-- 1. Criar tabela de motivos de cancelamento se não existir
CREATE TABLE IF NOT EXISTS motivos_cancelamento (
    id SERIAL PRIMARY KEY,
    codigo VARCHAR(50) UNIQUE NOT NULL,
    nome VARCHAR(100) NOT NULL,
    descricao TEXT,
    ativo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Popula com motivos válidos
INSERT INTO motivos_cancelamento (codigo, nome, descricao) VALUES
('remover_item', 'Não vou mais vender esse item e quero remover da plataforma', 'Remove o item permanentemente da plataforma'),
('trocar_comprador', 'Não me acertei com atual comprador. Encontrar outro comprador', 'Disponibiliza o item para outros compradores'),
('outro', 'Outro motivo', 'Motivo personalizado especificado pelo vendedor'),
('comprador_desistencia', 'Comprador desistiu', 'Cancelamento iniciado pelo comprador'),
('sistema_expiracao', 'Reserva expirou', 'Cancelamento automático por expiração')
ON CONFLICT (codigo) DO NOTHING;

-- 3. Criar tabela de fila de processamento para controle robusto
CREATE TABLE IF NOT EXISTS fila_processamento (
    id SERIAL PRIMARY KEY,
    reserva_id UUID NOT NULL,
    item_id UUID NOT NULL,
    tipo_operacao VARCHAR(50) NOT NULL, -- 'cancelamento', 'expiracao', 'proximo_fila'
    status INTEGER DEFAULT 0, -- 0: pendente, 1: processando, 2: concluído, 3: falhou
    tentativas INTEGER DEFAULT 0,
    max_tentativas INTEGER DEFAULT 3,
    lease_expira TIMESTAMP WITH TIME ZONE,
    erro_mensagem TEXT,
    metadados JSONB DEFAULT '{}',
    criado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    processado_em TIMESTAMP WITH TIME ZONE
);

-- 4. Criar índices de performance para fila
CREATE INDEX IF NOT EXISTS idx_fila_processamento_status ON fila_processamento(status) WHERE status IN (0, 1);
CREATE INDEX IF NOT EXISTS idx_fila_processamento_lease ON fila_processamento(lease_expira) WHERE status = 1;
CREATE INDEX IF NOT EXISTS idx_fila_processamento_item ON fila_processamento(item_id);

-- 5. Criar tabela de dead letter queue para falhas
CREATE TABLE IF NOT EXISTS fila_dead_letter (
    id SERIAL PRIMARY KEY,
    reserva_id UUID NOT NULL,
    item_id UUID NOT NULL,
    tipo_operacao VARCHAR(50) NOT NULL,
    tentativas_finais INTEGER,
    ultimo_erro TEXT,
    metadados JSONB DEFAULT '{}',
    criado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Melhorar função processar_proximo_fila com controle de concorrência
CREATE OR REPLACE FUNCTION processar_proximo_fila(p_item_id UUID)
RETURNS TABLE(nova_reserva_id UUID, usuario_id UUID, sucesso BOOLEAN) AS $$
DECLARE
    proximo_usuario RECORD;
    v_nova_reserva_id UUID;
    v_codigo_confirmacao TEXT;
BEGIN
    -- Buscar próximo da fila com lock para evitar concorrência
    SELECT fe.usuario_id, fe.posicao 
    INTO proximo_usuario
    FROM fila_espera fe
    WHERE fe.item_id = p_item_id
    ORDER BY fe.posicao ASC
    LIMIT 1
    FOR UPDATE SKIP LOCKED;
    
    IF FOUND THEN
        -- Gerar código de confirmação
        v_codigo_confirmacao := LPAD((FLOOR(random() * 900000) + 100000)::TEXT, 6, '0');
        
        -- Buscar valor do item
        WITH item_data AS (
            SELECT valor_girinhas, publicado_por 
            FROM itens 
            WHERE id = p_item_id
        )
        INSERT INTO reservas (
            item_id, 
            usuario_item, 
            usuario_reservou,
            valor_girinhas,
            valor_taxa,
            valor_total,
            codigo_confirmacao,
            status,
            created_at
        )
        SELECT 
            p_item_id,
            item_data.publicado_por,
            proximo_usuario.usuario_id,
            item_data.valor_girinhas,
            ROUND(item_data.valor_girinhas * 0.05, 2), -- Taxa de 5%
            item_data.valor_girinhas + ROUND(item_data.valor_girinhas * 0.05, 2),
            v_codigo_confirmacao,
            'pendente',
            NOW()
        FROM item_data
        RETURNING id INTO v_nova_reserva_id;
        
        -- Atualizar status do item
        UPDATE itens 
        SET status = 'reservado' 
        WHERE id = p_item_id;
        
        -- Remover da fila e reordenar posições
        DELETE FROM fila_espera 
        WHERE item_id = p_item_id AND usuario_id = proximo_usuario.usuario_id;
        
        UPDATE fila_espera 
        SET posicao = posicao - 1 
        WHERE item_id = p_item_id AND posicao > proximo_usuario.posicao;
        
        -- Registrar na fila de processamento para notificações
        INSERT INTO fila_processamento (reserva_id, item_id, tipo_operacao, metadados)
        VALUES (v_nova_reserva_id, p_item_id, 'nova_reserva', 
                jsonb_build_object('usuario_anterior', NULL, 'proximo_usuario', proximo_usuario.usuario_id));
        
        RETURN QUERY SELECT v_nova_reserva_id, proximo_usuario.usuario_id, TRUE;
    ELSE
        -- Nenhum usuário na fila, marcar item como disponível
        UPDATE itens 
        SET status = 'disponivel' 
        WHERE id = p_item_id;
        
        RETURN QUERY SELECT NULL::UUID, NULL::UUID, FALSE;
    END IF;
    
EXCEPTION WHEN OTHERS THEN
    -- Log do erro
    INSERT INTO fila_dead_letter (reserva_id, item_id, tipo_operacao, ultimo_erro)
    VALUES (NULL, p_item_id, 'processar_proximo_fila', SQLERRM);
    
    RETURN QUERY SELECT NULL::UUID, NULL::UUID, FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7. Criar função melhorada para cancelar reserva com diferentes motivos
CREATE OR REPLACE FUNCTION cancelar_reserva_v2(
    p_reserva_id UUID,
    p_usuario_id UUID,
    p_motivo_codigo VARCHAR(50),
    p_observacoes TEXT DEFAULT NULL
)
RETURNS JSONB AS $$
DECLARE
    v_reserva RECORD;
    v_motivo RECORD;
    v_resultado JSONB;
    v_processamento_fila BOOLEAN := FALSE;
BEGIN
    -- Buscar dados da reserva
    SELECT r.*, i.titulo as item_titulo, i.publicado_por as vendedor_id
    INTO v_reserva
    FROM reservas r
    JOIN itens i ON i.id = r.item_id
    WHERE r.id = p_reserva_id AND r.status = 'pendente'
    FOR UPDATE;
    
    IF NOT FOUND THEN
        RETURN jsonb_build_object('sucesso', false, 'erro', 'Reserva não encontrada ou já processada');
    END IF;
    
    -- Verificar se o usuário tem permissão para cancelar
    IF p_usuario_id != v_reserva.usuario_reservou AND p_usuario_id != v_reserva.vendedor_id THEN
        RETURN jsonb_build_object('sucesso', false, 'erro', 'Usuário não autorizado');
    END IF;
    
    -- Buscar motivo de cancelamento
    SELECT * INTO v_motivo FROM motivos_cancelamento WHERE codigo = p_motivo_codigo AND ativo = true;
    
    IF NOT FOUND THEN
        RETURN jsonb_build_object('sucesso', false, 'erro', 'Motivo de cancelamento inválido');
    END IF;
    
    -- Atualizar status da reserva
    UPDATE reservas 
    SET status = 'cancelada',
        updated_at = NOW()
    WHERE id = p_reserva_id;
    
    -- Registrar o cancelamento
    INSERT INTO fila_processamento (reserva_id, item_id, tipo_operacao, metadados)
    VALUES (p_reserva_id, v_reserva.item_id, 'cancelamento', 
            jsonb_build_object(
                'motivo_codigo', p_motivo_codigo,
                'motivo_nome', v_motivo.nome,
                'observacoes', p_observacoes,
                'cancelado_por', p_usuario_id
            ));
    
    -- Processar reembolso para o comprador
    INSERT INTO transacoes (user_id, tipo, valor, descricao, item_id, reserva_id)
    VALUES (v_reserva.usuario_reservou, 'reembolso', v_reserva.valor_total,
            'Reembolso por cancelamento: ' || v_motivo.nome, v_reserva.item_id, p_reserva_id);
    
    -- Atualizar carteira do comprador
    UPDATE carteiras 
    SET saldo_atual = saldo_atual + v_reserva.valor_total,
        total_recebido = total_recebido + v_reserva.valor_total
    WHERE user_id = v_reserva.usuario_reservou;
    
    -- Processar item baseado no motivo
    CASE p_motivo_codigo
        WHEN 'remover_item' THEN
            -- Remove item e limpa fila
            UPDATE itens SET status = 'removido' WHERE id = v_reserva.item_id;
            DELETE FROM fila_espera WHERE item_id = v_reserva.item_id;
            
        WHEN 'trocar_comprador' THEN
            -- Processa próximo da fila
            SELECT sucesso INTO v_processamento_fila 
            FROM processar_proximo_fila(v_reserva.item_id);
            
        WHEN 'outro' THEN
            -- Processa próximo da fila
            SELECT sucesso INTO v_processamento_fila 
            FROM processar_proximo_fila(v_reserva.item_id);
            
        ELSE
            -- Para outros motivos, deixa disponível
            UPDATE itens SET status = 'disponivel' WHERE id = v_reserva.item_id;
    END CASE;
    
    v_resultado := jsonb_build_object(
        'sucesso', true,
        'reserva_id', p_reserva_id,
        'motivo', v_motivo.nome,
        'valor_reembolsado', v_reserva.valor_total,
        'fila_processada', v_processamento_fila
    );
    
    RETURN v_resultado;
    
EXCEPTION WHEN OTHERS THEN
    -- Log do erro
    INSERT INTO fila_dead_letter (reserva_id, item_id, tipo_operacao, ultimo_erro)
    VALUES (p_reserva_id, v_reserva.item_id, 'cancelamento', SQLERRM);
    
    RETURN jsonb_build_object('sucesso', false, 'erro', SQLERRM);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 8. Função para processar fila de processamento com retry
CREATE OR REPLACE FUNCTION processar_fila_com_retry()
RETURNS TABLE(processados INTEGER, falharam INTEGER) AS $$
DECLARE
    item_fila RECORD;
    total_processados INTEGER := 0;
    total_falharam INTEGER := 0;
BEGIN
    FOR item_fila IN 
        SELECT * FROM fila_processamento 
        WHERE (status = 0 OR (status = 1 AND lease_expira < NOW()))
        AND tentativas < max_tentativas
        ORDER BY criado_em ASC
        FOR UPDATE SKIP LOCKED
        LIMIT 50 -- Processa em lotes
    LOOP
        BEGIN
            -- Marca como processando
            UPDATE fila_processamento 
            SET status = 1, 
                tentativas = tentativas + 1,
                lease_expira = NOW() + INTERVAL '5 minutes'
            WHERE id = item_fila.id;
            
            -- Processa baseado no tipo
            CASE item_fila.tipo_operacao
                WHEN 'nova_reserva' THEN
                    -- Enviar notificação de nova reserva
                    PERFORM create_notification(
                        (item_fila.metadados->>'proximo_usuario')::UUID,
                        'item_reservado',
                        'Você ganhou uma reserva!',
                        'Um item da sua fila de espera ficou disponível.',
                        jsonb_build_object('reserva_id', item_fila.reserva_id)
                    );
                    
                WHEN 'cancelamento' THEN
                    -- Processar notificações de cancelamento
                    PERFORM create_notification(
                        (SELECT usuario_reservou FROM reservas WHERE id = item_fila.reserva_id),
                        'reserva_cancelada',
                        'Reserva cancelada',
                        'Sua reserva foi cancelada e o valor foi reembolsado.',
                        jsonb_build_object('reserva_id', item_fila.reserva_id)
                    );
            END CASE;
            
            -- Marca como concluído
            UPDATE fila_processamento 
            SET status = 2, processado_em = NOW()
            WHERE id = item_fila.id;
            
            total_processados := total_processados + 1;
            
        EXCEPTION WHEN OTHERS THEN
            -- Move para dead letter se excedeu tentativas
            IF item_fila.tentativas >= item_fila.max_tentativas - 1 THEN
                INSERT INTO fila_dead_letter (reserva_id, item_id, tipo_operacao, tentativas_finais, ultimo_erro, metadados)
                VALUES (item_fila.reserva_id, item_fila.item_id, item_fila.tipo_operacao, 
                        item_fila.tentativas + 1, SQLERRM, item_fila.metadados);
                
                UPDATE fila_processamento SET status = 3 WHERE id = item_fila.id;
                total_falharam := total_falharam + 1;
            ELSE
                -- Volta para pendente com delay exponencial
                UPDATE fila_processamento 
                SET status = 0,
                    erro_mensagem = SQLERRM,
                    lease_expira = NOW() + (item_fila.tentativas * INTERVAL '30 seconds')
                WHERE id = item_fila.id;
            END IF;
        END;
    END LOOP;
    
    RETURN QUERY SELECT total_processados, total_falharam;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;