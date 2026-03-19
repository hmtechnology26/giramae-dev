import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Mail, Phone, Calendar, Coins, TrendingUp } from 'lucide-react';
import { usePerfilBeneficiario } from '@/hooks/parcerias/usePerfilBeneficiario';
import LoadingSpinner from '@/components/loading/LoadingSpinner';
import DocumentosValidados from '@/components/admin/parcerias/beneficiario/DocumentosValidados';
import ObservacoesInternas from '@/components/admin/parcerias/beneficiario/ObservacoesInternas';
import PadraoUso from '@/components/admin/parcerias/beneficiario/PadraoUso';

export default function PerfilBeneficiario() {
  const { programaId, userId } = useParams<{ programaId: string; userId: string }>();
  const navigate = useNavigate();
  
  const { perfil, loading } = usePerfilBeneficiario(userId!, programaId!);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (!perfil) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="p-6 text-center">
          <p className="text-lg">Beneficiário não encontrado</p>
          <Button className="mt-4" onClick={() => navigate(`/admin/parcerias/${programaId}`)}>
            Voltar
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4 md:p-6 lg:p-8">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate(`/admin/parcerias/${programaId}`)}
          className="w-fit"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar
        </Button>

        {/* Perfil */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <Avatar className="h-20 w-20">
                <AvatarImage src={perfil.avatar_url} />
                <AvatarFallback className="text-lg">
                  {perfil.nome.split(' ').map(n => n[0]).join('').slice(0, 2)}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h2 className="text-2xl font-bold">{perfil.nome}</h2>
                  <Badge variant={perfil.status === 'ativo' ? 'default' : 'destructive'}>
                    {perfil.status}
                  </Badge>
                </div>
                
                <div className="space-y-1 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    {perfil.email}
                  </div>
                  {perfil.telefone && (
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4" />
                      {perfil.telefone}
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Aprovado em {new Date(perfil.data_aprovacao).toLocaleDateString('pt-BR')}
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Resumo Financeiro */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Saldo Atual</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Coins className="h-5 w-5 text-yellow-500" />
                <p className="text-2xl font-bold">
                  {perfil.resumo_financeiro.saldo_atual.toLocaleString('pt-BR')}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Total Recebido (Programa)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Coins className="h-5 w-5 text-green-500" />
                <p className="text-2xl font-bold">
                  {perfil.resumo_financeiro.total_creditos_recebidos.toLocaleString('pt-BR')}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Total Recebido (Geral)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-blue-500" />
                <p className="text-2xl font-bold">
                  {perfil.resumo_financeiro.total_recebido.toLocaleString('pt-BR')}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Total Gasto</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Coins className="h-5 w-5 text-red-500" />
                <p className="text-2xl font-bold">
                  {perfil.resumo_financeiro.total_gasto.toLocaleString('pt-BR')}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Créditos Mês Atual</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Coins className="h-5 w-5 text-green-500" />
                <p className="text-2xl font-bold">
                  {perfil.resumo_financeiro.creditos_mes_atual.toLocaleString('pt-BR')}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Média Mensal</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-purple-500" />
                <p className="text-2xl font-bold">
                  {perfil.resumo_financeiro.media_mensal.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Estatísticas de Uso */}
        <Card>
          <CardHeader>
            <CardTitle>Estatísticas de Uso da Plataforma</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="border rounded-lg p-4">
                <p className="text-sm text-muted-foreground mb-1">Itens Publicados</p>
                <p className="text-2xl font-bold">{perfil.padrao_uso.total_itens_publicados}</p>
              </div>
              <div className="border rounded-lg p-4">
                <p className="text-sm text-muted-foreground mb-1">Compras Realizadas</p>
                <p className="text-2xl font-bold">
                  {perfil.padrao_uso.compras_confirmadas} / {perfil.padrao_uso.total_compras}
                </p>
                <p className="text-xs text-muted-foreground">confirmadas / total</p>
              </div>
              <div className="border rounded-lg p-4">
                <p className="text-sm text-muted-foreground mb-1">Vendas Realizadas</p>
                <p className="text-2xl font-bold">
                  {perfil.padrao_uso.vendas_confirmadas} / {perfil.padrao_uso.total_vendas}
                </p>
                <p className="text-xs text-muted-foreground">confirmadas / total</p>
              </div>
              <div className="border rounded-lg p-4">
                <p className="text-sm text-muted-foreground mb-1">Membro Desde</p>
                <p className="text-sm font-medium">
                  {new Date(perfil.data_cadastro).toLocaleDateString('pt-BR')}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Expiração de Girinhas */}
        {perfil.expiracao_girinhas.total_expirando_30_dias > 0 && (
          <Card className="border-orange-500">
            <CardHeader>
              <CardTitle className="text-orange-600">⚠️ Girinhas Expirando</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Expirando em 7 dias:</span>
                  <strong className="text-red-600">
                    {perfil.expiracao_girinhas.total_expirando_7_dias} Girinhas
                  </strong>
                </div>
                <div className="flex justify-between">
                  <span>Expirando em 30 dias:</span>
                  <strong className="text-orange-600">
                    {perfil.expiracao_girinhas.total_expirando_30_dias} Girinhas
                  </strong>
                </div>
                {perfil.expiracao_girinhas.proxima_expiracao && (
                  <div className="flex justify-between">
                    <span>Próxima expiração:</span>
                    <strong>
                      {new Date(perfil.expiracao_girinhas.proxima_expiracao).toLocaleDateString('pt-BR')}
                    </strong>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Tabs */}
        <Tabs defaultValue="solicitacao" className="w-full">
          <TabsList className="grid w-full grid-cols-3 lg:grid-cols-6">
            <TabsTrigger value="solicitacao">Solicitação</TabsTrigger>
            <TabsTrigger value="historico">Histórico</TabsTrigger>
            <TabsTrigger value="transacoes">Transações</TabsTrigger>
            <TabsTrigger value="itens">Itens</TabsTrigger>
            <TabsTrigger value="documentos">Documentos</TabsTrigger>
            <TabsTrigger value="observacoes">Observações</TabsTrigger>
          </TabsList>

          <TabsContent value="solicitacao">
            <Card>
              <CardHeader>
                <CardTitle>Dados da Solicitação</CardTitle>
              </CardHeader>
              <CardContent>
                {Object.keys(perfil.dados_solicitacao).length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">
                    Nenhum dado adicional fornecido na solicitação
                  </p>
                ) : (
                  <div className="space-y-3">
                    {Object.entries(perfil.dados_solicitacao).map(([key, value]) => (
                      <div key={key} className="flex justify-between items-start p-3 rounded-lg border">
                        <span className="font-medium capitalize">
                          {key.replace(/_/g, ' ')}:
                        </span>
                        <span className="text-right max-w-md">
                          {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="historico">
            <Card>
              <CardHeader>
                <CardTitle>Histórico de Créditos do Programa ({perfil.historico_creditos.length})</CardTitle>
              </CardHeader>
              <CardContent>
                {perfil.historico_creditos.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">
                    Nenhum crédito recebido ainda
                  </p>
                ) : (
                  <div className="space-y-2">
                    {perfil.historico_creditos.map((credito) => (
                      <div 
                        key={credito.id}
                        className="flex justify-between items-center p-3 rounded-lg border"
                      >
                        <div>
                          <p className="font-medium">
                            {new Date(credito.mes_referencia).toLocaleDateString('pt-BR', { 
                              year: 'numeric', 
                              month: 'long' 
                            })}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Creditado em {credito.data_creditacao ? new Date(credito.data_creditacao).toLocaleDateString('pt-BR') : 'N/A'}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold text-green-600">
                            +{credito.valor_creditado.toLocaleString('pt-BR')}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="transacoes">
            <Card>
              <CardHeader>
                <CardTitle>Últimas Transações (10 mais recentes)</CardTitle>
              </CardHeader>
              <CardContent>
                {perfil.ultimas_transacoes.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">
                    Nenhuma transação encontrada
                  </p>
                ) : (
                  <div className="space-y-2">
                    {perfil.ultimas_transacoes.map((transacao) => (
                      <div 
                        key={transacao.id}
                        className="flex justify-between items-center p-3 rounded-lg border"
                      >
                        <div className="flex-1">
                          <p className="font-medium">{transacao.descricao}</p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(transacao.data).toLocaleString('pt-BR')}
                          </p>
                          <p className="text-xs text-muted-foreground capitalize">
                            Tipo: {transacao.tipo.replace(/_/g, ' ')}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className={`text-lg font-bold ${
                            transacao.tipo.includes('entrada') || 
                            transacao.tipo === 'bonus' || 
                            transacao.tipo === 'compra' || 
                            transacao.tipo === 'recebido_item'
                              ? 'text-green-600' 
                              : 'text-red-600'
                          }`}>
                            {transacao.tipo.includes('entrada') || 
                             transacao.tipo === 'bonus' || 
                             transacao.tipo === 'compra' || 
                             transacao.tipo === 'recebido_item' ? '+' : '-'}
                            {transacao.valor.toLocaleString('pt-BR')}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="itens">
            <Card>
              <CardHeader>
                <CardTitle>Últimos Itens Publicados ({perfil.padrao_uso.total_itens_publicados} total)</CardTitle>
              </CardHeader>
              <CardContent>
                {perfil.padrao_uso.ultimos_itens.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">
                    Nenhum item publicado ainda
                  </p>
                ) : (
                  <div className="space-y-2">
                    {perfil.padrao_uso.ultimos_itens.map((item: any) => (
                      <div 
                        key={item.id}
                        className="flex justify-between items-center p-3 rounded-lg border"
                      >
                        <div className="flex-1">
                          <p className="font-medium">{item.titulo}</p>
                          <p className="text-xs text-muted-foreground">
                            Publicado em {new Date(item.created_at).toLocaleDateString('pt-BR')}
                          </p>
                          <Badge variant={
                            item.status === 'disponivel' ? 'default' : 
                            item.status === 'reservado' ? 'secondary' : 
                            'outline'
                          } className="mt-1">
                            {item.status}
                          </Badge>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold text-green-600">
                            {item.valor_girinhas.toLocaleString('pt-BR')}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="documentos">
            <DocumentosValidados programaId={programaId!} userId={userId!} />
          </TabsContent>

          <TabsContent value="observacoes">
            <ObservacoesInternas programaId={programaId!} userId={userId!} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
