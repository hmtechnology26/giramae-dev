
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Copy } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface CodigoConfirmacaoModalProps {
  isOpen: boolean;
  onClose: () => void;
  reserva: {
    id: string;
    codigo_confirmacao?: string;
    valor_girinhas: number;
    itens?: {
      titulo: string;
      fotos: string[] | null;
    } | null;
    profiles_reservador?: {
      nome: string;
    } | null;
  };
  isVendedor: boolean;
  onConfirmarCodigo: (codigo: string) => Promise<boolean>;
  loading: boolean;
}

const CodigoConfirmacaoModal = ({
  isOpen,
  onClose,
  reserva,
  isVendedor,
  onConfirmarCodigo,
  loading
}: CodigoConfirmacaoModalProps) => {
  const [codigoInput, setCodigoInput] = useState("");
  const { toast } = useToast();

  const copiarCodigo = () => {
    if (reserva.codigo_confirmacao) {
      navigator.clipboard.writeText(reserva.codigo_confirmacao);
      toast({
        title: "Código copiado!",
        description: "O código foi copiado para a área de transferência.",
      });
    }
  };

  const handleConfirmar = async () => {
    if (!codigoInput.trim()) {
      toast({
        title: "Código obrigatório",
        description: "Digite o código de confirmação.",
        variant: "destructive",
      });
      return;
    }

    const sucesso = await onConfirmarCodigo(codigoInput.trim().toUpperCase());
    if (sucesso) {
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-600" />
            Código de Confirmação
          </DialogTitle>
          <DialogDescription>
            {isVendedor ? (
              <>
                Para finalizar a troca, digite o código de 6 dígitos que o comprador irá te mostrar.
                <span className="block mt-1 text-xs text-amber-600">
                  ⚠️ Este é o código de confirmação da entrega, diferente do código do item (GRM-XXXXX).
                </span>
              </>
            ) : (
              <>
                Mostre este código de 6 dígitos para o vendedor na hora da troca.
                <span className="block mt-1 text-xs text-muted-foreground">
                  ℹ️ Este código é diferente do código do item (GRM-XXXXX).
                </span>
              </>
            )}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Informações da reserva */}
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
                  {isVendedor ? `Comprador: ${reserva.profiles_reservador?.nome || 'Usuário'}` : 'Sua reserva'}
                </p>
                <Badge variant="secondary" className="text-xs mt-1">
                  {reserva.valor_girinhas} Girinhas
                </Badge>
              </div>
            </div>
          </div>

          {isVendedor ? (
            // Interface para o vendedor inserir o código
            <div className="space-y-3">
              <Label htmlFor="codigo">Digite o código mostrado pelo comprador:</Label>
              <div className="flex gap-2">
                <Input
                  id="codigo"
                  value={codigoInput}
                  onChange={(e) => setCodigoInput(e.target.value.toUpperCase())}
                  placeholder="EX: A1B2C3"
                  maxLength={6}
                  className="text-center font-mono text-lg tracking-wider"
                />
              </div>
              <p className="text-xs text-gray-500">
                💡 Dica: Confira se o código está correto antes de confirmar.
              </p>
            </div>
          ) : (
            // Interface para o comprador mostrar o código
            <div className="space-y-3">
              <Label>Seu código de confirmação:</Label>
              <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex-1 text-center">
                  <div className="text-2xl font-mono font-bold text-green-800 tracking-wider">
                    {reserva.codigo_confirmacao || "------"}
                  </div>
                  <p className="text-xs text-green-600 mt-1">
                    Mostre este código para o vendedor
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={copiarCodigo}
                  className="shrink-0"
                >
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
              <p className="text-xs text-gray-500">
                🔒 Este código confirma que você recebeu o item em perfeitas condições.
              </p>
            </div>
          )}
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button variant="outline" onClick={onClose} className="w-full sm:w-auto">
            {isVendedor ? "Cancelar" : "Fechar"}
          </Button>
          
          {isVendedor && (
            <Button 
              onClick={handleConfirmar} 
              disabled={loading || !codigoInput.trim()}
              className="w-full sm:w-auto bg-green-600 hover:bg-green-700"
            >
              {loading ? "Finalizando..." : "Finalizar Troca"}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CodigoConfirmacaoModal;
