
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Shield, Clock, User } from 'lucide-react';

const AdminAuditLog = () => {
  const { data: logs, isLoading } = useQuery({
    queryKey: ['admin-audit-logs'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('admin_actions')
        .select(`
          *,
          profiles!admin_actions_user_id_fkey (
            nome,
            email
          )
        `)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      return data;
    },
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Log de Auditoria
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-16 bg-gray-100 rounded animate-pulse" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="w-5 h-5" />
          Log de Auditoria
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-96">
          <div className="space-y-3">
            {logs?.map((log) => (
              <div
                key={log.id}
                className="flex items-start justify-between p-3 border rounded-lg"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant="outline">
                      {log.action}
                    </Badge>
                    <div className="flex items-center gap-1 text-sm text-gray-500">
                      <User className="w-3 h-3" />
                      {log.profiles?.nome || log.profiles?.email || 'Usuário desconhecido'}
                    </div>
                  </div>
                  
                  {log.details && Object.keys(log.details).length > 0 && (
                    <div className="text-sm text-gray-600 mt-1">
                      <code className="bg-gray-100 px-2 py-1 rounded text-xs">
                        {JSON.stringify(log.details, null, 2)}
                      </code>
                    </div>
                  )}
                </div>
                
                <div className="flex items-center gap-1 text-xs text-gray-500">
                  <Clock className="w-3 h-3" />
                  {formatDistanceToNow(new Date(log.created_at), { 
                    addSuffix: true, 
                    locale: ptBR 
                  })}
                </div>
              </div>
            ))}
            
            {(!logs || logs.length === 0) && (
              <div className="text-center py-8 text-gray-500">
                Nenhum log de auditoria encontrado
              </div>
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export default AdminAuditLog;
