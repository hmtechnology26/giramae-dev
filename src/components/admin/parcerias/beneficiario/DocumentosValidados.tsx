import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FileText, Download } from 'lucide-react';
import EmptyState from '../shared/EmptyState';
import { Skeleton } from '@/components/ui/skeleton';

interface DocumentosValidadosProps {
  programaId: string;
  userId: string;
}

export default function DocumentosValidados({ programaId, userId }: DocumentosValidadosProps) {
  const { data: validacao, isLoading } = useQuery({
    queryKey: ['documentos-beneficiario', userId, programaId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('parcerias_usuarios_validacao')
        .select('documentos')
        .eq('user_id', userId)
        .eq('programa_id', programaId)
        .single();

      if (error) throw error;
      return data;
    }
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Documentos Validados</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
          </div>
        </CardContent>
      </Card>
    );
  }

  const documentos = validacao?.documentos as any[] || [];

  if (documentos.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Documentos Validados</CardTitle>
        </CardHeader>
        <CardContent>
          <EmptyState 
            icon={FileText}
            titulo="Nenhum documento enviado"
            mensagem="O beneficiário ainda não enviou documentos"
          />
        </CardContent>
      </Card>
    );
  }

  const handleDownload = (documento: any) => {
    // TODO: Implementar download via Supabase Storage
    console.log('Download:', documento);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Documentos Validados ({documentos.length})</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {documentos.map((doc, idx) => (
            <div key={idx} className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-3">
                <FileText className="h-5 w-5 text-primary" />
                <div>
                  <p className="font-medium">{doc.nome || `Documento ${idx + 1}`}</p>
                  <p className="text-xs text-muted-foreground">
                    {doc.tipo || 'Tipo não especificado'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant={doc.status === 'aprovado' ? 'default' : 'secondary'}>
                  {doc.status || 'Pendente'}
                </Badge>
                <Button size="sm" variant="outline" onClick={() => handleDownload(doc)}>
                  <Download className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
