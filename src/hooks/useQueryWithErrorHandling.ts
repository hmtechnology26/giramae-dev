
import { useState, useCallback, useRef, useEffect } from 'react';
import { withRetryAndTimeout, isNetworkError, isTemporaryError, SimpleCache } from '@/utils/errorHandling';

interface QueryOptions<T> {
  cacheKey?: string;
  cacheTTL?: number;
  enableCache?: boolean;
  maxRetries?: number;
  timeout?: number;
  retryDelay?: number;
  onError?: (error: Error) => void;
  onSuccess?: (data: T) => void;
  fallbackData?: T;
}

interface QueryState<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
  retryCount: number;
}

// Cache global compartilhado
const globalCache = new SimpleCache();

export function useQueryWithErrorHandling<T>(
  queryFn: () => Promise<T>,
  options: QueryOptions<T> = {}
) {
  const {
    cacheKey,
    cacheTTL = 5 * 60 * 1000, // 5 minutos
    enableCache = true,
    maxRetries = 3,
    timeout = 30000, // 30 segundos
    retryDelay = 1000,
    onError,
    onSuccess,
    fallbackData
  } = options;

  const [state, setState] = useState<QueryState<T>>({
    data: null,
    loading: false,
    error: null,
    retryCount: 0
  });

  const abortControllerRef = useRef<AbortController | null>(null);
  const isMountedRef = useRef(true);

  // Cleanup na desmontagem
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  const executeQuery = useCallback(async (retryAttempt = 0) => {
    // Verificar cache primeiro
    if (enableCache && cacheKey && retryAttempt === 0) {
      const cachedData = globalCache.get(cacheKey);
      if (cachedData) {
        setState(prev => ({
          ...prev,
          data: cachedData as T,
          loading: false,
          error: null
        }));
        return cachedData as T;
      }
    }

    // Cancelar request anterior
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Criar novo controller
    const controller = new AbortController();
    abortControllerRef.current = controller;

    if (!isMountedRef.current) return;

    setState(prev => ({
      ...prev,
      loading: true,
      error: null,
      retryCount: retryAttempt
    }));

    try {
      const data = await withRetryAndTimeout(
        queryFn,
        {
          maxRetries,
          delay: retryDelay,
          retryCondition: (error) => {
            return isNetworkError(error) || isTemporaryError(error);
          }
        },
        {
          timeout,
          timeoutMessage: `Timeout após ${timeout}ms`
        }
      );

      if (controller.signal.aborted || !isMountedRef.current) {
        return;
      }

      // Salvar no cache
      if (enableCache && cacheKey) {
        globalCache.set(cacheKey, data, cacheTTL);
      }

      setState(prev => ({
        ...prev,
        data,
        loading: false,
        error: null,
        retryCount: 0
      }));

      if (onSuccess) {
        onSuccess(data);
      }

      return data;
    } catch (error) {
      if (controller.signal.aborted || !isMountedRef.current) {
        return;
      }

      console.error('Query error:', error);

      const errorInstance = error instanceof Error ? error : new Error(String(error));

      // Tentar fallback de cache se disponível
      if (enableCache && cacheKey) {
        const cachedData = globalCache.get(cacheKey);
        if (cachedData) {
          console.log('Usando dados do cache como fallback');
          setState(prev => ({
            ...prev,
            data: cachedData as T,
            loading: false,
            error: errorInstance,
            retryCount: retryAttempt
          }));
          return cachedData as T;
        }
      }

      // Usar fallback data se fornecido
      if (fallbackData !== undefined) {
        console.log('Usando fallback data');
        setState(prev => ({
          ...prev,
          data: fallbackData,
          loading: false,
          error: errorInstance,
          retryCount: retryAttempt
        }));
        return fallbackData;
      }

      setState(prev => ({
        ...prev,
        data: null,
        loading: false,
        error: errorInstance,
        retryCount: retryAttempt
      }));

      if (onError) {
        onError(errorInstance);
      }

      throw errorInstance;
    }
  }, [queryFn, enableCache, cacheKey, cacheTTL, maxRetries, timeout, retryDelay, onError, onSuccess, fallbackData]);

  const retry = useCallback(() => {
    return executeQuery(state.retryCount + 1);
  }, [executeQuery, state.retryCount]);

  const refetch = useCallback(() => {
    // Limpar cache antes de refetch
    if (enableCache && cacheKey) {
      globalCache.delete(cacheKey);
    }
    return executeQuery(0);
  }, [executeQuery, enableCache, cacheKey]);

  const clearCache = useCallback(() => {
    if (cacheKey) {
      globalCache.delete(cacheKey);
    }
  }, [cacheKey]);

  return {
    ...state,
    execute: executeQuery,
    retry,
    refetch,
    clearCache,
    canRetry: state.retryCount < maxRetries
  };
}

// Hook específico para Supabase queries
export function useSupabaseQuery<T>(
  queryFn: () => Promise<{ data: T; error: any }>,
  options: QueryOptions<T> = {}
) {
  const wrappedQueryFn = useCallback(async () => {
    const result = await queryFn();
    if (result.error) {
      throw new Error(result.error.message || 'Supabase query error');
    }
    return result.data;
  }, [queryFn]);

  return useQueryWithErrorHandling(wrappedQueryFn, options);
}
