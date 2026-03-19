import React, { useState, useMemo, useEffect } from 'react';
import { useModeracaoItens } from '@/hooks/useModeracaoItens';
import { useUserProfiles } from '@/hooks/useUserProfiles';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { 
  RefreshCw,
  Filter,
  Search,
  Clock,
  Eye,
  Flag,
  ArrowUp,
  ArrowDown,
  MessageSquare
} from 'lucide-react';
import ItemModeracaoCardCompleto from './ItemModeracaoCardCompleto';

const ModeracaoItens = () => {
  const { itens, loading, aprovarItem, rejeitarItem, aceitarDenuncia, rejeitarDenuncia, refetch } = useModeracaoItens();
  const { profiles, fetchMultipleProfiles } = useUserProfiles();
  
  const [moderacaoLoading, setModeracaoLoading] = useState(false);
  const [filtros, setFiltros] = useState({
    busca: '',
    status: 'todos',
    categoria: 'todas',
    denunciados: 'todos'
  });
  const [ordenacao, setOrdenacao] = useState({
    campo: 'data_publicacao',
    direcao: 'desc' as 'asc' | 'desc'
  });

  // Buscar perfis dos usuários quando itens carregarem
  useEffect(() => {
    if (itens.length > 0) {
      const userIds = itens.map(item => item.usuario_id).filter(Boolean);
      fetchMultipleProfiles(userIds);
    }
  }, [itens, fetchMultipleProfiles]);

  // Estatísticas
  const stats = useMemo(() => {
    const pendentes = itens.filter(item => item.moderacao_status === 'pendente').length;
    const emAnalise = itens.filter(item => item.moderacao_status === 'em_analise').length;
    const denunciados = itens.filter(item => item.tem_denuncia).length;
    const totalDenuncias = itens.reduce((acc, item) => acc + (item.total_denuncias || 0), 0);
    
    return { pendentes, emAnalise, denunciados, totalDenuncias };
  }, [itens]);

  // Filtrar e ordenar itens
  const itensFiltrados = useMemo(() => {
    let resultado = [...itens];

    if (filtros.busca) {
      resultado = resultado.filter(item =>
        item.titulo.toLowerCase().includes(filtros.busca.toLowerCase()) ||
        item.usuario_nome.toLowerCase().includes(filtros.busca.toLowerCase())
      );
    }

    if (filtros.status !== 'todos') {
      resultado = resultado.filter(item => item.moderacao_status === filtros.status);
    }

    if (filtros.categoria !== 'todas') {
      resultado = resultado.filter(item => item.categoria === filtros.categoria);
    }

    if (filtros.denunciados === 'sim') {
      resultado = resultado.filter(item => item.tem_denuncia);
    } else if (filtros.denunciados === 'nao') {
      resultado = resultado.filter(item => !item.tem_denuncia);
    }

    // Priorização: denunciados primeiro, depois por data
    resultado.sort((a, b) => {
      // Primeiro critério: itens denunciados têm prioridade
      if (a.tem_denuncia && !b.tem_denuncia) return -1;
      if (!a.tem_denuncia && b.tem_denuncia) return 1;
      
      // Segundo critério: ordenação selecionada
      let valorA: any = a[ordenacao.campo as keyof typeof a];
      let valorB: any = b[ordenacao.campo as keyof typeof b];

      if (ordenacao.campo === 'data_publicacao' || ordenacao.campo === 'data_denuncia') {
        valorA = new Date(valorA).getTime();
        valorB = new Date(valorB).getTime();
      }

      if (typeof valorA === 'string') {
        valorA = valorA.toLowerCase();
        valorB = valorB.toLowerCase();
      }

      if (ordenacao.direcao === 'asc') {
        return valorA < valorB ? -1 : valorA > valorB ? 1 : 0;
      } else {
        return valorA > valorB ? -1 : valorA < valorB ? 1 : 0;
      }
    });

    return resultado;
  }, [itens, filtros, ordenacao]);

  const handleAprovar = async (moderacaoId: string) => {
    setModeracaoLoading(true);
    try {
      await aprovarItem(moderacaoId);
      await refetch();
    } finally {
      setModeracaoLoading(false);
    }
  };

  const handleRejeitar = async (moderacaoId: string, motivo: string, observacoes?: string) => {
    setModeracaoLoading(true);
    try {
      await rejeitarItem(moderacaoId, motivo, observacoes);
      await refetch();
    } finally {
      setModeracaoLoading(false);
    }
  };

  const handleAceitarDenuncia = async (denunciaId: string, comentario: string, observacoes?: string) => {
    setModeracaoLoading(true);
    try {
      await aceitarDenuncia(denunciaId, comentario, observacoes);
      await refetch();
    } finally {
      setModeracaoLoading(false);
    }
  };

  const handleRejeitarDenuncia = async (denunciaId: string, observacoes: string) => {
    setModeracaoLoading(true);
    try {
      await rejeitarDenuncia(denunciaId, observacoes);
      await refetch();
    } finally {
      setModeracaoLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando itens para moderação...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Moderação de Itens</h2>
          <p className="text-muted-foreground">
            Análise e aprovação de itens publicados na plataforma
          </p>
        </div>
        <Button onClick={refetch} variant="outline" disabled={loading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          {loading ? 'Carregando...' : 'Atualizar'}
        </Button>
      </div>

      {/* Cards de Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-l-4 border-l-yellow-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Pendentes</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.pendentes}</p>
              </div>
              <Clock className="w-8 h-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-blue-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Em Análise</p>
                <p className="text-2xl font-bold text-blue-600">{stats.emAnalise}</p>
              </div>
              <Eye className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-red-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Denunciados</p>
                <p className="text-2xl font-bold text-red-600">{stats.denunciados}</p>
              </div>
              <Flag className="w-8 h-8 text-red-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Denúncias</p>
                <p className="text-2xl font-bold text-purple-600">{stats.totalDenuncias}</p>
              </div>
              <MessageSquare className="w-8 h-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Filtros e Busca
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por título ou usuário..."
                value={filtros.busca}
                onChange={(e) => setFiltros(prev => ({ ...prev, busca: e.target.value }))}
                className="pl-10"
              />
            </div>

            <Select value={filtros.status} onValueChange={(value) => setFiltros(prev => ({ ...prev, status: value }))}>
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos os status</SelectItem>
                <SelectItem value="pendente">Pendente</SelectItem>
                <SelectItem value="em_analise">Em Análise</SelectItem>
                <SelectItem value="aprovado">Aprovado</SelectItem>
                <SelectItem value="rejeitado">Rejeitado</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filtros.categoria} onValueChange={(value) => setFiltros(prev => ({ ...prev, categoria: value }))}>
              <SelectTrigger>
                <SelectValue placeholder="Categoria" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todas">Todas as categorias</SelectItem>
                <SelectItem value="eletronicos">Eletrônicos</SelectItem>
                <SelectItem value="roupas">Roupas</SelectItem>
                <SelectItem value="calcados">Calçados</SelectItem>
                <SelectItem value="brinquedos">Brinquedos</SelectItem>
                <SelectItem value="livros">Livros</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filtros.denunciados} onValueChange={(value) => setFiltros(prev => ({ ...prev, denunciados: value }))}>
              <SelectTrigger>
                <SelectValue placeholder="Denúncias" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos</SelectItem>
                <SelectItem value="sim">Apenas denunciados</SelectItem>
                <SelectItem value="nao">Sem denúncias</SelectItem>
              </SelectContent>
            </Select>

            <Button
              variant="outline"
              onClick={() => setOrdenacao(prev => ({ ...prev, direcao: prev.direcao === 'asc' ? 'desc' : 'asc' }))}
              className="gap-2"
            >
              {ordenacao.direcao === 'asc' ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />}
              Ordenação
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Itens */}
      <div className="space-y-6">
        {itensFiltrados.map((item) => (
          <ItemModeracaoCardCompleto
            key={item.item_id}
            item={item}
            onAprovar={handleAprovar}
            onRejeitar={handleRejeitar}
            onAceitarDenuncia={handleAceitarDenuncia}
            onRejeitarDenuncia={handleRejeitarDenuncia}
            loading={moderacaoLoading}
          />
        ))}

        {itensFiltrados.length === 0 && (
          <Card>
            <CardContent className="p-12 text-center">
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-medium mb-2">Nenhum item encontrado</h3>
              <p className="text-muted-foreground">Tente ajustar os filtros ou termos de busca.</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default ModeracaoItens;
