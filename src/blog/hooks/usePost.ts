import { useState, useEffect } from 'react';
import { Post } from '@/blog/types';
import { getBlogRepository } from '@/blog/lib/data';

interface UsePostReturn {
  post: Post | null;
  loading: boolean;
  error: Error | null;
}

export function usePost(slug: string): UsePostReturn {
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const repository = getBlogRepository();
        const result = await repository.getPostBySlug(slug);
        
        if (result) {
          // Increment view count
          await repository.incrementViewCount(result.id);
        }
        
        setPost(result);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to fetch post'));
      } finally {
        setLoading(false);
      }
    };

    if (slug) {
      fetchPost();
    }
  }, [slug]);

  return { post, loading, error };
}
