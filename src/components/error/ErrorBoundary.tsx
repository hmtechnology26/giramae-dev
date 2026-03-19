
import React, { Component, ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import { Link } from 'react-router-dom';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallbackType?: 'page' | 'component' | 'feed';
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
  retryCount: number;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  private maxRetries = 3;

  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: 0
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return {
      hasError: true,
      error
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary capturou um erro:', error, errorInfo);
    
    this.setState({
      error,
      errorInfo
    });

    // Chamar callback personalizado se fornecido
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // Log do erro para monitoramento (pode ser integrado com Sentry, etc.)
    this.logError(error, errorInfo);
  }

  private logError(error: Error, errorInfo: React.ErrorInfo) {
    // Aqui você pode integrar com serviços de monitoramento
    console.error('Error logged:', {
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      timestamp: new Date().toISOString(),
      url: window.location.href,
      userAgent: navigator.userAgent
    });
  }

  private handleRetry = () => {
    if (this.state.retryCount < this.maxRetries) {
      this.setState(prevState => ({
        hasError: false,
        error: null,
        errorInfo: null,
        retryCount: prevState.retryCount + 1
      }));
    } else {
      // Após 3 tentativas, recarregar a página
      window.location.reload();
    }
  };

  private handleGoHome = () => {
    window.location.href = '/';
  };

  private renderFallbackUI() {
    const { fallbackType = 'component' } = this.props;
    const { error, retryCount } = this.state;

    const canRetry = retryCount < this.maxRetries;
    const errorMessage = error?.message || 'Erro desconhecido';

    switch (fallbackType) {
      case 'page':
        return (
          <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 flex items-center justify-center p-4">
            <Card className="w-full max-w-md">
              <CardHeader className="text-center">
                <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-red-100 flex items-center justify-center">
                  <AlertTriangle className="h-6 w-6 text-red-600" />
                </div>
                <CardTitle className="text-red-800">Ops! Algo deu errado</CardTitle>
                <CardDescription>
                  Encontramos um problema inesperado. Nossa equipe foi notificada.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded">
                  <strong>Erro:</strong> {errorMessage}
                </div>
                <div className="flex flex-col gap-2">
                  {canRetry ? (
                    <Button onClick={this.handleRetry} className="w-full">
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Tentar Novamente ({this.maxRetries - retryCount} tentativas restantes)
                    </Button>
                  ) : (
                    <Button onClick={() => window.location.reload()} className="w-full">
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Recarregar Página
                    </Button>
                  )}
                  <Button variant="outline" onClick={this.handleGoHome} className="w-full">
                    <Home className="h-4 w-4 mr-2" />
                    Ir para Início
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        );

      case 'feed':
        return (
          <div className="p-6 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
            <div className="text-center">
              <AlertTriangle className="h-8 w-8 text-orange-500 mx-auto mb-3" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Erro ao carregar itens
              </h3>
              <p className="text-gray-600 mb-4">
                Não foi possível carregar os itens. Verifique sua conexão.
              </p>
              <div className="flex flex-col gap-2 max-w-xs mx-auto">
                <Button onClick={this.handleRetry} size="sm" disabled={!canRetry}>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  {canRetry ? 'Tentar Novamente' : 'Limite de tentativas atingido'}
                </Button>
                <Button variant="outline" size="sm" asChild>
                  <Link to="/">Voltar ao Início</Link>
                </Button>
              </div>
            </div>
          </div>
        );

      default: // component
        return (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-start">
              <AlertTriangle className="h-5 w-5 text-red-500 mr-3 mt-0.5" />
              <div className="flex-1">
                <h4 className="text-sm font-medium text-red-800">
                  Erro no componente
                </h4>
                <p className="text-sm text-red-700 mt-1">
                  {errorMessage}
                </p>
                <Button 
                  onClick={this.handleRetry} 
                  size="sm" 
                  variant="outline" 
                  className="mt-2"
                  disabled={!canRetry}
                >
                  <RefreshCw className="h-3 w-3 mr-1" />
                  {canRetry ? 'Tentar Novamente' : 'Limite atingido'}
                </Button>
              </div>
            </div>
          </div>
        );
    }
  }

  render() {
    if (this.state.hasError) {
      return this.renderFallbackUI();
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
