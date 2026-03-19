import { Author, Category, Tag, Post } from '../types';

export const mockAuthors: Author[] = [
  {
    id: 'author-1',
    name: 'Equipe GiraMãe',
    slug: 'equipe-giramae',
    bio: 'Equipe dedicada a ajudar mães na jornada da maternidade',
  },
];

export const mockCategories: Category[] = [
  { id: 'cat-1', name: 'Economia', slug: 'economia', description: 'Dicas de economia', postCount: 0 },
  { id: 'cat-2', name: 'Sustentabilidade', slug: 'sustentabilidade', description: 'Práticas sustentáveis', postCount: 0 },
  { id: 'cat-3', name: 'Maternidade', slug: 'maternidade', description: 'Sobre ser mãe', postCount: 0 },
];

export const mockTags: Tag[] = [
  { id: 'tag-1', name: 'Roupas', slug: 'roupas' },
  { id: 'tag-2', name: 'Brinquedos', slug: 'brinquedos' },
  { id: 'tag-3', name: 'Dicas', slug: 'dicas' },
];

export const mockPosts: Post[] = [
  {
    id: 'post-1',
    title: '10 Dicas para Economizar com Roupas Infantis',
    slug: '10-dicas-economizar-roupas-infantis',
    excerpt: 'Descubra como economizar até 70% com roupas para seus filhos sem perder qualidade.',
    content: `# Como Economizar com Roupas Infantis

As crianças crescem rápido, e manter o guarda-roupa atualizado pode pesar no bolso.

## 1. Compre Trocas ao Invés de Novo

A GiraMãe permite trocar roupas usando Girinhas ao invés de dinheiro.

## 2. Aproveite Promoções Sazonais

Compre roupas de inverno no verão e vice-versa - descontos chegam a 70%.`,
    status: 'published',
    authorId: 'author-1',
    author: mockAuthors[0],
    categoryId: 'cat-1',
    category: mockCategories[0],
    viewCount: 234,
    readingTimeMinutes: 5,
    publishedAt: '2025-01-15T10:00:00Z',
    createdAt: '2025-01-10T10:00:00Z',
    updatedAt: '2025-01-15T10:00:00Z',
  },
];
