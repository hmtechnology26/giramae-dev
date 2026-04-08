import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious
} from '@/components/ui/carousel';
import { Heart, MapPin, School, Truck, Home, Clock, Users, Sparkles,Upload, CheckCircle, MessageCircle, Car, Info, User, MoreVertical, Flag, ZoomIn, ZoomOut, X, ChevronLeft, ChevronRight, Download } from 'lucide-react';
import LazyImage from '@/components/ui/lazy-image';
import { cn } from '@/lib/utils';
import { buildItemImageUrl } from '@/lib/cdn';
import ActionFeedback from '@/components/loading/ActionFeedback';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface LogisticaInfo {
  entrega_disponivel: boolean;
  busca_disponivel: boolean;
  distancia_km: number | null;
}

interface ItemCardProps {
  item: {
    id: string;
    titulo: string;
    descricao: string;
    valor_girinhas: number;
    categoria: string;
    subcategoria?: string;
    estado_conservacao: string;
    status: string;
    fotos?: string[];
    genero?: string;
    tamanho_valor?: string;
    tamanho_categoria?: string;
    endereco_bairro?: string;
    endereco_cidade?: string;
    endereco_estado?: string;
    aceita_entrega?: boolean;
    raio_entrega_km?: number;
    logistica?: LogisticaInfo;
    escola_comum?: boolean;
    publicado_por: string;
    created_at: string;
    escolas_inep?: {
      escola: string;
    };
    publicado_por_profile?: {
      nome: string;
      avatar_url?: string;
      reputacao?: number;
      whatsapp?: string;
    };
  };
  feedData: {
    favoritos: string[];
    reservas_usuario: Array<{
      item_id: string;
      status: string;
      id?: string;
      usuario_reservou?: string;
    }>;
    filas_espera: Record<string, {
      total_fila: number;
      posicao_usuario?: number;
      usuario_id?: string;
    }>;
  };
  currentUserId: string;
  taxaTransacao?: number;

  // Actions
  onToggleFavorito?: () => void;
  onEntrarFila?: () => void;
  onReservar?: () => void;
  onItemClick?: (itemId: string) => void;
  actionState?: 'loading' | 'success' | 'error' | 'idle';

  // Display options
  showActions?: boolean;
  showLocation?: boolean;
  showAuthor?: boolean;
  compact?: boolean;
  isModal?: boolean;
}

export const ItemCard: React.FC<ItemCardProps> = ({
  item,
  feedData,
  currentUserId,
  taxaTransacao = 0,
  onToggleFavorito,
  onEntrarFila,
  onReservar,
  onItemClick,
  actionState = 'idle',
  showActions = true,
  showLocation = true,
  showAuthor = true,
  compact = false
}) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [showDetails, setShowDetails] = useState(false);
  const [showReportDialog, setShowReportDialog] = useState(false);
  const [reportMotivo, setReportMotivo] = useState('');
  const [reportDescricao, setReportDescricao] = useState('');
  const [showImageModal, setShowImageModal] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [imageZoom, setImageZoom] = useState(1);

  const isFavorito = feedData.favoritos.includes(item.id);

  const hasActiveReservation = feedData.reservas_usuario.some(r =>
    r.item_id === item.id &&
    ['pendente', 'confirmada'].includes(r.status) &&
    r.usuario_reservou === currentUserId
  );

  const filaInfo = feedData.filas_espera[item.id];
  const isUserInQueue = filaInfo?.posicao_usuario && filaInfo.posicao_usuario > 0;

  const hasCommonSchool = Boolean(item.escola_comum);

  const itemIsReservado = item.status === 'reservado';
  const itemIsDisponivel = item.status === 'disponivel';

  const canShowWhatsApp = item.publicado_por_profile?.whatsapp &&
    itemIsReservado &&
    hasActiveReservation &&
    item.publicado_por !== currentUserId;

  const hasMultiplePhotos = item.fotos && item.fotos.length > 1;

  const handleReportSubmit = async () => {
    try {
      const { error } = await supabase
        .from('denuncias')
        .insert({
          item_id: item.id,
          denunciante_id: currentUserId,
          motivo: reportMotivo,
          descricao: reportDescricao
        });

      if (error) throw error;

      setShowReportDialog(false);
      setReportMotivo('');
      setReportDescricao('');

      toast({
        title: "Obrigada pela denúncia!",
        description: "Vamos analisar este item e tomar as providências necessárias.",
      });
    } catch (error) {
      console.error('Erro ao denunciar item:', error);
    }
  };

  const calcularValores = () => {
    const valorItem = item.valor_girinhas;
    const taxa = taxaTransacao > 0 ? valorItem * (taxaTransacao / 100) : 0;
    const total = valorItem + taxa;

    return {
      valorItem,
      taxa: Math.round(taxa * 100) / 100,
      total: Math.round(total * 100) / 100
    };
  };

  const valores = calcularValores();

  const shouldShowActionButton = showActions &&
    (onEntrarFila || onReservar) &&
    !isUserInQueue &&
    !hasActiveReservation &&
    item.publicado_por !== currentUserId;

  const handleClick = () => {
    if (onItemClick) onItemClick(item.id);
  };

  const handleImageClick = (e: React.MouseEvent, index: number = 0) => {
    e.stopPropagation();
    setSelectedImageIndex(index);
    setShowImageModal(true);
    setImageZoom(1);
  };

  const handleZoomIn = () => {
    setImageZoom(prev => Math.min(prev + 0.5, 3));
  };

  const handleZoomOut = () => {
    setImageZoom(prev => Math.max(prev - 0.5, 1));
  };

  const handleNextImage = () => {
    if (item.fotos && selectedImageIndex < item.fotos.length - 1) {
      setSelectedImageIndex(prev => prev + 1);
      setImageZoom(1);
    }
  };

  const handlePrevImage = () => {
    if (selectedImageIndex > 0) {
      setSelectedImageIndex(prev => prev - 1);
      setImageZoom(1);
    }
  };

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onToggleFavorito) {
      onToggleFavorito();
    }
  };

  const handleActionClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (itemIsReservado && onEntrarFila) {
      onEntrarFila();
    } else if (itemIsDisponivel && onReservar) {
      onReservar();
    }
  };

  const handleProfileClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (item.publicado_por_profile) {
      navigate(`/perfil/${item.publicado_por}`);
    }
  };

  const handleWhatsAppClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!item.publicado_por_profile?.whatsapp) return;

    const whatsappNumber = item.publicado_por_profile.whatsapp;
    const vendedorNome = item.publicado_por_profile.nome;
    const mensagem = `Olá ${vendedorNome}! Sobre o item "${item.titulo}" que reservei. Quando podemos combinar a entrega?`;
    const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(mensagem)}`;

    try {
      const reservaAtiva = feedData.reservas_usuario.find(r =>
        r.item_id === item.id &&
        ['pendente', 'confirmada'].includes(r.status) &&
        r.usuario_reservou === currentUserId
      );

      if (reservaAtiva) {
        await supabase.rpc('registrar_conversa_whatsapp', {
          p_reserva_id: reservaAtiva.id,
          p_usuario_recebeu: item.publicado_por
        });
      }
    } catch (error) {
      console.error('❌ Erro ao registrar comunicação WhatsApp:', error);
    }

    window.open(whatsappUrl, '_blank');
  };

  const getGeneroIcon = (genero?: string) => {
    switch (genero) {
      case 'menino': return '👦';
      case 'menina': return '👧';
      case 'unissex': return '👦👧';
      default: return null;
    }
  };

  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case 'novo': return 'bg-green-100 text-white';
      case 'seminovo': return 'bg-blue-100 text-white';
      case 'usado': return 'bg-yellow-100 text-white';
      case 'muito_usado': return 'bg-orange-100 text-white';
      default: return 'bg-gray-100 text-white';
    }
  };

  const getLocationText = () => {
    const parts = [];
    if (item.endereco_bairro) parts.push(item.endereco_bairro);
    if (item.endereco_cidade) parts.push(item.endereco_cidade);
    return parts.length > 0 ? parts.join(', ') : 'Local não informado';
  };

  const hasLocationData = item.endereco_bairro || item.endereco_cidade;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  return (
    <Card
      data-tour="item-card"
      className={cn(
        "premium-card group transition-all duration-500 relative overflow-hidden w-full flex flex-col h-full rounded-[2rem]",
        itemIsReservado && "opacity-95"
      )}>

      {/* Absolute Overlays */}
      <div className="absolute top-3 right-3 flex gap-2 z-20">
        {item.publicado_por !== currentUserId && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-9 w-9 p-0 bg-white/70 backdrop-blur-md rounded-full border border-white/20 hover:bg-white/90 shadow-sm"
              >
                <MoreVertical className="h-4 w-4 text-foreground/60" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="glass border-primary/5 rounded-xl">
              <DropdownMenuItem onClick={() => setShowReportDialog(true)} className="flex gap-2">
                <Flag className="h-4 w-4 text-primary" />
                <span className="font-medium">Reportar item</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}

        {showActions && onToggleFavorito && (
          <Button
            data-tour="btn-favorito"
            variant="ghost"
            size="sm"
            className="h-9 w-9 p-0 bg-white/70 backdrop-blur-md rounded-full border border-white/20 hover:bg-white/90 shadow-sm"
            onClick={handleFavoriteClick}
          >
            <Heart
              className={cn(
                "w-4 h-4 transition-all duration-300",
                isFavorito
                  ? 'fill-primary text-primary scale-110'
                  : 'text-foreground/40 hover:text-primary hover:scale-110'
              )}
            />
          </Button>
        )}
      </div>

      <CardContent className="p-0 flex flex-col h-full" onClick={handleClick}>
        {/* Photo Section */}
        <div className="relative w-full aspect-[4/3] bg-primary/5 overflow-hidden">
          <div className="relative w-full h-full cursor-pointer group/image" onClick={(e) => handleImageClick(e, 0)}>
            {hasMultiplePhotos ? (
              <Carousel className="w-full h-full">
                <CarouselContent className="h-full ml-0">
                  {item.fotos!.map((foto, index) => (
                    <CarouselItem key={index} className="h-full pl-0">
                      <div className="w-full h-full overflow-hidden" onClick={(e) => handleImageClick(e, index)}>
                        <img
                          src={buildItemImageUrl(foto)}
                          alt={`${item.titulo} - Foto ${index + 1}`}
                          className={cn(
                            "w-full h-full object-cover transition-transform duration-700 group-hover/image:scale-110",
                            itemIsReservado && "filter grayscale-[20%]"
                          )}
                          loading="lazy"
                        />
                      </div>
                    </CarouselItem>
                  ))}
                </CarouselContent>

                <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <CarouselPrevious className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/60 backdrop-blur-md hover:bg-white border-0 shadow-lg" />
                  <CarouselNext className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/60 backdrop-blur-md hover:bg-white border-0 shadow-lg" />
                </div>

                <div className="absolute top-3 left-3 bg-black/40 text-white text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full backdrop-blur-md z-10 border border-white/10">
                  {item.fotos!.length} fotos
                </div>
              </Carousel>
            ) : (
              <div className="w-full h-full overflow-hidden">
                <LazyImage
                  src={item.fotos?.[0] ? buildItemImageUrl(item.fotos[0]) : '/placeholder.svg'}
                  alt={item.titulo}
                  className={cn(
                    "w-full h-full object-cover transition-transform duration-700 group-hover/image:scale-110",
                    itemIsReservado && "filter grayscale-[20%]"
                  )}
                />
              </div>
            )}

            <div className="absolute bottom-3 left-3 flex gap-2 z-10">
              {item.logistica?.distancia_km !== null && item.logistica?.distancia_km !== undefined && (
                <div className="bg-white/70 rounded-full px-2.5 py-1 text-[10px] font-bold text-foreground/70 backdrop-blur-md border border-white/20 shadow-sm flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-primary" />
                  {item.logistica.distancia_km}km
                </div>
              )}

              {item.genero && getGeneroIcon(item.genero) && (
                <div className="bg-white/70 rounded-full px-2 py-1 text-xs backdrop-blur-md border border-white/20 shadow-sm">
                  {getGeneroIcon(item.genero)}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Info Section */}
        <div className="p-4 flex flex-col flex-1 space-y-3">
          <div className="flex flex-wrap gap-1.5 h-6 overflow-hidden">
            {itemIsReservado && (
              <Badge className="bg-destructive text-white border-0 rounded-full text-[9px] font-bold uppercase tracking-wider px-2">
                Reservado
              </Badge>
            )}

            <Badge className={cn(
              "border-0 rounded-full text-[9px] font-bold uppercase tracking-wider px-2 cursor-pointer",
              getEstadoColor(item.estado_conservacao).replace('bg-', 'bg-opacity-50 ')
            )}>
              {item.estado_conservacao.replace('_', ' ')}
            </Badge>

            {item.tamanho_valor && (
              <Badge variant="outline" className="bg-primary/5 text-primary cursor-pointer border-primary/10 rounded-full text-[9px] font-bold uppercase tracking-wider px-2">
                {item.tamanho_valor}
              </Badge>
            )}
          </div>

          {(hasCommonSchool || item.logistica?.entrega_disponivel || item.logistica?.busca_disponivel) && (
            <div className="flex flex-wrap gap-1.5">
              {hasCommonSchool && (
                <div className="flex items-center gap-1 bg-purple-50 text-purple-700 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider border border-purple-100">
                  <School className="w-2.5 h-2.5" />
                  Mesma escola
                </div>
              )}

              {item.logistica?.entrega_disponivel && (
                <div className="flex items-center gap-1 bg-green-50 text-green-700 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider border border-green-100">
                  <Truck className="w-2.5 h-2.5" />
                  Entrega grátis
                </div>
              )}

              {!item.logistica?.entrega_disponivel && item.logistica?.busca_disponivel && (
                <div className="flex items-center gap-1 bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider border border-blue-100">
                  <Car className="w-2.5 h-2.5" />
                  Pode buscar
                </div>
              )}
            </div>
          )}

          <h3 className="font-bold cursor-pointer leading-tight line-clamp-2 text-foreground/80 group-hover:text-primary transition-colors text-base min-h-[2.5rem]">
            {item.titulo}
          </h3>

          {hasLocationData && (
            <div className="flex items-center gap-1.5 text-xs font-medium text-foreground/40">
              <MapPin className="w-3 h-3" />
              <span className="truncate">{getLocationText()}</span>
            </div>
          )}

          <div className="mt-auto pt-4 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 group/price bg-primary/5 cursor-pointer px-3 py-1.5 rounded-2xl border border-primary/10 transition-all hover:bg-primary/10">
                <img src="/girinha_sem_fundo.png" alt="girinha" className='w-5 h-5 transition-transform duration-500 group-hover/price:rotate-12' />
                <span className="text-lg font-black text-primary tracking-tight ">
                  {valores.total}<span className="text-[15px] ml-0.5">G</span>
                </span>
              </div>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowDetails(!showDetails);
                }}
                className="p-2 rounded-full hover:bg-primary/5 text-foreground/30 hover:text-primary transition-all"
                title="Ver detalhes do item"
              >
                <Info className="w-5 h-5 shadow-sm" />
              </button>
            </div>

            {showDetails && (
              <div className="animate-in fade-in slide-in-from-top-2 duration-300 border border-primary/5 rounded-2xl p-4 bg-primary/[0.02] text-sm space-y-3">
                {item.descricao && (
                  <div>
                    <span className="text-[10px] font-bold text-foreground/30 uppercase tracking-widest">Descrição</span>
                    <p className="text-foreground/70 mt-1 text-xs leading-relaxed">{item.descricao}</p>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-[10px] font-bold text-foreground/30 uppercase tracking-widest block">Categoria</span>
                    <span className="text-xs font-medium text-foreground/60 capitalize">{item.categoria}</span>
                  </div>
                  {item.tamanho_valor && (
                    <div>
                      <span className="text-[10px] font-bold text-foreground/30 uppercase tracking-widest block">Tamanho</span>
                      <span className="text-xs font-medium text-foreground/60">{item.tamanho_valor}</span>
                    </div>
                  )}
                </div>

                <div className="pt-2 border-t border-primary/5">
                  <span className="text-[10px] font-bold text-foreground/20 uppercase tracking-widest block mb-1">Composição do Preço</span>
                  <div className="flex justify-between text-[11px] text-foreground/60">
                    <span>Valor do item</span>
                    <span>{valores.valorItem} G</span>
                  </div>
                  <div className="flex justify-between text-[11px] text-foreground/60">
                    <span>Taxa de processamento</span>
                    <span>{valores.taxa} G</span>
                  </div>
                </div>
              </div>
            )}

            {showAuthor && item.publicado_por_profile && (
              <button
                onClick={handleProfileClick}
                className="flex items-center gap-3 p-2 border border-primary/5 rounded-2xl bg-primary/[0.02] hover:bg-primary/5 transition-all group/profile"
              >
                <div className="w-8 h-8 rounded-full border border-white p-0.5 shadow-sm overflow-hidden shrink-0 bg-white">
                  {item.publicado_por_profile.avatar_url ? (
                    <img
                      src={item.publicado_por_profile.avatar_url}
                      alt={item.publicado_por_profile.nome}
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full rounded-full bg-primary/10 flex items-center justify-center">
                      <User className="w-4 h-4 text-primary" />
                    </div>
                  )}
                </div>
                <div className="flex-1 text-left min-w-0">
                  <div className="text-[11px] font-bold text-foreground/70 truncate uppercase tracking-wider">
                    {item.publicado_por_profile.nome}
                  </div>
                  <div className="text-[10px] text-primary/60 font-medium group-hover/profile:text-primary transition-colors">
                    Ver perfil →
                  </div>
                </div>
                {item.publicado_por_profile.reputacao && (
                  <div className="flex items-center gap-1 bg-white/50 px-2 py-1 rounded-lg border border-primary/5 shadow-sm shrink-0">
                    <span className="text-[10px] font-black text-amber-500">
                      {item.publicado_por_profile.reputacao.toFixed(1)}
                    </span>
                  </div>
                )}
              </button>
            )}

            {canShowWhatsApp && (
              <div className="bg-green-50 border border-green-200 rounded-2xl p-4 shadow-sm ring-1 ring-green-100/70">
                <div className="text-[10px] font-bold text-green-800 mb-2 text-center uppercase tracking-widest">
                  Combine a entrega
                </div>
                <Button
                  className="bg-green-600 hover:bg-green-700 text-white w-full rounded-xl h-11 shadow-lg shadow-green-200 font-bold border border-green-500/20"
                  onClick={handleWhatsAppClick}
                >
                  <MessageCircle className="w-4 h-4 mr-2" />
                  WhatsApp
                </Button>
              </div>
            )}

            {shouldShowActionButton && (
              <Button
                size="lg"
                className={cn(
                  "founders-button w-full h-12 text-white font-bold rounded-2xl shadow-lg",
                  itemIsReservado && "bg-amber-500 from-amber-500 to-orange-500"
                )}
                onClick={handleActionClick}
                disabled={actionState === 'loading' || (!itemIsDisponivel && !itemIsReservado)}
              >
                {actionState === 'loading' ? (
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 animate-spin" />
                    <span>{itemIsReservado ? 'Entrando...' : 'Reservando...'}</span>
                  </div>
                ) : itemIsReservado ? (
                  <div className="flex items-center gap-2">
                    <Users className="w-5 h-5" />
                    <span>ENTRAR NA FILA</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Upload className="w-5 h-5" />
                    <span>RESERVAR ITEM</span>
                  </div>
                )}
              </Button>
            )}

            {(isUserInQueue || hasActiveReservation) && !canShowWhatsApp && (
              <div className="bg-primary/5 border border-primary/10 rounded-2xl p-4 text-center">
                {hasActiveReservation ? (
                  <div className="space-y-2">
                    <div className="flex items-center justify-center gap-2 text-primary font-bold">
                      <CheckCircle className="w-5 h-5 text-green-500" />
                      <span className="text-sm">Item Reservado</span>
                    </div>
                    <p className="text-[11px] text-foreground/60 leading-relaxed">
                      Você tem uma reserva ativa. Aguarde o vendedor entrar em contato ou utilize as opções do sistema.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="flex items-center justify-center gap-2 text-primary font-bold">
                      <Users className="w-5 h-5" />
                      <span className="text-sm">Na fila - Posição {filaInfo?.posicao_usuario}</span>
                    </div>
                    <p className="text-[11px] text-foreground/60 leading-relaxed">
                      {filaInfo?.total_fila && filaInfo.total_fila > 1
                        ? `Há ${filaInfo.total_fila - (filaInfo.posicao_usuario || 0)} pessoas na sua frente.`
                        : 'Você será notificado se o item ficar disponível.'
                      }
                    </p>
                  </div>
                )}
              </div>
            )}

            {actionState !== 'idle' && actionState !== 'loading' && (
              <ActionFeedback
                state={actionState}
                successMessage={itemIsReservado ? "Adicionado à fila!" : "Item reservado!"}
                errorMessage={itemIsReservado ? "Erro ao entrar na fila" : "Erro ao reservar"}
                className="mt-2"
              />
            )}
          </div>
        </div>
      </CardContent>

      {/* Global Dialogs */}
      <Dialog open={showReportDialog} onOpenChange={setShowReportDialog}>
        <DialogContent className="glass border-primary/10 rounded-[2rem] max-w-md">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold tracking-tight">Reportar Item</DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Descreva o motivo da sua denúncia. Nossa equipe irá analisar com urgência.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            <div className="space-y-2">
              <label className="text-xs font-bold text-foreground/40 uppercase tracking-widest ml-1">Motivo</label>
              <Select value={reportMotivo} onValueChange={setReportMotivo}>
                <SelectTrigger className="h-12 border-primary/10 rounded-xl bg-white/50">
                  <SelectValue placeholder="Selecione o motivo" />
                </SelectTrigger>
                <SelectContent className="glass border-primary/5 rounded-xl">
                  <SelectItem value="conteudo_inapropriado">Conteúdo inapropriado</SelectItem>
                  <SelectItem value="preco_abusivo">Preço abusivo</SelectItem>
                  <SelectItem value="informacoes_falsas">Informações falsas</SelectItem>
                  <SelectItem value="item_danificado">Item danificado</SelectItem>
                  <SelectItem value="spam">Spam</SelectItem>
                  <SelectItem value="outro">Outro</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-foreground/40 uppercase tracking-widest ml-1">Descrição (opcional)</label>
              <Textarea
                placeholder="Descreva mais detalhes sobre o problema..."
                value={reportDescricao}
                onChange={(e) => setReportDescricao(e.target.value)}
                className="min-h-[100px] border-primary/10 rounded-xl bg-white/50 focus:border-primary/30 transition-all"
              />
            </div>
          </div>

          <DialogFooter className="gap-3">
            <Button variant="outline" onClick={() => setShowReportDialog(false)} className="rounded-xl h-12 flex-1 border-primary/10">
              Cancelar
            </Button>
            <Button
              onClick={handleReportSubmit}
              disabled={!reportMotivo}
              className="bg-destructive hover:bg-destructive/90 text-white rounded-xl h-12 flex-1"
            >
              Reportar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showImageModal} onOpenChange={setShowImageModal}>
        <DialogContent className="max-w-[100vw] w-full h-screen max-h-screen p-0 bg-black/95 border-0 rounded-none overflow-hidden flex flex-col">
          <DialogTitle className="sr-only">Visualização: {item.titulo}</DialogTitle>

          {/* Header */}
          <div className="flex items-center justify-between p-4 bg-gradient-to-b from-black/80 to-transparent z-50">
            <div className="flex items-center gap-3">
              <div className="bg-white/10 px-3 py-1 rounded-full backdrop-blur-md border border-white/10">
                <span className="text-xs font-bold text-white tracking-widest">
                  {selectedImageIndex + 1} / {item.fotos?.length || 1}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" onClick={handleZoomOut} disabled={imageZoom <= 1} className="text-white hover:bg-white/10 rounded-full h-10 w-10">
                <ZoomOut className="w-5 h-5" />
              </Button>
              <div className="text-white text-xs font-bold w-12 text-center opacity-60">
                {Math.round(imageZoom * 100)}%
              </div>
              <Button variant="ghost" size="icon" onClick={handleZoomIn} disabled={imageZoom >= 4} className="text-white hover:bg-white/10 rounded-full h-10 w-10">
                <ZoomIn className="w-5 h-5" />
              </Button>
              <div className="w-px h-6 bg-white/10 mx-2" />
              <Button variant="ghost" size="icon" onClick={() => setShowImageModal(false)} className="text-white hover:bg-white/10 rounded-full h-10 w-10">
                <X className="w-6 h-6" />
              </Button>
            </div>
          </div>

          {/* Image View */}
          <div className="flex-1 relative overflow-auto flex items-center justify-center p-4">
            <div
              className="transition-transform duration-200 ease-out"
              style={{ transform: `scale(${imageZoom})` }}
            >
              <img
                src={item.fotos?.[selectedImageIndex] ? buildItemImageUrl(item.fotos[selectedImageIndex]) : '/placeholder.svg'}
                alt={item.titulo}
                className="max-w-full max-h-[80vh] object-contain shadow-2xl"
              />
            </div>

            {/* Nav Arrows */}
            {hasMultiplePhotos && (
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handlePrevImage}
                  disabled={selectedImageIndex === 0}
                  className="absolute left-6 top-1/2 -translate-y-1/2 text-white hover:bg-white/10 rounded-full h-14 w-14 disabled:opacity-0 transition-all"
                >
                  <ChevronLeft className="w-8 h-8" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleNextImage}
                  disabled={selectedImageIndex === (item.fotos?.length || 1) - 1}
                  className="absolute right-6 top-1/2 -translate-y-1/2 text-white hover:bg-white/10 rounded-full h-14 w-14 disabled:opacity-0 transition-all"
                >
                  <ChevronRight className="w-8 h-8" />
                </Button>
              </>
            )}
          </div>

          {/* Footer View */}
          <div className="p-8 bg-gradient-to-t from-black/80 to-transparent z-50">
            <div className="max-w-3xl mx-auto space-y-4">
              <div className="flex items-center gap-3">
                <Badge className="bg-primary hover:bg-primary border-0 rounded-full px-3 py-1 font-bold tracking-wider">
                  {valores.total} G
                </Badge>
                <div className="h-4 w-px bg-white/20" />
                <h3 className="text-xl font-bold text-white tracking-tight">{item.titulo}</h3>
              </div>
              <p className="text-white/60 text-sm line-clamp-2 leading-relaxed">{item.descricao}</p>

              <div className="flex flex-wrap gap-4 pt-4 border-t border-white/10">
                <div className="flex items-center gap-2 text-white/40 text-xs">
                  <MapPin className="w-3.5 h-3.5" />
                  <span>{getLocationText()}</span>
                </div>
                <div className="flex items-center gap-2 text-white/40 text-xs">
                  <User className="w-3.5 h-3.5" />
                  <span>Publicado por {item.publicado_por_profile?.nome}</span>
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
};
