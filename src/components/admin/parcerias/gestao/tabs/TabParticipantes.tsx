import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Search, Eye, Ban, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import ModalSuspender from '../../shared/ModalSuspender';
import EmptyState from '../../shared/EmptyState';
import { Skeleton } from '@/components/ui/skeleton';

interface TabParticipantesProps {
  programaId: string;
}

export default function TabParticipantes({ programaId }: TabParticipantesProps) {
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [busca, setBusca] = useState('');
  const [beneficiarioSelecionado, setBeneficiarioSelecionado] = useState<any>(null);
  const [modalSuspender, setModalSuspender] = useState(false);

  // Query: Buscar Participantes Aprovados
  const { data: participantes = [], isLoading } = useQuery({
    queryKey: ['parcerias-participantes', programaId, busca],
    queryFn: async () => {
      let query = supabase
        .from('parcerias_usuarios_validacao')
        .select(`
          id,
          user_id,
          data_validacao,
          ativo,
          profiles!parcerias_usuarios_validacao_user_id_fkey (
            nome,
            email
          )
        `)
        .eq('programa_id', programaId)
        .eq('status', 'aprovado');

      if (busca) {
        query = query.or(`profiles.nome.ilike.%${busca}%,profiles.email.ilike.%${busca}%`);
      }

      const { data, error } = await query.order('data_validacao', { ascending: false });

      if (error) throw error;
      return data || [];
    }
  });

  // Mutation: Suspender Beneficiário
  const suspenderMutation = useMutation({
    mutationFn: async ({ validacaoId, motivo }: { validacaoId: string; motivo: string }) => {
      const { error } = await supabase
        .from('parcerias_usuarios_validacao')
        .update({ ativo: false, motivo_rejeicao: motivo })
        .eq('id', validacaoId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['parcerias-participantes', programaId] });
      toast({
        title: 'Beneficiário suspenso',
        description: 'O beneficiário foi suspenso do programa.'
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Erro ao suspender',
        description: error.message,
        variant: 'destructive'
      });
    }
  });

  const handleSuspender = (participante: any) => {
    setBeneficiarioSelecionado({
      nome: participante.profiles?.nome,
      email: participante.profiles?.email,
      validacaoId: participante.id
    });
    setModalSuspender(true);
  };

  const confirmarSuspensao = async (motivo: string) => {
    if (beneficiarioSelecionado) {
      await suspenderMutation.mutateAsync({
        validacaoId: beneficiarioSelecionado.validacaoId,
        motivo
      });
    }
  };

  const handleVerPerfil = (userId: string) => {
    navigate(`/admin/parcerias/${programaId}/beneficiario/${userId}`);
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header e Busca */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por nome ou email..."
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>
      </div>

      {/* Tabela */}
      {participantes.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <EmptyState 
              titulo={busca ? 'Nenhum participante encontrado' : 'Nenhum participante aprovado'}
              mensagem={busca ? 'Tente ajustar sua busca' : 'Aguardando aprovação de novos beneficiários'}
            />
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead className="hidden sm:table-cell">Email</TableHead>
                    <TableHead className="hidden md:table-cell">Data Aprovação</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {participantes.map((participante) => (
                    <TableRow key={participante.id}>
                      <TableCell className="font-medium">
                        {participante.profiles?.nome}
                      </TableCell>
                      <TableCell className="hidden sm:table-cell">
                        {participante.profiles?.email}
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        {participante.data_validacao 
                          ? new Date(participante.data_validacao).toLocaleDateString('pt-BR')
                          : '-'}
                      </TableCell>
                      <TableCell>
                        <Badge variant={participante.ativo ? 'default' : 'destructive'}>
                          {participante.ativo ? 'Ativo' : 'Suspenso'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleVerPerfil(participante.user_id)}
                          >
                            <Eye className="h-4 w-4 sm:mr-2" />
                            <span className="hidden sm:inline">Ver</span>
                          </Button>
                          {participante.ativo && (
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleSuspender(participante)}
                            >
                              <Ban className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Modal Suspender */}
      <ModalSuspender
        open={modalSuspender}
        onClose={() => setModalSuspender(false)}
        beneficiario={beneficiarioSelecionado}
        onConfirm={confirmarSuspensao}
      />
    </div>
  );
}
