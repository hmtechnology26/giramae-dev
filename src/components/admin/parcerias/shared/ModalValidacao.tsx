import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useState } from 'react';
import { Download, FileText } from 'lucide-react';
import type { ValidacaoUsuario } from '@/types/parcerias';

interface ModalValidacaoProps {
  open: boolean;
  onClose: () => void;
  validacao: ValidacaoUsuario | null;
  onConfirm: (observacoes?: string) => Promise<void>;
}

export default function ModalValidacao({ open, onClose, validacao, onConfirm }: ModalValidacaoProps) {
  const [observacoes, setObservacoes] = useState('');
  const [loading, setLoading] = useState(false);

  const handleConfirm = async () => {
    setLoading(true);
    try {
      await onConfirm(observacoes);
      setObservacoes('');
      onClose();
    } catch (error) {
      console.error('Erro ao aprovar:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!validacao) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Aprovar Validação</DialogTitle>
          <DialogDescription>
            Confirme a aprovação do beneficiário no programa
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Dados do Usuário */}
          <div className="bg-muted p-4 rounded-lg">
            <h4 className="font-semibold mb-2">Dados do Beneficiário</h4>
            <div className="space-y-1 text-sm">
              <p><strong>Nome:</strong> {validacao.profiles?.nome}</p>
              <p><strong>Email:</strong> {validacao.profiles?.email}</p>
              <p><strong>Telefone:</strong> {validacao.profiles?.telefone || 'Não informado'}</p>
              <p><strong>Data Solicitação:</strong> {new Date(validacao.data_solicitacao).toLocaleDateString('pt-BR')}</p>
            </div>
          </div>

          {/* Documentos */}
          {validacao.documentos && validacao.documentos.length > 0 && (
            <div>
              <h4 className="font-semibold mb-2">Documentos Anexados</h4>
              <div className="space-y-2">
                {validacao.documentos.map((doc, idx) => (
                  <div key={idx} className="flex items-center justify-between bg-muted p-3 rounded">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      <span className="text-sm">{doc.nome}</span>
                    </div>
                    <Button size="sm" variant="outline">
                      <Download className="h-4 w-4 mr-1" />
                      Baixar
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Dados Adicionais */}
          {validacao.dados_usuario && Object.keys(validacao.dados_usuario).length > 0 && (
            <div>
              <h4 className="font-semibold mb-2">Informações Adicionais</h4>
              <div className="bg-muted p-3 rounded text-sm">
                <pre className="whitespace-pre-wrap">{JSON.stringify(validacao.dados_usuario, null, 2)}</pre>
              </div>
            </div>
          )}

          {/* Observações */}
          <div>
            <Label htmlFor="observacoes">Observações (opcional)</Label>
            <Textarea
              id="observacoes"
              placeholder="Adicione observações sobre esta aprovação..."
              value={observacoes}
              onChange={(e) => setObservacoes(e.target.value)}
              rows={3}
              className="mt-1"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Cancelar
          </Button>
          <Button onClick={handleConfirm} disabled={loading}>
            {loading ? 'Aprovando...' : 'Confirmar Aprovação'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
