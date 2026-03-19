// FILE: src/components/reservas/CancelarReservaModal.tsx

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, XCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface MotivoCancel {
  id: number;
  codigo: string;
  nome: string;
  descricao?: string;
  ativo: boolean;
}

interface CancelarReservaModalProps {
  isOpen: boolean;
  onClose: () => void;
  reserva: {
    id: string;
    item_id: string;
    usuario_reservou: string;
    usuario_item: string;
    valor_girinhas: number;
    itens?: {
      titulo: string;
      fotos: string[] | null;
    } | null;
    profiles_reservador?: {
      nome: string;
    } | null;
    profiles_vendedor?: {
      nome: string;
    } | null;
  };
  isVendedor: boolean;
  onCancelamentoCompleto: () => void;
}

export const CancelarReservaModal = ({
  isOpen,
  onClose,
  reserva,
  isVendedor,
  onCancelamentoCompleto
}: CancelarReservaModalProps) => {
  const [motivoSelecionado, setMotivoSelecionado] = useState<string>('');
  const [observacoes, setObservacoes] = useState('');
  const [loading, setLoading] = useState(false);
  const [motivosDisponiveis, setMotivosDisponiveis] = useState<MotivoCancel[]>([]);
  const [loadingMotivos, setLoadingMotivos] = useState(true);
  const { toast } = useToast();

  // 🔥 CORREÇÃO PRINCIPAL: Carregar motivos do banco de dados
  useEffect(() => {
    const carregarMotivos = async () => {
      if (!isOpen) return;
      
      setLoadingMotivos(true);
      try {
        const { data: motivos, error } = await supabase
          .from('motivos_cancelamento')
          .select('*')
          .eq('ativo', true)
          .order('id');

        if (error) {
          console.error('Erro ao carregar motivos:', error);
          toast({
            title: 'Erro ao carregar motivos',
            description: 'Não foi possível carregar os motivos de cancelamento.',
            variant: 'destructive',
          });
          return;
        }

        // 🎯 FILTRAR MOTIVOS POR TIPO DE USUÁRIO
        const motivosFiltrados = motivos?.filter(motivo => {
          if (isVendedor) {
            // Vendedor: pode usar todos os motivos exceto os específicos do comprador
            return !['comprador_desistencia', 'sistema_expiracao'].includes(motivo.codigo);
          } else {
            // Comprador: apenas motivos específicos para comprador
            return ['comprador_desistencia'].includes(motivo.codigo);
          }
        }) || [];

        setMotivosDisponiveis(motivosFiltrados);
      } catch (error) {
        console.error('Erro ao carregar motivos:', error);
        toast({
          title: 'Erro inesperado',
          description: 'Tente novamente em alguns instantes.',
          variant: 'destructive',
        });
      } finally {
        setLoadingMotivos(false);
      }
    };

    carregarMotivos();
  }, [isOpen, isVendedor, toast]);

  // Reset form when modal opens/closes
  useEffect(() => {
    if (!isOpen) {
      setMotivoSelecionado('');
      setObservacoes('');
    }
  }, [isOpen]);

  const handleCancelar = async () => {
    if (!motivoSelecionado) {
      toast({
        title: 'Motivo obrigatório',
        description: 'Por favor, selecione um motivo para o cancelamento.',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    try {
      // 🔥 CORREÇÃO: Usar ID correto baseado no tipo de usuário
      const userId = isVendedor ? reserva.usuario_item : reserva.usuario_reservou;

      const { data, error } = await supabase.rpc('cancelar_reserva_v2', {
        p_reserva_id: reserva.id,
        p_usuario_id: userId,
        p_motivo_codigo: motivoSelecionado,
        p_observacoes: observacoes || null
      });

      if (error) {
        throw error;
      }

      if (data === true || (data && typeof data === 'object' && 'sucesso' in data && (data as any).sucesso)) {
        toast({
          title: 'Reserva cancelada',
          description: 'A reserva foi cancelada e o valor foi reembolsado.',
        });
        
        onCancelamentoCompleto();
        onClose();
      } else {
        const erro = data && typeof data === 'object' && 'erro' in data ? String((data as any).erro) : 'Não foi possível cancelar a reserva';
        throw new Error(erro);
      }

    } catch (error: any) {
      console.error('Erro ao cancelar reserva:', error);
      toast({
        title: 'Erro ao cancelar',
        description: error.message || 'Tente novamente em alguns minutos.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-sm mx-auto p-0 gap-0">
        <div className="space-y-4 p-4">
          <div className="text-center">
            <DialogTitle className="text-lg font-semibold text-red-600">🚫 Cancelar Reserva</DialogTitle>
            <p className="text-sm text-gray-600 mt-1">
              Por que você está cancelando?
            </p>
          </div>

          {/* Informações do item */}
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="flex items-center gap-3">
              <img
                src={reserva.itens?.fotos?.[0] || "https://images.unsplash.com/photo-1618160702438-9b02ab6515c9?w=100"}
                alt={reserva.itens?.titulo || "Item"}
                className="w-12 h-12 rounded-lg object-cover"
              />
              <div className="flex-1">
                <h4 className="font-medium text-sm line-clamp-1">
                  {reserva.itens?.titulo || "Item"}
                </h4>
                <p className="text-xs text-gray-600">
                  {isVendedor 
                    ? `Comprador: ${reserva.profiles_reservador?.nome || 'Usuário'}`
                    : `Vendedor: ${reserva.profiles_vendedor?.nome || 'Usuário'}`
                  }
                </p>
                <Badge variant="secondary" className="text-xs mt-1">
                  {reserva.valor_girinhas} Girinhas
                </Badge>
              </div>
            </div>
          </div>
          
          {/* 🔥 CORREÇÃO: Opções carregadas dinamicamente */}
          <div className="space-y-2">
            {loadingMotivos ? (
              <div className="text-center text-sm text-gray-500 py-4">
                Carregando motivos...
              </div>
            ) : motivosDisponiveis.length === 0 ? (
              <div className="text-center text-sm text-gray-500 py-4">
                Nenhum motivo disponível
              </div>
            ) : (
              motivosDisponiveis.map((motivo) => (
                <label 
                  key={motivo.codigo} 
                  className="flex items-start space-x-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50"
                >
                  <input 
                    type="radio" 
                    name="motivo" 
                    value={motivo.codigo}
                    className="mt-1" 
                    checked={motivoSelecionado === motivo.codigo}
                    onChange={(e) => setMotivoSelecionado(e.target.value)}
                  />
                  <div className="flex-1">
                    <span className="text-sm font-medium">{motivo.nome}</span>
                    {motivo.descricao && (
                      <p className="text-xs text-gray-500 mt-1">{motivo.descricao}</p>
                    )}
                  </div>
                </label>
              ))
            )}
          </div>

          {/* Campo observações */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Observações (opcional)</label>
            <textarea 
              className="w-full p-3 border rounded-lg text-sm"
              placeholder="Adicione detalhes se necessário..."
              maxLength={200}
              rows={3}
              value={observacoes}
              onChange={(e) => setObservacoes(e.target.value)}
            />
          </div>

          {/* Botões */}
          <div className="flex flex-col gap-3 pt-4">
            <button 
              className="w-full bg-red-500 text-white py-3 rounded-lg font-medium disabled:opacity-50"
              onClick={handleCancelar}
              disabled={loading || !motivoSelecionado || loadingMotivos}
            >
              {loading ? 'Cancelando...' : 'Confirmar Cancelamento'}
            </button>
            <button 
              className="w-full border border-gray-300 py-3 rounded-lg font-medium"
              onClick={onClose}
              disabled={loading}
            >
              Manter Reserva
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CancelarReservaModal;
