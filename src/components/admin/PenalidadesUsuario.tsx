import React from 'react';
import { AlertTriangle, Clock, Shield } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { usePenalidades } from '@/hooks/usePenalidades';
import LoadingSpinner from '@/components/loading/LoadingSpinner';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export const PenalidadesUsuario: React.FC = () => {
  const { penalidades, loading, error, getPenalidadesAtivas, getNivelTexto, getCorNivel } = usePenalidades();

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Penalidades
          </CardTitle>
        </CardHeader>
        <CardContent>
          <LoadingSpinner />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Penalidades
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Erro ao carregar penalidades: {error}
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  const penalidadesAtivas = getPenalidadesAtivas();

  if (penalidadesAtivas.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-green-600" />
            Situação Regular
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-sm">
            Você não possui penalidades ativas no momento.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-amber-600" />
          Penalidades Ativas ({penalidadesAtivas.length})
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {penalidadesAtivas.map((penalidade) => (
          <div
            key={penalidade.id}
            className={`p-4 rounded-lg border ${getCorNivel(penalidade.nivel)}`}
          >
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className={getCorNivel(penalidade.nivel)}>
                  {getNivelTexto(penalidade.nivel)}
                </Badge>
                <span className="text-sm font-medium">
                  {penalidade.tipo === 'item_rejeitado' && 'Item Rejeitado'}
                  {penalidade.tipo === 'denuncia_falsa' && 'Denúncia Falsa'}
                </span>
              </div>
              {penalidade.expira_em && (
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  Expira {formatDistanceToNow(new Date(penalidade.expira_em), { 
                    addSuffix: true, 
                    locale: ptBR 
                  })}
                </div>
              )}
            </div>
            
            {penalidade.motivo && (
              <p className="text-sm text-muted-foreground">
                <strong>Motivo:</strong> {penalidade.motivo}
              </p>
            )}
            
            <p className="text-xs text-muted-foreground mt-2">
              Aplicada {formatDistanceToNow(new Date(penalidade.created_at), { 
                addSuffix: true, 
                locale: ptBR 
              })}
            </p>
          </div>
        ))}

        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription className="text-sm">
            Penalidades são aplicadas quando itens não atendem às diretrizes da plataforma. 
            Reincidências resultam em penalidades mais severas.
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
};