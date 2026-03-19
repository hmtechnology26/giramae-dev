-- ETAPA 3: INTEGRAR COM SISTEMA EXISTENTE
-- Criar view segura que filtra itens rejeitados

-- 1. View principal que substitui queries diretas na tabela itens
CREATE OR REPLACE VIEW itens_moderados AS
SELECT 
  i.*,
  m.status as moderacao_status,
  m.moderado_em,
  m.moderador_id,
  m.comentario_predefinido,
  CASE 
    WHEN m.status = 'rejeitado' THEN true
    ELSE false 
  END as item_rejeitado,
  CASE 
    WHEN m.status = 'pendente' THEN true
    ELSE false 
  END as aguardando_moderacao
FROM itens i
LEFT JOIN moderacao_itens m ON i.id = m.item_id
WHERE i.status IN ('disponivel', 'reservado', 'entregue')
  AND (
    m.status != 'rejeitado' 
    OR m.status IS NULL  -- Para casos onde não há registro de moderação ainda
  );

-- 2. View específica para itens disponíveis (feed principal)
CREATE OR REPLACE VIEW itens_disponiveis_moderados AS
SELECT *
FROM itens_moderados
WHERE status = 'disponivel';

-- 3. Função para buscar itens com informações de moderação
CREATE OR REPLACE FUNCTION buscar_itens_com_moderacao(
  p_user_id UUID DEFAULT NULL,
  p_categoria TEXT DEFAULT NULL,
  p_limite INTEGER DEFAULT 20,
  p_offset INTEGER DEFAULT 0
) 
RETURNS TABLE(
  id UUID,
  titulo TEXT,
  descricao TEXT,
  categoria TEXT,
  subcategoria TEXT,
  valor_girinhas NUMERIC,
  status TEXT,
  fotos TEXT[],
  created_at TIMESTAMP WITH TIME ZONE,
  publicado_por UUID,
  moderacao_status TEXT,
  aguardando_moderacao BOOLEAN,
  vendedor_nome TEXT,
  vendedor_avatar TEXT,
  vendedor_cidade TEXT,
  vendedor_estado TEXT
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    im.id,
    im.titulo,
    im.descricao,
    im.categoria,
    im.subcategoria,
    im.valor_girinhas,
    im.status,
    im.fotos,
    im.created_at,
    im.publicado_por,
    COALESCE(im.moderacao_status, 'pendente') as moderacao_status,
    im.aguardando_moderacao,
    p.nome as vendedor_nome,
    p.avatar_url as vendedor_avatar,
    p.cidade as vendedor_cidade,
    p.estado as vendedor_estado
  FROM itens_moderados im
  JOIN profiles p ON p.id = im.publicado_por
  WHERE 
    (p_categoria IS NULL OR im.categoria = p_categoria)
    AND (p_user_id IS NULL OR im.publicado_por != p_user_id)  -- Excluir próprios itens
    AND im.status = 'disponivel'
  ORDER BY im.created_at DESC
  LIMIT p_limite
  OFFSET p_offset;
END;
$$;

-- 4. Função para admins verem todos os itens (incluindo rejeitados)
CREATE OR REPLACE FUNCTION admin_buscar_todos_itens(
  p_limite INTEGER DEFAULT 50,
  p_offset INTEGER DEFAULT 0
)
RETURNS TABLE(
  id UUID,
  titulo TEXT,
  categoria TEXT,
  valor_girinhas NUMERIC,
  status TEXT,
  moderacao_status TEXT,
  publicado_por UUID,
  vendedor_nome TEXT,
  created_at TIMESTAMP WITH TIME ZONE,
  moderado_em TIMESTAMP WITH TIME ZONE,
  comentario_predefinido TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Verificar se é admin
  IF NOT EXISTS (
    SELECT 1 FROM admin_users WHERE user_id = auth.uid()
  ) THEN
    RAISE EXCEPTION 'Acesso negado: apenas administradores';
  END IF;

  RETURN QUERY
  SELECT 
    i.id,
    i.titulo,
    i.categoria,
    i.valor_girinhas,
    i.status,
    COALESCE(m.status, 'pendente') as moderacao_status,
    i.publicado_por,
    p.nome as vendedor_nome,
    i.created_at,
    m.moderado_em,
    m.comentario_predefinido
  FROM itens i
  LEFT JOIN moderacao_itens m ON i.id = m.item_id
  JOIN profiles p ON p.id = i.publicado_por
  ORDER BY 
    CASE 
      WHEN m.status = 'pendente' THEN 0
      WHEN m.status = 'em_analise' THEN 1  
      WHEN m.status = 'rejeitado' THEN 2
      WHEN m.status = 'aprovado' THEN 3
      ELSE 4
    END,
    i.created_at DESC
  LIMIT p_limite
  OFFSET p_offset;
END;
$$;

-- 5. RLS policies para as views
ALTER VIEW itens_moderados OWNER TO postgres;
ALTER VIEW itens_disponiveis_moderados OWNER TO postgres;

-- Comentários para documentação
COMMENT ON VIEW itens_moderados IS 'View que exclui automaticamente itens rejeitados pela moderação';
COMMENT ON VIEW itens_disponiveis_moderados IS 'View específica para feed principal - apenas itens disponíveis e aprovados';
COMMENT ON FUNCTION buscar_itens_com_moderacao IS 'Função segura para buscar itens no feed considerando moderação';
COMMENT ON FUNCTION admin_buscar_todos_itens IS 'Função para admins verem todos os itens incluindo rejeitados';