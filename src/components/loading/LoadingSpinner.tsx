
import React from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  text?: string;
  className?: string;
  fullScreen?: boolean;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  text,
  className,
  fullScreen = false
}) => {
  const sizeMap = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
    xl: 'w-12 h-12'
  };

  const textSizeMap = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
    xl: 'text-xl'
  };

  const containerClass = fullScreen 
    ? 'fixed inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-50'
    : 'flex items-center justify-center p-4';

  return (
    <div className={cn(containerClass, className)}>
      <div className="flex flex-col items-center gap-3">
        <Loader2 className={cn('animate-spin text-primary', sizeMap[size])} />
        {text && (
          <p className={cn('text-gray-600 font-medium', textSizeMap[size])}>
            {text}
          </p>
        )}
      </div>
    </div>
  );
};

export default LoadingSpinner;
