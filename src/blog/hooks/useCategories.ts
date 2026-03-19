import { useState, useEffect } from 'react';
import { Category } from '@/blog/types';
import { getBlogRepository } from '@/blog/lib/data';

interface UseCategoriesReturn {
  categories: Category[];
  loading: boolean;
  error: Error | null;
}

export function useCategories(): UseCategoriesReturn {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const repository = getBlogRepository();
        const result = await repository.getCategories();
        
        setCategories(result);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to fetch categories'));
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  return { categories, loading, error };
}
