
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Trophy, Plus, Edit, BarChart3, Users, Gift, Target, Zap, Settings } from 'lucide-react';
import { useMissoesAdmin, MissaoAdmin } from '@/hooks/useMissoesAdmin';
import FormMissao from './FormMissao';
import MissoesSegmentadasAdmin from './MissoesSegmentadasAdmin';
import AnalyticsSegmentacao from './AnalyticsSegmentacao';

const MissoesAdmin: React.FC = () => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [missaoEditando, setMissaoEditando] = useState<MissaoAdmin | undefined>();
  const { 
    missoes, 
    isLoading, 
    criarMissao, 
    atualizarMissao, 
    toggleMissao,
    estatisticas 
  } = useMissoesAdmin();

  const handleSubmit = async (data: any) => {
    try {
      if (missaoEditando?.id) {
        await atualizarMissao.mutateAsync({ id: missaoEditando.id, ...data });
      } else {
        await criarMissao.mutateAsync(data);
      }
      setDialogOpen(false);
      setMissaoEditando(undefined);
    } catch (error) {
      console.error('Erro ao salvar missão:', error);
    }
  };

  const getTipoLabel = (tipo: string) => {
    switch (tipo) {
      case 'basic': return 'Básica';
      case 'engagement': return 'Engajamento';
      case 'social': return 'Social';
      default: return tipo;
    }
  };

  const getTipoIcon = (tipo: string) => {
    switch (tipo) {
      case 'basic': return Trophy;
      case 'engagement': return Zap;
      case 'social': return Users;
      default: return Target;
    }
  };

  // Filtrar missões simples (sem segmentação avançada)
  const missoesSimples = missoes.filter(missao => 
    !missao.criterios_segmentacao || Object.keys(missao.criterios_segmentacao || {}).length === 0
  );

  // Filtrar missões segmentadas
  const missoesSegmentadas = missoes.filter(missao => 
    missao.criterios_segmentacao && Object.keys(missao.criterios_segmentacao).length > 0
  );

  const getSegmentacaoInfo = (criterios: any) => {
    if (!criterios || Object.keys(criterios).length === 0) {
      return { count: 0, description: 'Missão simples' };
    }
    
    const count = Object.keys(criterios).length;
    const tipos = [];
    
    if (criterios.estados || criterios.cidades || criterios.bairros) tipos.push('Geografia');
    if (criterios.idades_filhos || criterios.sexo_filhos) tipos.push('Demografia');
    if (criterios.faixas_saldo || criterios.ja_comprou_girinhas) tipos.push('Comportamento');
    if (criterios.categorias_favoritas) tipos.push('Interesses');
    
    return {
      count,
      description: tipos.join(', ') || 'Critérios personalizados'
    };
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Sistema de Missões</h2>
          <p className="text-gray-600">Configure e monitore missões simples e segmentadas</p>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="simples" className="flex items-center gap-2">
            <Trophy className="w-4 h-4" />
            Simples
          </TabsTrigger>
          <TabsTrigger value="segmentadas" className="flex items-center gap-2">
            <Target className="w-4 h-4" />
            Segmentadas
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4" />
            Analytics
          </TabsTrigger>
          <TabsTrigger value="estatisticas" className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            Estatísticas
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total de Missões</CardTitle>
                <Trophy className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{missoes.length}</div>
                <p className="text-xs text-muted-foreground">
                  {missoes.filter(m => m.ativo).length} ativas
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Missões Simples</CardTitle>
                <Trophy className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">{missoesSimples.length}</div>
                <p className="text-xs text-muted-foreground">
                  {missoesSimples.filter(m => m.ativo).length} ativas
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Missões Segmentadas</CardTitle>
                <Target className="h-4 w-4 text-purple-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-purple-600">{missoesSegmentadas.length}</div>
                <p className="text-xs text-muted-foreground">
                  {missoesSegmentadas.filter(m => m.ativo).length} ativas
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Recompensas</CardTitle>
                <Gift className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {missoes.reduce((sum, m) => sum + m.recompensa_girinhas, 0)}
                </div>
                <p className="text-xs text-muted-foreground">
                  Girinhas em recompensas
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Últimas missões criadas */}
          <Card>
            <CardHeader>
              <CardTitle>Últimas Missões Criadas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {missoes.slice(0, 5).map((missao) => {
                  const Icon = getTipoIcon(missao.tipo_missao);
                  const segmentacaoInfo = getSegmentacaoInfo(missao.criterios_segmentacao);
                  
                  return (
                    <div key={missao.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <Icon className="w-5 h-5 text-gray-600" />
                        <div>
                          <h4 className="font-medium text-sm">{missao.titulo}</h4>
                          <p className="text-xs text-gray-500">{segmentacaoInfo.description}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant={missao.ativo ? 'default' : 'secondary'}>
                          {missao.ativo ? 'Ativa' : 'Inativa'}
                        </Badge>
                        <Badge variant="outline">
                          +{missao.recompensa_girinhas}
                        </Badge>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Missões Simples Tab */}
        <TabsContent value="simples" className="space-y-4">
          <div className="flex justify-end">
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Nova Missão Simples
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>
                    {missaoEditando ? 'Editar Missão' : 'Nova Missão Simples'}
                  </DialogTitle>
                </DialogHeader>
                <FormMissao
                  missao={missaoEditando}
                  onSubmit={handleSubmit}
                  isLoading={criarMissao.isPending || atualizarMissao.isPending}
                />
              </DialogContent>
            </Dialog>
          </div>

          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-20 bg-gray-100 rounded-lg animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="grid gap-4">
              {missoesSimples.map((missao) => {
                const Icon = getTipoIcon(missao.tipo_missao);
                
                return (
                  <Card key={missao.id}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3 flex-1">
                          <Icon className="w-8 h-8 text-gray-600" />
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-1">
                              <h3 className="font-medium">{missao.titulo}</h3>
                              <Badge variant={missao.ativo ? 'default' : 'secondary'}>
                                {missao.ativo ? 'Ativa' : 'Inativa'}
                              </Badge>
                              <Badge variant="outline">
                                {getTipoLabel(missao.tipo_missao)}
                              </Badge>
                            </div>
                            <p className="text-sm text-gray-600 mb-2">{missao.descricao}</p>
                            <div className="flex items-center space-x-4 text-xs text-gray-500">
                              <span>Recompensa: {missao.recompensa_girinhas} Girinhas</span>
                              <span>Categoria: {missao.categoria}</span>
                              <span>Condição: {missao.condicoes?.quantidade}x {missao.condicoes?.tipo}</span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setMissaoEditando(missao);
                              setDialogOpen(true);
                            }}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant={missao.ativo ? "destructive" : "default"}
                            size="sm"
                            onClick={() => toggleMissao.mutate({ 
                              id: missao.id!, 
                              ativo: !missao.ativo 
                            })}
                          >
                            {missao.ativo ? 'Desativar' : 'Ativar'}
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>

        {/* Missões Segmentadas Tab */}
        <TabsContent value="segmentadas">
          <MissoesSegmentadasAdmin />
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics">
          <AnalyticsSegmentacao />
        </TabsContent>

        {/* Estatísticas Tab */}
        <TabsContent value="estatisticas">
          {estatisticas && (
            <div className="grid md:grid-cols-3 gap-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Girinhas Distribuídas</CardTitle>
                  <Gift className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{estatisticas.totalGirinhasDistribuidas}</div>
                  <p className="text-xs text-muted-foreground">
                    Total em recompensas de missões
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Usuários Ativos</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{estatisticas.totalUsuariosAtivos}</div>
                  <p className="text-xs text-muted-foreground">
                    Usuários que coletaram recompensas
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total de Recompensas</CardTitle>
                  <BarChart3 className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{estatisticas.totalRecompensas}</div>
                  <p className="text-xs text-muted-foreground">
                    Recompensas coletadas
                  </p>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default MissoesAdmin;
