import React, { useState, useMemo, useEffect } from 'react';
import { useModeracaoItens } from '@/hooks/useModeracaoItens';
import { useUserProfiles } from '@/hooks/useUserProfiles';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';
import ModerationSidebar from './moderation/ModerationSidebar';
import ModerationFilters from './moderation/ModerationFilters';
import ModerationTabs from './moderation/ModerationTabs';
import { GerenciamentoUsuarios } from './GerenciamentoUsuarios';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';

const ModePanel = () => {
  // Criar hooks para buscar itens de cada aba específica
  const { data: itensPendentes, isLoading: loadingPendentes, refetch: refetchPendentes } = useQuery({
    queryKey: ['itens-pendentes-moderacao'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('itens_pendentes_moderacao')
        .select('*')
        .order('data_moderacao', { ascending: false });
      
      if (error) throw error;
      return data || [];
    },
    staleTime: 1000 * 60 * 2,
  });

  const { data: itensReportados, isLoading: loadingReportados, refetch: refetchReportados } = useQuery({
    queryKey: ['itens-reportados-moderacao'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('itens_reportados_moderacao')
        .select('*')
        .order('data_denuncia', { ascending: false });
      
      if (error) throw error;
      return data || [];
    },
    staleTime: 1000 * 60 * 2,
  });

  const { data: itensAprovados, isLoading: loadingAprovados, refetch: refetchAprovados } = useQuery({
    queryKey: ['itens-aprovados-moderacao'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('itens_aprovados_moderacao')
        .select('*')
        .order('moderado_em', { ascending: false });
      
      if (error) throw error;
      return data || [];
    },
    staleTime: 1000 * 60 * 2,
  });

  const { data: itensRejeitados, isLoading: loadingRejeitados, refetch: refetchRejeitados } = useQuery({
    queryKey: ['itens-rejeitados-moderacao'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('itens_rejeitados_moderacao')
        .select('*')
        .order('moderado_em', { ascending: false });
      
      if (error) throw error;
      return data || [];
    },
    staleTime: 1000 * 60 * 2,
  });

  // Função para refetch de todas as abas
  const refetchTodos = async () => {
    await Promise.all([
      refetchPendentes(),
      refetchReportados(), 
      refetchAprovados(),
      refetchRejeitados()
    ]);
  };

  // Manter o hook original apenas para as funções de moderação
  const { aprovarItem, rejeitarItem, aceitarDenuncia, rejeitarDenuncia } = useModeracaoItens();
  
  const { profiles, fetchMultipleProfiles } = useUserProfiles();
  
  const [moderacaoLoading, setModeracaoLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('todas');
  const [activeTab, setActiveTab] = useState('pendentes');
  const [activeView, setActiveView] = useState('revisar');

  // Combinar todos os itens baseado na aba ativa
  const loading = loadingPendentes || loadingReportados || loadingAprovados || loadingRejeitados;
  
  // Obter itens da aba ativa
  const getItensAba = () => {
    switch (activeTab) {
      case 'pendentes':
        return itensPendentes || [];
      case 'reportados':
        return itensReportados || [];
      case 'aprovados':
        return itensAprovados || [];
      case 'rejeitados':
        return itensRejeitados || [];
      default:
        return [];
    }
  };

  const itens = getItensAba();

  // Buscar perfis dos usuários quando itens carregarem
  useEffect(() => {
    if (itens.length > 0) {
      const userIds = itens.map(item => item.usuario_id).filter(Boolean);
      if (userIds.length > 0) {
        fetchMultipleProfiles(userIds);
      }
    }
  }, [itens, fetchMultipleProfiles]);

  // Estatísticas
  const stats = useMemo(() => {
    return {
      pendentes: itensPendentes?.length || 0,
      reportados: itensReportados?.length || 0,
      aprovados: itensAprovados?.length || 0,
      rejeitados: itensRejeitados?.length || 0,
    };
  }, [itensPendentes, itensReportados, itensAprovados, itensRejeitados]);

  // Filtrar itens por busca e categoria
  const itensFiltrados = useMemo(() => {
    let resultado = [...itens];

    // Filtrar por busca
    if (searchTerm) {
      resultado = resultado.filter(item =>
        item.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.usuario_nome.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filtrar por categoria
    if (selectedCategory !== 'todas') {
      resultado = resultado.filter(item => item.categoria === selectedCategory);
    }

    return resultado;
  }, [itens, searchTerm, selectedCategory]);

  const handleAprovar = async (moderacaoId: string) => {
    setModeracaoLoading(true);
    try {
      console.log('🟢 ModePanel - Aprovando item:', moderacaoId);
      await aprovarItem(moderacaoId);
      console.log('🟢 ModePanel - Item aprovado, fazendo refetch...');
      await refetchTodos();
      console.log('🟢 ModePanel - Refetch concluído');
    } finally {
      setModeracaoLoading(false);
    }
  };

  const handleRejeitar = async (moderacaoId: string, motivo: string, observacoes?: string) => {
    setModeracaoLoading(true);
    try {
      console.log('🔴 ModePanel - Rejeitando item:', moderacaoId, 'Motivo:', motivo);
      await rejeitarItem(moderacaoId, motivo, observacoes);
      console.log('🔴 ModePanel - Item rejeitado, fazendo refetch...');
      await refetchTodos();
      console.log('🔴 ModePanel - Refetch concluído');
    } finally {
      setModeracaoLoading(false);
    }
  };

  const handleAceitarDenuncia = async (denunciaId: string, comentario: string, observacoes?: string) => {
    setModeracaoLoading(true);
    try {
      console.log('🔴 ModePanel - Aceitando denúncia:', denunciaId, 'Comentário:', comentario);
      await aceitarDenuncia(denunciaId, comentario, observacoes);
      console.log('🔴 ModePanel - Denúncia aceita, fazendo refetch...');
      await refetchTodos();
      console.log('🔴 ModePanel - Refetch concluído');
    } finally {
      setModeracaoLoading(false);
    }
  };

  const handleRejeitarDenuncia = async (denunciaId: string, observacoes: string) => {
    setModeracaoLoading(true);
    try {
      console.log('🟢 ModePanel - Rejeitando denúncia:', denunciaId, 'Observações:', observacoes);
      await rejeitarDenuncia(denunciaId, observacoes);
      console.log('🟢 ModePanel - Denúncia rejeitada, fazendo refetch...');
      await refetchTodos();
      console.log('🟢 ModePanel - Refetch concluído');
    } finally {
      setModeracaoLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando sistema de moderação...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-background">
      <ModerationSidebar 
        stats={stats} 
        activeView={activeView}
        onViewChange={setActiveView}
      />
      
      {/* Main Content */}
      <div className="flex-1 p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold">Revisar Itens</h1>
            <p className="text-muted-foreground">Analise e modere os itens do marketplace</p>
          </div>
          <Button onClick={() => refetchTodos()} variant="outline" disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Atualizar
          </Button>
        </div>

        {activeView === 'revisar' && (
          <>
            <ModerationFilters
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              selectedCategory={selectedCategory}
              setSelectedCategory={setSelectedCategory}
            />

            <ModerationTabs
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              stats={stats}
              itensFiltrados={itensFiltrados as any}
              onAprovar={handleAprovar}
              onRejeitar={handleRejeitar}
              onAceitarDenuncia={handleAceitarDenuncia}
              onRejeitarDenuncia={handleRejeitarDenuncia}
              loading={moderacaoLoading}
            />
          </>
        )}

        {activeView === 'dashboard' && (
          <div className="text-center py-20">
            <h2 className="text-2xl font-bold mb-4">Dashboard</h2>
            <p className="text-muted-foreground">Em desenvolvimento...</p>
          </div>
        )}

        {activeView === 'denuncias' && (
          <div className="text-center py-20">
            <h2 className="text-2xl font-bold mb-4">Denúncias</h2>
            <p className="text-muted-foreground">Em desenvolvimento...</p>
          </div>
        )}

        {activeView === 'usuarios' && (
          <GerenciamentoUsuarios />
        )}


        {activeView === 'historico' && (
          <div className="text-center py-20">
            <h2 className="text-2xl font-bold mb-4">Histórico</h2>
            <p className="text-muted-foreground">Em desenvolvimento...</p>
          </div>
        )}

        {activeView === 'configuracoes' && (
          <div className="text-center py-20">
            <h2 className="text-2xl font-bold mb-4">Configurações</h2>
            <p className="text-muted-foreground">Em desenvolvimento...</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ModePanel;
