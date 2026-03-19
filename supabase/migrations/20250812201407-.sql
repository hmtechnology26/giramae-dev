-- Criar função para inativar item com feedback ao usuário
CREATE OR REPLACE FUNCTION public.inativar_item_com_feedback(
    p_item_id UUID,
    p_moderador_id UUID,
    p_motivo TEXT,
    p_observacoes TEXT DEFAULT NULL
) RETURNS JSONB AS $$
DECLARE
    v_item RECORD;
    v_usuario_id UUID;
BEGIN
    -- Buscar item e verificar se existe
    SELECT * INTO v_item FROM itens WHERE id = p_item_id;
    IF NOT FOUND THEN
        RETURN jsonb_build_object('sucesso', false, 'erro', 'Item não encontrado');
    END IF;
    
    v_usuario_id := v_item.publicado_por;
    
    -- Inativar item
    UPDATE itens 
    SET status = 'inativo', updated_at = now()
    WHERE id = p_item_id;
    
    -- Registrar moderação
    INSERT INTO moderacao_itens (
        item_id, status, moderador_id, moderado_em, 
        comentario_predefinido, observacoes
    ) VALUES (
        p_item_id, 'rejeitado', p_moderador_id, now(),
        p_motivo, p_observacoes
    ) ON CONFLICT (item_id) DO UPDATE SET
        status = 'rejeitado',
        moderador_id = p_moderador_id,
        moderado_em = now(),
        comentario_predefinido = p_motivo,
        observacoes = p_observacoes;
    
    -- Criar notificação para o usuário
    PERFORM create_notification(
        v_usuario_id,
        'item_rejeitado',
        'Item precisa de correção',
        format('Seu item "%s" foi inativado. Motivo: %s. Você pode editá-lo e republicar.', 
               v_item.titulo, p_motivo),
        jsonb_build_object(
            'item_id', p_item_id,
            'motivo', p_motivo,
            'observacoes', p_observacoes,
            'pode_reativar', true
        )
    );
    
    RETURN jsonb_build_object(
        'sucesso', true,
        'item_id', p_item_id,
        'status', 'inativo',
        'notificacao_enviada', true
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Atualizar função aceitar_denuncia para usar inativação em vez de exclusão
CREATE OR REPLACE FUNCTION public.aceitar_denuncia(
    p_denuncia_id UUID,
    p_moderador_id UUID,
    p_comentario TEXT DEFAULT 'denuncia_procedente',
    p_observacoes TEXT DEFAULT NULL
) RETURNS JSONB AS $$
DECLARE
    v_denuncia RECORD;
    v_resultado JSONB;
BEGIN
    -- Buscar denúncia
    SELECT * INTO v_denuncia FROM denuncias WHERE id = p_denuncia_id;
    IF NOT FOUND THEN
        RETURN jsonb_build_object('sucesso', false, 'erro', 'Denúncia não encontrada');
    END IF;
    
    -- Inativar item com feedback
    SELECT inativar_item_com_feedback(
        v_denuncia.item_id,
        p_moderador_id,
        p_comentario,
        p_observacoes || ' (Denúncia aceita)'
    ) INTO v_resultado;
    
    -- Atualizar denúncia
    UPDATE denuncias 
    SET 
        status = 'aceita',
        analisada_por = p_moderador_id,
        data_analise = now(),
        observacoes_admin = p_observacoes
    WHERE id = p_denuncia_id;
    
    RETURN v_resultado;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para reativar item após correção
CREATE OR REPLACE FUNCTION public.reativar_item_corrigido(
    p_item_id UUID,
    p_user_id UUID
) RETURNS JSONB AS $$
DECLARE
    v_item RECORD;
BEGIN
    -- Verificar se o item pertence ao usuário e está inativo
    SELECT * INTO v_item FROM itens 
    WHERE id = p_item_id AND publicado_por = p_user_id AND status = 'inativo';
    
    IF NOT FOUND THEN
        RETURN jsonb_build_object('sucesso', false, 'erro', 'Item não encontrado ou não pode ser reativado');
    END IF;
    
    -- Reativar item
    UPDATE itens 
    SET status = 'disponivel', updated_at = now()
    WHERE id = p_item_id;
    
    -- Criar nova entrada de moderação
    INSERT INTO moderacao_itens (item_id, status)
    VALUES (p_item_id, 'pendente')
    ON CONFLICT (item_id) DO UPDATE SET
        status = 'pendente',
        moderador_id = NULL,
        moderado_em = NULL,
        comentario_predefinido = NULL,
        observacoes = 'Item corrigido e resubmetido para moderação';
    
    RETURN jsonb_build_object(
        'sucesso', true,
        'item_id', p_item_id,
        'status', 'disponivel',
        'moderacao_status', 'pendente'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;