import React, { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { buildImageUrl, isFullUrl } from '@/lib/cdn';

export type ImageSize = 'thumbnail' | 'medium' | 'full';

interface LazyImageProps {
  src: string;
  alt: string;
  bucket?: string;
  size?: ImageSize;
  className?: string;
  skeletonClassName?: string;
  onLoad?: () => void;
  onError?: () => void;
  transform?: {
    width?: number;
    height?: number;
    quality?: number;
    format?: 'webp' | 'jpeg';
  };
}

const LazyImage: React.FC<LazyImageProps> = ({
  src,
  alt,
  bucket = 'itens',
  size = 'medium',
  className,
  skeletonClassName,
  onLoad,
  onError,
  transform
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const [hasError, setHasError] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    const currentContainer = containerRef.current;
    
    if (!currentContainer) return;

    observerRef.current = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observerRef.current?.disconnect();
        }
      },
      {
        rootMargin: '50px'
      }
    );

    observerRef.current.observe(currentContainer);

    return () => {
      observerRef.current?.disconnect();
    };
  }, []);

  // Processar URL da imagem usando CDN helper
  const getProcessedImageUrl = () => {
    if (!src) return '';
    
    // Se já for URL completa (http, blob, data), usar direto
    if (isFullUrl(src)) {
      return src;
    }
    
    // Construir URL usando CDN + path
    return buildImageUrl(src, bucket);
  };

  const imageUrl = getProcessedImageUrl();

  const handleLoad = () => {
    setIsLoaded(true);
    onLoad?.();
  };

  const handleError = () => {
    console.error('Erro ao carregar imagem:', imageUrl);
    setHasError(true);
    onError?.();
  };

  // Se deu erro, mostrar fallback
  if (hasError) {
    return (
      <div 
        ref={containerRef}
        className={cn(
          'flex items-center justify-center bg-gray-100 text-gray-400',
          className
        )}
      >
        <div className="text-center">
          <span className="text-4xl mb-2 block">⚠️</span>
          <span className="text-sm">Erro na imagem</span>
        </div>
      </div>
    );
  }

  return (
    <div ref={containerRef} className={cn('relative overflow-hidden', className)}>
      
      {/* Spinner de Carregamento (Logotipo Girando) */}
      {!isLoaded && (
        <div 
          className={cn(
            'absolute inset-0 bg-gray-50 flex items-center justify-center',
            skeletonClassName
          )}
        >
          <img 
            src="/giramae_logo.png"
            alt="Carregando..."
            className="animate-spin w-12 h-12 object-contain opacity-60"
          />
        </div>
      )}

      {/* Imagem real - só renderiza se estiver em view */}
      {isInView && (
        <img
          ref={imgRef}
          src={imageUrl}
          alt={alt}
          className={cn(
            'transition-opacity duration-500 w-full h-full object-cover absolute inset-0',
            isLoaded ? 'opacity-100' : 'opacity-0'
          )}
          onLoad={handleLoad}
          onError={handleError}
        />
      )}
    </div>
  );
};

export default LazyImage;
