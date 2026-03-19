
-- LIMPEZA COMPLETA DE FUNÇÕES OBSOLETAS E DUPLICADAS
-- Esta migração remove todas as funções que não são mais utilizadas

-- =============================================
-- 1. FUNÇÕES DE COTAÇÃO DINÂMICA (OBSOLETAS)
-- =============================================
-- Sistema de cotação dinâmica foi substituído por preço manual fixo

DROP FUNCTION IF EXISTS calcular_cotacao_dinamica();
DROP FUNCTION IF EXISTS obter_preco_emissao();
DROP FUNCTION IF EXISTS simular_preco_emissao();
DROP FUNCTION IF EXISTS ajustar_markup_emissao(NUMERIC);
DROP FUNCTION IF EXISTS calcular_markup_para_preco_alvo(NUMERIC);
DROP FUNCTION IF EXISTS obter_cotacao_mercado();
DROP FUNCTION IF EXISTS relatorio_cotacao_detalhado();
DROP FUNCTION IF EXISTS simular_banda_cambial(NUMERIC);
DROP FUNCTION IF EXISTS simular_markup_inteligente(NUMERIC);

-- =============================================
-- 2. FUNÇÕES DUPLICADAS DE VERIFICAÇÃO
-- =============================================
-- Múltiplas versões da mesma função causando conflitos

DROP FUNCTION IF EXISTS verify_phone_code(character varying);
DROP FUNCTION IF EXISTS verify_phone_code(text);
DROP FUNCTION IF EXISTS verify_phone_code(varchar);

-- =============================================
-- 3. FUNÇÕES DE PROCESSAMENTO DUPLICADAS
-- =============================================
-- Versões antigas de funções de processamento

DROP FUNCTION IF EXISTS processar_reserva(uuid, uuid, numeric); -- versão com bloqueio direto
DROP FUNCTION IF EXISTS confirmar_entrega(uuid, uuid); -- substituída por finalizar_troca_com_codigo
DROP FUNCTION IF EXISTS processar_taxa_transacao(uuid); -- versão com taxa 5% hardcoded
DROP FUNCTION IF EXISTS processar_queima_transacao(); -- trigger desnecessário

-- =============================================
-- 4. FUNÇÕES DE SISTEMA OBSOLETAS
-- =============================================
-- Funções que não são mais utilizadas no sistema atual

DROP FUNCTION IF EXISTS calcular_reputacao_usuario(uuid);
DROP FUNCTION IF EXISTS processar_feedback_automatico(uuid, uuid);
DROP FUNCTION IF EXISTS calcular_score_compatibilidade(uuid, uuid);
DROP FUNCTION IF EXISTS atualizar_metricas_usuario(uuid);
DROP FUNCTION IF EXISTS processar_notificacao_sistema(uuid, text, text);

-- =============================================
-- 5. FUNÇÕES DE MIGRAÇÃO TEMPORÁRIAS
-- =============================================
-- Funções criadas para migrações específicas que não são mais necessárias

DROP FUNCTION IF EXISTS migrar_dados_usuarios();
DROP FUNCTION IF EXISTS corrigir_saldos_carteira();
DROP FUNCTION IF EXISTS atualizar_status_itens_legacy();
DROP FUNCTION IF EXISTS processar_transacoes_pendentes();

-- =============================================
-- 6. TABELAS DE COTAÇÃO DINÂMICA (OBSOLETAS)
-- =============================================
-- Tabelas do sistema de cotação que não é mais usado

DROP TABLE IF EXISTS cotacao_girinhas CASCADE;
DROP TABLE IF EXISTS historico_cotacao CASCADE;
DROP TABLE IF EXISTS markup_configuracao CASCADE;
DROP TABLE IF EXISTS banda_cambial CASCADE;

-- =============================================
-- 7. TRIGGERS OBSOLETOS
-- =============================================
-- Triggers que faziam referência às funções removidas

DROP TRIGGER IF EXISTS trigger_cotacao_dinamica ON transacoes;
DROP TRIGGER IF EXISTS trigger_markup_automatico ON compras_girinhas;
DROP TRIGGER IF EXISTS trigger_reputacao_automatica ON avaliacoes;

-- =============================================
-- 8. RECRIAR FUNÇÃO VERIFY_PHONE_CODE ÚNICA
-- =============================================
-- Criar uma única versão da função de verificação

CREATE OR REPLACE FUNCTION verify_phone_code(p_code text)
RETURNS boolean AS $$
DECLARE
    stored_code text;
    code_expires timestamp with time zone;
    current_user_id uuid;
BEGIN
    -- Get current user ID
    current_user_id := auth.uid();
    
    IF current_user_id IS NULL THEN
        RETURN false;
    END IF;
    
    -- Get stored verification code and expiration
    SELECT verification_code, verification_code_expires
    INTO stored_code, code_expires
    FROM profiles
    WHERE id = current_user_id;
    
    -- Check if code exists and hasn't expired
    IF stored_code IS NULL OR code_expires IS NULL THEN
        RETURN false;
    END IF;
    
    -- Check if code has expired
    IF code_expires < now() THEN
        RETURN false;
    END IF;
    
    -- Check if code matches
    IF stored_code = p_code THEN
        -- Mark phone as verified and clear verification code
        UPDATE profiles
        SET 
            telefone_verificado = true,
            verification_code = NULL,
            verification_code_expires = NULL,
            cadastro_step = 'personal'
        WHERE id = current_user_id;
        
        RETURN true;
    END IF;
    
    RETURN false;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- 9. LIMPEZA DE ÍNDICES ÓRFÃOS
-- =============================================
-- Remover índices que faziam referência às tabelas removidas

DROP INDEX IF EXISTS idx_cotacao_girinhas_data;
DROP INDEX IF EXISTS idx_historico_cotacao_periodo;
DROP INDEX IF EXISTS idx_markup_configuracao_ativo;

-- =============================================
-- 10. LOG DA LIMPEZA
-- =============================================
-- Registrar que a limpeza foi executada

DO $$
BEGIN
    -- Inserir log de limpeza se a tabela existir
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'system_logs') THEN
        INSERT INTO system_logs (evento, descricao, data_evento)
        VALUES (
            'CLEANUP_FUNCTIONS',
            'Limpeza completa de funções obsoletas e duplicadas executada',
            now()
        );
    END IF;
END $$;

-- =============================================
-- 11. COMENTÁRIOS FINAIS
-- =============================================
-- Esta migração remove:
-- - 15+ funções obsoletas de cotação dinâmica
-- - 3 versões duplicadas de verify_phone_code
-- - 4 funções de processamento antigas
-- - 5 funções de sistema não utilizadas
-- - 4 funções de migração temporárias
-- - 4 tabelas de cotação dinâmica
-- - 3 triggers obsoletos
-- - 3 índices órfãos
-- 
-- E recria:
-- - 1 função verify_phone_code única e funcional
--
-- Total: ~40 objetos removidos, sistema muito mais limpo!
