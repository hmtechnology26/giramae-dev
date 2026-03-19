
-- ==========================================
-- FASE 1: LIMPEZA COMPLETA - REMOÇÃO DE CÓDIGO LEGADO
-- ==========================================

-- 1. DELETAR FUNÇÕES OBSOLETAS DE COTAÇÃO DINÂMICA
DROP FUNCTION IF EXISTS calcular_cotacao_dinamica();
DROP FUNCTION IF EXISTS obter_preco_emissao();
DROP FUNCTION IF EXISTS simular_preco_emissao();
DROP FUNCTION IF EXISTS ajustar_markup_emissao(NUMERIC);
DROP FUNCTION IF EXISTS calcular_markup_para_preco_alvo(NUMERIC);
DROP FUNCTION IF EXISTS obter_cotacao_mercado();
DROP FUNCTION IF EXISTS relatorio_cotacao_detalhado();
DROP FUNCTION IF EXISTS simular_banda_cambial(NUMERIC);
DROP FUNCTION IF EXISTS simular_markup_inteligente(NUMERIC);
DROP FUNCTION IF EXISTS obter_preco_venda_girinhas();
DROP FUNCTION IF EXISTS obter_preco_recompra_girinhas();
DROP FUNCTION IF EXISTS cotacao_mercado();
DROP FUNCTION IF EXISTS preco_emissao();
DROP FUNCTION IF EXISTS cotacao_atual();

-- 2. DELETAR FUNÇÕES COM LÓGICA HARDCODED E DUPLICADAS
DROP FUNCTION IF EXISTS processar_reserva(uuid, uuid, numeric);
DROP FUNCTION IF EXISTS confirmar_entrega(uuid, uuid);
DROP FUNCTION IF EXISTS processar_queima_transacao();
DROP FUNCTION IF EXISTS testar_precos_tela();

-- 3. DELETAR TABELAS OBSOLETAS
DROP TABLE IF EXISTS cotacao_girinhas CASCADE;
DROP TABLE IF EXISTS historico_cotacao CASCADE;

-- 4. REMOVER TRIGGERS DESNECESSÁRIOS
DROP TRIGGER IF EXISTS trigger_queima_transacao ON reservas;

-- ==========================================
-- FASE 2: REORGANIZAÇÃO ATÔMICA
-- ==========================================

-- 1. ADICIONAR CAMPOS DE AUDITORIA NA TABELA TRANSAÇÕES
ALTER TABLE transacoes 
ADD COLUMN IF NOT EXISTS metadados JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS reserva_id UUID REFERENCES reservas(id),
ADD COLUMN IF NOT EXISTS transferencia_id UUID REFERENCES transferencias_girinhas(id);

-- 2. ATUALIZAR CONSTRAINT DE TIPOS DE TRANSAÇÃO
ALTER TABLE transacoes DROP CONSTRAINT IF EXISTS transacoes_tipo_check;
ALTER TABLE transacoes ADD CONSTRAINT transacoes_tipo_check 
CHECK (tipo IN (
    -- Entrada de Girinhas
    'compra',                    -- Compra com dinheiro real
    'bonus',                     -- Bônus (cadastro, diário, etc)
    'missao',                    -- Recompensa de missão
    'transferencia_p2p_entrada', -- P2P recebida
    'recebido',                  -- Venda de item confirmada
    'reembolso',                 -- Cancelamento de reserva
    
    -- Saída de Girinhas  
    'gasto',                     -- DEPRECATED - usar bloqueio_reserva
    'bloqueio_reserva',          -- Bloqueio ao reservar item
    'taxa',                      -- Todas as taxas
    'transferencia_p2p_saida',   -- P2P enviada
    'extensao_validade',         -- Taxa de renovação
    'queima'                     -- Queima administrativa
));

-- 3. ADICIONAR CONSTRAINT DE VALOR POSITIVO (sem IF NOT EXISTS)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints 
                   WHERE constraint_name = 'check_valor_positivo' AND table_name = 'transacoes') THEN
        ALTER TABLE transacoes ADD CONSTRAINT check_valor_positivo CHECK (valor > 0);
    END IF;
END $$;

-- 4. CRIAR ÍNDICES PARA PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_transacoes_user_tipo ON transacoes(user_id, tipo);
CREATE INDEX IF NOT EXISTS idx_transacoes_expiracao ON transacoes(data_expiracao) WHERE data_expiracao IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_transacoes_created ON transacoes(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_transacoes_reserva ON transacoes(reserva_id) WHERE reserva_id IS NOT NULL;

-- ==========================================
-- FASE 3: SISTEMA UNIFICADO - FUNÇÕES V2
-- ==========================================

-- 1. FUNÇÃO MASTER DE PROCESSAMENTO ATÔMICO
CREATE OR REPLACE FUNCTION processar_transacao_atomica(
    p_operacao TEXT,
    p_dados JSONB
) RETURNS JSONB AS $$
DECLARE
    v_resultado JSONB;
BEGIN
    -- Garantir atomicidade com EXCEPTION block
    BEGIN
        CASE p_operacao
            WHEN 'compra_girinhas' THEN
                v_resultado := processar_compra_girinhas_v2(p_dados);
            WHEN 'reservar_item' THEN
                v_resultado := processar_reserva_item_v2(p_dados);
            WHEN 'confirmar_entrega' THEN
                v_resultado := processar_confirmacao_entrega_v2(p_dados);
            WHEN 'transferir_p2p' THEN
                v_resultado := processar_transferencia_p2p_v2(p_dados);
            WHEN 'renovar_validade' THEN
                v_resultado := processar_renovacao_validade_v2(p_dados);
            WHEN 'bonus_diario' THEN
                v_resultado := processar_bonus_diario_v2(p_dados);
            ELSE
                RAISE EXCEPTION 'Operação não reconhecida: %', p_operacao;
        END CASE;
        
        RETURN v_resultado;
    EXCEPTION
        WHEN OTHERS THEN
            -- Rollback automático e log do erro
            RAISE NOTICE 'Erro na operação %: %', p_operacao, SQLERRM;
            RETURN jsonb_build_object(
                'sucesso', false,
                'erro', SQLERRM
            );
    END;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. COMPRA DE GIRINHAS V2 (COM PREÇO MANUAL)
CREATE OR REPLACE FUNCTION processar_compra_girinhas_v2(p_dados JSONB)
RETURNS JSONB AS $$
DECLARE
    v_user_id UUID := (p_dados->>'user_id')::UUID;
    v_quantidade DECIMAL := (p_dados->>'quantidade')::DECIMAL;
    v_payment_id TEXT := p_dados->>'payment_id';
    v_preco_config JSONB;
    v_preco_unitario DECIMAL;
    v_valor_total DECIMAL;
    v_transacao_id UUID;
    v_validade_config JSONB;
    v_meses_validade INTEGER;
BEGIN
    -- Validações
    IF v_quantidade <= 0 OR v_quantidade > 999000 THEN
        RETURN jsonb_build_object('sucesso', false, 'erro', 'Quantidade inválida');
    END IF;
    
    -- Obter preço manual configurado
    SELECT valor INTO v_preco_config FROM config_sistema WHERE chave = 'preco_manual_girinhas';
    v_preco_unitario := (v_preco_config->>'valor')::DECIMAL;
    IF v_preco_unitario IS NULL THEN
        v_preco_unitario := 1.00; -- Fallback
    END IF;
    v_valor_total := v_quantidade * v_preco_unitario;
    
    -- Obter validade configurada
    SELECT valor INTO v_validade_config FROM config_sistema WHERE chave = 'validade_girinhas';
    v_meses_validade := (v_validade_config->>'meses')::INTEGER;
    IF v_meses_validade IS NULL THEN
        v_meses_validade := 12; -- Fallback
    END IF;
    
    -- Criar transação com validade e metadados
    INSERT INTO transacoes (
        user_id, tipo, valor, descricao,
        valor_real, quantidade_girinhas, 
        data_expiracao, metadados
    ) VALUES (
        v_user_id, 'compra', v_quantidade,
        format('Compra de %s Girinhas', v_quantidade),
        v_valor_total, v_quantidade,
        CURRENT_DATE + (v_meses_validade || ' months')::INTERVAL,
        jsonb_build_object(
            'payment_id', v_payment_id,
            'preco_unitario', v_preco_unitario,
            'operacao', 'compra_manual'
        )
    ) RETURNING id INTO v_transacao_id;
    
    -- Atualizar carteira
    UPDATE carteiras 
    SET saldo_atual = saldo_atual + v_quantidade,
        total_recebido = total_recebido + v_quantidade
    WHERE user_id = v_user_id;
    
    RETURN jsonb_build_object(
        'sucesso', true,
        'transacao_id', v_transacao_id,
        'quantidade', v_quantidade,
        'valor_total', v_valor_total,
        'data_expiracao', CURRENT_DATE + (v_meses_validade || ' months')::INTERVAL
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. RESERVA DE ITEM V2 (COM TAXA CONFIGURÁVEL)
CREATE OR REPLACE FUNCTION processar_reserva_item_v2(p_dados JSONB)
RETURNS JSONB AS $$
DECLARE
    v_item_id UUID := (p_dados->>'item_id')::UUID;
    v_user_id UUID := (p_dados->>'user_id')::UUID;
    v_item RECORD;
    v_taxa_config JSONB;
    v_taxa_percentual DECIMAL;
    v_valor_item DECIMAL;
    v_valor_taxa DECIMAL;
    v_valor_total DECIMAL;
    v_saldo_atual DECIMAL;
    v_reserva_id UUID;
    v_transacao_id UUID;
BEGIN
    -- Buscar item com lock
    SELECT * INTO v_item FROM itens 
    WHERE id = v_item_id AND status = 'disponivel'
    FOR UPDATE;
    
    IF NOT FOUND THEN
        RETURN jsonb_build_object('sucesso', false, 'erro', 'Item não disponível');
    END IF;
    
    -- Verificar se não é o próprio item
    IF v_item.publicado_por = v_user_id THEN
        RETURN jsonb_build_object('sucesso', false, 'erro', 'Não é possível reservar seu próprio item');
    END IF;
    
    -- Obter taxa de transação
    SELECT valor INTO v_taxa_config FROM config_sistema WHERE chave = 'taxa_transacao';
    v_taxa_percentual := COALESCE((v_taxa_config->>'percentual')::DECIMAL, 5.0);
    
    -- Calcular valores
    v_valor_item := v_item.valor_girinhas;
    v_valor_taxa := ROUND(v_valor_item * v_taxa_percentual / 100, 2);
    v_valor_total := v_valor_item + v_valor_taxa;
    
    -- Verificar saldo com lock
    SELECT saldo_atual INTO v_saldo_atual FROM carteiras 
    WHERE user_id = v_user_id 
    FOR UPDATE;
    
    IF v_saldo_atual < v_valor_total THEN
        RETURN jsonb_build_object('sucesso', false, 'erro', 'Saldo insuficiente');
    END IF;
    
    -- Criar transação de bloqueio
    INSERT INTO transacoes (
        user_id, tipo, valor, descricao, item_id, metadados
    ) VALUES (
        v_user_id, 'bloqueio_reserva', v_valor_total,
        format('Bloqueio para reserva: %s (item: %s + taxa: %s)', 
               v_valor_total, v_valor_item, v_valor_taxa),
        v_item_id,
        jsonb_build_object(
            'valor_item', v_valor_item,
            'valor_taxa', v_valor_taxa,
            'taxa_percentual', v_taxa_percentual,
            'operacao', 'reserva_item'
        )
    ) RETURNING id INTO v_transacao_id;
    
    -- Debitar carteira
    UPDATE carteiras 
    SET saldo_atual = saldo_atual - v_valor_total,
        total_gasto = total_gasto + v_valor_total
    WHERE user_id = v_user_id;
    
    -- Criar reserva
    INSERT INTO reservas (
        item_id, usuario_item, usuario_reservou,
        valor_girinhas, valor_taxa, valor_total,
        codigo_confirmacao, status
    ) VALUES (
        v_item_id, v_item.publicado_por, v_user_id,
        v_valor_item, v_valor_taxa, v_valor_total,
        LPAD((FLOOR(random() * 900000) + 100000)::TEXT, 6, '0'),
        'pendente'
    ) RETURNING id INTO v_reserva_id;
    
    -- Atualizar transação com reserva_id
    UPDATE transacoes 
    SET reserva_id = v_reserva_id
    WHERE id = v_transacao_id;
    
    -- Atualizar status do item
    UPDATE itens SET status = 'reservado' WHERE id = v_item_id;
    
    RETURN jsonb_build_object(
        'sucesso', true,
        'reserva_id', v_reserva_id,
        'transacao_id', v_transacao_id,
        'valor_bloqueado', v_valor_total,
        'codigo_confirmacao', (SELECT codigo_confirmacao FROM reservas WHERE id = v_reserva_id)
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. CONFIRMAÇÃO DE ENTREGA V2 (ATÔMICA)
CREATE OR REPLACE FUNCTION processar_confirmacao_entrega_v2(p_dados JSONB)
RETURNS JSONB AS $$
DECLARE
    v_reserva_id UUID := (p_dados->>'reserva_id')::UUID;
    v_codigo TEXT := p_dados->>'codigo_confirmacao';
    v_user_id UUID := (p_dados->>'user_id')::UUID;
    v_reserva RECORD;
    v_transacao_vendedor_id UUID;
    v_transacao_taxa_id UUID;
BEGIN
    -- Buscar reserva com validação e lock
    SELECT * INTO v_reserva FROM reservas 
    WHERE id = v_reserva_id 
    AND codigo_confirmacao = v_codigo
    AND usuario_item = v_user_id
    AND status = 'pendente'
    FOR UPDATE;
    
    IF NOT FOUND THEN
        RETURN jsonb_build_object('sucesso', false, 'erro', 'Reserva inválida ou já processada');
    END IF;
    
    -- Transferir girinhas para o vendedor (valor sem taxa)
    INSERT INTO transacoes (
        user_id, tipo, valor, descricao, 
        item_id, reserva_id, metadados
    ) VALUES (
        v_reserva.usuario_item, 'recebido', v_reserva.valor_girinhas,
        'Venda confirmada',
        v_reserva.item_id, v_reserva_id,
        jsonb_build_object(
            'operacao', 'venda_confirmada',
            'comprador_id', v_reserva.usuario_reservou
        )
    ) RETURNING id INTO v_transacao_vendedor_id;
    
    -- Creditar vendedor
    UPDATE carteiras 
    SET saldo_atual = saldo_atual + v_reserva.valor_girinhas,
        total_recebido = total_recebido + v_reserva.valor_girinhas
    WHERE user_id = v_reserva.usuario_item;
    
    -- Registrar taxa como queima (já foi debitada no bloqueio)
    IF v_reserva.valor_taxa > 0 THEN
        INSERT INTO transacoes (
            user_id, tipo, valor, descricao,
            item_id, reserva_id, metadados
        ) VALUES (
            v_reserva.usuario_reservou, 'taxa', v_reserva.valor_taxa,
            format('Taxa de serviço (%s%%)', 
                   COALESCE((SELECT (valor->>'percentual')::TEXT FROM config_sistema WHERE chave = 'taxa_transacao'), '5')),
            v_reserva.item_id, v_reserva_id,
            jsonb_build_object(
                'operacao', 'taxa_transacao',
                'vendedor_id', v_reserva.usuario_item
            )
        ) RETURNING id INTO v_transacao_taxa_id;
        
        -- Registrar na tabela de queimas
        INSERT INTO queimas_girinhas (
            user_id, quantidade, motivo, transacao_id
        ) VALUES (
            v_reserva.usuario_reservou, v_reserva.valor_taxa,
            'taxa_transacao', v_transacao_taxa_id
        );
    END IF;
    
    -- Atualizar status
    UPDATE reservas SET status = 'confirmada' WHERE id = v_reserva_id;
    UPDATE itens SET status = 'entregue' WHERE id = v_reserva.item_id;
    
    -- Verificar metas dos usuários (se função existir)
    IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'verificar_metas_usuario') THEN
        PERFORM verificar_metas_usuario(v_reserva.usuario_reservou);
        PERFORM verificar_metas_usuario(v_reserva.usuario_item);
    END IF;
    
    RETURN jsonb_build_object(
        'sucesso', true,
        'valor_transferido', v_reserva.valor_girinhas,
        'taxa_cobrada', v_reserva.valor_taxa,
        'transacao_vendedor_id', v_transacao_vendedor_id
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. TRANSFERÊNCIA P2P V2 (COM TAXA CONFIGURÁVEL)
CREATE OR REPLACE FUNCTION processar_transferencia_p2p_v2(p_dados JSONB)
RETURNS JSONB AS $$
DECLARE
    v_remetente_id UUID := (p_dados->>'remetente_id')::UUID;
    v_destinatario_id UUID := (p_dados->>'destinatario_id')::UUID;
    v_quantidade DECIMAL := (p_dados->>'quantidade')::DECIMAL;
    v_taxa_config JSONB;
    v_taxa_percentual DECIMAL;
    v_taxa DECIMAL;
    v_valor_liquido DECIMAL;
    v_saldo_remetente DECIMAL;
    v_transferencia_id UUID;
    v_transacao_saida_id UUID;
    v_transacao_entrada_id UUID;
    v_transacao_taxa_id UUID;
BEGIN
    -- Validações
    IF v_quantidade <= 0 OR v_quantidade > 10000 THEN
        RETURN jsonb_build_object('sucesso', false, 'erro', 'Quantidade inválida');
    END IF;
    
    IF v_remetente_id = v_destinatario_id THEN
        RETURN jsonb_build_object('sucesso', false, 'erro', 'Não é possível transferir para si mesmo');
    END IF;
    
    -- Obter configurações
    SELECT valor INTO v_taxa_config FROM config_sistema WHERE chave = 'taxa_transferencia';
    v_taxa_percentual := COALESCE((v_taxa_config->>'percentual')::DECIMAL, 1.0);
    
    -- Calcular taxa (1%)
    v_taxa := ROUND(v_quantidade * (v_taxa_percentual / 100), 2);
    v_valor_liquido := v_quantidade - v_taxa;
    
    -- Verificar saldo do remetente com lock
    SELECT saldo_atual INTO v_saldo_remetente FROM carteiras 
    WHERE user_id = v_remetente_id 
    FOR UPDATE;
    
    IF v_saldo_remetente < v_quantidade THEN
        RETURN jsonb_build_object('sucesso', false, 'erro', 'Saldo insuficiente');
    END IF;
    
    -- Criar transferência
    INSERT INTO transferencias_girinhas (remetente_id, destinatario_id, quantidade, taxa_cobrada)
    VALUES (v_remetente_id, v_destinatario_id, v_quantidade, v_taxa)
    RETURNING id INTO v_transferencia_id;
    
    -- Debitar do remetente
    UPDATE carteiras 
    SET saldo_atual = saldo_atual - v_quantidade,
        total_gasto = total_gasto + v_quantidade
    WHERE user_id = v_remetente_id;
    
    -- Creditar ao destinatário
    UPDATE carteiras 
    SET saldo_atual = saldo_atual + v_valor_liquido,
        total_recebido = total_recebido + v_valor_liquido
    WHERE user_id = v_destinatario_id;
    
    -- Registrar transações
    INSERT INTO transacoes (user_id, tipo, valor, descricao, transferencia_id, metadados)
    VALUES 
        (v_remetente_id, 'transferencia_p2p_saida', v_quantidade, 'Transferência P2P enviada', 
         v_transferencia_id, jsonb_build_object('destinatario_id', v_destinatario_id, 'taxa', v_taxa))
    RETURNING id INTO v_transacao_saida_id;
    
    INSERT INTO transacoes (user_id, tipo, valor, descricao, transferencia_id, metadados)
    VALUES 
        (v_destinatario_id, 'transferencia_p2p_entrada', v_valor_liquido, 'Transferência P2P recebida', 
         v_transferencia_id, jsonb_build_object('remetente_id', v_remetente_id, 'valor_bruto', v_quantidade))
    RETURNING id INTO v_transacao_entrada_id;
    
    -- Registrar taxa como queima
    IF v_taxa > 0 THEN
        INSERT INTO transacoes (user_id, tipo, valor, descricao, transferencia_id, metadados)
        VALUES (v_remetente_id, 'taxa', v_taxa, format('Taxa de transferência (%s%%)', v_taxa_percentual), 
               v_transferencia_id, jsonb_build_object('operacao', 'taxa_transferencia_p2p'))
        RETURNING id INTO v_transacao_taxa_id;
        
        INSERT INTO queimas_girinhas (user_id, quantidade, motivo, transacao_id)
        VALUES (v_remetente_id, v_taxa, 'taxa_transferencia', v_transacao_taxa_id);
    END IF;
    
    RETURN jsonb_build_object(
        'sucesso', true,
        'transferencia_id', v_transferencia_id,
        'valor_enviado', v_quantidade,
        'valor_recebido', v_valor_liquido,
        'taxa_cobrada', v_taxa
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. REFATORAR FUNÇÃO EXISTENTE finalizar_troca_com_codigo PARA USAR V2
CREATE OR REPLACE FUNCTION finalizar_troca_com_codigo(
    p_reserva_id UUID, 
    p_codigo_confirmacao TEXT
) RETURNS BOOLEAN AS $$
DECLARE
    v_resultado JSONB;
BEGIN
    -- Usar função V2 para garantir atomicidade
    SELECT processar_transacao_atomica(
        'confirmar_entrega',
        jsonb_build_object(
            'reserva_id', p_reserva_id,
            'codigo_confirmacao', p_codigo_confirmacao,
            'user_id', (SELECT usuario_item FROM reservas WHERE id = p_reserva_id)
        )
    ) INTO v_resultado;
    
    RETURN (v_resultado->>'sucesso')::BOOLEAN;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7. FUNÇÃO PARA ENTRADA NA FILA USANDO V2
CREATE OR REPLACE FUNCTION entrar_fila_espera(
    p_item_id UUID,
    p_usuario_id UUID
) RETURNS JSONB AS $$
DECLARE
    v_resultado JSONB;
BEGIN
    -- Usar função V2 para garantir atomicidade
    SELECT processar_transacao_atomica(
        'reservar_item',
        jsonb_build_object(
            'item_id', p_item_id,
            'user_id', p_usuario_id
        )
    ) INTO v_resultado;
    
    RETURN v_resultado;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ==========================================
-- FASE 4: CONFIGURAÇÕES E VALIDAÇÃO
-- ==========================================

-- Atualizar configurações se não existirem
INSERT INTO config_sistema (chave, valor) VALUES 
    ('taxa_transacao', '{"percentual": 5.0, "descricao": "Taxa cobrada em vendas de itens"}'),
    ('taxa_transferencia', '{"percentual": 1.0, "descricao": "Taxa em transferências P2P"}'),
    ('preco_manual_girinhas', '{"valor": 1.00, "descricao": "Preço fixo por Girinha"}'),
    ('validade_girinhas', '{"meses": 12, "descricao": "Prazo de validade das Girinhas"}')
ON CONFLICT (chave) DO NOTHING;

-- Comentários informativos
COMMENT ON FUNCTION processar_transacao_atomica IS 'Função master para processamento atômico de todas as transações do sistema';
COMMENT ON FUNCTION processar_compra_girinhas_v2 IS 'Processamento seguro de compra de Girinhas com preço manual';
COMMENT ON FUNCTION processar_reserva_item_v2 IS 'Processamento atômico de reserva de item com taxa configurável';
COMMENT ON FUNCTION processar_confirmacao_entrega_v2 IS 'Confirmação de entrega com transferência atômica de Girinhas';
COMMENT ON FUNCTION processar_transferencia_p2p_v2 IS 'Transferência P2P segura com taxa configurável';
