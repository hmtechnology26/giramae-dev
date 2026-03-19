import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useState } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import type { ValidacaoUsuario } from '@/types/parcerias';

interface ModalRejeicaoProps {
  open: boolean;
  onClose: () => void;
  validacao: ValidacaoUsuario | null;
  onConfirm: (motivo: string) => Promise<void>;
}

const MOTIVOS_PREDEFINIDOS = [
  'Documentos incompletos',
  'Documentos ilegíveis',
  'Documentos vencidos',
  'Dados inconsistentes',
  'Não atende aos critérios do programa',
  'Outro motivo'
];

export default function ModalRejeicao({ open, onClose, validacao, onConfirm }: ModalRejeicaoProps) {
  const [motivoPredefinido, setMotivoPredefinido] = useState('');
  const [motivoDetalhado, setMotivoDetalhado] = useState('');
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState('');

  const handleConfirm = async () => {
    const motivoFinal = motivoPredefinido === 'Outro motivo' 
      ? motivoDetalhado 
      : `${motivoPredefinido}${motivoDetalhado ? ': ' + motivoDetalhado : ''}`;

    if (!motivoFinal || motivoFinal.length < 10) {
      setErro('O motivo deve ter pelo menos 10 caracteres');
      return;
    }

    setLoading(true);
    setErro('');
    try {
      await onConfirm(motivoFinal);
      setMotivoPredefinido('');
      setMotivoDetalhado('');
      onClose();
    } catch (error) {
      console.error('Erro ao rejeitar:', error);
      setErro('Erro ao rejeitar validação. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  if (!validacao) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Rejeitar Validação</DialogTitle>
          <DialogDescription>
            Informe o motivo da rejeição. O beneficiário será notificado.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Dados do Usuário */}
          <div className="bg-muted p-4 rounded-lg">
            <h4 className="font-semibold mb-2">Beneficiário</h4>
            <div className="space-y-1 text-sm">
              <p><strong>Nome:</strong> {validacao.profiles?.nome}</p>
              <p><strong>Email:</strong> {validacao.profiles?.email}</p>
            </div>
          </div>

          {/* Motivo Predefinido */}
          <div>
            <Label htmlFor="motivo-predefinido">Motivo da Rejeição</Label>
            <Select value={motivoPredefinido} onValueChange={setMotivoPredefinido}>
              <SelectTrigger id="motivo-predefinido" className="mt-1">
                <SelectValue placeholder="Selecione o motivo" />
              </SelectTrigger>
              <SelectContent>
                {MOTIVOS_PREDEFINIDOS.map((motivo) => (
                  <SelectItem key={motivo} value={motivo}>
                    {motivo}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Detalhamento */}
          <div>
            <Label htmlFor="motivo-detalhado">
              Detalhamento {motivoPredefinido === 'Outro motivo' && '(obrigatório)'}
            </Label>
            <Textarea
              id="motivo-detalhado"
              placeholder="Adicione detalhes sobre o motivo da rejeição..."
              value={motivoDetalhado}
              onChange={(e) => {
                setMotivoDetalhado(e.target.value);
                setErro('');
              }}
              rows={4}
              className="mt-1"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Mínimo de 10 caracteres
            </p>
          </div>

          {/* Erro */}
          {erro && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{erro}</AlertDescription>
            </Alert>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Cancelar
          </Button>
          <Button 
            variant="destructive" 
            onClick={handleConfirm} 
            disabled={loading || !motivoPredefinido}
          >
            {loading ? 'Rejeitando...' : 'Confirmar Rejeição'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
