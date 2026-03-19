
export interface RetryOptions {
  maxRetries?: number;
  delay?: number;
  backoff?: 'fixed' | 'exponential';
  retryCondition?: (error: any) => boolean;
}

export interface TimeoutOptions {
  timeout?: number;
  timeoutMessage?: string;
}

// Função para retry automático
export async function withRetry<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const {
    maxRetries = 3,
    delay = 1000,
    backoff = 'exponential',
    retryCondition = (error) => isNetworkError(error)
  } = options;

  let lastError: any;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      
      // Se não é um erro que deve ser retentado, falha imediatamente
      if (!retryCondition(error)) {
        throw error;
      }

      // Se é a última tentativa, falha
      if (attempt === maxRetries) {
        throw error;
      }

      // Calcular delay para próxima tentativa
      const currentDelay = backoff === 'exponential' 
        ? delay * Math.pow(2, attempt)
        : delay;

      console.log(`Tentativa ${attempt + 1} falhou, tentando novamente em ${currentDelay}ms...`);
      await sleep(currentDelay);
    }
  }

  throw lastError;
}

// Função para adicionar timeout
export async function withTimeout<T>(
  promise: Promise<T>,
  options: TimeoutOptions = {}
): Promise<T> {
  const { timeout = 30000, timeoutMessage = 'Operação excedeu o tempo limite' } = options;

  const timeoutPromise = new Promise<never>((_, reject) => {
    setTimeout(() => {
      reject(new Error(timeoutMessage));
    }, timeout);
  });

  return Promise.race([promise, timeoutPromise]);
}

// Combinar retry e timeout
export async function withRetryAndTimeout<T>(
  fn: () => Promise<T>,
  retryOptions: RetryOptions = {},
  timeoutOptions: TimeoutOptions = {}
): Promise<T> {
  return withRetry(
    () => withTimeout(fn(), timeoutOptions),
    retryOptions
  );
}

// Verificar se é erro de rede
export function isNetworkError(error: any): boolean {
  if (!error) return false;
  
  const message = error.message?.toLowerCase() || '';
  const code = error.code || '';
  
  return (
    message.includes('network') ||
    message.includes('fetch') ||
    message.includes('connection') ||
    message.includes('timeout') ||
    code === 'NETWORK_ERROR' ||
    code === 'ECONNREFUSED' ||
    code === 'ENOTFOUND' ||
    error.name === 'NetworkError'
  );
}

// Verificar se é erro temporário
export function isTemporaryError(error: any): boolean {
  if (!error) return false;
  
  const status = error.status || error.statusCode;
  
  // Erros de servidor temporários
  if (status >= 500 && status < 600) return true;
  
  // Rate limiting
  if (status === 429) return true;
  
  // Timeout
  if (status === 408) return true;
  
  return isNetworkError(error);
}

// Helper para sleep
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Cache simples em memória
export class SimpleCache<T> {
  private cache = new Map<string, { data: T; timestamp: number; ttl: number }>();

  set(key: string, data: T, ttl: number = 5 * 60 * 1000): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    });
  }

  get(key: string): T | null {
    const entry = this.cache.get(key);
    
    if (!entry) return null;
    
    const isExpired = Date.now() - entry.timestamp > entry.ttl;
    
    if (isExpired) {
      this.cache.delete(key);
      return null;
    }
    
    return entry.data;
  }

  clear(): void {
    this.cache.clear();
  }

  delete(key: string): boolean {
    return this.cache.delete(key);
  }
}
