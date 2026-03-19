-- =============================================
-- CORRIGIR SECURITY WARNINGS - Funções Blog
-- =============================================

-- Recriar funções com SET search_path

DROP FUNCTION IF EXISTS public.blog_get_posts;
CREATE OR REPLACE FUNCTION public.blog_get_posts(
  p_status TEXT DEFAULT NULL,
  p_category_id UUID DEFAULT NULL,
  p_author_id UUID DEFAULT NULL,
  p_search TEXT DEFAULT NULL,
  p_tag_ids UUID[] DEFAULT NULL,
  p_page INT DEFAULT 1,
  p_page_size INT DEFAULT 10
)
RETURNS TABLE (
  id UUID,
  title TEXT,
  slug TEXT,
  excerpt TEXT,
  content TEXT,
  status TEXT,
  author_id UUID,
  category_id UUID,
  seo_title TEXT,
  seo_description TEXT,
  seo_keywords TEXT[],
  canonical_url TEXT,
  featured_image TEXT,
  featured_image_alt TEXT,
  og_image TEXT,
  og_title TEXT,
  og_description TEXT,
  view_count INT,
  reading_time_minutes INT,
  published_at TIMESTAMPTZ,
  scheduled_for TIMESTAMPTZ,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
) 
LANGUAGE plpgsql STABLE SECURITY DEFINER
SET search_path = blog, public
AS $$
BEGIN
  RETURN QUERY
  SELECT DISTINCT
    p.id, p.title, p.slug, p.excerpt, p.content, p.status,
    p.author_id, p.category_id,
    p.seo_title, p.seo_description, p.seo_keywords, p.canonical_url,
    p.featured_image, p.featured_image_alt, p.og_image, p.og_title, p.og_description,
    p.view_count, p.reading_time_minutes,
    p.published_at, p.scheduled_for, p.created_at, p.updated_at
  FROM blog.posts p
  LEFT JOIN blog.post_tags pt ON p.id = pt.post_id
  WHERE
    (p_status IS NULL OR p.status = p_status)
    AND (p_category_id IS NULL OR p.category_id = p_category_id)
    AND (p_author_id IS NULL OR p.author_id = p_author_id)
    AND (p_search IS NULL OR p.title ILIKE '%' || p_search || '%' OR p.content ILIKE '%' || p_search || '%')
    AND (p_tag_ids IS NULL OR pt.tag_id = ANY(p_tag_ids))
  ORDER BY p.published_at DESC NULLS LAST, p.created_at DESC
  LIMIT p_page_size
  OFFSET (p_page - 1) * p_page_size;
END;
$$;

DROP FUNCTION IF EXISTS public.blog_get_post_by_slug;
CREATE OR REPLACE FUNCTION public.blog_get_post_by_slug(p_slug TEXT)
RETURNS TABLE (
  id UUID,
  title TEXT,
  slug TEXT,
  excerpt TEXT,
  content TEXT,
  status TEXT,
  author_id UUID,
  category_id UUID,
  seo_title TEXT,
  seo_description TEXT,
  seo_keywords TEXT[],
  canonical_url TEXT,
  featured_image TEXT,
  featured_image_alt TEXT,
  og_image TEXT,
  og_title TEXT,
  og_description TEXT,
  view_count INT,
  reading_time_minutes INT,
  published_at TIMESTAMPTZ,
  scheduled_for TIMESTAMPTZ,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
)
LANGUAGE plpgsql STABLE SECURITY DEFINER
SET search_path = blog, public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id, p.title, p.slug, p.excerpt, p.content, p.status,
    p.author_id, p.category_id,
    p.seo_title, p.seo_description, p.seo_keywords, p.canonical_url,
    p.featured_image, p.featured_image_alt, p.og_image, p.og_title, p.og_description,
    p.view_count, p.reading_time_minutes,
    p.published_at, p.scheduled_for, p.created_at, p.updated_at
  FROM blog.posts p
  WHERE p.slug = p_slug;
END;
$$;

DROP FUNCTION IF EXISTS public.blog_increment_view_count;
CREATE OR REPLACE FUNCTION public.blog_increment_view_count(p_post_id UUID)
RETURNS VOID
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = blog, public
AS $$
BEGIN
  UPDATE blog.posts
  SET view_count = view_count + 1
  WHERE id = p_post_id;
END;
$$;

DROP FUNCTION IF EXISTS public.blog_get_categories;
CREATE OR REPLACE FUNCTION public.blog_get_categories()
RETURNS TABLE (
  id UUID,
  name TEXT,
  slug TEXT,
  description TEXT,
  seo_title TEXT,
  seo_description TEXT,
  post_count BIGINT,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
)
LANGUAGE plpgsql STABLE SECURITY DEFINER
SET search_path = blog, public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    c.id, c.name, c.slug, c.description,
    c.seo_title, c.seo_description,
    COUNT(p.id) as post_count,
    c.created_at, c.updated_at
  FROM blog.categories c
  LEFT JOIN blog.posts p ON c.id = p.category_id AND p.status = 'published'
  GROUP BY c.id, c.name, c.slug, c.description, c.seo_title, c.seo_description, c.created_at, c.updated_at
  ORDER BY c.name;
END;
$$;

DROP FUNCTION IF EXISTS public.blog_get_category_by_slug;
CREATE OR REPLACE FUNCTION public.blog_get_category_by_slug(p_slug TEXT)
RETURNS TABLE (
  id UUID,
  name TEXT,
  slug TEXT,
  description TEXT,
  seo_title TEXT,
  seo_description TEXT,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
)
LANGUAGE plpgsql STABLE SECURITY DEFINER
SET search_path = blog, public
AS $$
BEGIN
  RETURN QUERY
  SELECT c.id, c.name, c.slug, c.description, c.seo_title, c.seo_description, c.created_at, c.updated_at
  FROM blog.categories c
  WHERE c.slug = p_slug;
END;
$$;

DROP FUNCTION IF EXISTS public.blog_get_tags;
CREATE OR REPLACE FUNCTION public.blog_get_tags()
RETURNS TABLE (
  id UUID,
  name TEXT,
  slug TEXT,
  created_at TIMESTAMPTZ
)
LANGUAGE plpgsql STABLE SECURITY DEFINER
SET search_path = blog, public
AS $$
BEGIN
  RETURN QUERY
  SELECT t.id, t.name, t.slug, t.created_at
  FROM blog.tags t
  ORDER BY t.name;
END;
$$;

DROP FUNCTION IF EXISTS public.blog_get_authors;
CREATE OR REPLACE FUNCTION public.blog_get_authors()
RETURNS TABLE (
  id UUID,
  name TEXT,
  slug TEXT,
  bio TEXT,
  avatar_url TEXT,
  email TEXT,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
)
LANGUAGE plpgsql STABLE SECURITY DEFINER
SET search_path = blog, public
AS $$
BEGIN
  RETURN QUERY
  SELECT a.id, a.name, a.slug, a.bio, a.avatar_url, a.email, a.created_at, a.updated_at
  FROM blog.authors a
  ORDER BY a.name;
END;
$$;

DROP FUNCTION IF EXISTS public.blog_get_author_by_slug;
CREATE OR REPLACE FUNCTION public.blog_get_author_by_slug(p_slug TEXT)
RETURNS TABLE (
  id UUID,
  name TEXT,
  slug TEXT,
  bio TEXT,
  avatar_url TEXT,
  email TEXT,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
)
LANGUAGE plpgsql STABLE SECURITY DEFINER
SET search_path = blog, public
AS $$
BEGIN
  RETURN QUERY
  SELECT a.id, a.name, a.slug, a.bio, a.avatar_url, a.email, a.created_at, a.updated_at
  FROM blog.authors a
  WHERE a.slug = p_slug;
END;
$$;

DROP FUNCTION IF EXISTS public.blog_get_post_tags;
CREATE OR REPLACE FUNCTION public.blog_get_post_tags(p_post_id UUID)
RETURNS TABLE (
  id UUID,
  name TEXT,
  slug TEXT
)
LANGUAGE plpgsql STABLE SECURITY DEFINER
SET search_path = blog, public
AS $$
BEGIN
  RETURN QUERY
  SELECT t.id, t.name, t.slug
  FROM blog.tags t
  INNER JOIN blog.post_tags pt ON t.id = pt.tag_id
  WHERE pt.post_id = p_post_id
  ORDER BY t.name;
END;
$$;