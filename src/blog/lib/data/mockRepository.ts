// Mock Repository para desenvolvimento
import { BlogRepository, Post, Category, Author, Tag, PostFilters, PaginationOptions } from '@/blog/types';

const mockAuthors: Author[] = [
  {
    id: 'author-1',
    name: 'Equipe GiraMãe',
    slug: 'equipe-giramae',
    bio: 'Equipe dedicada a ajudar mães na jornada da maternidade consciente',
    avatarUrl: '/team-avatar.jpg',
  },
];

const mockCategories: Category[] = [
  {
    id: 'cat-1',
    name: 'Economia',
    slug: 'economia',
    description: 'Dicas para economizar na maternidade',
    postCount: 0,
  },
  {
    id: 'cat-2',
    name: 'Sustentabilidade',
    slug: 'sustentabilidade',
    description: 'Práticas sustentáveis para famílias',
    postCount: 0,
  },
  {
    id: 'cat-3',
    name: 'Maternidade',
    slug: 'maternidade',
    description: 'Dicas e experiências sobre ser mãe',
    postCount: 0,
  },
];

const mockTags: Tag[] = [
  { id: 'tag-1', name: 'Roupas Infantis', slug: 'roupas-infantis', postCount: 2 },
  { id: 'tag-2', name: 'Economia', slug: 'economia', postCount: 3 },
  { id: 'tag-3', name: 'Sustentabilidade', slug: 'sustentabilidade', postCount: 2 },
  { id: 'tag-4', name: 'Dicas Práticas', slug: 'dicas-praticas', postCount: 5 },
  { id: 'tag-5', name: 'Maternidade', slug: 'maternidade', postCount: 4 },
];

const mockPosts: Post[] = [
  {
    id: 'post-1',
    title: '10 Dicas para Economizar com Roupas Infantis',
    slug: '10-dicas-economizar-roupas-infantis',
    excerpt: 'Descubra como economizar até 70% com roupas para seus filhos sem perder qualidade.',
    content: `# Como Economizar com Roupas Infantis

As crianças crescem rápido, e manter o guarda-roupa atualizado pode pesar no bolso. Mas existem estratégias inteligentes para economizar sem abrir mão da qualidade.

## 1. Compre Trocas ao Invés de Novo

A GiraMãe permite que você troque roupas que não servem mais por outras no tamanho adequado, usando Girinhas ao invés de dinheiro.

## 2. Aproveite Promoções Sazonais

Compre roupas de inverno no verão e vice-versa - os descontos chegam a 70%.

## 3. Organize Rodízios com Amigas

Combine com outras mães de criar um sistema de rodízio de roupas infantis.`,
    status: 'published',
    authorId: 'author-1',
    author: mockAuthors[0],
    categoryId: 'cat-1',
    category: mockCategories[0],
    seoTitle: '10 Dicas Práticas para Economizar com Roupas Infantis',
    seoDescription: 'Aprenda estratégias comprovadas para economizar até 70% com roupas infantis mantendo qualidade e estilo.',
    featuredImage: '/blog/economizar-roupas.jpg',
    viewCount: 234,
    readingTimeMinutes: 5,
    publishedAt: '2025-01-15T10:00:00Z',
    createdAt: '2025-01-10T10:00:00Z',
    updatedAt: '2025-01-15T10:00:00Z',
  },
  {
    id: 'post-2',
    title: 'Sustentabilidade Infantil: Por Onde Começar',
    slug: 'sustentabilidade-infantil-por-onde-comecar',
    excerpt: 'Guia completo para adotar práticas sustentáveis na criação dos filhos.',
    content: `# Sustentabilidade na Maternidade

Criar filhos de forma consciente é possível e necessário. Veja como começar.`,
    status: 'published',
    authorId: 'author-1',
    author: mockAuthors[0],
    categoryId: 'cat-2',
    category: mockCategories[1],
    viewCount: 189,
    readingTimeMinutes: 7,
    publishedAt: '2025-01-10T10:00:00Z',
    createdAt: '2025-01-05T10:00:00Z',
    updatedAt: '2025-01-10T10:00:00Z',
  },
];

export class MockBlogRepository implements BlogRepository {
  private posts: Post[] = mockPosts;
  private categories: Category[] = mockCategories;
  private authors: Author[] = mockAuthors;
  private tags: Tag[] = mockTags;

  async getPosts(filters?: PostFilters, pagination?: PaginationOptions): Promise<Post[]> {
    let filtered = [...this.posts];

    if (filters?.status) {
      filtered = filtered.filter(p => p.status === filters.status);
    }

    if (filters?.categoryId) {
      filtered = filtered.filter(p => p.categoryId === filters.categoryId);
    }

    if (filters?.authorId) {
      filtered = filtered.filter(p => p.authorId === filters.authorId);
    }

    if (filters?.search) {
      const search = filters.search.toLowerCase();
      filtered = filtered.filter(p =>
        p.title.toLowerCase().includes(search) ||
        p.excerpt.toLowerCase().includes(search)
      );
    }

    // Sort by published date
    filtered.sort((a, b) => 
      new Date(b.publishedAt || b.createdAt).getTime() - 
      new Date(a.publishedAt || a.createdAt).getTime()
    );

    if (pagination) {
      const start = (pagination.page - 1) * pagination.pageSize;
      const end = start + pagination.pageSize;
      return filtered.slice(start, end);
    }

    return filtered;
  }

  async getPostById(id: string): Promise<Post | null> {
    return this.posts.find(p => p.id === id) || null;
  }

  async getPostBySlug(slug: string): Promise<Post | null> {
    return this.posts.find(p => p.slug === slug) || null;
  }

  async createPost(data: Partial<Post>): Promise<Post> {
    const newPost: Post = {
      id: `post-${Date.now()}`,
      title: data.title || '',
      slug: data.slug || '',
      excerpt: data.excerpt || '',
      content: data.content || '',
      status: data.status || 'draft',
      authorId: data.authorId || 'author-1',
      viewCount: 0,
      readingTimeMinutes: Math.ceil((data.content?.split(' ').length || 0) / 200),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ...data,
    };

    this.posts.push(newPost);
    return newPost;
  }

  async updatePost(data: Partial<Post> & { id: string }): Promise<Post> {
    const index = this.posts.findIndex(p => p.id === data.id);
    if (index === -1) throw new Error('Post not found');

    this.posts[index] = {
      ...this.posts[index],
      ...data,
      updatedAt: new Date().toISOString(),
    };

    return this.posts[index];
  }

  async deletePost(id: string): Promise<void> {
    this.posts = this.posts.filter(p => p.id !== id);
  }

  async incrementViewCount(id: string): Promise<void> {
    const post = this.posts.find(p => p.id === id);
    if (post) {
      post.viewCount++;
    }
  }

  async getCategories(): Promise<Category[]> {
    return this.categories;
  }

  async getCategoryBySlug(slug: string): Promise<Category | null> {
    return this.categories.find(c => c.slug === slug) || null;
  }

  async getAuthors(): Promise<Author[]> {
    return this.authors;
  }

  async getAuthorBySlug(slug: string): Promise<Author | null> {
    return this.authors.find(a => a.slug === slug) || null;
  }

  async getTags(): Promise<Tag[]> {
    return this.tags;
  }

  async getTagBySlug(slug: string): Promise<Tag | null> {
    return this.tags.find(t => t.slug === slug) || null;
  }
}
