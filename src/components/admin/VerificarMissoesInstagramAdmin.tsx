import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Instagram, CheckCircle, ExternalLink } from 'lucide-react';
import { useMissaoInstagram } from '@/hooks/useMissaoInstagram';

export const VerificarMissoesInstagramAdmin: React.FC = () => {
  const { verificarManualmente } = useMissaoInstagram();

  const { data: verificacoesPendentes, isLoading } = useQuery({
    queryKey: ['admin-instagram-verifications'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('user_instagram_verifications')
        .select(`
          *,
          profiles(nome, email)
        `)
        .eq('verification_status', 'pending')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
    refetchInterval: 30000
  });

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-20 bg-muted rounded-lg animate-pulse" />
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
          <Instagram className="w-6 h-6" />
          Verificações Instagram Pendentes
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {!verificacoesPendentes || verificacoesPendentes.length === 0 ? (
          <div className="text-center py-8">
            <Instagram className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">Nenhuma verificação pendente</p>
          </div>
        ) : (
          verificacoesPendentes.map((verif: any) => (
            <Card key={verif.id} className="border-purple-200">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold">{verif.profiles.nome}</p>
                    <p className="text-sm text-muted-foreground">{verif.profiles.email}</p>
                    <Badge variant="secondary" className="mt-2">
                      @{verif.instagram_username}
                    </Badge>
                    <p className="text-xs text-muted-foreground mt-1">
                      Conectado em: {new Date(verif.connected_at).toLocaleString('pt-BR')}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        window.open(
                          `https://instagram.com/${verif.instagram_username}`,
                          '_blank'
                        );
                      }}
                    >
                      <ExternalLink className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => verificarManualmente.mutate(verif.id)}
                      disabled={verificarManualmente.isPending}
                    >
                      <CheckCircle className="w-4 h-4 mr-1" />
                      Aprovar
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </CardContent>
    </Card>
  );
};
