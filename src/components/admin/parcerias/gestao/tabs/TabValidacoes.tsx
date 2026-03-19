import { useState } from 'react';
import { useValidacoes } from '@/hooks/parcerias/useValidacoes';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Download, CheckCircle, XCircle, FileText, Clock } from 'lucide-react';
import ModalValidacao from '../../shared/ModalValidacao';
import ModalRejeicao from '../../shared/ModalRejeicao';
import EmptyState from '../../shared/EmptyState';
import { Skeleton } from '@/components/ui/skeleton';
import type { ValidacaoUsuario } from '@/types/parcerias';

interface TabValidacoesProps {
  programaId: string;
}

export default function TabValidacoes({ programaId }: TabValidacoesProps) {
  const [validacaoSelecionada, setValidacaoSelecionada] = useState<ValidacaoUsuario | null>(null);
  const [modalAprovar, setModalAprovar] = useState(false);
  const [modalRejeitar, setModalRejeitar] = useState(false);

  const {
    validacoesPendentes,
    loading,
    aprovar,
    rejeitar,
    downloadDocumento
  } = useValidacoes(programaId);

  const handleAprovar = (validacao: ValidacaoUsuario) => {
    setValidacaoSelecionada(validacao);
    setModalAprovar(true);
  };

  const handleRejeitar = (validacao: ValidacaoUsuario) => {
    setValidacaoSelecionada(validacao);
    setModalRejeitar(true);
  };

  const confirmarAprovacao = async () => {
    if (validacaoSelecionada) {
      await aprovar(validacaoSelecionada.id);
    }
  };

  const confirmarRejeicao = async (motivo: string) => {
    if (validacaoSelecionada) {
      await rejeitar(validacaoSelecionada.id, motivo);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h3 className="text-lg font-semibold">
            Validações Pendentes ({validacoesPendentes.length})
          </h3>
          <p className="text-sm text-muted-foreground">
            Analise e aprove os novos beneficiários
          </p>
        </div>
      </div>

      {/* Lista de Validações */}
      {validacoesPendentes.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <EmptyState 
              icon={CheckCircle}
              titulo="Nenhuma validação pendente"
              mensagem="Todas as solicitações foram processadas!"
            />
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {validacoesPendentes.map((validacao) => (
            <Card key={validacao.id}>
              <CardContent className="p-4 sm:p-6">
                <div className="flex flex-col gap-4">
                  {/* Informações do Beneficiário */}
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold truncate">{validacao.profiles?.nome}</h4>
                      <p className="text-sm text-muted-foreground truncate">{validacao.profiles?.email}</p>
                      {validacao.profiles?.telefone && (
                        <p className="text-sm text-muted-foreground">{validacao.profiles.telefone}</p>
                      )}
                    </div>
                    <Badge variant="outline" className="shrink-0">
                      <Clock className="h-3 w-3 mr-1" />
                      {new Date(validacao.data_solicitacao).toLocaleDateString('pt-BR')}
                    </Badge>
                  </div>

                  {/* Documentos */}
                  {validacao.documentos && validacao.documentos.length > 0 && (
                    <div>
                      <p className="text-sm font-medium mb-2">Documentos anexados:</p>
                      <div className="flex flex-wrap gap-2">
                        {validacao.documentos.map((doc, idx) => (
                          <Button
                            key={idx}
                            size="sm"
                            variant="outline"
                            onClick={() => downloadDocumento(validacao, doc)}
                          >
                            <FileText className="h-3 w-3 mr-1" />
                            {doc.nome}
                            <Download className="h-3 w-3 ml-1" />
                          </Button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Ações */}
                  <div className="flex flex-col sm:flex-row gap-2 pt-2 border-t">
                    <Button
                      className="flex-1"
                      onClick={() => handleAprovar(validacao)}
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Aprovar
                    </Button>
                    <Button
                      className="flex-1"
                      variant="destructive"
                      onClick={() => handleRejeitar(validacao)}
                    >
                      <XCircle className="h-4 w-4 mr-2" />
                      Rejeitar
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Modais */}
      <ModalValidacao
        open={modalAprovar}
        onClose={() => setModalAprovar(false)}
        validacao={validacaoSelecionada}
        onConfirm={confirmarAprovacao}
      />

      <ModalRejeicao
        open={modalRejeitar}
        onClose={() => setModalRejeitar(false)}
        validacao={validacaoSelecionada}
        onConfirm={confirmarRejeicao}
      />
    </div>
  );
}
