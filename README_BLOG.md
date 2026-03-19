# 📚 Blog GiraMãe - Estrutura Isolada

## 📁 Estrutura de Arquivos

```
src/blog/
├── types/
│   └── index.ts              # Tipos TypeScript do blog
├── lib/
│   ├── data/
│   │   ├── index.ts          # Exportação do repository
│   │   └── mockRepository.ts # Implementação mock para desenvolvimento
│   └── utils/
│       ├── slugify.ts        # Geração de slugs
│       ├── truncate.ts       # Truncar texto
│       └── formatDate.ts     # Formatação de datas
├── hooks/
│   ├── usePosts.ts           # Hook para listar posts
│   ├── usePost.ts            # Hook para post individual
│   └── useCategories.ts      # Hook para categorias
└── README_BLOG.md            # Esta documentação

src/pages/
├── Blog.tsx                  # Página principal do blog (lista)
└── BlogPost.tsx              # Página de detalhes do post
```

## 🎯 Isolamento Completo

✅ **Totalmente isolado** do resto do projeto GiraMãe
✅ **Sem dependências** de tabelas Supabase do projeto principal
✅ **Mock data** pronto para desenvolvimento
✅ **Repository pattern** para fácil migração futura

## 🚀 Como Usar

### 1. Acessar o Blog

```typescript
// Rotas públicas disponíveis:
http://localhost:5173/blog              // Lista de posts
http://localhost:5173/blog/[slug]       // Detalhe do post
```

### 2. Dados Mock

Por padrão, o blog usa dados mock. Posts de exemplo já estão disponíveis em:
`src/blog/lib/data/mockRepository.ts`

### 3. Adicionar Novo Post (Mock)

```typescript
// Em mockRepository.ts, adicione ao array mockPosts:
{
  id: 'post-3',
  title: 'Novo Post',
  slug: 'novo-post',
  excerpt: 'Resumo do post',
  content: '# Conteúdo em Markdown',
  status: 'published',
  authorId: 'author-1',
  categoryId: 'cat-1',
  viewCount: 0,
  readingTimeMinutes: 5,
  publishedAt: new Date().toISOString(),
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
}
```

### 4. Criar Novas Categorias

```typescript
// Em mockRepository.ts, adicione ao array mockCategories:
{
  id: 'cat-4',
  name: 'Nova Categoria',
  slug: 'nova-categoria',
  description: 'Descrição da categoria',
  postCount: 0,
}
```

## 🔄 Migração Futura para Supabase

Quando quiser conectar ao Supabase:

1. Criar tabelas no Supabase:
```sql
-- Tabela de autores
CREATE TABLE blog_authors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  bio TEXT,
  avatar_url TEXT,
  email TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Tabela de categorias
CREATE TABLE blog_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  seo_title TEXT,
  seo_description TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Tabela de posts
CREATE TABLE blog_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  excerpt TEXT NOT NULL,
  content TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('draft', 'published', 'scheduled', 'archived')),
  
  -- Relations
  author_id UUID REFERENCES blog_authors(id),
  category_id UUID REFERENCES blog_categories(id),
  
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
  view_count INTEGER DEFAULT 0,
  reading_time_minutes INTEGER,
  published_at TIMESTAMPTZ,
  scheduled_for TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Índices
CREATE INDEX idx_blog_posts_slug ON blog_posts(slug);
CREATE INDEX idx_blog_posts_status ON blog_posts(status);
CREATE INDEX idx_blog_posts_category ON blog_posts(category_id);
CREATE INDEX idx_blog_posts_published ON blog_posts(published_at DESC);
```

2. Criar `src/blog/lib/data/supabaseRepository.ts`:
```typescript
import { supabase } from '@/integrations/supabase/client';
import { BlogRepository } from '@/blog/types';

export class SupabaseBlogRepository implements BlogRepository {
  async getPosts(filters, pagination) {
    let query = supabase
      .from('blog_posts')
      .select('*, author:blog_authors(*), category:blog_categories(*)');
    
    if (filters?.status) {
      query = query.eq('status', filters.status);
    }
    
    // ... implementar outros filtros
    
    const { data, error } = await query;
    if (error) throw error;
    return data;
  }
  
  // ... implementar outros métodos
}
```

3. Atualizar `src/blog/lib/data/index.ts`:
```typescript
import { SupabaseBlogRepository } from './supabaseRepository';
import { MockBlogRepository } from './mockRepository';

export function getBlogRepository() {
  const useMock = process.env.VITE_USE_MOCK_BLOG === 'true';
  return useMock ? new MockBlogRepository() : new SupabaseBlogRepository();
}
```

## 📦 Dependências Instaladas

- `react-markdown` - Renderização de Markdown
- `date-fns` - Formatação de datas (já estava no projeto)

## 🎨 Componentes UI Usados

Todos os componentes shadcn/ui necessários já estavam instalados:
- Button, Input, Card, Badge
- Table (para admin futuro)
- Dialog, Alert
- Loader2 (lucide-react)

## 🛣️ Roadmap

### ✅ Fase 1: MVP Público (COMPLETO)
- [x] Estrutura isolada do blog
- [x] Tipos TypeScript
- [x] Repository pattern
- [x] Mock data
- [x] Hooks (usePosts, usePost, useCategories)
- [x] Página de lista de posts
- [x] Página de detalhe do post
- [x] Busca e filtros por categoria
- [x] Sistema de visualizações
- [x] Markdown rendering

### 🔜 Fase 2: Admin Panel
- [ ] Tela de gerenciamento de posts
- [ ] Editor de posts com preview
- [ ] Upload de imagens
- [ ] Gerenciamento de categorias
- [ ] Sistema de agendamento

### 🔜 Fase 3: SEO Avançado
- [ ] Structured data (JSON-LD)
- [ ] Open Graph tags
- [ ] Twitter Cards
- [ ] Sitemap XML
- [ ] Meta tags dinâmicas

### 🔜 Fase 4: Integração Supabase
- [ ] Migração para Supabase
- [ ] Sistema de autores
- [ ] Sistema de tags
- [ ] Comentários
- [ ] Analytics

## 💡 Exemplo de Uso

```typescript
// Buscar posts de uma categoria
const { posts, loading } = usePosts({ 
  status: 'published',
  categoryId: 'cat-1' 
});

// Buscar post individual
const { post } = usePost('slug-do-post');

// Listar categorias
const { categories } = useCategories();
```

## 🔒 Segurança

- ✅ Validação de slugs
- ✅ Sanitização de HTML (via react-markdown)
- ✅ Tipos TypeScript estritos
- ✅ Repository pattern para isolamento

## 📝 Notas Importantes

1. **Mock Data**: Por padrão usa dados mock. Perfeito para desenvolvimento.
2. **Isolamento**: Zero dependência do resto do projeto.
3. **Escalável**: Fácil adicionar Supabase futuramente.
4. **SEO Ready**: Estrutura preparada para SEO.
5. **Mobile First**: UI responsiva com Tailwind.

## 🆘 Problemas Comuns

**Q: Posts não aparecem?**
A: Verifique que o status seja 'published' no mock data.

**Q: Como adicionar imagens?**
A: Adicione URLs de imagens em `featuredImage` no mock data.

**Q: Como customizar UI?**
A: Edite `src/pages/Blog.tsx` e `src/pages/BlogPost.tsx`.

---

**Criado por**: Lovable AI  
**Data**: 2025-01-22  
**Status**: ✅ Pronto para uso
