import { z } from 'zod';

export const postFormSchema = z.object({
  title: z.string().min(10, 'Título deve ter no mínimo 10 caracteres').max(255),
  slug: z.string().min(5).max(255).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug inválido'),
  excerpt: z.string().min(50, 'Resumo deve ter no mínimo 50 caracteres').max(500),
  content: z.string().min(100, 'Conteúdo deve ter no mínimo 100 caracteres'),
  categoryId: z.string().optional(),
  status: z.enum(['draft', 'published', 'scheduled', 'archived']),
  seoTitle: z.string().max(60).optional(),
  seoDescription: z.string().max(160).optional(),
  featuredImage: z.string().url().optional().or(z.literal('')),
});

export type PostFormData = z.infer<typeof postFormSchema>;
