-- Remover todas as versões das funções de tags
DROP FUNCTION IF EXISTS blog.blog_get_tags();
DROP FUNCTION IF EXISTS blog.blog_get_tag_by_slug(TEXT);
DROP FUNCTION IF EXISTS public.blog_get_tags();
DROP FUNCTION IF EXISTS public.blog_get_tag_by_slug(TEXT);

-- Criar funções corretas no schema public (como todas as outras funções do blog)
CREATE FUNCTION public.blog_get_tags()
RETURNS TABLE (
  id UUID,
  name TEXT,
  slug TEXT,
  post_count BIGINT
) 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, blog
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

CREATE FUNCTION public.blog_get_tag_by_slug(p_slug TEXT)
RETURNS TABLE (
  id UUID,
  name TEXT,
  slug TEXT
) 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, blog
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