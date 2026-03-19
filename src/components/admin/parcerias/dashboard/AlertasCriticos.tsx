import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertTriangle, AlertCircle, Info } from 'lucide-react';
import type { AlertaCritico } from '@/types/parcerias';
import EmptyState from '../shared/EmptyState';

interface AlertasCriticosProps {
  alertas: AlertaCritico[];
}

export default function AlertasCriticos({ alertas }: AlertasCriticosProps) {
  const getIcone = (prioridade: string) => {
    switch (prioridade) {
      case 'alta':
        return AlertTriangle;
      case 'media':
        return AlertCircle;
      default:
        return Info;
    }
  };

  const getVariant = (prioridade: string): 'default' | 'destructive' => {
    return prioridade === 'alta' ? 'destructive' : 'default';
  };

  if (alertas.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Alertas Críticos</CardTitle>
        </CardHeader>
        <CardContent>
          <EmptyState 
            titulo="Nenhum alerta no momento"
            mensagem="Tudo está funcionando normalmente!"
          />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Alertas Críticos ({alertas.length})</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {alertas.map((alerta, index) => {
          const Icon = getIcone(alerta.prioridade);
          return (
            <Alert key={index} variant={getVariant(alerta.prioridade)}>
              <Icon className="h-4 w-4" />
              <AlertTitle>{alerta.titulo}</AlertTitle>
              <AlertDescription>{alerta.descricao}</AlertDescription>
            </Alert>
          );
        })}
      </CardContent>
    </Card>
  );
}
