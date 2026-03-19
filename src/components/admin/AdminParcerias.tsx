import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Building2, Users, FileText, Settings, CheckCircle, XCircle, Eye, Download } from 'lucide-react';
import { useAdminParcerias } from '@/hooks/parcerias/useAdminParcerias';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';

export default function AdminParcerias() {
  const { estatisticas, validacoesPendentes, loading, aprovarValidacao, rejeitarValidacao, downloadDocumento } = useAdminParcerias();
  const [motivoRejeicao, setMotivoRejeicao] = useState('');
  const [validacaoSelecionada, setValidacaoSelecionada] = useState<string | null>(null);
  const { toast } = useToast();

  const handleAprovar = async (validacaoId: string) => {
    await aprovarValidacao(validacaoId);
  };

  const handleRejeitar = async () => {
    if (!validacaoSelecionada || !motivoRejeicao.trim()) {
      toast({
        title: "Motivo obrigatório",
        description: "Informe o motivo da rejeição.",
        variant: "destructive"
      });
      return;
    }

    await rejeitarValidacao(validacaoSelecionada, motivoRejeicao);
    setValidacaoSelecionada(null);
    setMotivoRejeicao('');
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-20 w-full" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-32 w-full" />
          ))}
        </div>
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Building2 className="w-6 h-6 text-primary" />
            Gestão de Parcerias
          </h2>
          <p className="text-muted-foreground">
            Gerencie organizações, programas e validações de usuários
          </p>
        </div>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Nova Parceria
        </Button>
      </div>

      {/* Stats Cards */}
      {estatisticas && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Organizações</CardTitle>
              <Building2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{estatisticas.organizacoes_ativas}</div>
              <p className="text-xs text-muted-foreground">organizações ativas</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Programas</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{estatisticas.programas_ativos}</div>
              <p className="text-xs text-muted-foreground">programas ativos</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Usuários Aprovados</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{estatisticas.usuarios_aprovados_total}</div>
              <p className="text-xs text-muted-foreground">recebendo benefícios</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pendentes</CardTitle>
              <Settings className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{estatisticas.pendentes_validacao_total}</div>
              <p className="text-xs text-muted-foreground">aguardando análise</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Validações Pendentes */}
      <Card>
        <CardHeader>
          <CardTitle>Validações Pendentes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {validacoesPendentes.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                Nenhuma validação pendente no momento.
              </div>
            ) : (
              validacoesPendentes.map((validacao) => (
                <Card key={validacao.id} className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">{validacao.organizacao_nome}</Badge>
                        <Badge style={{ backgroundColor: '#2563eb' }}>{validacao.programa_nome}</Badge>
                      </div>
                      <div>
                        <p className="font-semibold">{validacao.usuario_nome}</p>
                        <p className="text-sm text-muted-foreground">{validacao.usuario_email}</p>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Solicitado em: {new Date(validacao.data_solicitacao).toLocaleDateString('pt-BR', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </div>
                      <div className="text-sm">
                        <strong>Dados:</strong> {Object.entries(validacao.dados_usuario as Record<string, string>).map(([key, value]) => (
                          <span key={key} className="mr-4">{key}: {String(value)}</span>
                        ))}
                      </div>
                      {validacao.documentos.length > 0 && (
                        <div className="text-sm">
                          <strong>Documentos:</strong>
                          <div className="flex gap-2 mt-1">
                            {validacao.documentos.map((doc: any, index: number) => (
                              <Badge 
                                key={index} 
                                variant="outline" 
                                className="cursor-pointer hover:bg-muted transition-colors"
                                onClick={() => downloadDocumento(validacao, doc)}
                              >
                                <Download className="w-3 h-3 mr-1" />
                                {doc.nome}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => handleAprovar(validacao.id)}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <CheckCircle className="w-4 h-4 mr-1" />
                        Aprovar
                      </Button>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => setValidacaoSelecionada(validacao.id)}
                          >
                            <XCircle className="w-4 h-4 mr-1" />
                            Rejeitar
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Rejeitar Validação</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div>
                              <label className="text-sm font-medium">Motivo da rejeição:</label>
                              <Textarea
                                placeholder="Informe o motivo da rejeição..."
                                value={motivoRejeicao}
                                onChange={(e) => setMotivoRejeicao(e.target.value)}
                                className="mt-1"
                              />
                            </div>
                            <div className="flex gap-2 justify-end">
                              <Button variant="outline" onClick={() => {
                                setValidacaoSelecionada(null);
                                setMotivoRejeicao('');
                              }}>
                                Cancelar
                              </Button>
                              <Button variant="destructive" onClick={handleRejeitar}>
                                Confirmar Rejeição
                              </Button>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </div>
                </Card>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}