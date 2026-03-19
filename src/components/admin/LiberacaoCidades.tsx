import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { CheckCircle, Clock, Users, Building2, RefreshCcw } from 'lucide-react';

interface CidadeConfig {
  id: string;
  cidade: string;
  estado: string;
  liberada: boolean;
  usuarios_aguardando: number;
  usuarios_liberados: number;
  itens_publicados: number;
  liberada_em?: string;
  notas_admin?: string;
}

const LiberacaoCidades = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [notasAdmin, setNotasAdmin] = useState('');
  const [cidadeSelecionada, setCidadeSelecionada] = useState<CidadeConfig | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  // Buscar dados das cidades
  const { data: cidades, isLoading } = useQuery({
    queryKey: ['cidades-config'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('cidades_config')
        .select('*')
        .order('usuarios_aguardando', { ascending: false });

      if (error) throw error;
      return data as CidadeConfig[];
    },
  });

  // Mutação para liberar cidade
  const liberarCidadeMutation = useMutation({
    mutationFn: async ({ cidade, estado, notas }: { cidade: string; estado: string; notas: string }) => {
      const { data, error } = await supabase.rpc('liberar_cidade_manual', {
        p_cidade: cidade,
        p_estado: estado,
        p_admin_id: user?.id,
        p_notas: notas || null
      });

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
        toast({
          title: "Cidade liberada com sucesso!",
          description: `${(data as any).usuarios_liberados} usuários foram liberados em ${(data as any).cidade}/${(data as any).estado}`,
        });
      queryClient.invalidateQueries({ queryKey: ['cidades-config'] });
      setDialogOpen(false);
      setNotasAdmin('');
      setCidadeSelecionada(null);
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao liberar cidade",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Mutação para atualizar contadores
  const atualizarContadoresMutation = useMutation({
    mutationFn: async () => {
      // Executar atualização para todas as cidades
      const promises = cidades?.map(cidade => 
        supabase.rpc('atualizar_contadores_cidade', {
          p_cidade: cidade.cidade,
          p_estado: cidade.estado
        })
      ) || [];

      await Promise.all(promises);
    },
    onSuccess: () => {
      toast({
        title: "Contadores atualizados",
        description: "Todos os contadores foram recalculados com sucesso",
      });
      queryClient.invalidateQueries({ queryKey: ['cidades-config'] });
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao atualizar contadores",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleLiberarCidade = () => {
    if (!cidadeSelecionada) return;
    
    liberarCidadeMutation.mutate({
      cidade: cidadeSelecionada.cidade,
      estado: cidadeSelecionada.estado,
      notas: notasAdmin
    });
  };

  // Calcular estatísticas gerais
  const stats = React.useMemo(() => {
    if (!cidades) return { total: 0, liberadas: 0, bloqueadas: 0, usuariosAguardando: 0 };
    
    return {
      total: cidades.length,
      liberadas: cidades.filter(c => c.liberada).length,
      bloqueadas: cidades.filter(c => !c.liberada).length,
      usuariosAguardando: cidades.reduce((sum, c) => sum + c.usuarios_aguardando, 0)
    };
  }, [cidades]);

  if (isLoading) {
    return <div className="flex justify-center p-8">Carregando...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Cards de estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Cidades</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cidades Liberadas</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.liberadas}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cidades Bloqueadas</CardTitle>
            <Clock className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{stats.bloqueadas}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Usuários Aguardando</CardTitle>
            <Users className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.usuariosAguardando}</div>
          </CardContent>
        </Card>
      </div>

      {/* Ações */}
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Gestão de Cidades</h2>
        <Button
          onClick={() => atualizarContadoresMutation.mutate()}
          disabled={atualizarContadoresMutation.isPending}
          variant="outline"
        >
          <RefreshCcw className="w-4 h-4 mr-2" />
          {atualizarContadoresMutation.isPending ? 'Atualizando...' : 'Atualizar Contadores'}
        </Button>
      </div>

      {/* Tabela de cidades */}
      <Card>
        <CardHeader>
          <CardTitle>Controle por Cidade</CardTitle>
          <CardDescription>
            Libere cidades quando houver massa crítica suficiente de usuários
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Cidade/Estado</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-center">Aguardando</TableHead>
                <TableHead className="text-center">Liberados</TableHead>
                <TableHead className="text-center">Itens</TableHead>
                <TableHead className="text-center">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {cidades?.map((cidade) => (
                <TableRow key={cidade.id}>
                  <TableCell className="font-medium">
                    {cidade.cidade}/{cidade.estado}
                  </TableCell>
                  <TableCell>
                    <Badge variant={cidade.liberada ? "default" : "secondary"}>
                      {cidade.liberada ? 'Liberada' : 'Bloqueada'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-center">
                    <span className={cidade.usuarios_aguardando > 0 ? 'font-semibold text-orange-600' : ''}>
                      {cidade.usuarios_aguardando}
                    </span>
                  </TableCell>
                  <TableCell className="text-center">
                    {cidade.usuarios_liberados}
                  </TableCell>
                  <TableCell className="text-center">
                    {cidade.itens_publicados}
                  </TableCell>
                  <TableCell className="text-center">
                    {!cidade.liberada && cidade.usuarios_aguardando > 0 && (
                      <Dialog open={dialogOpen && cidadeSelecionada?.id === cidade.id} onOpenChange={setDialogOpen}>
                        <DialogTrigger asChild>
                          <Button 
                            size="sm"
                            onClick={() => setCidadeSelecionada(cidade)}
                          >
                            Liberar
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>
                              Liberar {cidade.cidade}/{cidade.estado}
                            </DialogTitle>
                            <DialogDescription>
                              Esta ação liberará {cidade.usuarios_aguardando} usuários para acessar a plataforma.
                              Esta ação não pode ser desfeita.
                            </DialogDescription>
                          </DialogHeader>
                          
                          <div className="space-y-4">
                            <div>
                              <label className="text-sm font-medium">Notas administrativas (opcional)</label>
                              <Textarea
                                value={notasAdmin}
                                onChange={(e) => setNotasAdmin(e.target.value)}
                                placeholder="Ex: Região atingiu 10+ usuários ativos..."
                                className="mt-1"
                              />
                            </div>
                          </div>

                          <DialogFooter>
                            <Button 
                              variant="outline" 
                              onClick={() => {
                                setDialogOpen(false);
                                setNotasAdmin('');
                                setCidadeSelecionada(null);
                              }}
                            >
                              Cancelar
                            </Button>
                            <Button 
                              onClick={handleLiberarCidade}
                              disabled={liberarCidadeMutation.isPending}
                            >
                              {liberarCidadeMutation.isPending ? 'Liberando...' : 'Confirmar Liberação'}
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    )}
                    {cidade.liberada && (
                      <span className="text-sm text-muted-foreground">
                        Liberada em {new Date(cidade.liberada_em!).toLocaleDateString()}
                      </span>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default LiberacaoCidades;