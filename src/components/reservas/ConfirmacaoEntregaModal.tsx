
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CheckCircle, Package, Clock, AlertTriangle } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface ConfirmacaoEntregaModalProps {
  isOpen: boolean;
  onClose: () => void;
  reserva: {
    id: string;
    confirmado_por_reservador: boolean;
    confirmado_por_vendedor: boolean;
    itens?: {
      titulo: string;
    } | null;
    profiles_reservador?: {
      nome: string;
    } | null;
    profiles_vendedor?: {
      nome: string;
    } | null;
  };
  isReservador: boolean;
  onConfirmar: () => void;
  loading: boolean;
}

const ConfirmacaoEntregaModal = ({
  isOpen,
  onClose,
  reserva,
  isReservador,
  onConfirmar,
  loading
}: ConfirmacaoEntregaModalProps) => {
  const jaConfirmei = isReservador 
    ? reserva.confirmado_por_reservador 
    : reserva.confirmado_por_vendedor;
  
  const outraConfirmou = isReservador 
    ? reserva.confirmado_por_vendedor 
    : reserva.confirmado_por_reservador;

  const outraPessoa = isReservador 
    ? reserva.profiles_vendedor 
    : reserva.profiles_reservador;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="w-5 h-5 text-primary" />
            Confirmar {isReservador ? 'Recebimento' : 'Entrega'}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div className="text-center">
            <h3 className="font-semibold text-gray-800 mb-2">
              {reserva.itens?.titulo}
            </h3>
            <p className="text-sm text-gray-600">
              {isReservador 
                ? `Você recebeu este item de ${outraPessoa?.nome}?`
                : `Você entregou este item para ${outraPessoa?.nome}?`
              }
            </p>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-2">
                <CheckCircle className={`w-4 h-4 ${jaConfirmei ? 'text-green-500' : 'text-gray-400'}`} />
                <span className="text-sm">Sua confirmação</span>
              </div>
              <Badge variant={jaConfirmei ? "default" : "secondary"}>
                {jaConfirmei ? 'Confirmado' : 'Pendente'}
              </Badge>
            </div>

            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-2">
                <CheckCircle className={`w-4 h-4 ${outraConfirmou ? 'text-green-500' : 'text-gray-400'}`} />
                <span className="text-sm">{outraPessoa?.nome}</span>
              </div>
              <Badge variant={outraConfirmou ? "default" : "secondary"}>
                {outraConfirmou ? 'Confirmado' : 'Pendente'}
              </Badge>
            </div>
          </div>

          {!jaConfirmei && (
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="flex items-start gap-2">
                <AlertTriangle className="w-5 h-5 text-blue-600 mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium text-blue-800 mb-1">
                    Importante:
                  </p>
                  <p className="text-blue-700">
                    {isReservador 
                      ? 'Confirme apenas se você realmente recebeu o item conforme o combinado.'
                      : 'Confirme apenas se você realmente entregou o item para a outra mãe.'
                    }
                  </p>
                </div>
              </div>
            </div>
          )}

          {jaConfirmei && !outraConfirmou && (
            <div className="bg-yellow-50 p-4 rounded-lg">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-yellow-600" />
                <div className="text-sm">
                  <p className="font-medium text-yellow-800">
                    Aguardando confirmação
                  </p>
                  <p className="text-yellow-700">
                    Esperando {outraPessoa?.nome} confirmar também.
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="flex gap-3">
            <Button 
              variant="outline" 
              onClick={onClose}
              className="flex-1"
              disabled={loading}
            >
              Cancelar
            </Button>
            
            {!jaConfirmei && (
              <Button 
                onClick={onConfirmar}
                className="flex-1 bg-green-600 hover:bg-green-700"
                disabled={loading}
              >
                {loading ? 'Confirmando...' : `Confirmar ${isReservador ? 'Recebimento' : 'Entrega'}`}
              </Button>
            )}

            {jaConfirmei && (
              <Button 
                variant="outline"
                onClick={onClose}
                className="flex-1"
              >
                Fechar
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ConfirmacaoEntregaModal;
