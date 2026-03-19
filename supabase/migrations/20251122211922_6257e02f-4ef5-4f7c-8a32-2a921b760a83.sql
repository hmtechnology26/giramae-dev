-- Adicionar função para buscar todas as tags com contagem de posts
CREATE OR REPLACE FUNCTION blog.blog_get_tags()
RETURNS TABLE (
  id UUID,
  name TEXT,
  slug TEXT,
  post_count BIGINT
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    t.id,
    t.name,
    t.slug,
    COUNT(pt.post_id) AS post_count
  FROM blog.tags t
  LEFT JOIN blog.post_tags pt ON t.id = pt.tag_id
  LEFT JOIN blog.posts p ON pt.post_id = p.id AND p.status = 'published'
  GROUP BY t.id, t.name, t.slug
  ORDER BY post_count DESC, t.name ASC;
END;
$$;

-- Adicionar função para buscar tag por slug
CREATE OR REPLACE FUNCTION blog.blog_get_tag_by_slug(p_slug TEXT)
RETURNS TABLE (
  id UUID,
  name TEXT,
  slug TEXT
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    t.id,
    t.name,
    t.slug
  FROM blog.tags t
  WHERE t.slug = p_slug
  LIMIT 1;
END;
$$;