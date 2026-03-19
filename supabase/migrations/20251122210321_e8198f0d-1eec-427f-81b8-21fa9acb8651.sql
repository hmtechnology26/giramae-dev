-- Funções wrapper para criar e atualizar posts

-- Função para criar post
CREATE OR REPLACE FUNCTION public.blog_create_post(
  p_title TEXT,
  p_slug TEXT,
  p_excerpt TEXT,
  p_content TEXT,
  p_status TEXT DEFAULT 'draft',
  p_author_id UUID DEFAULT NULL,
  p_category_id UUID DEFAULT NULL,
  p_seo_title TEXT DEFAULT NULL,
  p_seo_description TEXT DEFAULT NULL,
  p_featured_image TEXT DEFAULT NULL
) RETURNS TABLE (
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
  featured_image TEXT,
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
) LANGUAGE plpgsql SECURITY DEFINER SET search_path = blog, public AS $$
BEGIN
  RETURN QUERY
  INSERT INTO blog.posts (
    title, slug, excerpt, content, status, 
    author_id, category_id, seo_title, seo_description, 
    featured_image, published_at
  ) VALUES (
    p_title, p_slug, p_excerpt, p_content, p_status,
    p_author_id, p_category_id, p_seo_title, p_seo_description,
    p_featured_image, 
    CASE WHEN p_status = 'published' THEN now() ELSE NULL END
  )
  RETURNING 
    blog.posts.id,
    blog.posts.title,
    blog.posts.slug,
    blog.posts.excerpt,
    blog.posts.content,
    blog.posts.status,
    blog.posts.author_id,
    blog.posts.category_id,
    blog.posts.seo_title,
    blog.posts.seo_description,
    blog.posts.featured_image,
    blog.posts.published_at,
    blog.posts.created_at,
    blog.posts.updated_at;
END;
$$;

-- Função para atualizar post
CREATE OR REPLACE FUNCTION public.blog_update_post(
  p_id UUID,
  p_title TEXT DEFAULT NULL,
  p_slug TEXT DEFAULT NULL,
  p_excerpt TEXT DEFAULT NULL,
  p_content TEXT DEFAULT NULL,
  p_status TEXT DEFAULT NULL,
  p_category_id UUID DEFAULT NULL,
  p_seo_title TEXT DEFAULT NULL,
  p_seo_description TEXT DEFAULT NULL,
  p_featured_image TEXT DEFAULT NULL
) RETURNS TABLE (
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
  featured_image TEXT,
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
) LANGUAGE plpgsql SECURITY DEFINER SET search_path = blog, public AS $$
DECLARE
  v_current_published_at TIMESTAMPTZ;
BEGIN
  -- Pegar published_at atual
  SELECT blog.posts.published_at INTO v_current_published_at
  FROM blog.posts
  WHERE blog.posts.id = p_id;

  RETURN QUERY
  UPDATE blog.posts SET
    title = COALESCE(p_title, blog.posts.title),
    slug = COALESCE(p_slug, blog.posts.slug),
    excerpt = COALESCE(p_excerpt, blog.posts.excerpt),
    content = COALESCE(p_content, blog.posts.content),
    status = COALESCE(p_status, blog.posts.status),
    category_id = COALESCE(p_category_id, blog.posts.category_id),
    seo_title = COALESCE(p_seo_title, blog.posts.seo_title),
    seo_description = COALESCE(p_seo_description, blog.posts.seo_description),
    featured_image = COALESCE(p_featured_image, blog.posts.featured_image),
    published_at = CASE 
      WHEN p_status = 'published' AND v_current_published_at IS NULL 
      THEN now() 
      ELSE v_current_published_at 
    END,
    updated_at = now()
  WHERE blog.posts.id = p_id
  RETURNING 
    blog.posts.id,
    blog.posts.title,
    blog.posts.slug,
    blog.posts.excerpt,
    blog.posts.content,
    blog.posts.status,
    blog.posts.author_id,
    blog.posts.category_id,
    blog.posts.seo_title,
    blog.posts.seo_description,
    blog.posts.featured_image,
    blog.posts.published_at,
    blog.posts.created_at,
    blog.posts.updated_at;
END;
$$;