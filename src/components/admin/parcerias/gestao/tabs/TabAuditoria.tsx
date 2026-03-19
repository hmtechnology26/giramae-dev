import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollText } from 'lucide-react';

interface TabAuditoriaProps {
  programaId: string;
}

export default function TabAuditoria({ programaId }: TabAuditoriaProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ScrollText className="h-5 w-5" />
          Auditoria e Logs
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-center py-12">
          <ScrollText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-semibold mb-2">Em Desenvolvimento</h3>
          <p className="text-sm text-muted-foreground max-w-md mx-auto">
            O módulo de auditoria está em construção. Em breve você poderá visualizar todos os
            logs de ações administrativas realizadas no programa.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
