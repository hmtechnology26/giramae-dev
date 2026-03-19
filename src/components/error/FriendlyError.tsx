
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import { Link } from 'react-router-dom';

interface FriendlyErrorProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  showHomeButton?: boolean;
  type?: 'connection' | 'not-found' | 'permission' | 'generic';
}

const FriendlyError: React.FC<FriendlyErrorProps> = ({
  title,
  message,
  onRetry,
  showHomeButton = true,
  type = 'generic'
}) => {
  const getErrorConfig = () => {
    switch (type) {
      case 'connection':
        return {
          icon: '🌐',
          defaultTitle: 'Problema de conexão',
          defaultMessage: 'Verifique sua internet e tente novamente.',
          color: 'text-orange-600'
        };
      case 'not-found':
        return {
          icon: '🔍',
          defaultTitle: 'Conteúdo não encontrado',
          defaultMessage: 'O que você está procurando não existe ou foi removido.',
          color: 'text-blue-600'
        };
      case 'permission':
        return {
          icon: '🔒',
          defaultTitle: 'Acesso negado',
          defaultMessage: 'Você não tem permissão para acessar este conteúdo.',
          color: 'text-red-600'
        };
      default:
        return {
          icon: '⚠️',
          defaultTitle: 'Ops! Algo deu errado',
          defaultMessage: 'Encontramos um problema inesperado. Tente novamente.',
          color: 'text-gray-600'
        };
    }
  };

  const config = getErrorConfig();

  return (
    <div className="flex items-center justify-center p-8">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 text-4xl">
            {config.icon}
          </div>
          <CardTitle className={config.color}>
            {title || config.defaultTitle}
          </CardTitle>
          <CardDescription>
            {message || config.defaultMessage}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex flex-col gap-2">
            {onRetry && (
              <Button onClick={onRetry} className="w-full">
                <RefreshCw className="h-4 w-4 mr-2" />
                Tentar Novamente
              </Button>
            )}
            {showHomeButton && (
              <Button variant="outline" asChild className="w-full">
                <Link to="/">
                  <Home className="h-4 w-4 mr-2" />
                  Ir para Início
                </Link>
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default FriendlyError;
