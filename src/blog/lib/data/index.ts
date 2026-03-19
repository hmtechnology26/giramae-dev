// Data layer - Repository pattern
import { BlogRepository } from '@/blog/types';
import { SupabaseBlogRepository } from './supabaseRepository';
import { MockBlogRepository } from './mockRepository';

let repository: BlogRepository | null = null;

export function getBlogRepository(): BlogRepository {
  if (!repository) {
    // Usar Supabase como padrão
    // Fallback para mock apenas em desenvolvimento se necessário
    const useMock = import.meta.env.VITE_USE_MOCK_BLOG === 'true';
    
    if (useMock) {
      console.log('📝 Blog: Usando mock data (desenvolvimento)');
      repository = new MockBlogRepository();
    } else {
      console.log('📝 Blog: Usando Supabase (produção)');
      repository = new SupabaseBlogRepository();
    }
  }
  return repository;
}

export function resetBlogRepository() {
  repository = null;
}
