-- REORGANIZAÇÃO: Integrar Penalidades no Gerenciamento de Usuários

-- ================================================================
-- 1. View de Usuários com Penalidades e Estatísticas
-- ================================================================

-- View principal de usuários para administração
CREATE OR REPLACE VIEW public.usuarios_admin AS
SELECT 
    p.id as user_id,
    p.nome,
    p.email,
    p.username,
    p.avatar_url,
    p.telefone,
    p.cidade,
    p.estado,
    p.cadastro_status,
    p.created_at as data_cadastro,
    p.ultima_atividade,
    
    -- Estatísticas de atividade
    COALESCE(stats.total_itens, 0) as total_itens_publicados,
    COALESCE(stats.total_reservas, 0) as total_reservas_feitas,
    COALESCE(stats.total_vendas, 0) as total_vendas_realizadas,
    COALESCE(stats.total_denuncias, 0) as total_denuncias_feitas,
    
    -- Dados da carteira
    COALESCE(c.saldo_atual, 0) as saldo_girinhas,
    COALESCE(c.total_recebido, 0) as total_girinhas_recebidas,
    COALESCE(c.total_gasto, 0) as total_girinhas_gastas,
    
    -- Penalidades ativas
    pen.penalidades_ativas,
    pen.penalidade_mais_grave,
    pen.total_penalidades_historico,
    pen.ultima_penalidade,
    
    -- Status derivado
    CASE 
        WHEN pen.penalidade_mais_grave >= 3 THEN 'suspenso'
        WHEN pen.penalidade_mais_grave >= 2 THEN 'warned'
        WHEN pen.penalidade_mais_grave = 1 THEN 'warned'
        WHEN p.ultima_atividade > NOW() - INTERVAL '7 days' THEN 'active'
        ELSE 'inactive'
    END as status,
    
    -- Pontuação de reputação (0-100)
    GREATEST(0, LEAST(100, 
        100 - 
        (COALESCE(pen.total_penalidades_historico, 0) * 10) - 
        (COALESCE(stats.total_rejeicoes, 0) * 5)
    )) as pontuacao_reputacao,
    
    -- Violações (soma de rejeições e penalidades)
    COALESCE(stats.total_rejeicoes, 0) + COALESCE(pen.total_penalidades_historico, 0) as total_violacoes

FROM public.profiles p

-- Estatísticas de atividade
LEFT JOIN (
    SELECT 
        publicado_por as user_id,
        COUNT(*) as total_itens,
        SUM(CASE WHEN status = 'entregue' THEN 1 ELSE 0 END) as total_vendas,
        SUM(CASE WHEN EXISTS(
            SELECT 1 FROM moderacao_itens mi 
            WHERE mi.item_id = i.id AND mi.status = 'rejeitado'
        ) THEN 1 ELSE 0 END) as total_rejeicoes
    FROM public.itens i
    GROUP BY publicado_por
) stats ON p.id = stats.user_id

-- Estatísticas de reservas
LEFT JOIN (
    SELECT 
        usuario_reservou as user_id,
        COUNT(*) as total_reservas
    FROM public.reservas
    GROUP BY usuario_reservou
) res_stats ON p.id = res_stats.user_id

-- Estatísticas de denúncias
LEFT JOIN (
    SELECT 
        denunciante_id as user_id,
        COUNT(*) as total_denuncias
    FROM public.denuncias
    GROUP BY denunciante_id
) den_stats ON p.id = den_stats.user_id

-- Dados da carteira
LEFT JOIN public.carteiras c ON p.id = c.user_id

-- Penalidades agregadas
LEFT JOIN (
    SELECT 
        usuario_id,
        COUNT(CASE WHEN ativo = true AND (expira_em IS NULL OR expira_em > NOW()) THEN 1 END) as penalidades_ativas,
        MAX(CASE WHEN ativo = true AND (expira_em IS NULL OR expira_em > NOW()) THEN nivel ELSE 0 END) as penalidade_mais_grave,
        COUNT(*) as total_penalidades_historico,
        MAX(created_at) as ultima_penalidade
    FROM public.penalidades_usuario
    GROUP BY usuario_id
) pen ON p.id = pen.usuario_id

-- Usar COALESCE para garantir que campos não sejam NULL
WHERE p.id IS NOT NULL
ORDER BY p.created_at DESC;

-- ================================================================
-- 2. View de Penalidades Detalhadas por Usuário
-- ================================================================

CREATE OR REPLACE VIEW public.penalidades_usuarios_detalhada AS
SELECT 
    pu.id as penalidade_id,
    pu.usuario_id,
    p.nome as usuario_nome,
    p.email as usuario_email,
    p.username as usuario_username,
    pu.tipo,
    pu.nivel,
    pu.motivo,
    pu.expira_em,
    pu.ativo,
    pu.created_at,
    pu.updated_at,
    
    -- Status da penalidade
    CASE 
        WHEN NOT pu.ativo THEN 'removida'
        WHEN pu.expira_em IS NOT NULL AND pu.expira_em <= NOW() THEN 'expirada'
        ELSE 'ativa'
    END as status_penalidade,
    
    -- Texto descritivo do tipo
    CASE pu.tipo
        WHEN 'item_rejeitado' THEN 'Item Rejeitado'
        WHEN 'denuncia_falsa' THEN 'Denúncia Falsa'
        ELSE INITCAP(REPLACE(pu.tipo, '_', ' '))
    END as tipo_descricao,
    
    -- Texto descritivo do nível
    CASE pu.nivel
        WHEN 1 THEN 'Leve'
        WHEN 2 THEN 'Médio'
        WHEN 3 THEN 'Grave'
        ELSE 'Desconhecido'
    END as nivel_descricao

FROM public.penalidades_usuario pu
JOIN public.profiles p ON pu.usuario_id = p.id
ORDER BY pu.created_at DESC;

-- ================================================================
-- 3. View de Estatísticas Globais do Sistema
-- ================================================================

CREATE OR REPLACE VIEW public.estatisticas_sistema AS
SELECT 
    -- Usuários
    (SELECT COUNT(*) FROM profiles) as total_usuarios,
    (SELECT COUNT(*) FROM profiles WHERE ultima_atividade > NOW() - INTERVAL '7 days') as usuarios_ativos,
    (SELECT COUNT(*) FROM profiles WHERE ultima_atividade > NOW() - INTERVAL '30 days') as usuarios_ativos_mes,
    
    -- Penalidades
    (SELECT COUNT(*) FROM penalidades_usuario WHERE ativo = true AND (expira_em IS NULL OR expira_em > NOW())) as penalidades_ativas,
    (SELECT COUNT(*) FROM penalidades_usuario WHERE ativo = true AND nivel >= 2 AND (expira_em IS NULL OR expira_em > NOW())) as usuarios_suspensos,
    (SELECT COUNT(*) FROM penalidades_usuario WHERE ativo = true AND nivel = 1 AND (expira_em IS NULL OR expira_em > NOW())) as usuarios_warned,
    
    -- Moderação
    (SELECT COUNT(*) FROM itens_pendentes_moderacao) as itens_pendentes,
    (SELECT COUNT(*) FROM itens_reportados_moderacao) as denuncias_ativas,
    
    -- Atividade do sistema
    (SELECT COUNT(*) FROM itens WHERE created_at > NOW() - INTERVAL '24 hours') as itens_publicados_hoje,
    (SELECT COUNT(*) FROM reservas WHERE created_at > NOW() - INTERVAL '24 hours') as reservas_hoje;

-- ================================================================
-- 4. Função para buscar usuários com filtros
-- ================================================================

CREATE OR REPLACE FUNCTION public.buscar_usuarios_admin(
    p_termo_busca TEXT DEFAULT NULL,
    p_status_filtro TEXT DEFAULT 'todos',
    p_limite INTEGER DEFAULT 50,
    p_offset INTEGER DEFAULT 0
)
RETURNS TABLE(
    user_id UUID,
    nome TEXT,
    email TEXT,
    username TEXT,
    status TEXT,
    pontuacao_reputacao INTEGER,
    total_violacoes BIGINT,
    penalidades_ativas BIGINT,
    penalidade_mais_grave INTEGER,
    data_cadastro TIMESTAMP WITH TIME ZONE,
    ultima_atividade TIMESTAMP WITH TIME ZONE
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        ua.user_id,
        ua.nome,
        ua.email,
        ua.username,
        ua.status,
        ua.pontuacao_reputacao,
        ua.total_violacoes,
        ua.penalidades_ativas,
        ua.penalidade_mais_grave,
        ua.data_cadastro,
        ua.ultima_atividade
    FROM usuarios_admin ua
    WHERE 
        -- Filtro de busca
        (p_termo_busca IS NULL OR 
         ua.nome ILIKE '%' || p_termo_busca || '%' OR
         ua.email ILIKE '%' || p_termo_busca || '%' OR
         ua.username ILIKE '%' || p_termo_busca || '%')
        
        -- Filtro de status
        AND (p_status_filtro = 'todos' OR ua.status = p_status_filtro)
        
    ORDER BY 
        CASE WHEN p_status_filtro = 'suspenso' THEN ua.penalidade_mais_grave END DESC,
        ua.ultima_atividade DESC NULLS LAST,
        ua.data_cadastro DESC
        
    LIMIT p_limite
    OFFSET p_offset;
END;
$$;

-- ================================================================
-- 5. RLS Policies para as novas views
-- ================================================================

-- Permitir que admins vejam as views
CREATE POLICY "Admins podem ver usuarios_admin" ON usuarios_admin
    FOR SELECT TO authenticated
    USING (EXISTS (SELECT 1 FROM admin_users WHERE user_id = auth.uid()));

CREATE POLICY "Admins podem ver penalidades_usuarios_detalhada" ON penalidades_usuarios_detalhada
    FOR SELECT TO authenticated
    USING (EXISTS (SELECT 1 FROM admin_users WHERE user_id = auth.uid()));

CREATE POLICY "Admins podem ver estatisticas_sistema" ON estatisticas_sistema
    FOR SELECT TO authenticated
    USING (EXISTS (SELECT 1 FROM admin_users WHERE user_id = auth.uid()));

-- ================================================================
-- COMENTÁRIOS PARA VERIFICAÇÃO
-- ================================================================

-- VIEWS CRIADAS:
-- ✅ usuarios_admin - Visão completa de usuários com penalidades e estatísticas
-- ✅ penalidades_usuarios_detalhada - Penalidades detalhadas por usuário
-- ✅ estatisticas_sistema - Estatísticas globais do sistema
-- ✅ buscar_usuarios_admin() - Função de busca com filtros

-- DADOS DISPONÍVEIS:
-- • Informações básicas do usuário
-- • Estatísticas de atividade (itens, reservas, vendas)
-- • Dados da carteira (saldo, histórico)
-- • Penalidades ativas e históricas
-- • Status derivado (active, warned, suspended, inactive)
-- • Pontuação de reputação (0-100)
-- • Total de violações

-- PRÓXIMOS PASSOS:
-- • Criar componente GerenciamentoUsuarios
-- • Atualizar navegação lateral
-- • Remover seção específica de penalidades