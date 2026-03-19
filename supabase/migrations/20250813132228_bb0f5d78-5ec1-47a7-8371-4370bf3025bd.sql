-- Deletar views existentes relacionadas à moderação
DROP VIEW IF EXISTS itens_moderacao_completa;
DROP VIEW IF EXISTS itens_disponiveis_moderados;
DROP VIEW IF EXISTS itens_moderados;
DROP VIEW IF EXISTS itens_completos;

-- Criar view para itens PENDENTES de moderação
CREATE OR REPLACE VIEW itens_pendentes_moderacao AS
SELECT 
    m.id as moderacao_id,
    m.status as moderacao_status,
    m.created_at as data_moderacao,
    m.denuncia_id,
    m.denuncia_aceita,
    i.id as item_id,
    i.titulo,
    i.categoria,
    i.valor_girinhas,
    i.fotos[1] as primeira_foto,
    i.created_at as data_publicacao,
    i.publicado_por as usuario_id,
    p.nome as usuario_nome,
    CASE WHEN m.denuncia_id IS NOT NULL THEN true ELSE false END as tem_denuncia,
    COALESCE(
        (SELECT COUNT(*) FROM denuncias d WHERE d.item_id = i.id),
        0
    ) as total_denuncias
FROM moderacao_itens m
INNER JOIN itens i ON i.id = m.item_id
INNER JOIN profiles p ON p.id = i.publicado_por
WHERE m.status = 'pendente'
ORDER BY m.created_at DESC;

-- Criar view para itens REPORTADOS (com denúncias)
CREATE OR REPLACE VIEW itens_reportados_moderacao AS
SELECT 
    m.id as moderacao_id,
    m.status as moderacao_status,
    m.created_at as data_moderacao,
    m.denuncia_id,
    m.denuncia_aceita,
    i.id as item_id,
    i.titulo,
    i.categoria,
    i.valor_girinhas,
    i.fotos[1] as primeira_foto,
    i.created_at as data_publicacao,
    i.publicado_por as usuario_id,
    p.nome as usuario_nome,
    true as tem_denuncia,
    COALESCE(
        (SELECT COUNT(*) FROM denuncias d WHERE d.item_id = i.id),
        0
    ) as total_denuncias,
    d.motivo as motivo_denuncia,
    d.descricao as descricao_denuncia,
    d.created_at as data_denuncia
FROM moderacao_itens m
INNER JOIN itens i ON i.id = m.item_id
INNER JOIN profiles p ON p.id = i.publicado_por
INNER JOIN denuncias d ON d.item_id = i.id
WHERE m.denuncia_id IS NOT NULL
ORDER BY d.created_at DESC;

-- Criar view para itens APROVADOS
CREATE OR REPLACE VIEW itens_aprovados_moderacao AS
SELECT 
    m.id as moderacao_id,
    m.status as moderacao_status,
    m.created_at as data_moderacao,
    m.moderado_em,
    m.denuncia_id,
    m.denuncia_aceita,
    i.id as item_id,
    i.titulo,
    i.categoria,
    i.valor_girinhas,
    i.fotos[1] as primeira_foto,
    i.created_at as data_publicacao,
    i.publicado_por as usuario_id,
    p.nome as usuario_nome,
    CASE WHEN m.denuncia_id IS NOT NULL THEN true ELSE false END as tem_denuncia,
    COALESCE(
        (SELECT COUNT(*) FROM denuncias d WHERE d.item_id = i.id),
        0
    ) as total_denuncias
FROM moderacao_itens m
INNER JOIN itens i ON i.id = m.item_id
INNER JOIN profiles p ON p.id = i.publicado_por
WHERE m.status IN ('aprovado', 'em_analise')
ORDER BY m.moderado_em DESC;

-- Criar view para itens REJEITADOS
CREATE OR REPLACE VIEW itens_rejeitados_moderacao AS
SELECT 
    m.id as moderacao_id,
    m.status as moderacao_status,
    m.created_at as data_moderacao,
    m.moderado_em,
    m.denuncia_id,
    m.denuncia_aceita,
    i.id as item_id,
    i.titulo,
    i.categoria,
    i.valor_girinhas,
    i.fotos[1] as primeira_foto,
    i.created_at as data_publicacao,
    i.publicado_por as usuario_id,
    p.nome as usuario_nome,
    CASE WHEN m.denuncia_id IS NOT NULL THEN true ELSE false END as tem_denuncia,
    COALESCE(
        (SELECT COUNT(*) FROM denuncias d WHERE d.item_id = i.id),
        0
    ) as total_denuncias,
    m.observacoes as observacoes_moderacao,
    m.comentario_predefinido
FROM moderacao_itens m
INNER JOIN itens i ON i.id = m.item_id
INNER JOIN profiles p ON p.id = i.publicado_por
WHERE m.status IN ('rejeitado', 'rejeitado_admin')
ORDER BY m.moderado_em DESC;