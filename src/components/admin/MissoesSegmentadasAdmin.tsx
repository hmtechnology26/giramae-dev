
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Users, BarChart3, Settings, Plus, Target, Zap, Calendar, MapPin } from 'lucide-react';
import { useMissoesAdmin, MissaoAdmin } from '@/hooks/useMissoesAdmin';
import MissaoSegmentadaForm from './MissaoSegmentadaForm';

const MissoesSegmentadasAdmin: React.FC = () => {
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
      console.error('Erro ao salvar missão segmentada:', error);
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

  const getSegmentacaoInfo = (criterios: any) => {
    if (!criterios || Object.keys(criterios).length === 0) {
      return { count: 0, description: 'Todos os usuários' };
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

  // Filtrar apenas missões com segmentação
  const missoesSegmentadas = missoes.filter(missao => 
    missao.criterios_segmentacao && Object.keys(missao.criterios_segmentacao).length > 0
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Missões Segmentadas</h2>
          <p className="text-gray-600">Gerencie missões com segmentação avançada de usuários</p>
        </div>
        
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Nova Missão Segmentada
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {missaoEditando ? 'Editar Missão Segmentada' : 'Nova Missão Segmentada'}
              </DialogTitle>
            </DialogHeader>
            <MissaoSegmentadaForm
              missao={missaoEditando}
              onSubmit={handleSubmit}
              isLoading={criarMissao.isPending || atualizarMissao.isPending}
            />
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="lista" className="space-y-4">
        <TabsList>
          <TabsTrigger value="lista">Missões Segmentadas</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
        </TabsList>

        <TabsContent value="lista" className="space-y-4">
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-32 bg-gray-100 rounded-lg animate-pulse" />
              ))}
            </div>
          ) : missoesSegmentadas.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <Target className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Nenhuma missão segmentada
                </h3>
                <p className="text-gray-600 mb-4">
                  Crie sua primeira missão com segmentação personalizada
                </p>
                <Button onClick={() => setDialogOpen(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Criar Primeira Missão
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {missoesSegmentadas.map((missao) => {
                const segmentacaoInfo = getSegmentacaoInfo(missao.criterios_segmentacao);
                const temEventos = missao.acoes_eventos && missao.acoes_eventos.length > 0;
                
                return (
                  <Card key={missao.id}>
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <h3 className="font-semibold text-lg">{missao.titulo}</h3>
                            <Badge variant={missao.ativo ? 'default' : 'secondary'}>
                              {missao.ativo ? 'Ativa' : 'Inativa'}
                            </Badge>
                            <Badge variant="outline">
                              {getTipoLabel(missao.tipo_missao)}
                            </Badge>
                          </div>
                          
                          <p className="text-gray-600 mb-4">{missao.descricao}</p>
                          
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                            {/* Segmentação */}
                            <div className="flex items-center space-x-2 p-3 bg-blue-50 rounded-lg">
                              <Users className="w-5 h-5 text-blue-600" />
                              <div>
                                <p className="text-sm font-medium text-blue-900">
                                  {segmentacaoInfo.count} Critérios
                                </p>
                                <p className="text-xs text-blue-600">
                                  {segmentacaoInfo.description}
                                </p>
                              </div>
                            </div>

                            {/* Eventos */}
                            <div className="flex items-center space-x-2 p-3 bg-green-50 rounded-lg">
                              <Zap className="w-5 h-5 text-green-600" />
                              <div>
                                <p className="text-sm font-medium text-green-900">
                                  {missao.acoes_eventos?.length || 0} Eventos
                                </p>
                                <p className="text-xs text-green-600">
                                  {temEventos ? 'Personalizados' : 'Padrão'}
                                </p>
                              </div>
                            </div>

                            {/* Período */}
                            <div className="flex items-center space-x-2 p-3 bg-purple-50 rounded-lg">
                              <Calendar className="w-5 h-5 text-purple-600" />
                              <div>
                                <p className="text-sm font-medium text-purple-900">
                                  {missao.data_inicio && missao.data_fim ? 'Limitado' : 'Ilimitado'}
                                </p>
                                <p className="text-xs text-purple-600">
                                  {missao.data_inicio ? 
                                    new Date(missao.data_inicio).toLocaleDateString() : 
                                    'Sempre ativo'
                                  }
                                </p>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center space-x-4 text-sm text-gray-500">
                            <span>Recompensa: {missao.recompensa_girinhas} Girinhas</span>
                            <span>Categoria: {missao.categoria}</span>
                            <span>Condição: {missao.condicoes?.quantidade}x {missao.condicoes?.tipo}</span>
                            {missao.usuarios_elegíveis_cache && (
                              <span>~{missao.usuarios_elegíveis_cache} usuários elegíveis</span>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2 ml-4">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setMissaoEditando(missao);
                              setDialogOpen(true);
                            }}
                          >
                            <Settings className="w-4 h-4" />
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

        <TabsContent value="analytics">
          <div className="grid md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Missões Segmentadas</CardTitle>
                <Target className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{missoesSegmentadas.length}</div>
                <p className="text-xs text-muted-foreground">
                  Total com segmentação ativa
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Usuários Segmentados</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {missoesSegmentadas.reduce((sum, m) => sum + (m.usuarios_elegíveis_cache || 0), 0)}
                </div>
                <p className="text-xs text-muted-foreground">
                  Total de alcance estimado
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Eventos Configurados</CardTitle>
                <Zap className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {missoesSegmentadas.reduce((sum, m) => sum + (m.acoes_eventos?.length || 0), 0)}
                </div>
                <p className="text-xs text-muted-foreground">
                  Ações personalizadas ativas
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="templates">
          <Card>
            <CardHeader>
              <CardTitle>Templates de Segmentação</CardTitle>
              <p className="text-gray-600">
                Templates reutilizáveis para configurações comuns de segmentação
              </p>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4">
                {[
                  {
                    nome: 'Mães SP - Volta às Aulas',
                    criterios: ['São Paulo', 'Filhos 6-12 anos', 'Material escolar'],
                    usuarios: '~1,200'
                  },
                  {
                    nome: 'Primeiras Compradoras RJ',
                    criterios: ['Rio de Janeiro', 'Nunca comprou', 'Saldo baixo'],
                    usuarios: '~850'
                  },
                  {
                    nome: 'Usuárias Premium Nacional',
                    criterios: ['Saldo 100+ Girinhas', 'Ativas 30 dias', 'Múltiplas categorias'],
                    usuarios: '~350'
                  },
                  {
                    nome: 'Mães de Bebês - Grandes Centros',
                    criterios: ['SP/RJ/BH', 'Filhos 0-2 anos', 'Roupas + Acessórios'],
                    usuarios: '~950'
                  }
                ].map((template, index) => (
                  <Card key={index} className="border-dashed border-2 hover:border-blue-300 cursor-pointer">
                    <CardContent className="p-4">
                      <h4 className="font-medium mb-2">{template.nome}</h4>
                      <div className="space-y-2">
                        <div className="flex flex-wrap gap-1">
                          {template.criterios.map((criterio, i) => (
                            <Badge key={i} variant="outline" className="text-xs">
                              {criterio}
                            </Badge>
                          ))}
                        </div>
                        <p className="text-sm text-blue-600 font-medium">
                          {template.usuarios} usuários elegíveis
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default MissoesSegmentadasAdmin;
