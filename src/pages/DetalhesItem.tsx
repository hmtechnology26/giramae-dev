import React, { useState, useMemo, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { analytics } from '@/lib/analytics';
import SEOHead from '@/components/seo/SEOHead';
import { pageTitle } from '@/lib/pageTitle';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Skeleton } from "@/components/ui/skeleton"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/hooks/useAuth";
import { supabase } from '@/integrations/supabase/client';
import FriendlyError from '@/components/error/FriendlyError';
import { useReservas } from '@/hooks/useReservas';
import { useBonificacoes } from '@/hooks/useBonificacoes';
import { useCarteira } from '@/hooks/useCarteira';
import { buildAvatarUrl, buildItemImageUrl } from '@/lib/cdn';
import { ChevronLeft, ShieldCheck, MapPin, AlertCircle, MessageCircle, Heart, Star, ShoppingBag, Clock, Tag } from 'lucide-react';
import Header from '@/components/shared/Header';
import Footer from '@/components/shared/Footer';
import QuickNav from '@/components/shared/QuickNav';
import LoadingSpinner from '@/components/loading/LoadingSpinner';
import { cn } from "@/lib/utils";

interface ItemFeed {
  id: string;
  titulo: string;
  descricao: string;
  categoria: string;
  subcategoria?: string;
  estado_conservacao: string;
  fotos: string[];
  valor_girinhas: number;
  status: string;
  publicado_por: string;
  created_at: string;
  updated_at: string;
  publicado_por_profile: {
    nome: string;
    avatar_url?: string;
    reputacao?: number;
    whatsapp?: string;
  };
  vendedor_bairro?: string;
  vendedor_cidade?: string;
  vendedor_estado?: string;
  vendedor_cep?: string;
  genero?: string;
  tamanho_categoria?: string;
  tamanho_valor?: string;
}

const DetalhesItem = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const { criarReserva, cancelarReserva, isItemReservado, reservas } = useReservas();
  const { processarBonusTrocaConcluida } = useBonificacoes();
  const { verificarSaldo, saldo } = useCarteira();
  const queryClient = useQueryClient();
  const [denunciaDialogOpen, setDenunciaDialogOpen] = useState(false);
  const [motivoDenuncia, setMotivoDenuncia] = useState('');
  const [selectedPhoto, setSelectedPhoto] = useState(0);

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['item', id],
    queryFn: async () => {
      if (!id) throw new Error('ID do item não fornecido');

      const { data, error } = await supabase
        .from('itens')
        .select(`
          *,
          profiles!publicado_por(nome, avatar_url, telefone, cidade, estado, bairro, reputacao)
        `)
        .eq('id', id)
        .single();

      if (error) throw error;
      return data;
    },
  });

  const item = useMemo(() => {
    if (!data) return null;

    return {
      id: data.id || '',
      titulo: data.titulo || '',
      descricao: data.descricao || '',
      categoria: data.categoria || '',
      subcategoria: data.subcategoria || '',
      genero: data.genero || '',
      tamanho_categoria: data.tamanho_categoria || '',
      tamanho_valor: data.tamanho_valor || '',
      estado_conservacao: data.estado_conservacao || '',
      fotos: data.fotos || [],
      valor_girinhas: data.valor_girinhas || 0,
      status: data.status || '',
      publicado_por: data.publicado_por || '',
      created_at: data.created_at || '',
      updated_at: data.updated_at || '',
      publicado_por_profile: {
        nome: data.profiles?.nome || '',
        avatar_url: data.profiles?.avatar_url || '',
        reputacao: data.profiles?.reputacao || 0,
        whatsapp: data.profiles?.telefone || ''
      },
      vendedor_bairro: data.profiles?.bairro || '',
      vendedor_cidade: data.profiles?.cidade || '',
      vendedor_estado: data.profiles?.estado || '',
      vendedor_cep: '',
    };
  }, [data]);

  // ✅ ANALYTICS: Visualização do item
  useEffect(() => {
    if (item) {
      analytics.items.view(
        item.id,
        item.titulo,
        item.categoria,
        item.valor_girinhas
      );
    }
  }, [item]);

  const handleReservarItem = async () => {
    if (!id || !item) return;

    if (!verificarSaldo(item.valor_girinhas)) {
      toast({
        title: "Saldo insuficiente",
        description: `Você precisa de pelo menos ${item.valor_girinhas} G$ para reservar este item. Seu saldo atual: ${saldo} G$`,
        variant: "destructive",
      });
      return;
    }

    analytics.items.reserve(item.id, item.valor_girinhas);

    try {
      await criarReserva(id);
      analytics.items.exchangeComplete(id, item.id, item.valor_girinhas);
      toast({
        title: "Item reservado! 🎉",
        description: "O vendedor foi notificado da sua reserva.",
      });
      refetch();
      queryClient.invalidateQueries({ queryKey: ['carteira'] });
    } catch (error: any) {
      toast({
        title: "Erro ao reservar item",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleCancelarReserva = async () => {
    if (!id || !user) return;

    const reserva = reservas.find(r => r.item_id === id && r.usuario_reservou === user.id && r.status === 'pendente');
    
    if (!reserva) {
      toast({
        title: "Erro",
        description: "Reserva não encontrada.",
        variant: "destructive",
      });
      return;
    }

    try {
      await cancelarReserva(reserva.id);
      toast({
        title: "Reserva cancelada",
        description: "A reserva foi cancelada e o valor foi reembolsado para sua carteira.",
      });
      refetch();
      queryClient.invalidateQueries({ queryKey: ['carteira'] });
    } catch (error: any) {
      toast({
        title: "Erro ao cancelar reserva",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleReportarItem = async () => {
    if (!id || !motivoDenuncia.trim()) return;

    try {
      toast({
        title: "Obrigado pelo feedback",
        description: "Sua denúncia foi registrada e será analisada.",
      });
      setDenunciaDialogOpen(false);
      setMotivoDenuncia('');
    } catch (error: any) {
      toast({
        title: "Erro ao reportar item",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleTrocarMensagens = async () => {
    if (!item?.publicado_por_profile?.whatsapp) {
      toast({
        title: "Vendedor sem WhatsApp",
        description: "Este vendedor não possui WhatsApp cadastrado.",
        variant: "destructive",
      });
      return;
    }

    const numeroWhatsApp = item.publicado_por_profile.whatsapp.replace(/\D/g, '');
    const mensagemPadrao = `Olá! Eu reservei o item "${item.titulo}" no GiraMãe. Gostaria de combinar a entrega. Qual o melhor horário e local?`;
    const linkWhatsApp = `https://wa.me/55${numeroWhatsApp}?text=${encodeURIComponent(mensagemPadrao)}`;
    window.open(linkWhatsApp, '_blank');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-25 to-blue-50 flex flex-col items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (error || !item) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-25 to-blue-50 pt-32 px-6">
        <FriendlyError
          title={error ? "Erro ao carregar item" : "Item não encontrado"}
          message={error ? "Não foi possível carregar os detalhes do item." : "O item não foi encontrado ou não está mais disponível."}
          onRetry={() => error ? window.location.reload() : navigate('/feed')}
        />
      </div>
    );
  }

  const isOwner = user?.id === item.publicado_por;
  const isItemAvailable = item.status === 'disponivel';
  const isItemReserved = item.status === 'reservado';
  
  const usuarioJaReservou = isItemReservado(id || '');
  const hasActiveReservation = usuarioJaReservou;

  const isUserWhoReserved = isItemReserved && usuarioJaReservou;

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-25 to-blue-50 font-sans">
      <SEOHead title={pageTitle.item(item.titulo)} description={item.descricao} />
      <Header />

      <main className="container mx-auto pt-32 pb-24 px-4">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-foreground/40 font-bold text-xs uppercase tracking-widest mb-8 hover:text-primary transition-colors group"
        >
          <ChevronLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
          Voltar ao Feed
        </button>

        <div className="grid lg:grid-cols-12 gap-10">
          {/* Galeria de Fotos */}
          <div className="lg:col-span-7 space-y-6">
            <div className="premium-card bg-white/40 backdrop-blur-xl border-white/60 rounded-[3rem] p-4 shadow-2xl relative overflow-hidden aspect-square flex items-center justify-center">
              {item.fotos && item.fotos.length > 0 ? (
                <img
                  src={buildItemImageUrl(item.fotos[selectedPhoto])}
                  alt={item.titulo}
                  className="max-h-full max-w-full object-contain rounded-[2.5rem] transition-all duration-700 hover:scale-105"
                />
              ) : (
                <div className="bg-muted w-full h-full rounded-[2.5rem] flex items-center justify-center text-foreground/20 italic">
                  Nenhuma foto cadastrada
                </div>
              )}

              {isItemReserved && (
                <div className="absolute inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-20 rounded-[3.1rem]">
                  <Badge className="bg-red-500 text-white px-8 py-3 rounded-full text-xl font-black uppercase tracking-widest shadow-2xl shadow-red-500/50">
                    Reservado
                  </Badge>
                </div>
              )}
            </div>

            {item.fotos && item.fotos.length > 1 && (
              <div className="flex gap-4 overflow-x-auto pb-2 no-scrollbar">
                {item.fotos.map((foto, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedPhoto(index)}
                    className={cn(
                      "w-24 h-24 rounded-2xl overflow-hidden border-2 transition-all shrink-0",
                      selectedPhoto === index ? "border-primary shadow-lg scale-105" : "border-white/40 opacity-60 hover:opacity-100"
                    )}
                  >
                    <img src={buildItemImageUrl(foto)} alt={`Miniatura ${index + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Informações e Ações */}
          <div className="lg:col-span-5 space-y-8">
            <div className="premium-card bg-white/60 backdrop-blur-xl border-white/60 rounded-[3rem] p-10 shadow-2xl space-y-8">
              <div className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline" className="px-3 py-1 bg-primary/5 border-primary/10 text-primary font-bold text-[10px] uppercase tracking-wider rounded-lg">
                    {item.categoria}
                  </Badge>
                  <Badge variant="outline" className="px-3 py-1 bg-purple-500/5 border-purple-500/10 text-purple-600 font-bold text-[10px] uppercase tracking-wider rounded-lg">
                    {item.estado_conservacao}
                  </Badge>
                </div>
                <h1 className="text-4xl md:text-5xl font-black text-foreground tracking-tight leading-tight">
                  <span className="text-glow text-primary italic">Garimpo:</span> <br />
                  {item.titulo}
                </h1>
                <div className="flex items-center gap-4 text-primary font-black text-3xl">
                  {item.valor_girinhas} G$
                  <span className="text-xs text-foreground/30 font-bold uppercase tracking-widest">Valor de Troca</span>
                </div>
              </div>

              <div className="space-y-4 text-foreground/50 leading-relaxed font-medium">
                <p className="border-l-4 border-primary/20 pl-4 py-2 bg-primary/[0.02] rounded-r-2xl italic">
                  "{item.descricao}"
                </p>
                <div className="grid grid-cols-2 gap-4 pt-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-primary/5 flex items-center justify-center text-primary"><ShoppingBag className="w-5 h-5" /></div>
                    <div className="flex flex-col"><span className="text-[10px] uppercase font-bold tracking-widest opacity-60">Gênero</span><span className="text-foreground text-sm font-bold">{item.genero || 'Unissex'}</span></div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-primary/5 flex items-center justify-center text-primary"><Tag className="w-5 h-5" /></div>
                    <div className="flex flex-col"><span className="text-[10px] uppercase font-bold tracking-widest opacity-60">Tamanho</span><span className="text-foreground text-sm font-bold">{item.tamanho_valor || 'N/A'}</span></div>
                  </div>
                </div>
              </div>

              <hr className="border-primary/5" />

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Avatar className="w-14 h-14 border-2 border-primary/10 ring-4 ring-primary/5">
                    <AvatarImage src={buildAvatarUrl(item.publicado_por_profile?.avatar_url)} />
                    <AvatarFallback className="bg-primary/10 text-primary font-bold">
                      {item.publicado_por_profile?.nome?.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col">
                    <span className="text-foreground font-black tracking-tight">{item.publicado_por_profile?.nome}</span>
                    <div className="flex items-center gap-1 text-[10px] font-bold text-foreground/30 uppercase tracking-widest">
                      <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                      Reputação: <span className="text-foreground/60">{item.publicado_por_profile?.reputacao || 0}</span>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col items-end">
                  <div className="flex items-center gap-1.5 text-foreground/40 text-[10px] font-bold uppercase tracking-widest">
                    <MapPin className="w-3 h-3" />
                    {item.vendedor_bairro}
                  </div>
                  <div className="text-[10px] font-black text-primary uppercase">{item.vendedor_cidade}</div>
                </div>
              </div>

              <div className="space-y-4 pt-4">
                {!isOwner && isItemAvailable && (
                  <Button
                    onClick={handleReservarItem}
                    className="founders-button w-full h-16 text-white text-lg rounded-full shadow-2xl shadow-primary/30"
                  >
                    Reservar Item
                  </Button>
                )}

                {!isOwner && isItemReserved && isUserWhoReserved && (
                  <div className="flex flex-col gap-4">
                    <Button
                      onClick={handleTrocarMensagens}
                      className="founders-button w-full h-16 text-white text-lg rounded-full shadow-2xl shadow-green-500/30 bg-green-500 hover:bg-green-600 flex gap-3"
                    >
                      <MessageCircle className="w-6 h-6" />
                      Combinar a Entrega
                    </Button>
                    <Button
                      variant="outline"
                      onClick={handleCancelarReserva}
                      className="w-full h-12 text-sm font-bold rounded-full border-red-200 text-red-500 hover:bg-red-50"
                    >
                      Cancelar Minha Reserva
                    </Button>
                  </div>
                )}

                {isOwner && isItemAvailable && (
                  <div className="p-6 bg-primary/5 border border-primary/10 rounded-3xl text-center space-y-2">
                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center text-primary mx-auto">
                      <Clock className="w-6 h-6" />
                    </div>
                    <p className="text-sm font-bold text-primary/60 italic">Aguardando interessados no seu desapego...</p>
                    <Button variant="ghost" className="text-[10px] font-black uppercase text-primary tracking-widest hover:bg-primary/10" asChild>
                      <Link to="/editar-item">Editar Anúncio</Link>
                    </Button>
                  </div>
                )}

                {isOwner && isItemReserved && (
                  <div className="space-y-4">
                    <div className="bg-red-50/50 border border-red-200/50 p-6 rounded-3xl text-center">
                      <p className="text-sm font-bold text-red-600/60 uppercase tracking-widest mb-4">Item Reservado por outra Mãe</p>
                      <Button
                        onClick={async () => {
                          if (!id) return;
                          try {
                            await supabase.from('itens').update({ status: 'trocado' }).eq('id', id);
                            await processarBonusTrocaConcluida();
                            toast({ title: "Troca Confirmada! 🎉", description: "Que alegria ver o amor circulando!" });
                            refetch();
                          } catch (error: any) {
                            toast({ title: "Erro", description: error.message, variant: "destructive" });
                          }
                        }}
                        className="founders-button w-full h-16 bg-red-500 text-white rounded-full shadow-xl shadow-red-500/10"
                      >
                        Confirmar Troca Concluída
                      </Button>
                    </div>
                  </div>
                )}

                <Dialog open={denunciaDialogOpen} onOpenChange={setDenunciaDialogOpen}>
                  <DialogTrigger asChild>
                    <button className="w-full text-center text-foreground/20 text-[10px] font-bold uppercase tracking-widest hover:text-red-500 transition-colors py-4">
                      Reportar conduta inapropriada
                    </button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[425px] rounded-[2.5rem] border-none shadow-2xl backdrop-blur-3xl bg-white/90">
                    <DialogHeader className="space-y-4">
                      <DialogTitle className="text-2xl font-black text-red-600 italic">Reportar Item</DialogTitle>
                      <DialogDescription className="text-foreground/50 font-medium">
                        Sua segurança é nossa prioridade. Conte-nos o que aconteceu.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="py-6">
                      <Textarea
                        placeholder="Descreva o motivo da denúncia com detalhes..."
                        value={motivoDenuncia}
                        onChange={(e) => setMotivoDenuncia(e.target.value)}
                        className="rounded-2xl border-primary/10 focus:ring-primary/5 min-h-[150px] font-medium"
                      />
                    </div>
                    <Button onClick={handleReportarItem} className="founders-button bg-red-500 text-white h-14 rounded-full">Enviar Denúncia</Button>
                  </DialogContent>
                </Dialog>
              </div>
            </div>

            {/* Garantia do Sistema */}
            <div className="premium-card bg-emerald-50/30 backdrop-blur-xl border-emerald-200/50 rounded-[2.5rem] p-8 space-y-4 flex items-start gap-4 shadow-xl border relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 via-transparent to-transparent opacity-50" />
              <div className="w-12 h-12 bg-emerald-500/10 rounded-2xl flex items-center justify-center text-emerald-600 shrink-0 relative z-10">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div className="space-y-1 relative z-10">
                <h4 className="text-emerald-900 font-black text-sm tracking-tight uppercase">Troca 100% Protegida</h4>
                <p className="text-emerald-800/60 text-xs font-bold leading-relaxed">
                  Suas Girinhas ficam bloqueadas com segurança até que as duas mães confirmem a entrega presencial.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      <QuickNav />
      <Footer />
    </div>
  );
};

export default DetalhesItem;
