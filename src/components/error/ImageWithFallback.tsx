
import React, { useState } from 'react';
import { cn } from '@/lib/utils';

interface ImageWithFallbackProps {
  src: string;
  alt: string;
  className?: string;
  fallback?: React.ReactNode;
  onError?: () => void;
  onLoad?: () => void;
}

const ImageWithFallback: React.FC<ImageWithFallbackProps> = ({
  src,
  alt,
  className,
  fallback,
  onError,
  onLoad
}) => {
  const [hasError, setHasError] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  const handleError = () => {
    setHasError(true);
    onError?.();
  };

  const handleLoad = () => {
    setIsLoaded(true);
    onLoad?.();
  };

  if (hasError) {
    return (
      <div className={cn(
        'flex items-center justify-center bg-gray-100 text-gray-400',
        className
      )}>
        {fallback || (
          <div className="text-center">
            <span className="text-4xl mb-2 block">📷</span>
            <span className="text-sm">Imagem não encontrada</span>
          </div>
        )}
      </div>
    );
  }

  return (
    <>
      {!isLoaded && (
        <div className={cn(
          'absolute inset-0 bg-gray-200 animate-pulse flex items-center justify-center',
          className
        )}>
          <span className="text-gray-400">📷</span>
        </div>
      )}
      <img
        src={src}
        alt={alt}
        className={cn(
          'transition-opacity duration-300',
          isLoaded ? 'opacity-100' : 'opacity-0',
          className
        )}
        onError={handleError}
        onLoad={handleLoad}
      />
    </>
  );
};

export default ImageWithFallback;
