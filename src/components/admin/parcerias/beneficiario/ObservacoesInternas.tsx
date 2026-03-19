import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { MessageSquare, Send } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import EmptyState from '../shared/EmptyState';
import { Skeleton } from '@/components/ui/skeleton';

interface ObservacoesInternasProps {
  programaId: string;
  userId: string;
}

export default function ObservacoesInternas({ programaId, userId }: ObservacoesInternasProps) {
  const [novaObservacao, setNovaObservacao] = useState('');
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Query: Buscar observações (usando campo dados_usuario da validação)
  const { data: validacao, isLoading } = useQuery({
    queryKey: ['observacoes-beneficiario', userId, programaId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('parcerias_usuarios_validacao')
        .select('dados_usuario')
        .eq('user_id', userId)
        .eq('programa_id', programaId)
        .single();

      if (error) throw error;
      return data;
    }
  });

  // Mutation: Adicionar observação
  const addObservacaoMutation = useMutation({
    mutationFn: async (texto: string) => {
      const dadosUsuario = (validacao?.dados_usuario as any) || {};
      const observacoes = dadosUsuario.observacoes || [];
      const novaObs = {
        texto,
        autor: 'admin', // TODO: Pegar user.email do admin logado
        data: new Date().toISOString()
      };

      const { error } = await supabase
        .from('parcerias_usuarios_validacao')
        .update({
          dados_usuario: {
            ...dadosUsuario,
            observacoes: [...observacoes, novaObs]
          }
        })
        .eq('user_id', userId)
        .eq('programa_id', programaId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['observacoes-beneficiario', userId, programaId] });
      setNovaObservacao('');
      toast({
        title: 'Observação adicionada',
        description: 'A observação foi salva com sucesso.'
      });
    },
    onError: () => {
      toast({
        title: 'Erro',
        description: 'Não foi possível adicionar a observação.',
        variant: 'destructive'
      });
    }
  });

  const handleAdd = () => {
    if (!novaObservacao.trim()) return;
    addObservacaoMutation.mutate(novaObservacao);
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Observações Internas</CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-32 w-full" />
        </CardContent>
      </Card>
    );
  }

  const observacoes = (validacao?.dados_usuario as any)?.observacoes || [];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Observações Internas ({observacoes.length})</CardTitle>
      </CardHeader>
      <CardContent>
        {/* Formulário */}
        <div className="space-y-3 mb-6">
          <Textarea
            placeholder="Adicione uma observação interna (visível apenas para admins)..."
            value={novaObservacao}
            onChange={(e) => setNovaObservacao(e.target.value)}
            rows={3}
          />
          <Button 
            onClick={handleAdd} 
            disabled={!novaObservacao.trim() || addObservacaoMutation.isPending}
            className="w-full sm:w-auto"
          >
            <Send className="h-4 w-4 mr-2" />
            {addObservacaoMutation.isPending ? 'Adicionando...' : 'Adicionar Observação'}
          </Button>
        </div>

        {/* Lista de Observações */}
        {observacoes.length === 0 ? (
          <EmptyState 
            icon={MessageSquare}
            titulo="Nenhuma observação"
            mensagem="Adicione a primeira observação sobre este beneficiário"
          />
        ) : (
          <div className="space-y-3">
            {observacoes.map((obs: any, idx: number) => (
              <div key={idx} className="p-4 border rounded-lg">
                <div className="flex items-start justify-between mb-2">
                  <p className="font-medium text-sm">{obs.autor}</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(obs.data).toLocaleString('pt-BR')}
                  </p>
                </div>
                <p className="text-sm">{obs.texto}</p>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
