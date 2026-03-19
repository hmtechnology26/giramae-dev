import { useState, useEffect, useRef } from 'react';
import { Post, PostFilters, PaginationOptions } from '@/blog/types';
import { getBlogRepository } from '@/blog/lib/data';

interface UsePostsReturn {
  posts: Post[];
  loading: boolean;
  error: Error | null;
  hasMore: boolean;
  loadMore: () => void;
  refetch: () => void;
}

export function usePosts(
  filters?: PostFilters,
  initialPageSize: number = 20
): UsePostsReturn {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [page, setPage] = useState(1);
  const [loadingMore, setLoadingMore] = useState(false);
  
  // Guarda os filtros anteriores para detectar mudanças
  const prevFiltersRef = useRef<string>('');

  const fetchPosts = async (currentPage: number, isLoadMore: boolean) => {
    try {
      if (isLoadMore) {
        setLoadingMore(true);
      } else {
        setLoading(true);
      }
      setError(null);
      
      const repository = getBlogRepository();
      const result = await repository.getPosts(filters, {
        page: currentPage,
        pageSize: initialPageSize
      });
      
      if (isLoadMore) {
        // Acumula posts (load more)
        setPosts(prev => [...prev, ...result]);
      } else {
        // Substitui posts (novos filtros)
        setPosts(result);
      }
      
      setHasMore(result.length === initialPageSize);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch posts'));
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const loadMore = () => {
    if (!loadingMore && !loading && hasMore) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchPosts(nextPage, true);
    }
  };

  useEffect(() => {
    // Serializa filtros atuais
    const currentFilters = JSON.stringify({
      status: filters?.status,
      categoryId: filters?.categoryId,
      authorId: filters?.authorId,
      search: filters?.search,
      tags: filters?.tags,
    });
    
    // Verifica se os filtros mudaram
    const filtersChanged = currentFilters !== prevFiltersRef.current;
    
    if (filtersChanged) {
      // Filtros mudaram - resetar paginação
      prevFiltersRef.current = currentFilters;
      setPage(1);
      fetchPosts(1, false);
    }
  }, [
    filters?.status,
    filters?.categoryId,
    filters?.authorId,
    filters?.search,
    JSON.stringify(filters?.tags),
  ]);

  return {
    posts,
    loading: loading && !loadingMore,
    error,
    hasMore,
    loadMore,
    refetch: () => {
      setPage(1);
      fetchPosts(1, false);
    },
  };
}
