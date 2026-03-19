
import React, { useState, useEffect } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { AlertCircle, RefreshCw } from 'lucide-react';

interface LoadingWithTimeoutProps {
  isLoading: boolean;
  timeout?: number; // em millisegundos
  onTimeout?: () => void;
  fallbackComponent?: React.ReactNode;
  children: React.ReactNode;
  loadingComponent?: React.ReactNode;
}

const LoadingWithTimeout: React.FC<LoadingWithTimeoutProps> = ({
  isLoading,
  timeout = 15000, // 15 segundos por padrão
  onTimeout,
  fallbackComponent,
  children,
  loadingComponent
}) => {
  const [hasTimedOut, setHasTimedOut] = useState(false);

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;

    if (isLoading) {
      setHasTimedOut(false);
      timeoutId = setTimeout(() => {
        setHasTimedOut(true);
        if (onTimeout) {
          onTimeout();
        }
      }, timeout);
    }

    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [isLoading, timeout, onTimeout]);

  if (!isLoading) {
    return <>{children}</>;
  }

  if (hasTimedOut) {
    if (fallbackComponent) {
      return <>{fallbackComponent}</>;
    }

    return (
      <div className="flex flex-col items-center justify-center p-8 space-y-4">
        <div className="flex items-center space-x-2 text-orange-600">
          <AlertCircle className="h-5 w-5" />
          <span className="text-sm font-medium">
            Carregamento demorado
          </span>
        </div>
        <p className="text-gray-600 text-center max-w-md">
          O carregamento está demorando mais que o esperado. 
          Verifique sua conexão ou tente novamente.
        </p>
        {onTimeout && (
          <Button onClick={onTimeout} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Tentar Novamente
          </Button>
        )}
      </div>
    );
  }

  if (loadingComponent) {
    return <>{loadingComponent}</>;
  }

  // Loading padrão com skeletons
  return (
    <div className="space-y-4">
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-4 w-1/2" />
      <Skeleton className="h-32 w-full" />
      <div className="flex space-x-2">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-4 w-16" />
      </div>
    </div>
  );
};

export default LoadingWithTimeout;
