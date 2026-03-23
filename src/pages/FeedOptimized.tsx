import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { Plus, MapPin, Search, Filter, Truck, Car } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import Header from '@/components/shared/Header';
import QuickNav from '@/components/shared/QuickNav';
import LoadingSpinner from '@/components/loading/LoadingSpinner';
import ItemCardSkeleton from '@/components/loading/ItemCardSkeleton';
import EmptyState from '@/components/loading/EmptyState';
import { ItemCard } from '@/components/shared/ItemCard';
import { useAuth } from '@/hooks/useAuth';
import { useDebounce } from '@/hooks/useDebounce';
import { useSimpleGeolocation } from '@/hooks/useSimpleGeolocation';
import { useTiposTamanho } from '@/hooks/useTamanhosPorCategoria';
import { useToast } from '@/hooks/use-toast';
import { useFeedInfinito } from '@/hooks/useFeedInfinito';
import { useInfiniteScroll } from '@/hooks/useInfiniteScroll';
import InfiniteScrollIndicator from '@/components/loading/InfiniteScrollIndicator';
import { supabase } from '@/integrations/supabase/client';
import { useConfigSistema } from '@/hooks/useConfigSistema';
import { analytics } from '@/lib/analytics';
import SEOHead from '@/components/seo/SEOHead';
import { pageTitle } from '@/lib/pageTitle';
import { useTourTrigger } from '@/modules/onboarding';
import { Badge } from '@/components/ui/badge';
import { useCarteira } from '@/hooks/useCarteira';
import { cn } from '@/lib/utils';

const FeedOptimized = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const { verificarSaldo, saldo } = useCarteira();
  const queryClient = useQueryClient();

  // ✅ ANALYTICS: Rastrear visualização do feed
  useEffect(() => {
    analytics.feed.view();
  }, []);

  // ✅ TOUR: Dispara automaticamente na primeira visita
  useTourTrigger('feed-tour', {
    condition: 'first-visit',
    delay: 1500
  });

  // ✅ Estados de filtros (incluindo novo filtro de logística)
  const [busca, setBusca] = useState('');
  const [cidadeManual, setCidadeManual] = useState('');
  const [categoria, setCategoria] = useState('todas');
  const [subcategoria, setSubcategoria] = useState('todas');
  const [genero, setGenero] = useState('todos');
  const [tamanho, setTamanho] = useState('todos');
  const [precoRange, setPrecoRange] = useState([0, 200]);
  const [modalidadeLogistica, setModalidadeLogistica] = useState<'todas' | 'entrega' | 'busca'>('todas');
  const [mostrarFiltrosAvancados, setMostrarFiltrosAvancados] = useState(false);
  const [filtrosAplicados, setFiltrosAplicados] = useState(true);
  const [mostrarReservados, setMostrarReservados] = useState(true);
  const [actionStates, setActionStates] = useState<Record<string, 'loading' | 'success' | 'error' | 'idle'>>({});

  // ✅ Hooks essenciais mantidos
  const { location, loading: geoLoading, error: geoError, detectarLocalizacao, limparLocalizacao } = useSimpleGeolocation();
  const { tiposTamanho, isLoading: loadingTamanhos } = useTiposTamanho(categoria === 'todas' ? '' : categoria);
  const debouncedBusca = useDebounce(busca, 500);

  // ✅ Função para calcular location de forma segura
  const getLocationForSearch = () => {
    if (location) return location;

    if (cidadeManual) {
      return {
        cidade: cidadeManual,
        estado: '',
        bairro: undefined
      };
    }

    return { cidade: '', estado: '', bairro: undefined };
  };

  const locationForSearch = getLocationForSearch();

  // ✅ Objeto com todos os filtros consolidado (incluindo modalidade logística)
  const filtrosCompletos = useMemo(() => ({
    busca: debouncedBusca,
    cidade: locationForSearch.cidade || cidadeManual,
    categoria: categoria === 'todas' ? undefined : categoria,
    subcategoria: subcategoria === 'todas' ? undefined : subcategoria,
    genero: genero === 'todos' ? undefined : genero,
    tamanho: tamanho === 'todos' ? undefined : tamanho,
    precoMin: precoRange[0],
    precoMax: precoRange[1],
    mostrarReservados,
    modalidadeLogistica,
    itemId: undefined
  }), [debouncedBusca, locationForSearch.cidade, cidadeManual, categoria, subcategoria, genero, tamanho, precoRange, mostrarReservados, modalidadeLogistica]);

  // ✅ Hook consolidado com TODOS os dados
  const {
    data: paginasFeed,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading: loadingFeed,
    refetch
  } = useFeedInfinito(user?.id || '', filtrosCompletos);

  // ✅ Extrair TODOS os dados das páginas
  const itens = useMemo(() => {
    return paginasFeed?.pages?.flatMap(page => page?.itens || []) || [];
  }, [paginasFeed]);

  // ✅ OBTER TAXA DO SISTEMA
  const { taxaTransacao } = useConfigSistema();

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

  // ✅ Lógica de subcategorias filtradas
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

    // 1. CORREÇÃO: Juntar TODOS os arrays de tamanhos em um só,
    // usando flatMap, em vez de pegar apenas o primeiro.
    const todosTamanhos = tipos.flatMap(tipo => tiposTamanho[tipo] || []);

    // 2. CORREÇÃO: Deduzir usando 'label_display' (que é único)
    // em vez de 'valor' (que é repetido).
    const tamanhosUnicos = todosTamanhos.reduce((acc, tamanho) => {
      if (!acc.some(item => item.label_display === tamanho.label_display)) {
        acc.push(tamanho);
      }
      return acc;
    }, [] as typeof todosTamanhos);

    return tamanhosUnicos;
  };

  const subcategoriasFiltradas = getSubcategoriasFiltradas();
  const tamanhosDisponiveis = getTamanhosDisponiveis();

  // ✅ Filtrar itens baseado na opção de mostrar reservados
  const itensFiltrados = mostrarReservados
    ? itens
    : itens.filter(item => item.status === 'disponivel');

  // ✅ Scroll infinito
  const { ref: infiniteRef } = useInfiniteScroll({
    loading: isFetchingNextPage,
    hasNextPage: hasNextPage || false,
    onLoadMore: fetchNextPage,
    disabled: !hasNextPage,
    rootMargin: '100px',
  });

  const handleItemClick = useCallback((itemId: string, position?: number) => {
    // ✅ ANALYTICS: Clique em item do feed
    analytics.feed.itemClick(itemId, position || 0);

    navigate(`/item/${itemId}`);
  }, [navigate]);

  // ✅ FUNÇÃO entrarNaFila usando RPC direto
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
      queryClient.invalidateQueries({ queryKey: ['carteira'] });
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

  // ✅ FUNÇÃO toggleFavorito usando RPC direto
  const toggleFavorito = async (itemId: string) => {
    if (!user) return;

    const isFavorito = feedData.favoritos.includes(itemId);

    try {
      if (isFavorito) {
        // ✅ ANALYTICS: Remover dos favoritos
        analytics.items.removeFromFavorites(itemId);

        // Remover favorito
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
        // ✅ ANALYTICS: Adicionar aos favoritos
        analytics.items.addToFavorites(itemId);

        // Adicionar favorito
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

      // Atualizar dados
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

  // Handlers para ações dos itens
  const handleReservarItem = async (itemId: string) => {
    const item = itens.find(i => i.id === itemId);
    if (!item) return;

    if (!verificarSaldo(item.valor_girinhas)) {
      toast({
        title: "Saldo insuficiente",
        description: `Você precisa de pelo menos ${item.valor_girinhas} G$ para reservar este item. Seu saldo atual: ${saldo} G$`,
        variant: "destructive",
      });
      return;
    }

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

  const handleAplicarFiltros = () => {
    setFiltrosAplicados(true);
    refetch();
  };

  const handleLimparFiltros = () => {
    setBusca('');
    setCidadeManual('');
    setCategoria('todas');
    setSubcategoria('todas');
    setGenero('todos');
    setTamanho('todos');
    setPrecoRange([0, 200]);
    setModalidadeLogistica('todas');
    setMostrarReservados(true);
    limparLocalizacao();
    setMostrarFiltrosAvancados(false);
    refetch();
  };

  const handleLocationClick = () => {
    if (location) {
      limparLocalizacao();
    } else {
      detectarLocalizacao();
    }
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

  const getLocationText = () => {
    if (locationForSearch && locationForSearch.cidade) {
      return `em ${locationForSearch.cidade}`;
    }
    return 'próximos';
  };

  // ✅ Função para obter texto do filtro de logística ativo
  const getLogisticaFilterText = () => {
    switch (modalidadeLogistica) {
      case 'entrega': return ' com entrega';
      case 'busca': return ' que posso buscar';
      default: return '';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-25 to-blue-50 pb-32">
      <Header />
      <SEOHead title={pageTitle.feed()} description="Explore os melhores desapegos próximos a você no GiraMãe." />

      <main className="container mx-auto mt-20 px-4 py-8">
        <div className="max-w-6xl mx-auto space-y-8">
          <div className="text-center space-y-4 mb-8 animate-in fade-in slide-in-from-bottom-4 duration-1000">
            <div className="flex justify-center mb-2">
              <Badge variant="outline" className="px-5 py-1.5 rounded-full border-primary/20 text-primary font-bold tracking-[0.2em] uppercase text-[10px] bg-white/60 backdrop-blur-md">
                Garimpo Consciente & Circular
              </Badge>
            </div>
            <h1 className="text-4xl md:text-6xl font-black tracking-tight text-foreground leading-none">
              Feed de <span className="text-glow text-primary italic">Oportunidades</span>
            </h1>
            <p className="text-foreground/40 font-medium text-lg max-w-2xl mx-auto leading-relaxed mt-2">
              Dê uma nova história para peças cheias de amor e <span className="text-primary italic">economize com inteligência</span>.
            </p>
          </div>

          {/* ✅ FILTROS E BUSCA */}
          <div data-tour="filters-panel" className="p-4 md:p-3 mb-12 bg-white/50 backdrop-blur-xl border border-white/80 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)] rounded-[3rem] relative overflow-hidden group" style={{ marginTop: "-1rem" }}>
            {/* Campo de busca com ícone de filtro */}
            <div className="relative mb-0 flex flex-col md:flex-row gap-4">
              <div className="relative flex-1 group/search">
                <div className="absolute inset-0 bg-white/60 rounded-[1.5rem] shadow-inner pointer-events-none" />
                <Search className="absolute left-6 top-1/2 transform -translate-y-1/2 text-primary/40 w-5 h-5 transition-all duration-500 group-focus-within/search:text-primary group-focus-within/search:scale-110 z-10" />
                <Input
                  data-tour="search-input"
                  type="text"
                  placeholder="Busque por vestido, carrinho, lego..."
                  value={busca}
                  onChange={(e) => setBusca(e.target.value)}
                  className="pl-14 pr-6 h-14 text-base border-white/40 focus:border-primary/30 focus:ring-primary/20 rounded-[1.5rem] bg-transparent relative z-10 transition-all placeholder:text-foreground/30 font-medium"
                />
              </div>
              <Button
                data-tour="expand-filters"
                onClick={toggleFiltrosAvancados}
                variant="outline"
                className={cn(
                  "h-14 px-8 rounded-[1.5rem] border-white/40 transition-all duration-500 flex items-center justify-center gap-3 group/filter overflow-hidden relative font-black text-[11px] uppercase tracking-[0.2em]",
                  mostrarFiltrosAvancados ? "bg-primary text-white border-primary shadow-2xl shadow-primary/20" : "bg-white/80 text-foreground/60 hover:bg-primary/5 backdrop-blur-md hover:text-primary"
                )}
              >
                <Filter className={cn("w-4 h-4 transition-transform duration-500", mostrarFiltrosAvancados ? "rotate-180" : "group-hover/filter:rotate-12")} />
                <span>Filtros Avançados</span>
                {mostrarFiltrosAvancados && <div className="absolute inset-0 bg-white/10 animate-pulse" />}
              </Button>
            </div>

            {/* Filtros Avançados */}
            {mostrarFiltrosAvancados && (
              <div className="space-y-10 border-t border-primary/5 pt-10 mt-8 animate-in slide-in-from-top-4 duration-700 ease-out z-20 relative bg-white rounded-[2rem] p-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                  {/* Seção Opções e Localização */}
                  <div className="space-y-8">
                    <div className="space-y-4">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                        <h3 className="text-[10px] font-black text-foreground/40 uppercase tracking-[0.2em]">Visualização Inteligente</h3>
                      </div>
                      <div className="flex items-center justify-between bg-primary/[0.02] border border-primary/5 p-5 rounded-[2rem] transition-all hover:bg-primary/[0.04]">
                        <div className="space-y-0.5">
                          <Label htmlFor="mostrar-reservados" className="text-sm font-bold text-foreground/70">
                            Mostrar itens reservados
                          </Label>
                          <p className="text-[10px] text-foreground/30 font-medium font-sans">Inclua peças que já estão em processo de troca</p>
                        </div>
                        <Switch
                          id="mostrar-reservados"
                          checked={mostrarReservados}
                          onCheckedChange={setMostrarReservados}
                        />
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                        <h3 className="text-[10px] font-black text-foreground/40 uppercase tracking-[0.2em]">Sua Região</h3>
                      </div>
                      <div className="space-y-3">
                        <div className="relative group/location">
                          <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-primary/40 group-focus-within/location:text-primary transition-colors" />
                          <Input
                            type="text"
                            placeholder="Digite sua cidade..."
                            value={cidadeManual}
                            onChange={(e) => setCidadeManual(e.target.value)}
                            className="w-full h-12 pl-12 border-primary/5 focus:border-primary/20 focus:ring-primary/5 rounded-xl bg-white/50 text-base transition-all font-medium font-sans"
                          />
                        </div>

                        <Button
                          onClick={handleLocationClick}
                          disabled={geoLoading}
                          variant="ghost"
                          className="w-full h-12 flex items-center justify-center border border-dashed border-primary/20 rounded-xl hover:bg-primary/5 transition-all group/geo"
                        >
                          <div className={cn("w-2 h-2 rounded-full mr-3 animate-pulse bg-primary", !location && "opacity-0")} />
                          <span className="text-sm font-bold text-foreground/60 group-hover/geo:text-primary transition-colors font-sans">
                            {geoLoading ? 'Detectando localização...' :
                              location ? `📍 Itens em ${location.cidade}` :
                                'Detectar Localização Automática'}
                          </span>
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* Modalidade de Entrega */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                      <h3 className="text-[10px] font-black text-foreground/40 uppercase tracking-[0.2em]">Logística de Encontro</h3>
                    </div>
                    <div className="grid grid-cols-1 gap-2 bg-primary/[0.02] border border-primary/5 p-4 rounded-[2rem]">
                      {[
                        { id: 'todas', label: 'Todas as opções', icon: '🔄', desc: 'Ver tudo que está disponível' },
                        { id: 'entrega', label: 'Só com entrega grátis', icon: <Truck className="w-4 h-4" />, desc: 'Vendedoras que entregam' },
                        { id: 'busca', label: 'Posso buscar', icon: <Car className="w-4 h-4" />, desc: 'Retirada no local' }
                      ].map((opt) => (
                        <label
                          key={opt.id}
                          className={cn(
                            "flex items-center justify-between cursor-pointer p-4 rounded-2xl transition-all duration-300",
                            modalidadeLogistica === opt.id ? "bg-white shadow-xl shadow-primary/5 border border-primary/10 scale-[1.02] z-10" : "hover:bg-primary/5 border border-transparent"
                          )}>
                          <div className="flex items-center gap-4">
                            <div className={cn(
                              "w-10 h-10 rounded-xl flex items-center justify-center transition-all",
                              modalidadeLogistica === opt.id ? "bg-primary text-white" : "bg-white/50 text-primary/40"
                            )}>
                              {typeof opt.icon === 'string' ? <span className="text-lg">{opt.icon}</span> : opt.icon}
                            </div>
                            <div className="flex flex-col">
                              <span className="text-sm font-bold text-foreground/80 font-sans">{opt.label}</span>
                              <span className="text-[10px] text-foreground/30 font-medium uppercase tracking-wider font-sans">{opt.desc}</span>
                            </div>
                          </div>
                          <input
                            type="radio"
                            name="modalidade"
                            value={opt.id}
                            checked={modalidadeLogistica === opt.id}
                            onChange={(e) => setModalidadeLogistica(e.target.value as any)}
                            className="w-4 h-4 accent-primary"
                          />
                        </label>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Grid de Categorias/Tamanhos */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 pt-4">
                  {[
                    { label: 'CATEGORIA', value: categoria, onChange: handleCategoriaChange, options: categorias, type: 'select' },
                    { label: 'SUBCATEGORIA', value: subcategoria, onChange: setSubcategoria, options: subcategoriasFiltradas, disabled: categoria === 'todas', type: 'select_sub' },
                    {
                      label: 'GÊNERO', value: genero, onChange: setGenero, options: [
                        { id: 'todos', nome: 'Todos' },
                        { id: 'menino', nome: 'Menino', icon: '👦' },
                        { id: 'menina', nome: 'Menina', icon: '👧' },
                        { id: 'unissex', nome: 'Unissex', icon: '👶' }
                      ], type: 'select_simple'
                    },
                    {
                      label: categoria === 'calcados' ? 'NÚMERO' : categoria === 'brinquedos' ? 'IDADE' : categoria === 'livros' ? 'FAIXA ETÁRIA' : 'TAMANHO',
                      value: tamanho, onChange: handleTamanhoChange, options: tamanhosDisponiveis, disabled: categoria === 'todas' || loadingTamanhos, type: 'select_tamanho'
                    }
                  ].map((field, idx) => (
                    <div key={idx} className="space-y-3">
                      <h3 className="text-[10px] font-black text-foreground/40 uppercase tracking-[0.2em] ml-1">{field.label}</h3>
                      <Select value={field.value} onValueChange={field.onChange} disabled={field.disabled}>
                        <SelectTrigger className="h-12 border-primary/5 focus:border-primary/20 focus:ring-primary/5 rounded-xl bg-white/50 text-sm font-bold transition-all font-sans">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-white/95 backdrop-blur-xl border-primary/10 rounded-2xl shadow-2xl max-h-80">
                          {field.type === 'select' && (
                            <>
                              <SelectItem value="todas">Todas</SelectItem>
                              {field.options.map((cat: any) => (
                                <SelectItem key={cat.codigo} value={cat.codigo}>
                                  <span className="flex items-center gap-3">
                                    <span className="text-xl opacity-60">{cat.icone}</span>
                                    <span className="font-bold">{cat.nome}</span>
                                  </span>
                                </SelectItem>
                              ))}
                            </>
                          )}
                          {field.type === 'select_sub' && (
                            <>
                              <SelectItem value="todas">Todas</SelectItem>
                              {field.options.map((sub: any) => (
                                <SelectItem key={sub.id} value={sub.nome}>
                                  <span className="flex items-center gap-3">
                                    <span className="text-xl opacity-60">{sub.icone}</span>
                                    <span className="font-bold">{sub.nome}</span>
                                  </span>
                                </SelectItem>
                              ))}
                            </>
                          )}
                          {field.type === 'select_simple' && (
                            field.options.map((opt: any) => (
                              <SelectItem key={opt.id} value={opt.id}>
                                <span className="flex items-center gap-3">
                                  {opt.icon && <span className="text-xl opacity-60">{opt.icon}</span>}
                                  <span className="font-bold">{opt.nome}</span>
                                </span>
                              </SelectItem>
                            ))
                          )}
                          {field.type === 'select_tamanho' && (
                            <>
                              <SelectItem value="todos">Todos</SelectItem>
                              {field.options.map((tam: any) => (
                                <SelectItem key={tam.id} value={tam.valor}>
                                  {tam.label_display}
                                </SelectItem>
                              ))}
                            </>
                          )}
                        </SelectContent>
                      </Select>
                    </div>
                  ))}
                </div>

                {/* Faixa de Preço e Ações */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 pt-8 items-end">
                  <div className="lg:col-span-12 xl:col-span-7 space-y-6">
                    <div className="flex items-center justify-between">
                      <h3 className="text-[10px] font-black text-foreground/40 uppercase tracking-[0.2em] ml-1">
                        Faixa de Preço (Girinhas)
                      </h3>
                      <div className="bg-primary/5 px-4 py-1.5 rounded-full border border-primary/10">
                        <span className="text-sm font-black text-primary italic uppercase tracking-wider font-sans">{precoRange[0]} - {precoRange[1]} G$</span>
                      </div>
                    </div>
                    <div className="px-2">
                      <Slider
                        value={precoRange}
                        onValueChange={setPrecoRange}
                        max={200}
                        min={0}
                        step={5}
                        className="w-full"
                      />
                    </div>
                  </div>

                  <div className="lg:col-span-12 xl:col-span-5 flex gap-4">
                    <Button
                      onClick={handleLimparFiltros}
                      variant="ghost"
                      className="flex-1 h-14 text-[10px] font-black text-foreground/40 uppercase tracking-[0.3em] hover:text-primary transition-all hover:bg-primary/5 rounded-2xl"
                    >
                      Limpar Filtros
                    </Button>
                    <Button
                      onClick={handleAplicarFiltros}
                      className="founders-button flex-[1.5] h-14 text-white font-black uppercase text-xs tracking-[0.2em] rounded-2xl shadow-xl shadow-primary/20"
                    >
                      Aplicar Filtros
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Loading state */}
        {loadingFeed && itensFiltrados.length === 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {Array.from({ length: 10 }).map((_, i) => (
              <ItemCardSkeleton key={i} />
            ))}
          </div>
        )}

        {/* Empty state */}
        {!loadingFeed && itensFiltrados.length === 0 && (
          <EmptyState
            type="search"
            title={locationForSearch?.cidade ?
              `Nenhum item encontrado em ${locationForSearch.cidade}${getLogisticaFilterText()}` :
              `Nenhum item encontrado${getLogisticaFilterText()}`
            }
            description={
              !mostrarReservados
                ? "Tente incluir itens reservados ou ajustar os filtros"
                : modalidadeLogistica !== 'todas'
                  ? "Tente mudar a modalidade de entrega ou ajustar outros filtros"
                  : "Tente ajustar os filtros para ver mais opções"
            }
            actionLabel="Limpar filtros"
            onAction={handleLimparFiltros}
          />
        )}

        {/* Grid de itens */}
        {itensFiltrados.length > 0 && (
          <>
            <div className="mb-4 text-sm text-gray-600 flex items-center justify-between">
              <span>
                {locationForSearch && locationForSearch.cidade && ` em ${locationForSearch.cidade}`}
                {getLogisticaFilterText()}
              </span>

              {/* ✅ Indicador visual do filtro ativo */}
              {modalidadeLogistica !== 'todas' && (
                <div className="flex items-center gap-2 text-xs text-primary bg-primary/10 px-2 py-1 rounded-full">
                  {modalidadeLogistica === 'entrega' ? (
                    <><Truck className="w-3 h-3" /> Só com entrega</>
                  ) : (
                    <><Car className="w-3 h-3" /> Posso buscar</>
                  )}
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {itensFiltrados.map((item) => (
                <ItemCard
                  key={item.id}
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
              ))}
            </div>
          </>
        )}

        {/* Scroll infinito e loading */}
        <div ref={infiniteRef}>
          <InfiniteScrollIndicator
            isFetchingNextPage={isFetchingNextPage}
            hasNextPage={hasNextPage || false}
            itemsCount={itens.length}
            isInitialLoading={loadingFeed}
            onCreateItem={() => navigate('/publicar')}
          />
        </div>
      </main>

      <QuickNav />
    </div>
  );
};

export default FeedOptimized;