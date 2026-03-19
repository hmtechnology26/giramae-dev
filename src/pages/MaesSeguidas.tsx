import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Header from '@/components/shared/Header';
import QuickNav from '@/components/shared/QuickNav';
import Footer from '@/components/shared/Footer';
import LoadingSpinner from '@/components/loading/LoadingSpinner';
import EmptyState from '@/components/loading/EmptyState';
import FriendlyError from '@/components/error/FriendlyError';
import MaeSeguidaCard from '@/components/shared/MaeSeguidaCard';
import { useSeguidores } from '@/hooks/useSeguidores';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import SEOHead from '@/components/seo/SEOHead';
import { pageTitle } from '@/lib/pageTitle';
import {
  Heart,
  ChevronLeft,
  RefreshCw,
  Loader,
  Sparkles,
  Users
} from 'lucide-react';

interface MaeSeguida {
  id: string;
  seguidor_id: string;
  seguido_id: string;
  created_at: string;
  profiles: {
    id: string;
    nome: string;
    sobrenome?: string;
    avatar_url?: string;
    bio?: string;
    cidade?: string;
    estado?: string;
    bairro?: string;
    data_nascimento?: string;
    reputacao: number;
    interesses?: string[];
    created_at: string;
    last_seen_at?: string;
    aceita_entrega_domicilio: boolean;
    raio_entrega_km?: number;
    estatisticas: {
      total_itens: number;
      itens_ativos: number;
      itens_disponiveis: number;
      total_seguidores: number;
      total_seguindo: number;
      avaliacoes_recebidas: number;
      media_avaliacao: number;
      ultima_atividade?: string;
      membro_desde: string;
      distancia_km?: number;
    };
    itens_recentes: Array<{
      id: string;
      titulo: string;
      categoria: string;
      valor_girinhas: number;
      fotos: string[];
      status: string;
      created_at: string;
    }>;
    escola_comum: boolean;
    logistica: {
      entrega_disponivel: boolean;
      busca_disponivel: boolean;
    };
  };
}

interface RespostaAPI {
  success: boolean;
  page: number;
  limit: number;
  total_seguindo: number;
  data: MaeSeguida[];
  has_more: boolean;
  total_count: number;
}

const MaesSeguidas = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { deixarDeSeguir } = useSeguidores();

  const [seguindo, setSeguindo] = React.useState<MaeSeguida[]>([]);
  const [totalSeguindo, setTotalSeguindo] = React.useState(0);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [refreshing, setRefreshing] = React.useState(false);

  const [page, setPage] = React.useState(0);
  const [hasMore, setHasMore] = React.useState(true);
  const [loadingMore, setLoadingMore] = React.useState(false);

  const loadMoreRef = React.useRef<HTMLDivElement>(null);

  const carregarMaesSeguidas = React.useCallback(async (pageNum: number = 0, reset: boolean = false) => {
    if (!user?.id) return;

    try {
      if (pageNum === 0) setError(null);
      if (pageNum > 0) setLoadingMore(true);

      const { data, error } = await supabase
        .rpc('carregar_maes_seguidas_paginado', {
          p_user_id: user.id,
          p_page: pageNum,
          p_limit: 20
        });

      if (error) throw error;

      const resultado = data as unknown as RespostaAPI;

      if (resultado.success) {
        if (reset || pageNum === 0) {
          setSeguindo(resultado.data || []);
        } else {
          setSeguindo(prev => [...prev, ...(resultado.data || [])]);
        }

        setTotalSeguindo(resultado.total_seguindo || 0);
        setHasMore(resultado.has_more || false);
        setPage(pageNum);
      } else {
        throw new Error('Erro ao carregar dados');
      }
    } catch (err) {
      console.error('Erro ao carregar mães seguidas:', err);
      if (pageNum === 0) {
        setError(err instanceof Error ? err.message : 'Não foi possível carregar as mães seguidas');
      }
    } finally {
      if (pageNum > 0) setLoadingMore(false);
    }
  }, [user?.id]);

  React.useEffect(() => {
    const carregarDados = async () => {
      setLoading(true);
      await carregarMaesSeguidas(0, true);
      setLoading(false);
    };

    carregarDados();
  }, [carregarMaesSeguidas]);

  React.useEffect(() => {
    const element = loadMoreRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const target = entries[0];
        if (target.isIntersecting && hasMore && !loadingMore && !loading) {
          carregarMaesSeguidas(page + 1);
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(element);
    return () => observer.unobserve(element);
  }, [page, hasMore, loadingMore, loading, carregarMaesSeguidas]);

  const handleUnfollow = async (maeId: string) => {
    try {
      const sucesso = await deixarDeSeguir(maeId);
      if (sucesso) {
        setSeguindo(prev => prev.filter(mae => mae.profiles?.id !== maeId));
        setTotalSeguindo(prev => prev - 1);
      }
    } catch (err) {
      console.error('Erro ao deixar de seguir:', err);
    }
  };

  const handleViewProfile = (maeId: string) => {
    navigate(`/perfil/${maeId}`);
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    setPage(0);
    setHasMore(true);
    await carregarMaesSeguidas(0, true);
    setRefreshing(false);
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-25 to-blue-50 flex flex-col items-center justify-center">
        <Header />
        <main className="flex-grow flex items-center justify-center pt-32">
          <div className="premium-card bg-white/60 backdrop-blur-xl border-white/60 rounded-[3rem] p-12 shadow-2xl text-center space-y-8 max-w-md mx-4">
            <div className="w-20 h-20 bg-primary/10 rounded-[2rem] flex items-center justify-center text-primary mx-auto shadow-inner">
              <Users className="w-10 h-10" />
            </div>
            <div className="space-y-2">
              <h2 className="text-3xl font-black text-foreground tracking-tight">Espaço Restrito</h2>
              <p className="text-foreground/40 font-medium leading-relaxed">Você precisa estar logada para ver as mães que está seguindo.</p>
            </div>
            <Button onClick={() => navigate('/auth')} className="founders-button w-full h-14 text-white text-lg rounded-full">
              Fazer Login
            </Button>
          </div>
        </main>
        <QuickNav />
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-25 to-blue-50 flex flex-col items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-25 to-blue-50 font-sans">
        <Header />
        <main className="container mx-auto pt-32 px-4">
          <FriendlyError
            type="connection"
            title="Erro ao Carregar"
            message={error}
            onRetry={handleRefresh}
          />
        </main>
        <QuickNav />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-25 to-blue-50 font-sans">
      <SEOHead title={pageTitle.maesSeguidas()} />
      <Header />

      <main className="container mx-auto pt-32 pb-24 px-4 max-w-6xl">
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-foreground/40 font-bold text-xs uppercase tracking-widest hover:text-primary transition-colors group"
          >
            <ChevronLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
            Voltar
          </button>
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="w-10 h-10 bg-white/40 backdrop-blur-xl border border-white/60 rounded-full flex items-center justify-center text-primary shadow-sm hover:scale-110 active:scale-95 transition-all"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          </button>
        </div>

        <div className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-2">
            <h1 className="text-4xl md:text-5xl font-black text-foreground tracking-tight">
              Mães <span className="text-glow text-primary italic">Seguidas</span>
            </h1>
            <p className="text-foreground/40 font-bold uppercase tracking-widest text-[10px] mt-2">Sua rede de confiança e conexões</p>
          </div>

          <div className="flex items-center gap-4">
            <div className="px-6 py-3 bg-white/40 backdrop-blur-xl border border-white/60 rounded-full flex items-center gap-3 shadow-sm">
              <Heart className="w-4 h-4 text-primary fill-primary animate-pulse" />
              <span className="text-xs font-black text-foreground uppercase tracking-widest">
                Seguindo {totalSeguindo} Mães
              </span>
            </div>
          </div>
        </div>

        {seguindo.length === 0 ? (
          <div className="py-20 text-center space-y-8 animate-in fade-in zoom-in duration-700">
            <EmptyState
              type="search"
              title="Sua rede ainda está crescendo"
              description="Você ainda não segue nenhuma mãe. Explore o feed e siga perfis para montar sua rede de confiança!"
              actionLabel="Explorar Feed"
              onAction={() => navigate('/feed')}
            />
          </div>
        ) : (
          <div className="space-y-12">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {seguindo.map((item) => {
                const mae = item.profiles;
                if (!mae) return null;

                return (
                  <div key={mae.id} className="transition-transform duration-500 hover:scale-[1.03]">
                    <MaeSeguidaCard
                      mae={mae}
                      onUnfollow={handleUnfollow}
                      onViewProfile={handleViewProfile}
                    />
                  </div>
                );
              })}
            </div>

            {hasMore && (
              <div ref={loadMoreRef} className="flex justify-center items-center py-12">
                {loadingMore && (
                  <div className="flex items-center gap-3 text-primary font-black text-xs uppercase tracking-widest">
                    <Loader className="w-5 h-5 animate-spin" />
                    <span>Carregando mais conexões...</span>
                  </div>
                )}
              </div>
            )}

            {!hasMore && seguindo.length > 0 && (
              <div className="text-center py-12">
                <div className="inline-flex items-center gap-3 px-8 py-4 bg-white/40 backdrop-blur-xl border border-white/60 rounded-full text-foreground/40 text-[10px] font-black uppercase tracking-widest shadow-sm">
                  <Sparkles className="w-4 h-4 text-primary" />
                  Você chegou ao fim da sua rede de {totalSeguindo} mães
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      <QuickNav />
      <Footer />
    </div>
  );
};

export default MaesSeguidas;