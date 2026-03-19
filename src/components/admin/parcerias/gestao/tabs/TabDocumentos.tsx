import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText } from 'lucide-react';

interface TabDocumentosProps {
  programaId: string;
}

export default function TabDocumentos({ programaId }: TabDocumentosProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Gestão de Documentos
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-center py-12">
          <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-semibold mb-2">Em Desenvolvimento</h3>
          <p className="text-sm text-muted-foreground max-w-md mx-auto">
            O módulo de gestão de documentos está em construção. Em breve você poderá visualizar,
            aprovar e rejeitar documentos de todos os beneficiários de forma centralizada.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
