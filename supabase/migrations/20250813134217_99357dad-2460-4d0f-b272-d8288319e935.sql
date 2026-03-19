-- ==========================================
-- PARTE 1: SISTEMA DE PENALIDADES - MVP1
-- Funções e Triggers para Auto-Aplicação
-- ==========================================

-- 1. FUNÇÃO PRINCIPAL DE VERIFICAÇÃO
CREATE OR REPLACE FUNCTION pode_usuario_agir(
    p_user_id UUID,
    p_acao TEXT DEFAULT 'geral' -- 'publicar', 'reservar', 'denunciar', 'geral'
) RETURNS BOOLEAN AS $$
DECLARE
    v_penalidade_ativa RECORD;
    v_pode_agir BOOLEAN := true;
    v_nivel_minimo INTEGER := 1;
BEGIN
    -- Log da verificação
    INSERT INTO audit_log (user_id, action, details) 
    VALUES (p_user_id, 'VERIFICACAO_PENALIDADE', 
            jsonb_build_object('acao', p_acao, 'timestamp', NOW()));

    -- Determinar nível mínimo para bloqueio baseado na ação
    CASE p_acao
        WHEN 'publicar' THEN v_nivel_minimo := 1;  -- Bloqueia desde nível 1
        WHEN 'denunciar' THEN v_nivel_minimo := 2; -- Bloqueia desde nível 2  
        WHEN 'reservar' THEN v_nivel_minimo := 3;  -- Bloqueia apenas nível 3
        ELSE v_nivel_minimo := 3; -- Default para outras ações
    END CASE;

    -- Verificar se há penalidades ativas que impedem a ação
    SELECT * INTO v_penalidade_ativa
    FROM penalidades_usuario 
    WHERE usuario_id = p_user_id 
      AND ativo = true 
      AND nivel >= v_nivel_minimo
      AND (expira_em IS NULL OR expira_em > NOW())
    LIMIT 1;

    -- Se encontrou penalidade ativa, bloquear ação
    IF FOUND THEN
        v_pode_agir := false;
        
        -- Log da ação bloqueada
        INSERT INTO audit_log (user_id, action, details) 
        VALUES (p_user_id, 'ACAO_BLOQUEADA_PENALIDADE', 
                jsonb_build_object(
                    'acao', p_acao,
                    'nivel_penalidade', v_penalidade_ativa.nivel,
                    'tipo_penalidade', v_penalidade_ativa.tipo,
                    'motivo', v_penalidade_ativa.motivo
                ));
    END IF;

    RETURN v_pode_agir;

EXCEPTION 
    WHEN OTHERS THEN
        -- Em caso de erro, registrar e permitir ação (fail-safe)
        INSERT INTO audit_log (user_id, action, details) 
        VALUES (p_user_id, 'ERRO_VERIFICACAO_PENALIDADE', 
                jsonb_build_object('erro', SQLERRM, 'acao', p_acao));
        
        RETURN true; -- Fail-safe: permite ação em caso de erro
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. FUNÇÃO DE AUTO-PENALIZAÇÃO POR REJEIÇÕES
CREATE OR REPLACE FUNCTION verificar_e_aplicar_penalidade_rejeicao(
    p_usuario_id UUID
) RETURNS VOID AS $$
DECLARE
    v_rejeicoes_recentes INTEGER := 0;
    v_penalidade_ativa RECORD;
    v_nivel_penalidade INTEGER;
    v_duracao_dias INTEGER;
BEGIN
    -- Log do início da verificação
    INSERT INTO audit_log (user_id, action, details) 
    VALUES (p_usuario_id, 'VERIFICACAO_AUTO_PENALIDADE', 
            jsonb_build_object('motivo', 'rejeicao_item'));

    -- Contar rejeições do usuário nos últimos 30 dias
    SELECT COUNT(*) INTO v_rejeicoes_recentes
    FROM moderacao_itens mi
    JOIN itens i ON i.id = mi.item_id
    WHERE i.publicado_por = p_usuario_id
      AND mi.status = 'rejeitado'
      AND mi.moderado_em >= NOW() - INTERVAL '30 days';

    -- Log do número de rejeições encontradas
    INSERT INTO audit_log (user_id, action, details) 
    VALUES (p_usuario_id, 'CONTAGEM_REJEICOES', 
            jsonb_build_object('rejeicoes_30_dias', v_rejeicoes_recentes));

    -- Verificar se já tem penalidade ativa do tipo item_rejeitado
    SELECT * INTO v_penalidade_ativa
    FROM penalidades_usuario 
    WHERE usuario_id = p_usuario_id 
      AND tipo = 'item_rejeitado'
      AND ativo = true 
      AND (expira_em IS NULL OR expira_em > NOW());

    -- Aplicar penalidade apenas se: rejeições >= 3 E sem penalidade ativa
    IF v_rejeicoes_recentes >= 3 AND v_penalidade_ativa IS NULL THEN
        
        -- Calcular nível: LEAST(rejeições - 2, 3)
        v_nivel_penalidade := LEAST(v_rejeicoes_recentes - 2, 3);
        
        -- Calcular duração baseada no nível
        CASE v_nivel_penalidade
            WHEN 1 THEN v_duracao_dias := 7;
            WHEN 2 THEN v_duracao_dias := 15;
            WHEN 3 THEN v_duracao_dias := 30;
            ELSE v_duracao_dias := 7;
        END CASE;

        -- Inserir nova penalidade
        INSERT INTO penalidades_usuario (
            usuario_id, tipo, nivel, motivo, expira_em, ativo
        ) VALUES (
            p_usuario_id, 
            'item_rejeitado', 
            v_nivel_penalidade,
            format('Auto-aplicada por %s rejeições nos últimos 30 dias', v_rejeicoes_recentes),
            NOW() + (v_duracao_dias || ' days')::INTERVAL,
            true
        );

        -- Log da penalidade aplicada
        INSERT INTO audit_log (user_id, action, details) 
        VALUES (p_usuario_id, 'PENALIDADE_AUTO_APLICADA', 
                jsonb_build_object(
                    'tipo', 'item_rejeitado',
                    'nivel', v_nivel_penalidade,
                    'rejeicoes', v_rejeicoes_recentes,
                    'duracao_dias', v_duracao_dias,
                    'expira_em', NOW() + (v_duracao_dias || ' days')::INTERVAL
                ));
    END IF;

EXCEPTION 
    WHEN OTHERS THEN
        -- Log do erro mas não falha
        INSERT INTO audit_log (user_id, action, details) 
        VALUES (p_usuario_id, 'ERRO_AUTO_PENALIDADE', 
                jsonb_build_object('erro', SQLERRM));
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. TRIGGER AUTOMÁTICO PARA REJEIÇÕES
CREATE OR REPLACE FUNCTION trigger_verificar_penalidade_rejeicao()
RETURNS TRIGGER AS $$
DECLARE
    v_usuario_id UUID;
BEGIN
    -- Verificar se mudou para rejeitado
    IF NEW.status = 'rejeitado' AND (OLD.status IS NULL OR OLD.status != 'rejeitado') THEN
        
        -- Obter usuário do item
        SELECT i.publicado_por INTO v_usuario_id
        FROM itens i 
        WHERE i.id = NEW.item_id;
        
        -- Verificar e aplicar penalidade se necessário
        IF v_usuario_id IS NOT NULL THEN
            PERFORM verificar_e_aplicar_penalidade_rejeicao(v_usuario_id);
        END IF;
    END IF;
    
    RETURN NEW;
    
EXCEPTION 
    WHEN OTHERS THEN
        -- Log do erro mas não falha o update
        INSERT INTO audit_log (action, details) 
        VALUES ('ERRO_TRIGGER_PENALIDADE', 
                jsonb_build_object('erro', SQLERRM, 'moderacao_id', NEW.id));
        
        RETURN NEW; -- Continua o update mesmo com erro
END;
$$ LANGUAGE plpgsql;

-- Criar/recriar o trigger
DROP TRIGGER IF EXISTS trigger_penalidade_rejeicao ON moderacao_itens;
CREATE TRIGGER trigger_penalidade_rejeicao
    AFTER UPDATE ON moderacao_itens
    FOR EACH ROW
    EXECUTE FUNCTION trigger_verificar_penalidade_rejeicao();

-- 4. FUNÇÃO AUXILIAR PARA APLICAR PENALIDADE MANUALMENTE (ADMIN)
CREATE OR REPLACE FUNCTION aplicar_penalidade(
    p_usuario_id UUID,
    p_tipo TEXT,
    p_nivel INTEGER,
    p_motivo TEXT,
    p_duracao_dias INTEGER DEFAULT NULL
) RETURNS UUID AS $$
DECLARE
    v_penalidade_id UUID;
    v_expira_em TIMESTAMP WITH TIME ZONE;
BEGIN
    -- Calcular data de expiração
    IF p_duracao_dias IS NOT NULL THEN
        v_expira_em := NOW() + (p_duracao_dias || ' days')::INTERVAL;
    ELSE
        -- Duração padrão baseada no nível
        CASE p_nivel
            WHEN 1 THEN v_expira_em := NOW() + INTERVAL '7 days';
            WHEN 2 THEN v_expira_em := NOW() + INTERVAL '15 days';  
            WHEN 3 THEN v_expira_em := NOW() + INTERVAL '30 days';
            ELSE v_expira_em := NOW() + INTERVAL '7 days';
        END CASE;
    END IF;

    -- Inserir penalidade
    INSERT INTO penalidades_usuario (
        usuario_id, tipo, nivel, motivo, expira_em, ativo
    ) VALUES (
        p_usuario_id, p_tipo, p_nivel, p_motivo, v_expira_em, true
    ) RETURNING id INTO v_penalidade_id;

    -- Log da aplicação manual
    INSERT INTO audit_log (user_id, action, details) 
    VALUES (auth.uid(), 'PENALIDADE_APLICADA_MANUAL', 
            jsonb_build_object(
                'penalidade_id', v_penalidade_id,
                'usuario_penalizado', p_usuario_id,
                'tipo', p_tipo,
                'nivel', p_nivel,
                'motivo', p_motivo
            ));

    RETURN v_penalidade_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. FUNÇÃO PARA REMOVER PENALIDADE (ADMIN)
CREATE OR REPLACE FUNCTION remover_penalidade(
    p_penalidade_id UUID
) RETURNS BOOLEAN AS $$
DECLARE
    v_penalidade RECORD;
BEGIN
    -- Buscar penalidade
    SELECT * INTO v_penalidade 
    FROM penalidades_usuario 
    WHERE id = p_penalidade_id AND ativo = true;

    IF NOT FOUND THEN
        RETURN false;
    END IF;

    -- Inativar penalidade
    UPDATE penalidades_usuario 
    SET ativo = false, updated_at = NOW()
    WHERE id = p_penalidade_id;

    -- Log da remoção
    INSERT INTO audit_log (user_id, action, details) 
    VALUES (auth.uid(), 'PENALIDADE_REMOVIDA_MANUAL', 
            jsonb_build_object(
                'penalidade_id', p_penalidade_id,
                'usuario_penalizado', v_penalidade.usuario_id,
                'tipo', v_penalidade.tipo,
                'nivel', v_penalidade.nivel
            ));

    RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. FUNÇÃO PARA LIMPAR PENALIDADES EXPIRADAS (MANUTENÇÃO)
CREATE OR REPLACE FUNCTION limpar_penalidades_expiradas()
RETURNS INTEGER AS $$
DECLARE
    v_removidas INTEGER;
BEGIN
    UPDATE penalidades_usuario 
    SET ativo = false, updated_at = NOW()
    WHERE ativo = true 
      AND expira_em IS NOT NULL 
      AND expira_em <= NOW();
    
    GET DIAGNOSTICS v_removidas = ROW_COUNT;
    
    -- Log da limpeza
    INSERT INTO audit_log (action, details) 
    VALUES ('LIMPEZA_PENALIDADES_EXPIRADAS', 
            jsonb_build_object('removidas', v_removidas));
    
    RETURN v_removidas;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;