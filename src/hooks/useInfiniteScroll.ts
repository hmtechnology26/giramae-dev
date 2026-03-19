
import { useEffect, useRef, useCallback } from 'react';

interface UseInfiniteScrollOptions {
  loading: boolean;
  hasNextPage: boolean;
  onLoadMore: () => void;
  disabled?: boolean;
  rootMargin?: string;
  threshold?: number;
}

export const useInfiniteScroll = ({
  loading,
  hasNextPage,
  onLoadMore,
  disabled = false,
  rootMargin = '100px',
  threshold = 0.1,
}: UseInfiniteScrollOptions) => {
  const elementRef = useRef<HTMLDivElement>(null);

  const handleIntersection = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      const [entry] = entries;
      
      if (
        entry.isIntersecting &&
        hasNextPage &&
        !loading &&
        !disabled
      ) {
        console.log('🔄 Scroll infinito: carregando próxima página');
        onLoadMore();
      }
    },
    [hasNextPage, loading, disabled, onLoadMore]
  );

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(handleIntersection, {
      root: null,
      rootMargin,
      threshold,
    });

    observer.observe(element);

    return () => observer.unobserve(element);
  }, [handleIntersection, rootMargin, threshold]);

  return {
    ref: elementRef,
  };
};
