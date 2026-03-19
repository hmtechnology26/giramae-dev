-- =============================================
-- SCHEMA BLOG - Banco de Dados Real
-- =============================================

-- Criar schema blog
CREATE SCHEMA IF NOT EXISTS blog;

-- =============================================
-- TABELAS
-- =============================================

-- Tabela de autores
CREATE TABLE blog.authors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  bio TEXT,
  avatar_url TEXT,
  email TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Tabela de categorias
CREATE TABLE blog.categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  seo_title TEXT,
  seo_description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Tabela de tags
CREATE TABLE blog.tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Tabela de posts
CREATE TABLE blog.posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  excerpt TEXT NOT NULL,
  content TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'scheduled', 'archived')),
  
  -- Relations
  author_id UUID NOT NULL REFERENCES blog.authors(id) ON DELETE CASCADE,
  category_id UUID REFERENCES blog.categories(id) ON DELETE SET NULL,
  
  -- SEO
  seo_title TEXT,
  seo_description TEXT,
  seo_keywords TEXT[],
  canonical_url TEXT,
  
  -- Images
  featured_image TEXT,
  featured_image_alt TEXT,
  og_image TEXT,
  og_title TEXT,
  og_description TEXT,
  
  -- Metadata
  view_count INTEGER NOT NULL DEFAULT 0,
  reading_time_minutes INTEGER NOT NULL DEFAULT 5,
  published_at TIMESTAMPTZ,
  scheduled_for TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Tabela de relacionamento post-tags (muitos para muitos)
CREATE TABLE blog.post_tags (
  post_id UUID NOT NULL REFERENCES blog.posts(id) ON DELETE CASCADE,
  tag_id UUID NOT NULL REFERENCES blog.tags(id) ON DELETE CASCADE,
  PRIMARY KEY (post_id, tag_id)
);

-- =============================================
-- ÍNDICES
-- =============================================

CREATE INDEX idx_posts_slug ON blog.posts(slug);
CREATE INDEX idx_posts_status ON blog.posts(status);
CREATE INDEX idx_posts_author ON blog.posts(author_id);
CREATE INDEX idx_posts_category ON blog.posts(category_id);
CREATE INDEX idx_posts_published ON blog.posts(published_at DESC);
CREATE INDEX idx_posts_view_count ON blog.posts(view_count DESC);
CREATE INDEX idx_categories_slug ON blog.categories(slug);
CREATE INDEX idx_tags_slug ON blog.tags(slug);
CREATE INDEX idx_authors_slug ON blog.authors(slug);

-- =============================================
-- TRIGGERS
-- =============================================

-- Trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION blog.update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_posts_updated_at
  BEFORE UPDATE ON blog.posts
  FOR EACH ROW
  EXECUTE FUNCTION blog.update_updated_at();

CREATE TRIGGER update_categories_updated_at
  BEFORE UPDATE ON blog.categories
  FOR EACH ROW
  EXECUTE FUNCTION blog.update_updated_at();

CREATE TRIGGER update_authors_updated_at
  BEFORE UPDATE ON blog.authors
  FOR EACH ROW
  EXECUTE FUNCTION blog.update_updated_at();

-- =============================================
-- RLS POLICIES
-- =============================================

-- Habilitar RLS
ALTER TABLE blog.posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog.tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog.authors ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog.post_tags ENABLE ROW LEVEL SECURITY;

-- Policies para posts
CREATE POLICY "Posts publicados são públicos"
  ON blog.posts FOR SELECT
  USING (status = 'published');

CREATE POLICY "Admins podem gerenciar posts"
  ON blog.posts FOR ALL
  USING (is_master_admin());

-- Policies para categorias (público para leitura)
CREATE POLICY "Categorias são públicas"
  ON blog.categories FOR SELECT
  USING (true);

CREATE POLICY "Admins podem gerenciar categorias"
  ON blog.categories FOR ALL
  USING (is_master_admin());

-- Policies para tags (público para leitura)
CREATE POLICY "Tags são públicas"
  ON blog.tags FOR SELECT
  USING (true);

CREATE POLICY "Admins podem gerenciar tags"
  ON blog.tags FOR ALL
  USING (is_master_admin());

-- Policies para autores (público para leitura)
CREATE POLICY "Autores são públicos"
  ON blog.authors FOR SELECT
  USING (true);

CREATE POLICY "Admins podem gerenciar autores"
  ON blog.authors FOR ALL
  USING (is_master_admin());

-- Policies para post_tags
CREATE POLICY "Post tags são públicos"
  ON blog.post_tags FOR SELECT
  USING (true);

CREATE POLICY "Admins podem gerenciar post tags"
  ON blog.post_tags FOR ALL
  USING (is_master_admin());

-- =============================================
-- FUNÇÕES WRAPPER (PUBLIC SCHEMA)
-- =============================================

-- Função para buscar posts com filtros
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
) AS $$
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
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- Função para buscar post por slug
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
) AS $$
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
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- Função para incrementar view count
CREATE OR REPLACE FUNCTION public.blog_increment_view_count(p_post_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE blog.posts
  SET view_count = view_count + 1
  WHERE id = p_post_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para buscar categorias
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
) AS $$
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
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- Função para buscar categoria por slug
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
) AS $$
BEGIN
  RETURN QUERY
  SELECT c.id, c.name, c.slug, c.description, c.seo_title, c.seo_description, c.created_at, c.updated_at
  FROM blog.categories c
  WHERE c.slug = p_slug;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- Função para buscar tags
CREATE OR REPLACE FUNCTION public.blog_get_tags()
RETURNS TABLE (
  id UUID,
  name TEXT,
  slug TEXT,
  created_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT t.id, t.name, t.slug, t.created_at
  FROM blog.tags t
  ORDER BY t.name;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- Função para buscar autores
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
) AS $$
BEGIN
  RETURN QUERY
  SELECT a.id, a.name, a.slug, a.bio, a.avatar_url, a.email, a.created_at, a.updated_at
  FROM blog.authors a
  ORDER BY a.name;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- Função para buscar autor por slug
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
) AS $$
BEGIN
  RETURN QUERY
  SELECT a.id, a.name, a.slug, a.bio, a.avatar_url, a.email, a.created_at, a.updated_at
  FROM blog.authors a
  WHERE a.slug = p_slug;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- Função para buscar tags de um post
CREATE OR REPLACE FUNCTION public.blog_get_post_tags(p_post_id UUID)
RETURNS TABLE (
  id UUID,
  name TEXT,
  slug TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT t.id, t.name, t.slug
  FROM blog.tags t
  INNER JOIN blog.post_tags pt ON t.id = pt.tag_id
  WHERE pt.post_id = p_post_id
  ORDER BY t.name;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- =============================================
-- DADOS INICIAIS
-- =============================================

-- Criar autor padrão
INSERT INTO blog.authors (name, slug, bio, avatar_url)
VALUES (
  'Equipe GiraMãe',
  'equipe-giramae',
  'Equipe dedicada a ajudar mães na jornada da maternidade sustentável e econômica.',
  '/logo.png'
) ON CONFLICT (slug) DO NOTHING;

-- Criar categorias padrão
INSERT INTO blog.categories (name, slug, description, seo_title, seo_description)
VALUES 
  (
    'Maternidade',
    'maternidade',
    'Dicas e experiências sobre a jornada da maternidade',
    'Maternidade | Blog GiraMãe',
    'Dicas práticas sobre maternidade, cuidados com bebês e desenvolvimento infantil'
  ),
  (
    'Economia',
    'economia',
    'Como economizar na criação dos filhos',
    'Economia Infantil | Blog GiraMãe',
    'Aprenda a economizar comprando, trocando e reutilizando roupas e produtos infantis'
  ),
  (
    'Sustentabilidade',
    'sustentabilidade',
    'Práticas sustentáveis na criação dos filhos',
    'Sustentabilidade | Blog GiraMãe',
    'Sustentabilidade infantil, economia circular e consumo consciente'
  )
ON CONFLICT (slug) DO NOTHING;

-- Criar tags padrão
INSERT INTO blog.tags (name, slug)
VALUES 
  ('Roupas Infantis', 'roupas-infantis'),
  ('Economia Circular', 'economia-circular'),
  ('Dicas de Mãe', 'dicas-de-mae'),
  ('Brechó', 'brecho'),
  ('Sustentabilidade', 'sustentabilidade'),
  ('Trocas', 'trocas')
ON CONFLICT (slug) DO NOTHING;