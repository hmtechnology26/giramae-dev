
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Wifi, RefreshCw, Home } from 'lucide-react';
import { Link } from 'react-router-dom';

interface ConnectionErrorProps {
  onRetry?: () => void;
  message?: string;
  showHomeButton?: boolean;
}

const ConnectionError: React.FC<ConnectionErrorProps> = ({
  onRetry,
  message = "Verifique sua conexão com a internet e tente novamente.",
  showHomeButton = true
}) => {
  return (
    <div className="flex items-center justify-center p-8">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-orange-100 flex items-center justify-center">
            <Wifi className="h-6 w-6 text-orange-600" />
          </div>
          <CardTitle className="text-orange-800">Sem conexão</CardTitle>
          <CardDescription>
            {message}
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

export default ConnectionError;
