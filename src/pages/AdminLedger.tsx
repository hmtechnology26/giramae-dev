import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import Header from '@/components/shared/Header';
import AdminGuard from '@/components/auth/AdminGuard';
import { Search, Database, DollarSign, Users, Activity, Download } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import SEOHead from '@/components/seo/SEOHead';

// Interfaces para os dados do ledger
interface LedgerCarteira {
  user_id: string;
  saldo_atual: number;
  total_recebido: number;
  total_gasto: number;
  created_at: string;
  updated_at: string;
}

interface LedgerTransacao {
  transacao_id: string;
  user_id: string;
  conta_origem: string;
  conta_destino: string;
  valor: number;
  tipo: string;
  descricao: string;
  data_criacao: string;
  data_expiracao: string | null;
  metadata: any;
}

interface ProfileInfo {
  id: string;
  nome: string;
  username: string;
  email: string;
  cidade: string;
  estado: string;
}

const AdminLedger = () => {
  const [filtroUsuario, setFiltroUsuario] = useState('');
  const [filtroTipo, setFiltroTipo] = useState('');
  const [filtroValorMin, setFiltroValorMin] = useState('');
  const [filtroValorMax, setFiltroValorMax] = useState('');
  const [limite, setLimite] = useState(50);

  // Query para carteiras
  const { data: carteiras, isLoading: loadingCarteiras } = useQuery({
    queryKey: ['admin-ledger-carteiras', filtroUsuario, limite],
    queryFn: async () => {
      let query = (supabase as any)
        .from('ledger_carteiras')
        .select('*')
        .order('updated_at', { ascending: false })
        .limit(limite);

      if (filtroUsuario) {
        query = query.ilike('user_id', `%${filtroUsuario}%`);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as LedgerCarteira[];
    }
  });

  // Query para transações
  const { data: transacoes, isLoading: loadingTransacoes } = useQuery({
    queryKey: ['admin-ledger-transacoes', filtroUsuario, filtroTipo, filtroValorMin, filtroValorMax, limite],
    queryFn: async () => {
      let query = (supabase as any)
        .from('ledger_transacoes')
        .select('*')
        .order('data_criacao', { ascending: false })
        .limit(limite);

      if (filtroUsuario) {
        query = query.ilike('user_id', `%${filtroUsuario}%`);
      }

      if (filtroTipo) {
        query = query.eq('tipo', filtroTipo);
      }

      if (filtroValorMin) {
        query = query.gte('valor', parseFloat(filtroValorMin));
      }

      if (filtroValorMax) {
        query = query.lte('valor', parseFloat(filtroValorMax));
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as LedgerTransacao[];
    }
  });

  // Query para perfis dos usuários (para mostrar nomes)
  const { data: perfis } = useQuery({
    queryKey: ['admin-ledger-perfis'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, nome, username, email, cidade, estado');
      
      if (error) throw error;
      return data as ProfileInfo[];
    }
  });

  // Query para estatísticas gerais
  const { data: estatisticas } = useQuery({
    queryKey: ['admin-ledger-stats'],
    queryFn: async () => {
      const [
        { data: totalCarteiras },
        { data: totalTransacoes },
        { data: somaCarteiras }
      ] = await Promise.all([
        (supabase as any).from('ledger_carteiras').select('*', { count: 'exact', head: true }),
        (supabase as any).from('ledger_transacoes').select('*', { count: 'exact', head: true }),
        (supabase as any).from('ledger_carteiras').select('saldo_atual, total_recebido, total_gasto')
      ]);

      const totalSaldo = somaCarteiras?.reduce((acc: number, c: any) => acc + Number(c.saldo_atual || 0), 0) || 0;
      const totalRecebido = somaCarteiras?.reduce((acc: number, c: any) => acc + Number(c.total_recebido || 0), 0) || 0;
      const totalGasto = somaCarteiras?.reduce((acc: number, c: any) => acc + Number(c.total_gasto || 0), 0) || 0;

      return {
        totalCarteiras: totalCarteiras?.length || 0,
        totalTransacoes: totalTransacoes?.length || 0,
        totalSaldo: Math.round(totalSaldo),
        totalRecebido: Math.round(totalRecebido),
        totalGasto: Math.round(totalGasto)
      };
    }
  });

  // Função para obter nome do usuário
  const getNomeUsuario = (userId: string) => {
    const perfil = perfis?.find(p => p.id === userId);
    return perfil ? `${perfil.nome} (${perfil.username || 'sem username'})` : userId.substring(0, 8) + '...';
  };

  // Função para obter tipos únicos de transação
  const tiposTransacao = Array.from(new Set(transacoes?.map(t => t.tipo) || []));

  // Função para exportar dados
  const exportarDados = (dados: any[], filename: string) => {
    const csv = [
      Object.keys(dados[0] || {}).join(','),
      ...dados.map(item => Object.values(item).map(val => 
        typeof val === 'string' && val.includes(',') ? `"${val}"` : val
      ).join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${filename}-${format(new Date(), 'yyyy-MM-dd-HH-mm')}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <AdminGuard>
      <div className="min-h-screen bg-background">
        <SEOHead
          title="Admin Ledger - GiraMãe"
          description="Painel administrativo para visualizar e filtrar dados do sistema Ledger"
        />
        <Header />
        
        <main className="container mx-auto px-4 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-2 flex items-center gap-2">
              <Database className="w-8 h-8 text-primary" />
              Admin Ledger
            </h1>
            <p className="text-gray-600">Visualize e filtre todos os dados do sistema Ledger</p>
          </div>

          {/* Estatísticas Gerais */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Carteiras</p>
                    <p className="text-2xl font-bold text-blue-600">
                      {estatisticas?.totalCarteiras?.toLocaleString() || '0'}
                    </p>
                  </div>
                  <Users className="w-8 h-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Transações</p>
                    <p className="text-2xl font-bold text-green-600">
                      {estatisticas?.totalTransacoes?.toLocaleString() || '0'}
                    </p>
                  </div>
                  <Activity className="w-8 h-8 text-green-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Saldo Total</p>
                    <p className="text-2xl font-bold text-purple-600">
                      {estatisticas?.totalSaldo?.toLocaleString() || '0'}
                    </p>
                  </div>
                  <DollarSign className="w-8 h-8 text-purple-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Recebido</p>
                    <p className="text-2xl font-bold text-orange-600">
                      {estatisticas?.totalRecebido?.toLocaleString() || '0'}
                    </p>
                  </div>
                  <DollarSign className="w-8 h-8 text-orange-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="carteiras" className="space-y-6">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="carteiras">Carteiras Ledger</TabsTrigger>
              <TabsTrigger value="transacoes">Transações Ledger</TabsTrigger>
            </TabsList>

            {/* Tab Carteiras */}
            <TabsContent value="carteiras">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>Carteiras do Sistema Ledger</span>
                    <Button
                      onClick={() => carteiras && exportarDados(carteiras, 'ledger-carteiras')}
                      variant="outline"
                      size="sm"
                      className="flex items-center gap-2"
                    >
                      <Download className="w-4 h-4" />
                      Exportar CSV
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {/* Filtros */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <Input
                        placeholder="Buscar por User ID..."
                        value={filtroUsuario}
                        onChange={(e) => setFiltroUsuario(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                    <Select value={limite.toString()} onValueChange={(value) => setLimite(parseInt(value))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Limite de resultados" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="25">25 resultados</SelectItem>
                        <SelectItem value="50">50 resultados</SelectItem>
                        <SelectItem value="100">100 resultados</SelectItem>
                        <SelectItem value="200">200 resultados</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Tabela de Carteiras */}
                  {loadingCarteiras ? (
                    <div className="text-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                      <p className="text-gray-600 mt-2">Carregando carteiras...</p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Usuário</TableHead>
                            <TableHead>Saldo Atual</TableHead>
                            <TableHead>Total Recebido</TableHead>
                            <TableHead>Total Gasto</TableHead>
                            <TableHead>Atualizado</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {carteiras?.map((carteira) => (
                            <TableRow key={carteira.user_id}>
                              <TableCell>
                                <div>
                                  <p className="font-medium">{getNomeUsuario(carteira.user_id)}</p>
                                  <p className="text-xs text-gray-500">{carteira.user_id}</p>
                                </div>
                              </TableCell>
                              <TableCell>
                                <Badge variant={carteira.saldo_atual > 0 ? "default" : "secondary"}>
                                  {carteira.saldo_atual.toFixed(2)}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-green-600 font-medium">
                                {carteira.total_recebido.toFixed(2)}
                              </TableCell>
                              <TableCell className="text-red-600 font-medium">
                                {carteira.total_gasto.toFixed(2)}
                              </TableCell>
                              <TableCell className="text-sm text-gray-500">
                                {carteira.updated_at && format(new Date(carteira.updated_at), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Tab Transações */}
            <TabsContent value="transacoes">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>Transações do Sistema Ledger</span>
                    <Button
                      onClick={() => transacoes && exportarDados(transacoes, 'ledger-transacoes')}
                      variant="outline"
                      size="sm"
                      className="flex items-center gap-2"
                    >
                      <Download className="w-4 h-4" />
                      Exportar CSV
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {/* Filtros */}
                  <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <Input
                        placeholder="Buscar por User ID..."
                        value={filtroUsuario}
                        onChange={(e) => setFiltroUsuario(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                    <Select value={filtroTipo} onValueChange={setFiltroTipo}>
                      <SelectTrigger>
                        <SelectValue placeholder="Tipo de transação" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">Todos os tipos</SelectItem>
                        {tiposTransacao.map(tipo => (
                          <SelectItem key={tipo} value={tipo}>{tipo}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Input
                      placeholder="Valor mínimo"
                      type="number"
                      value={filtroValorMin}
                      onChange={(e) => setFiltroValorMin(e.target.value)}
                    />
                    <Input
                      placeholder="Valor máximo"
                      type="number"
                      value={filtroValorMax}
                      onChange={(e) => setFiltroValorMax(e.target.value)}
                    />
                    <Select value={limite.toString()} onValueChange={(value) => setLimite(parseInt(value))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Limite" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="25">25</SelectItem>
                        <SelectItem value="50">50</SelectItem>
                        <SelectItem value="100">100</SelectItem>
                        <SelectItem value="200">200</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Tabela de Transações */}
                  {loadingTransacoes ? (
                    <div className="text-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                      <p className="text-gray-600 mt-2">Carregando transações...</p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>ID Transação</TableHead>
                            <TableHead>Usuário</TableHead>
                            <TableHead>Tipo</TableHead>
                            <TableHead>Valor</TableHead>
                            <TableHead>Descrição</TableHead>
                            <TableHead>Data</TableHead>
                            <TableHead>Expiração</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {transacoes?.map((transacao) => (
                            <TableRow key={transacao.transacao_id}>
                              <TableCell className="font-mono text-xs">
                                {transacao.transacao_id.substring(0, 8)}...
                              </TableCell>
                              <TableCell>
                                <div>
                                  <p className="font-medium text-sm">{getNomeUsuario(transacao.user_id)}</p>
                                  <p className="text-xs text-gray-500">{transacao.user_id.substring(0, 8)}...</p>
                                </div>
                              </TableCell>
                              <TableCell>
                                <Badge variant="outline">{transacao.tipo}</Badge>
                              </TableCell>
                              <TableCell>
                                <span className={`font-medium ${transacao.valor >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                  {transacao.valor >= 0 ? '+' : ''}{transacao.valor.toFixed(2)}
                                </span>
                              </TableCell>
                              <TableCell className="max-w-xs truncate" title={transacao.descricao}>
                                {transacao.descricao}
                              </TableCell>
                              <TableCell className="text-sm">
                                {format(new Date(transacao.data_criacao), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                              </TableCell>
                              <TableCell className="text-sm">
                                {transacao.data_expiracao 
                                  ? format(new Date(transacao.data_expiracao), 'dd/MM/yyyy', { locale: ptBR })
                                  : '-'
                                }
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </AdminGuard>
  );
};

export default AdminLedger;