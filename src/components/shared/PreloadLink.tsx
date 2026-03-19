
import React, { useRef } from 'react';
import { Link, LinkProps } from 'react-router-dom';
import { usePreloadRoute } from '@/hooks/usePreloadRoute';

interface PreloadLinkProps extends LinkProps {
  children: React.ReactNode;
  preloadDelay?: number;
}

const PreloadLink: React.FC<PreloadLinkProps> = ({ 
  to, 
  children, 
  preloadDelay = 100,
  ...props 
}) => {
  const { preloadRoute } = usePreloadRoute();
  const preloadTimerRef = useRef<NodeJS.Timeout | null>(null);

  const handleMouseEnter = () => {
    // Delay pequeno para evitar preloads desnecessários em hover rápido
    preloadTimerRef.current = setTimeout(() => {
      const path = typeof to === 'string' ? to : to.pathname;
      if (path) {
        preloadRoute(path);
      }
    }, preloadDelay);
  };

  const handleMouseLeave = () => {
    if (preloadTimerRef.current) {
      clearTimeout(preloadTimerRef.current);
      preloadTimerRef.current = null;
    }
  };

  return (
    <Link
      to={to}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      {...props}
    >
      {children}
    </Link>
  );
};

export default PreloadLink;
