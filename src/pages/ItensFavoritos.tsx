import React, { useState, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import Header from '@/components/shared/Header';
import QuickNav from '@/components/shared/QuickNav';
import Footer from '@/components/shared/Footer';
import ItemCardSkeleton from '@/components/loading/ItemCardSkeleton';
import EmptyState from '@/components/loading/EmptyState';
import { ItemCard } from '@/components/shared/ItemCard';
import { useAuth } from '@/hooks/useAuth';
import { useDebounce } from '@/hooks/useDebounce';
import { useTiposTamanho } from '@/hooks/useTamanhosPorCategoria';
import { useToast } from '@/hooks/use-toast';
import { useFeedInfinito } from '@/hooks/useFeedInfinito';
import { useInfiniteScroll } from '@/hooks/useInfiniteScroll';
import InfiniteScrollIndicator from '@/components/loading/InfiniteScrollIndicator';
import { supabase } from '@/integrations/supabase/client';
import { useConfigSistema } from '@/hooks/useConfigSistema';
import SEOHead from '@/components/seo/SEOHead';
import { pageTitle } from '@/lib/pageTitle';
import {
  ArrowLeft,
  Search,
  Filter,
  Heart,
  Sparkles,
  ChevronLeft
} from 'lucide-react';

const ItensFavoritos = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();

  // ✅ ESTADOS DE FILTROS IDÊNTICOS AO PERFIL
  const [busca, setBusca] = useState('');
  const [categoria, setCategoria] = useState('todas');
  const [subcategoria, setSubcategoria] = useState('todas');
  const [genero, setGenero] = useState('todos');
  const [tamanho, setTamanho] = useState('todos');
  const [precoRange, setPrecoRange] = useState([0, 200]);
  const [mostrarFiltrosAvancados, setMostrarFiltrosAvancados] = useState(false);
  const [mostrarReservados, setMostrarReservados] = useState(true);
  const [actionStates, setActionStates] = useState<Record<string, 'loading' | 'success' | 'error' | 'idle'>>({});

  // ✅ HOOKS IDÊNTICOS AO PERFIL
  const { tiposTamanho, isLoading: loadingTamanhos } = useTiposTamanho(categoria === 'todas' ? '' : categoria);
  const debouncedBusca = useDebounce(busca, 500);

  // ✅ HOOK DO FEED COM FILTRO DE FAVORITOS
  const {
    data: paginasFeed,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading: loadingFeed,
    refetch
  } = useFeedInfinito(user?.id || '', {
    busca: debouncedBusca,
    categoria: categoria === 'todas' ? undefined : categoria,
    subcategoria: subcategoria === 'todas' ? undefined : subcategoria,
    genero: genero === 'todos' ? undefined : genero,
    tamanho: tamanho === 'todos' ? undefined : tamanho,
    precoMin: precoRange[0],
    precoMax: precoRange[1],
    mostrarReservados
  });

  // ✅ EXTRAIR DADOS IDÊNTICO AO PERFIL
  const itens = useMemo(() => {
    return paginasFeed?.pages?.flatMap(page => page?.itens || []) || [];
  }, [paginasFeed]);

  // ✅ OBTER TAXA DO SISTEMA
  const { taxaTransacao } = useConfigSistema();

  // ✅ DADOS CONSOLIDADOS IDÊNTICOS AO PERFIL
  const feedData = useMemo(() => {
    const primeiraPagina = paginasFeed?.pages?.[0];
    return {
      favoritos: primeiraPagina?.favoritos || [],
      reservas_usuario: primeiraPagina?.reservas_usuario || [],
      filas_espera: primeiraPagina?.filas_espera || {},
      configuracoes: primeiraPagina?.configuracoes,
      profile_essencial: primeiraPagina?.profile_essencial,
      taxaTransacao: taxaTransacao
    };
  }, [paginasFeed, taxaTransacao]);

  const categorias = feedData.configuracoes?.categorias || [];
  const todasSubcategorias = feedData.configuracoes?.subcategorias || [];

  // ✅ LÓGICAS IDÊNTICAS AO PERFIL
  const getSubcategoriasFiltradas = () => {
    if (!Array.isArray(todasSubcategorias) || categoria === 'todas') return [];

    const filtradas = todasSubcategorias.filter(sub => sub.categoria_pai === categoria);
    const subcategoriasUnicas = filtradas.reduce((acc, sub) => {
      if (!acc.some(item => item.nome === sub.nome)) {
        acc.push(sub);
      }
      return acc;
    }, [] as typeof filtradas);

    return subcategoriasUnicas;
  };

  const getTamanhosDisponiveis = () => {
    if (!tiposTamanho || typeof tiposTamanho !== 'object') return [];

    const tipos = Object.keys(tiposTamanho);
    const tipoUnico = tipos[0];
    const tamanhos = tipoUnico ? (tiposTamanho[tipoUnico] || []) : [];

    const tamanhosUnicos = tamanhos.reduce((acc, tamanho) => {
      if (!acc.some(item => item.valor === tamanho.valor)) {
        acc.push(tamanho);
      }
      return acc;
    }, [] as typeof tamanhos);

    return tamanhosUnicos;
  };

  const subcategoriasFiltradas = getSubcategoriasFiltradas();
  const tamanhosDisponiveis = getTamanhosDisponiveis();

  // ✅ FILTRAR ITENS FAVORITOS
  const itensFiltrados = useMemo(() => {
    const itensFavoritos = itens.filter(item => feedData.favoritos.includes(item.id));
    return mostrarReservados
      ? itensFavoritos
      : itensFavoritos.filter(item => item.status === 'disponivel');
  }, [itens, feedData.favoritos, mostrarReservados]);

  // ✅ SCROLL INFINITO IDÊNTICO AO PERFIL
  const { ref: infiniteRef } = useInfiniteScroll({
    loading: isFetchingNextPage,
    hasNextPage: hasNextPage || false,
    onLoadMore: fetchNextPage,
    disabled: !hasNextPage,
    rootMargin: '100px',
  });

  const handleItemClick = useCallback((itemId: string) => {
    navigate(`/item/${itemId}`);
  }, [navigate]);

  // ✅ FUNÇÃO entrarNaFila IDÊNTICA AO PERFIL
  const entrarNaFila = async (itemId: string) => {
    if (!user) return;

    setActionStates(prev => ({ ...prev, [itemId]: 'loading' }));

    try {
      const { data, error } = await supabase
        .rpc('entrar_fila_espera', {
          p_item_id: itemId,
          p_usuario_id: user.id
        });

      if (error) {
        toast({
          title: "Erro ao reservar",
          description: error.message,
          variant: "destructive"
        });
        setActionStates(prev => ({ ...prev, [itemId]: 'error' }));
        return false;
      }

      const result = data as { tipo?: string; posicao?: number } | null;

      if (result?.tipo === 'reserva_direta') {
        toast({
          title: "Item reservado! 🎉",
          description: "As Girinhas foram bloqueadas. Use o código de confirmação na entrega."
        });
      } else if (result?.tipo === 'fila_espera') {
        toast({
          title: "Entrou na fila! 📝",
          description: `Você está na posição ${result.posicao} da fila. As Girinhas NÃO foram bloqueadas ainda.`
        });
      }

      setActionStates(prev => ({ ...prev, [itemId]: 'success' }));
      setTimeout(() => {
        setActionStates(prev => ({ ...prev, [itemId]: 'idle' }));
      }, 2000);

      await refetch();
      return true;
    } catch (err) {
      console.error('Erro ao entrar na fila:', err);
      toast({
        title: "Erro ao entrar na fila",
        description: err instanceof Error ? err.message : "Tente novamente.",
        variant: "destructive"
      });
      setActionStates(prev => ({ ...prev, [itemId]: 'error' }));
      setTimeout(() => {
        setActionStates(prev => ({ ...prev, [itemId]: 'idle' }));
      }, 2000);
      return false;
    }
  };

  // ✅ FUNÇÃO toggleFavorito IDÊNTICA AO PERFIL
  const toggleFavorito = async (itemId: string) => {
    if (!user) return;

    const isFavorito = feedData.favoritos.includes(itemId);

    try {
      if (isFavorito) {
        const { error } = await supabase
          .from('favoritos')
          .delete()
          .eq('user_id', user.id)
          .eq('item_id', itemId);

        if (error) throw error;

        toast({
          title: "Removido dos favoritos",
          description: "Item removido da sua lista de desejos.",
        });
      } else {
        const { error } = await supabase
          .from('favoritos')
          .insert({
            user_id: user.id,
            item_id: itemId
          });

        if (error) throw error;

        toast({
          title: "Adicionado aos favoritos! ❤️",
          description: "Item adicionado à sua lista de desejos.",
        });
      }

      await refetch();
    } catch (error) {
      console.error('Erro ao toggle favorito:', error);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar os favoritos.",
        variant: "destructive",
      });
    }
  };

  // ✅ HANDLERS IDÊNTICOS AO PERFIL
  const handleReservarItem = async (itemId: string) => {
    try {
      await entrarNaFila(itemId);
    } catch (error) {
      console.error('Erro ao reservar item:', error);
    }
  };

  const handleEntrarFila = async (itemId: string) => {
    try {
      await entrarNaFila(itemId);
    } catch (error) {
      console.error('Erro ao entrar na fila:', error);
    }
  };

  const handleToggleFavorito = async (itemId: string) => {
    try {
      await toggleFavorito(itemId);
    } catch (error) {
      console.error('Erro ao toggle favorito:', error);
    }
  };

  // ✅ HANDLERS DE FILTROS IDÊNTICOS AO PERFIL
  const handleAplicarFiltros = () => {
    refetch();
  };

  const handleLimparFiltros = () => {
    setBusca('');
    setCategoria('todas');
    setSubcategoria('todas');
    setGenero('todos');
    setTamanho('todos');
    setPrecoRange([0, 200]);
    setMostrarReservados(true);
    setMostrarFiltrosAvancados(false);
    refetch();
  };

  const toggleFiltrosAvancados = () => {
    setMostrarFiltrosAvancados(!mostrarFiltrosAvancados);
  };

  const handleCategoriaChange = (novaCategoria: string) => {
    setCategoria(novaCategoria);
    setSubcategoria('todas');
    setTamanho('todos');
  };

  const handleTamanhoChange = (valor: string) => {
    setTamanho(valor);
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-25 to-blue-50 flex flex-col items-center justify-center">
        <Header />
        <main className="flex-grow flex items-center justify-center pt-32">
          <div className="premium-card bg-white/60 backdrop-blur-xl border-white/60 rounded-[3rem] p-12 shadow-2xl text-center space-y-8 max-w-md mx-4">
            <div className="w-20 h-20 bg-primary/10 rounded-[2rem] flex items-center justify-center text-primary mx-auto shadow-inner">
              <Heart className="w-10 h-10" />
            </div>
            <div className="space-y-2">
              <h2 className="text-3xl font-black text-foreground tracking-tight">Espaço Restrito</h2>
              <p className="text-foreground/40 font-medium leading-relaxed">Você precisa estar logada para acessar sua lista de desejos e favoritos.</p>
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-25 to-blue-50 font-sans">
      <SEOHead title={pageTitle.favoritos()} />
      <Header />

      <main className="container mx-auto pt-32 pb-24 px-4 max-w-6xl">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-foreground/40 font-bold text-xs uppercase tracking-widest mb-8 hover:text-primary transition-colors group"
        >
          <ChevronLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
          Voltar
        </button>

        <div className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-2">
            <h1 className="text-4xl md:text-5xl font-black text-foreground tracking-tight">
              Meus <span className="text-glow text-primary italic">Favoritos</span>
            </h1>
            <p className="text-foreground/40 font-bold uppercase tracking-widest text-[10px] mt-2">Sua lista de desejos e oportunidades</p>
          </div>

          <div className="flex items-center gap-4">
            <div className="px-6 py-3 bg-white/40 backdrop-blur-xl border border-white/60 rounded-full flex items-center gap-3 shadow-sm">
              <Heart className="w-4 h-4 text-primary fill-primary" />
              <span className="text-xs font-black text-foreground uppercase tracking-widest">
                {itensFiltrados.length} {itensFiltrados.length === 1 ? 'Item' : 'Itens'}
              </span>
            </div>
          </div>
        </div>

        {/* ✅ FILTROS E BUSCA */}
        <div className="premium-card bg-white/60 backdrop-blur-xl border-white/60 rounded-[3rem] p-8 shadow-2xl mb-12">
          <div className="relative group">
            <Search className="absolute left-6 top-1/2 transform -translate-y-1/2 text-foreground/20 w-5 h-5 group-focus-within:text-primary transition-colors" />
            <Input
              type="text"
              placeholder="Busque nos seus favoritos..."
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              className="pl-16 pr-20 h-16 text-lg border-primary/5 focus:border-primary/20 focus:ring-primary/5 bg-white/40 rounded-3xl"
            />
            <button
              onClick={toggleFiltrosAvancados}
              className={`absolute right-4 top-1/2 transform -translate-y-1/2 w-10 h-10 flex items-center justify-center rounded-2xl transition-all ${mostrarFiltrosAvancados ? 'bg-primary text-white shadow-lg' : 'bg-primary/5 text-primary hover:bg-primary/10'}`}
            >
              <Filter className="w-5 h-5" />
            </button>
          </div>

          {/* ✅ FILTROS AVANÇADOS */}
          {mostrarFiltrosAvancados && (
            <div className="space-y-10 mt-10 pt-10 border-t border-primary/5 animate-in slide-in-from-top-4 duration-500">
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                <div className="space-y-4">
                  <Label className="text-[10px] font-black text-foreground/30 uppercase tracking-widest ml-1">Visibilidade</Label>
                  <div className="flex items-center justify-between p-4 bg-white/40 rounded-2xl border border-white/60">
                    <span className="text-sm font-bold text-foreground">Itens Reservados</span>
                    <Switch checked={mostrarReservados} onCheckedChange={setMostrarReservados} />
                  </div>
                </div>

                <div className="space-y-4">
                  <Label className="text-[10px] font-black text-foreground/30 uppercase tracking-widest ml-1">Categoria</Label>
                  <Select value={categoria} onValueChange={handleCategoriaChange}>
                    <SelectTrigger className="h-14 rounded-2xl bg-white/40 border-primary/5">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="rounded-2xl border-primary/10">
                      <SelectItem value="todas">Todas Categorias</SelectItem>
                      {categorias.map((cat) => (
                        <SelectItem key={cat.codigo} value={cat.codigo}>{cat.nome}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-4">
                  <Label className="text-[10px] font-black text-foreground/30 uppercase tracking-widest ml-1">Gênero</Label>
                  <Select value={genero} onValueChange={setGenero}>
                    <SelectTrigger className="h-14 rounded-2xl bg-white/40 border-primary/5">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="rounded-2xl border-primary/10">
                      <SelectItem value="todos">Todos Gêneros</SelectItem>
                      <SelectItem value="menino">Menino</SelectItem>
                      <SelectItem value="menina">Menina</SelectItem>
                      <SelectItem value="unissex">Unissex</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-4">
                  <Label className="text-[10px] font-black text-foreground/30 uppercase tracking-widest ml-1">Tamanho</Label>
                  <Select value={tamanho} onValueChange={handleTamanhoChange} disabled={categoria === 'todas' || loadingTamanhos}>
                    <SelectTrigger className="h-14 rounded-2xl bg-white/40 border-primary/5">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="rounded-2xl border-primary/10">
                      <SelectItem value="todos">Todos Tamanhos</SelectItem>
                      {tamanhosDisponiveis.map((tam) => (
                        <SelectItem key={tam.id} value={tam.valor}>{tam.label_display}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-4 max-w-xl">
                <div className="flex justify-between items-center mb-2">
                  <Label className="text-[10px] font-black text-foreground/30 uppercase tracking-widest ml-1">Faixa de Preço</Label>
                  <span className="text-xs font-black text-primary">{precoRange[0]} — {precoRange[1]} G$</span>
                </div>
                <Slider
                  value={precoRange}
                  onValueChange={setPrecoRange}
                  max={200}
                  min={0}
                  step={5}
                  className="py-4"
                />
              </div>

              <div className="flex gap-4 pt-4">
                <Button onClick={handleLimparFiltros} variant="ghost" className="h-14 px-8 rounded-full text-[10px] font-black uppercase tracking-widest text-foreground/40 hover:bg-foreground/5">Limpar Filtros</Button>
                <Button onClick={handleAplicarFiltros} className="founders-button h-14 px-10 text-white rounded-full">Aplicar Filtros</Button>
              </div>
            </div>
          )}
        </div>

        {/* ✅ FEED DE FAVORITOS */}
        {loadingFeed && itensFiltrados.length === 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {Array.from({ length: 8 }).map((_, i) => (
              <ItemCardSkeleton key={i} />
            ))}
          </div>
        ) : itensFiltrados.length === 0 ? (
          <div className="py-20 text-center space-y-8 animate-in fade-in zoom-in duration-700">
            <EmptyState
              type="favoritos"
              title="Sua lista de desejos está vazia"
              description={!mostrarReservados ? "Tente incluir itens reservados ou ajustar os filtros." : "Explore o feed e salve os itens que você mais gostou clicando no coração."}
              actionLabel="Voltar para o Feed"
              onAction={() => navigate('/feed')}
            />
          </div>
        ) : (
          <div className="space-y-12">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {itensFiltrados.map((item) => (
                <div key={item.id} className="transition-transform duration-500 hover:scale-[1.03]">
                  <ItemCard
                    item={item}
                    feedData={feedData}
                    currentUserId={user?.id || ''}
                    taxaTransacao={feedData.taxaTransacao}
                    onItemClick={handleItemClick}
                    showActions={true}
                    onToggleFavorito={() => handleToggleFavorito(item.id)}
                    onReservar={() => handleReservarItem(item.id)}
                    onEntrarFila={() => handleEntrarFila(item.id)}
                    actionState={actionStates[item.id]}
                  />
                </div>
              ))}
            </div>

            {hasNextPage && (
              <div ref={infiniteRef} className="pt-12">
                <InfiniteScrollIndicator
                  isFetchingNextPage={isFetchingNextPage}
                  hasNextPage={hasNextPage || false}
                  itemsCount={itensFiltrados.length}
                  isInitialLoading={loadingFeed}
                />
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

export default ItensFavoritos;
