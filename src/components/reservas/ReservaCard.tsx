// src/components/reservas/ReservaCard.tsx - VERSÃO CORRIGIDA

import { useState, useEffect } from "react";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Clock, CheckCircle, X, Users, Star, Key, Eye, MessageCircle } from "lucide-react";
import AvaliacaoModal from "./AvaliacaoModal";
import CodigoConfirmacaoModal from "./CodigoConfirmacaoModal";
import { CancelarReservaModal } from "./CancelarReservaModal";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useReservas } from "@/hooks/useReservas";
import { supabase } from "@/integrations/supabase/client";
import { buildAvatarUrl, buildItemImageUrl } from "@/lib/cdn";

interface ReservaCardProps {
  reserva: {
    id: string;
    item_id: string;
    usuario_reservou: string;
    usuario_item: string;
    valor_girinhas: number;
    status: string;
    prazo_expiracao: string;
    codigo_confirmacao?: string;
    posicao_fila?: number;
    tempo_restante?: number;
    itens?: {
      titulo: string;
      fotos: string[] | null;
      valor_girinhas: number;
      codigo_unico?: string; // ✅ CÓDIGO DO ITEM
    } | null;
    profiles_reservador?: {
      nome: string;
      avatar_url: string | null;
      whatsapp?: string;
    } | null;
    profiles_vendedor?: {
      nome: string;
      avatar_url: string | null;
      whatsapp?: string;
    } | null;
  };
  onConfirmarEntrega: (reservaId: string, codigo: string) => Promise<boolean>;
  onCancelarReserva: (reservaId: string) => void;
  onRefresh?: () => void;
  onVerDetalhes?: (itemId: string) => void;
}

const ReservaCard = ({
  reserva,
  onConfirmarEntrega,
  onCancelarReserva,
  onRefresh,
  onVerDetalhes
}: ReservaCardProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { confirmarEntrega, loading } = useReservas();
  const [showAvaliacao, setShowAvaliacao] = useState(false);
  const [showCodigoModal, setShowCodigoModal] = useState(false);
  const [showCancelarModal, setShowCancelarModal] = useState(false);
  const [loadingConfirmacao, setLoadingConfirmacao] = useState(false);
  const [jaAvaliou, setJaAvaliou] = useState(false);

  const isReservador = reserva.usuario_reservou === user?.id;

  // Verificar se já avaliou quando componente carrega
  useEffect(() => {
    const verificarAvaliacao = async () => {
      if (reserva.status === 'confirmada' && user?.id) {
        try {
          const { data } = await supabase
            .from('avaliacoes')
            .select('id')
            .eq('reserva_id', reserva.id)
            .eq('avaliador_id', user.id)
            .maybeSingle();

          setJaAvaliou(!!data);
        } catch (error) {
          console.error('Erro ao verificar avaliação:', error);
        }
      }
    };

    verificarAvaliacao();
  }, [reserva.id, reserva.status, user?.id]);
  const isVendedor = reserva.usuario_item === user?.id;
  const outraPessoa = isReservador ? reserva.profiles_vendedor : reserva.profiles_reservador;
  const imagemItem = reserva.itens?.fotos?.[0]
    ? buildItemImageUrl(reserva.itens.fotos[0])
    : "https://images.unsplash.com/photo-1618160702438-9b02ab6515c9?w=200";

  // ✅ HANDLER WHATSAPP CORRIGIDO COM LIMPEZA DE NÚMERO E REGISTRO DE LOG
  const handleWhatsAppClick = async () => {
    if (!outraPessoa?.whatsapp) {
      toast({
        title: "WhatsApp não disponível",
        description: "Esta pessoa não possui WhatsApp cadastrado.",
        variant: "destructive",
      });
      return;
    }

    // ✅ LIMPAR E VALIDAR NÚMERO DE TELEFONE
    const rawNumber = outraPessoa.whatsapp;
    const cleanNumber = rawNumber.replace(/\D/g, ''); // Remove tudo que não é dígito

    // ✅ VALIDAR SE O NÚMERO É VÁLIDO (pelo menos 10 dígitos)
    if (cleanNumber.length < 10) {
      toast({
        title: "Número inválido",
        description: "O número de WhatsApp desta pessoa parece estar incompleto.",
        variant: "destructive",
      });
      return;
    }

    // ✅ GARANTIR FORMATO BRASILEIRO (adicionar 55 se necessário)
    let finalNumber = cleanNumber;
    if (!finalNumber.startsWith('55')) {
      finalNumber = '55' + finalNumber;
    }

    const nomeOutraPessoa = outraPessoa.nome;
    const tituloItem = reserva.itens?.titulo || "item";
    const codigoItem = reserva.itens?.codigo_unico || '';

    // ✅ MENSAGEM PERSONALIZADA BASEADA NO PAPEL DO USUÁRIO (incluindo código do item)
    let mensagem = "";

    if (isReservador) {
      // Você reservou - vai falar com o vendedor (incluindo código do item)
      mensagem = `Olá ${nomeOutraPessoa}! Sobre o item *${tituloItem}* ${codigoItem ? `(Código: *${codigoItem}*)` : ''} que reservei. Quando podemos combinar a entrega? 😊`;
    } else {
      // Reservaram seu item - vai falar com o comprador (incluindo código do item)
      mensagem = `Olá ${nomeOutraPessoa}! Sobre o item *${tituloItem}* ${codigoItem ? `(Código: *${codigoItem}*)` : ''} que você reservou. Quando podemos combinar a entrega? 😊`;
    }

    // ✅ CONSTRUIR URL DO WHATSAPP (SEM 55 DUPLICADO)
    const whatsappUrl = `https://wa.me/${finalNumber}?text=${encodeURIComponent(mensagem)}`;

    console.log('🟡 Abrindo WhatsApp:', {
      numeroOriginal: rawNumber,
      numeroLimpo: cleanNumber,
      numeroFinal: finalNumber,
      url: whatsappUrl
    });

    try {
      // ✅ REGISTRAR CONVERSA NO LOG (IGUAL AO FEED)
      await supabase.rpc('registrar_conversa_whatsapp', {
        p_reserva_id: reserva.id,
        p_usuario_recebeu: isReservador ? reserva.usuario_item : reserva.usuario_reservou
      });
      console.log('✅ Comunicação WhatsApp registrada no banco');

      // ✅ MOSTRAR TOAST DE CONFIRMAÇÃO
      toast({
        title: "Abrindo WhatsApp...",
        description: `Iniciando conversa com ${nomeOutraPessoa}`,
      });

    } catch (error) {
      console.error('❌ Erro ao registrar comunicação WhatsApp:', error);
      // Não bloquear a abertura do WhatsApp por erro no log
    }

    // ✅ ABRIR WHATSAPP
    window.open(whatsappUrl, '_blank');
  };

  // ✅ FUNÇÃO PARA ABRIR DETALHES
  const handleVerDetalhes = () => {
    if (onVerDetalhes && reserva.item_id) {
      onVerDetalhes(reserva.item_id);
    }
  };

  // Função com retry para verificação de avaliação
  const verificarSeJaAvaliouComRetry = async (maxTentativas = 3): Promise<boolean> => {
    for (let i = 0; i < maxTentativas; i++) {
      try {
        const { data } = await supabase
          .from('avaliacoes')
          .select('id')
          .eq('reserva_id', reserva.id)
          .eq('avaliador_id', user?.id)
          .single();

        return !!data;
      } catch (error) {
        if (i === maxTentativas - 1) {
          console.error('Erro ao verificar avaliação após retry:', error);
        }
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }
    return false;
  };

  const formatarTempo = (tempo?: number) => {
    if (!tempo) return 'Expirado';
    const horas = Math.floor(tempo / (1000 * 60 * 60));
    const minutos = Math.floor((tempo % (1000 * 60 * 60)) / (1000 * 60));
    return `${horas}h ${minutos}m`;
  };

  const getStatusBadge = () => {
    switch (reserva.status) {
      case 'pendente':
        return <Badge className="bg-orange-100 text-orange-700 border-orange-200">Ativa</Badge>;
      case 'confirmada':
        return <Badge className="bg-green-100 text-green-700 border-green-200">Confirmada</Badge>;
      case 'cancelada':
        return <Badge variant="secondary">Cancelada</Badge>;
      default:
        return <Badge variant="outline">{reserva.status}</Badge>;
    }
  };

  const getPrioridade = () => {
    if (reserva.posicao_fila && reserva.posicao_fila > 0) {
      return (
        <div className="flex items-center gap-1 text-blue-600">
          <Users className="w-4 h-4" />
          <span className="text-sm">{reserva.posicao_fila}º na fila</span>
        </div>
      );
    }
    return null;
  };

  const getTempoRestante = () => {
    if (reserva.status === 'pendente' && reserva.tempo_restante) {
      const isUrgent = reserva.tempo_restante < 2 * 60 * 60 * 1000; // menos de 2 horas
      return (
        <div className={`flex items-center gap-1 ${isUrgent ? 'text-red-600' : 'text-orange-600'}`}>
          <Clock className="w-4 h-4" />
          <span>Expira em {formatarTempo(reserva.tempo_restante)}</span>
        </div>
      );
    }
    return null;
  };

  const mostrarBotaoAvaliar = reserva.status === 'confirmada' && !jaAvaliou;

  // ✅ VERIFICAR SE DEVE MOSTRAR WHATSAPP
  const mostrarWhatsApp = reserva.status === 'pendente' && outraPessoa?.whatsapp;

  return (
    <>
      <Card className="overflow-hidden">
        <CardHeader className="pb-3">
          <div className="flex justify-between items-start">
            <div className="flex gap-3">
              {/* ✅ IMAGEM CLICÁVEL */}
              <div
                className="cursor-pointer hover:opacity-80 transition-opacity"
                onClick={handleVerDetalhes}
              >
                <img
                  src={imagemItem}
                  alt={reserva.itens?.titulo || "Item"}
                  className="w-16 h-16 rounded-lg object-cover"
                />
              </div>
              <div className="flex-grow">
                {/* ✅ TÍTULO CLICÁVEL COM CÓDIGO DO ITEM */}
                <div className="flex items-center gap-2">
                  <h3
                    className="font-semibold text-gray-800 line-clamp-1 cursor-pointer hover:text-primary transition-colors"
                    onClick={handleVerDetalhes}
                  >
                    {reserva.itens?.titulo || "Item não encontrado"}
                  </h3>
                  {/* ✅ BADGE AZUL COM CÓDIGO DO ITEM */}
                  {reserva.itens?.codigo_unico && (
                    <Badge variant="outline" className="text-xs font-mono bg-blue-50 text-blue-700 border-blue-200 shrink-0">
                      {reserva.itens.codigo_unico}
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-2 mt-1">
                  {getStatusBadge()}
                  <span className="text-sm text-primary font-medium">
                    {reserva.valor_girinhas} Girinhas
                  </span>
                </div>
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="py-3">
          <div className="flex items-center gap-3 mb-3">
            <Avatar className="w-8 h-8">
              <AvatarImage src={buildAvatarUrl(outraPessoa?.avatar_url)} />
              <AvatarFallback className="text-xs">
                {outraPessoa?.nome?.split(' ').map(n => n[0]).join('') || '?'}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="text-sm font-medium">
                {isReservador ? 'Vendedor' : 'Comprador'}: {outraPessoa?.nome || 'Usuário'}
              </p>
              <p className="text-xs text-gray-500">
                {isReservador ? 'Você reservou este item' : 'Reservou seu item'}
              </p>
            </div>
          </div>

          <div className="space-y-2">
            {getPrioridade()}
            {getTempoRestante()}
          </div>
        </CardContent>

        <CardFooter className="pt-3 bg-gray-50/50">
          <div className="flex gap-2 w-full">
            {/* ✅ BOTÃO VER DETALHES SEMPRE PRESENTE */}
            {onVerDetalhes && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleVerDetalhes}
                className="shrink-0"
              >
                <Eye className="w-4 h-4" />
              </Button>
            )}

            {reserva.status === 'pendente' && (
              <>
                {/* ✅ BOTÃO WHATSAPP CORRIGIDO */}
                {mostrarWhatsApp && (
                  <Button
                    size="sm"
                    onClick={handleWhatsAppClick}
                    className="flex-1 bg-green-500 hover:bg-green-600 text-white"
                  >
                    <MessageCircle className="w-4 h-4 mr-1" />
                    WhatsApp
                  </Button>
                )}

                <Button
                  size="sm"
                  onClick={() => setShowCodigoModal(true)}
                  className={`${mostrarWhatsApp ? 'shrink-0' : 'flex-1'} bg-blue-600 hover:bg-blue-700`}
                >
                  <Key className="w-4 h-4 mr-1" />
                  {isVendedor ? 'Ver código' : 'Código'}
                </Button>

                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setShowCancelarModal(true)}
                  className="shrink-0 border-red-200 text-red-600 hover:bg-red-50"
                >
                  <X className="w-4 h-4" />
                </Button>
              </>
            )}

            {mostrarBotaoAvaliar && (
              <Button
                size="sm"
                onClick={() => setShowAvaliacao(true)}
                className="flex-1 bg-purple-600 hover:bg-purple-700"
              >
                <Star className="w-4 h-4 mr-1" />
                Avaliar
              </Button>
            )}
          </div>
        </CardFooter>
      </Card>

      {/* Modais */}
      {showCodigoModal && (
        <CodigoConfirmacaoModal
          isOpen={showCodigoModal}
          onClose={() => setShowCodigoModal(false)}
          reserva={reserva}
          onConfirmarCodigo={(codigo) => onConfirmarEntrega(reserva.id, codigo)}
          isVendedor={isVendedor}
          loading={false}
        />
      )}

      {showAvaliacao && (
        <AvaliacaoModal
          isOpen={showAvaliacao}
          onClose={() => setShowAvaliacao(false)}
          reserva={reserva}
          onAvaliacaoCompleta={() => {
            setJaAvaliou(true);
            onRefresh?.();
          }}
        />
      )}

      {showCancelarModal && (
        <CancelarReservaModal
          isOpen={showCancelarModal}
          onClose={() => setShowCancelarModal(false)}
          reserva={reserva}
          isVendedor={isVendedor}
          onCancelamentoCompleto={() => {
            setShowCancelarModal(false);
            onRefresh?.();
          }}
        />
      )}
    </>
  );
};

export default ReservaCard;
