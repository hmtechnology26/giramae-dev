
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Star, Heart } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

interface AvaliacaoModalProps {
  isOpen: boolean;
  onClose: () => void;
  reserva: {
    id: string;
    item_id: string;
    usuario_reservou: string;
    usuario_item: string;
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
  onAvaliacaoCompleta: () => void;
}

const AvaliacaoModal = ({ isOpen, onClose, reserva, onAvaliacaoCompleta }: AvaliacaoModalProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [rating, setRating] = useState(5);
  const [comentario, setComentario] = useState("");
  const [loading, setLoading] = useState(false);

  const isReservador = reserva.usuario_reservou === user?.id;
  const outraPessoa = isReservador ? reserva.profiles_vendedor : reserva.profiles_reservador;
  const usuarioAvaliado = isReservador ? reserva.usuario_item : reserva.usuario_reservou;

  const handleSubmitAvaliacao = async () => {
    if (!user || !usuarioAvaliado) return;

    setLoading(true);
    try {
      // Criar avaliação usando SQL raw query devido aos tipos não estarem atualizados
      const { error: avaliacaoError } = await supabase
        .from('avaliacoes' as any)
        .insert({
          reserva_id: reserva.id,
          avaliador_id: user.id,
          avaliado_id: usuarioAvaliado,
          item_id: reserva.item_id,
          rating: rating,
          comentario: comentario.trim() || null,
          tipo_avaliacao: isReservador ? 'comprador_para_vendedor' : 'vendedor_para_comprador'
        });

      if (avaliacaoError) throw avaliacaoError;

      // Atualizar reputação usando a função RPC
      const { error: reputacaoError } = await supabase
        .rpc('atualizar_reputacao' as any, {
          p_usuario_id: usuarioAvaliado,
          p_nova_nota: rating
        });

      if (reputacaoError) {
        console.error('Erro ao atualizar reputação:', reputacaoError);
        // Não bloquear o fluxo por erro de reputação
      }

      toast({
        title: "Avaliação enviada! ⭐",
        description: `Obrigada pelo feedback sobre ${outraPessoa?.nome}!`,
      });

      onAvaliacaoCompleta();
      onClose();
    } catch (error) {
      console.error('Erro ao salvar avaliação:', error);
      toast({
        title: "Erro ao avaliar",
        description: "Tente novamente em alguns minutos.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Heart className="w-5 h-5 text-primary" />
            Avaliar a troca
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div className="text-center">
            <p className="text-sm text-gray-600 mb-2">
              Como foi sua experiência com
            </p>
            <p className="font-semibold text-gray-800">
              {outraPessoa?.nome}?
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Item: {reserva.itens?.titulo}
            </p>
          </div>

          <div className="space-y-4">
            <div className="text-center">
              <p className="text-sm font-medium mb-3">Dê uma nota de 1 a 5 estrelas:</p>
              <div className="flex justify-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => setRating(star)}
                    className="p-1 transition-colors"
                  >
                    <Star
                      className={`w-8 h-8 ${
                        star <= rating 
                          ? 'fill-yellow-400 text-yellow-400' 
                          : 'text-gray-300'
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 block mb-2">
                Comentário (opcional)
              </label>
              <Textarea
                placeholder={`Conte como foi a experiência com ${outraPessoa?.nome}...`}
                value={comentario}
                onChange={(e) => setComentario(e.target.value)}
                rows={3}
                maxLength={500}
              />
              <p className="text-xs text-gray-500 mt-1">
                {comentario.length}/500 caracteres
              </p>
            </div>
          </div>

          <div className="flex gap-3">
            <Button 
              variant="outline" 
              onClick={onClose}
              className="flex-1"
              disabled={loading}
            >
              Depois
            </Button>
            <Button 
              onClick={handleSubmitAvaliacao}
              className="flex-1"
              disabled={loading}
            >
              {loading ? 'Enviando...' : 'Avaliar'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AvaliacaoModal;
