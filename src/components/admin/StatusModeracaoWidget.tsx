import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, CheckCircle, Clock, XCircle } from 'lucide-react';

interface StatusModeracaoWidgetProps {
  totalPendentes: number;
  totalAprovados: number;
  totalRejeitados: number;
  className?: string;
}

const StatusModeracaoWidget: React.FC<StatusModeracaoWidgetProps> = ({
  totalPendentes,
  totalAprovados,
  totalRejeitados,
  className
}) => {
  const total = totalPendentes + totalAprovados + totalRejeitados;
  
  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium">Status da Moderação</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-3 gap-3">
          <div className="text-center">
            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-yellow-100 dark:bg-yellow-900 mx-auto mb-1">
              <Clock className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />
            </div>
            <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
              {totalPendentes}
            </div>
            <div className="text-xs text-muted-foreground">Pendentes</div>
          </div>
          
          <div className="text-center">
            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-green-100 dark:bg-green-900 mx-auto mb-1">
              <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400" />
            </div>
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
              {totalAprovados}
            </div>
            <div className="text-xs text-muted-foreground">Aprovados</div>
          </div>
          
          <div className="text-center">
            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-red-100 dark:bg-red-900 mx-auto mb-1">
              <XCircle className="w-4 h-4 text-red-600 dark:text-red-400" />
            </div>
            <div className="text-2xl font-bold text-red-600 dark:text-red-400">
              {totalRejeitados}
            </div>
            <div className="text-xs text-muted-foreground">Rejeitados</div>
          </div>
        </div>
        
        {totalPendentes > 0 && (
          <div className="flex items-center gap-2 p-2 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
            <AlertTriangle className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />
            <span className="text-sm text-yellow-700 dark:text-yellow-300">
              {totalPendentes} {totalPendentes === 1 ? 'item aguarda' : 'itens aguardam'} moderação
            </span>
          </div>
        )}
        
        <div className="text-xs text-muted-foreground text-center">
          Total de {total} {total === 1 ? 'item' : 'itens'} no sistema
        </div>
      </CardContent>
    </Card>
  );
};

export default StatusModeracaoWidget;