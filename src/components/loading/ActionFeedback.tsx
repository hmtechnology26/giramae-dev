import React from 'react';
import { CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ActionFeedbackProps {
  state: 'success' | 'error' | 'warning' | 'loading' | 'idle';
  successMessage?: string;
  errorMessage?: string;
  warningMessage?: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

const ActionFeedback: React.FC<ActionFeedbackProps> = ({
  state,
  successMessage = 'Ação realizada com sucesso!',
  errorMessage = 'Ocorreu um erro.',
  warningMessage = 'Atenção necessária.',
  className,
  size = 'sm'
}) => {
  if (state === 'idle' || state === 'loading') return null;

  const sizeClasses = {
    sm: 'text-xs p-2',
    md: 'text-sm p-3',
    lg: 'text-base p-4'
  };

  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5'
  };

  const getConfig = () => {
    switch (state) {
      case 'success':
        return {
          icon: CheckCircle,
          message: successMessage,
          bgColor: 'bg-green-50',
          textColor: 'text-green-800',
          iconColor: 'text-green-600'
        };
      case 'error':
        return {
          icon: XCircle,
          message: errorMessage,
          bgColor: 'bg-red-50',
          textColor: 'text-red-800',
          iconColor: 'text-red-600'
        };
      case 'warning':
        return {
          icon: AlertCircle,
          message: warningMessage,
          bgColor: 'bg-yellow-50',
          textColor: 'text-yellow-800',
          iconColor: 'text-yellow-600'
        };
      default:
        return null;
    }
  };

  const config = getConfig();
  if (!config) return null;

  const Icon = config.icon;

  return (
    <div className={cn(
      'flex items-center gap-2 rounded-md border',
      config.bgColor,
      config.textColor,
      sizeClasses[size],
      className
    )}>
      <Icon className={cn(iconSizes[size], config.iconColor)} />
      <span className="flex-1">{config.message}</span>
    </div>
  );
};

export default ActionFeedback;
