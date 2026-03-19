import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useState } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

interface ModalSuspenderProps {
  open: boolean;
  onClose: () => void;
  beneficiario: { nome: string; email: string } | null;
  onConfirm: (motivo: string) => Promise<void>;
}

export default function ModalSuspender({ open, onClose, beneficiario, onConfirm }: ModalSuspenderProps) {
  const [motivo, setMotivo] = useState('');
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState('');

  const handleConfirm = async () => {
    if (!motivo || motivo.length < 10) {
      setErro('O motivo deve ter pelo menos 10 caracteres');
      return;
    }

    setLoading(true);
    setErro('');
    try {
      await onConfirm(motivo);
      setMotivo('');
      onClose();
    } catch (error) {
      console.error('Erro ao suspender:', error);
      setErro('Erro ao suspender beneficiário. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  if (!beneficiario) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Suspender Beneficiário</DialogTitle>
          <DialogDescription>
            O beneficiário será temporariamente suspenso do programa
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Dados do Beneficiário */}
          <div className="bg-muted p-4 rounded-lg">
            <div className="space-y-1 text-sm">
              <p><strong>Nome:</strong> {beneficiario.nome}</p>
              <p><strong>Email:</strong> {beneficiario.email}</p>
            </div>
          </div>

          {/* Motivo */}
          <div>
            <Label htmlFor="motivo-suspensao">Motivo da Suspensão</Label>
            <Textarea
              id="motivo-suspensao"
              placeholder="Explique o motivo da suspensão..."
              value={motivo}
              onChange={(e) => {
                setMotivo(e.target.value);
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
            disabled={loading || !motivo}
          >
            {loading ? 'Suspendendo...' : 'Confirmar Suspensão'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
