import React, { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ItemCard } from "@/components/shared/ItemCard";
import { X, ExternalLink } from "lucide-react";
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';

interface ModalItemDetalhesProps {
  isOpen: boolean;
  onClose: () => void;
  itemId: string | null;
  contextType?: 'reserva' | 'fila' | 'venda' | 'concluida';
}

const ModalItemDetalhes: React.FC<ModalItemDetalhesProps> = ({
  isOpen,
  onClose,
  itemId,
  contextType = 'reserva'
}) => {
  const { user } = useAuth();
  const navigate = useNavigate();

  // ✅ Buscar dados completos do item
  const { data: item, isLoading, error } = useQuery({
    queryKey: ['modal-item', itemId],
    queryFn: async () => {
      if (!itemId) return null;

      const { data, error } = await supabase
        .from('itens')
        .select(`
          *,
          publicado_por_profile:profiles!itens_publicado_por_fkey(
            nome,
            avatar_url,
            reputacao,
            numero_whatsapp,
            cidade,
            estado,
            bairro
          )
        `)
        .eq('id', itemId)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!itemId && isOpen,
    staleTime: 300000, // 5 minutos
  });

  // ✅ Mock feedData similar ao usado no feed
  const feedData = useMemo(() => ({
    favoritos: [],
    reservas_usuario: [],
    filas_espera: {},
    configuracoes: null,
    profile_essencial: null,
    taxaTransacao: 5
  }), []);

  // ✅ Função para ir para página de detalhes completa
  const abrirDetalhesCompletos = () => {
    if (itemId) {
      navigate(`/item/${itemId}`);
      onClose();
    }
  };

  // ✅ Ações limitadas baseadas no contexto
  const getAcoesDisponiveis = () => {
    switch (contextType) {
      case 'reserva':
        return {
          showActions: false, // Não mostrar ações de reservar (já foi reservado)
          showLocation: true,
          showAuthor: true
        };
      case 'fila':
        return {
          showActions: false, // Não mostrar ações (já está na fila)
          showLocation: true,
          showAuthor: true
        };
      case 'venda':
        return {
          showActions: false, // É seu próprio item
          showLocation: true,
          showAuthor: false // Não precisa mostrar seu próprio nome
        };
      case 'concluida':
        return {
          showActions: false, // Troca já foi concluída
          showLocation: true,
          showAuthor: true
        };
      default:
        return {
          showActions: true,
          showLocation: true,
          showAuthor: true
        };
    }
  };

  const acoes = getAcoesDisponiveis();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md p-0 gap-0 bg-transparent border-0 shadow-none">
        {/* Header do Modal */}
        <DialogHeader className="bg-white rounded-t-lg p-4 border-b">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-lg font-semibold">
              Detalhes do Item
            </DialogTitle>
          </div>
        </DialogHeader>

        {/* Conteúdo do Modal */}
        <div className="bg-white rounded-b-lg">
          {isLoading && (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-gray-600">Carregando detalhes...</p>
            </div>
          )}

          {error && (
            <div className="p-8 text-center">
              <p className="text-red-600 mb-4">Erro ao carregar item</p>
              <Button variant="outline" onClick={onClose}>
                Fechar
              </Button>
            </div>
          )}

          {item && (
            <div className="p-4">
              {/* ✅ ItemCard Reutilizado */}
              <ItemCard
                item={item}
                feedData={feedData}
                currentUserId={user?.id || ''}
                taxaTransacao={feedData.taxaTransacao}
                onItemClick={() => {}} // Não navegar (já estamos vendo detalhes)
                showActions={acoes.showActions}
                showLocation={acoes.showLocation}
                showAuthor={acoes.showAuthor}
                onToggleFavorito={() => {}} // Desabilitado no modal
                onReservar={() => {}} // Desabilitado no contexto de reserva
                onEntrarFila={() => {}} // Desabilitado no contexto de fila
                actionState="idle"
                isModal={true} // ✅ Prop para indicar que está em modal
              />

              {/* ✅ Contexto da Reserva */}
              {contextType && (
                <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600">
                    {contextType === 'reserva' && "Você reservou este item"}
                    {contextType === 'fila' && "Você está na fila de espera"}
                    {contextType === 'venda' && "Este é seu item publicado"}
                    {contextType === 'concluida' && "Troca concluída com sucesso"}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ModalItemDetalhes;
