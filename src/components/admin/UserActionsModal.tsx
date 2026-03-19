import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertTriangle, Calendar, Clock, Shield, Ban, UserX } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { UsuarioAdmin } from '@/hooks/useGerenciamentoUsuarios';

interface PenalidadeDetalhada {
  penalidade_id: string;
  tipo: string;
  nivel: number;
  motivo: string;
  created_at: string;
  expira_em?: string;
  aplicada_por?: string;
  status_penalidade: string;
  removida_por?: string;
  removida_em?: string;
  ativo: boolean;
  nivel_descricao: string;
  tipo_descricao: string;
  usuario_email: string;
  usuario_id: string;
  usuario_nome: string;
  usuario_username: string;
}

interface UserActionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  usuario: UsuarioAdmin | null;
  onRefresh: () => void;
}

export const UserActionsModal: React.FC<UserActionsModalProps> = ({
  isOpen,
  onClose,
  usuario,
  onRefresh
}) => {
  const [penalidades, setPenalidades] = useState<PenalidadeDetalhada[]>([]);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  
  // Estados para suspensão
  const [diasSuspensao, setDiasSuspensao] = useState('7');
  const [motivoSuspensao, setMotivoSuspensao] = useState('');
  
  // Estados para banimento
  const [motivoBanimento, setMotivoBanimento] = useState('');
  
  const { toast } = useToast();

  const fetchPenalidades = async () => {
    if (!usuario) return;
    
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('penalidades_usuarios_detalhada')
        .select('*')
        .eq('usuario_id', usuario.user_id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPenalidades(data || []);
    } catch (error) {
      console.error('Erro ao buscar penalidades:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar histórico de penalidades",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && usuario) {
      fetchPenalidades();
    }
  }, [isOpen, usuario]);

  const aplicarSuspensao = async () => {
    if (!usuario || !motivoSuspensao.trim()) {
      toast({
        title: "Erro",
        description: "Motivo da suspensão é obrigatório",
        variant: "destructive"
      });
      return;
    }

    try {
      setActionLoading('suspensao');
      const { data, error } = await supabase.rpc('aplicar_suspensao_manual', {
        p_usuario_id: usuario.user_id,
        p_duracao_dias: parseInt(diasSuspensao),
        p_motivo: motivoSuspensao,
        p_admin_id: (await supabase.auth.getUser()).data.user?.id
      });

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: `Suspensão de ${diasSuspensao} dias aplicada com sucesso`
      });

      setMotivoSuspensao('');
      fetchPenalidades();
      onRefresh();
    } catch (error) {
      console.error('Erro ao aplicar suspensão:', error);
      toast({
        title: "Erro",
        description: "Erro ao aplicar suspensão",
        variant: "destructive"
      });
    } finally {
      setActionLoading(null);
    }
  };

  const aplicarBanimento = async () => {
    if (!usuario || !motivoBanimento.trim()) {
      toast({
        title: "Erro",
        description: "Motivo do banimento é obrigatório",
        variant: "destructive"
      });
      return;
    }

    try {
      setActionLoading('banimento');
      const { data, error } = await supabase.rpc('aplicar_banimento_permanente', {
        p_usuario_id: usuario.user_id,
        p_motivo: motivoBanimento,
        p_admin_id: (await supabase.auth.getUser()).data.user?.id
      });

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Banimento permanente aplicado com sucesso"
      });

      setMotivoBanimento('');
      fetchPenalidades();
      onRefresh();
    } catch (error) {
      console.error('Erro ao aplicar banimento:', error);
      toast({
        title: "Erro",
        description: "Erro ao aplicar banimento",
        variant: "destructive"
      });
    } finally {
      setActionLoading(null);
    }
  };

  const removerPenalidade = async (penalidadeId: string) => {
    try {
      setActionLoading(penalidadeId);
      const { data, error } = await supabase.rpc('remover_penalidade_restaurar_usuario', {
        p_penalidade_id: penalidadeId,
        p_admin_id: (await supabase.auth.getUser()).data.user?.id
      });

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Penalidade removida com sucesso"
      });

      fetchPenalidades();
      onRefresh();
    } catch (error) {
      console.error('Erro ao remover penalidade:', error);
      toast({
        title: "Erro",
        description: "Erro ao remover penalidade",
        variant: "destructive"
      });
    } finally {
      setActionLoading(null);
    }
  };

  const getTipoBadgeConfig = (tipo: string, nivel: number) => {
    switch (tipo) {
      case 'advertencia':
        return { text: 'Advertência', className: 'bg-yellow-100 text-yellow-800' };
      case 'suspensao':
        return { text: 'Suspensão', className: 'bg-orange-100 text-orange-800' };
      case 'banimento':
        return { text: 'Banimento', className: 'bg-red-100 text-red-800' };
      default:
        return { text: tipo, className: 'bg-gray-100 text-gray-800' };
    }
  };

  if (!usuario) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Ações de Moderação - {usuario.nome}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Status atual */}
          <div className="bg-muted p-4 rounded-lg">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="font-medium">Status:</span> {usuario.status}
              </div>
              <div>
                <span className="font-medium">Reputação:</span> {usuario.pontuacao_reputacao}%
              </div>
              <div>
                <span className="font-medium">Violações:</span> {usuario.total_violacoes}
              </div>
              <div>
                <span className="font-medium">Penalidades Ativas:</span> {usuario.penalidades_ativas}
              </div>
            </div>
          </div>

          <Tabs defaultValue="historico" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="historico">Histórico</TabsTrigger>
              <TabsTrigger value="suspensao">Suspender</TabsTrigger>
              <TabsTrigger value="banimento">Banir</TabsTrigger>
            </TabsList>

            <TabsContent value="historico" className="space-y-4">
              <div className="space-y-3">
                <h3 className="font-medium flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4" />
                  Histórico de Penalidades
                </h3>
                
                {loading ? (
                  <div className="text-center py-8">Carregando...</div>
                ) : penalidades.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    Nenhuma penalidade encontrada
                  </div>
                ) : (
                  <div className="space-y-3">
                    {penalidades.map((penalidade) => {
                      const tipoConfig = getTipoBadgeConfig(penalidade.tipo, penalidade.nivel);
                      const isAtiva = penalidade.ativo;
                      
                      return (
                        <div key={penalidade.penalidade_id} className="border rounded-lg p-4">
                          <div className="flex items-start justify-between">
                            <div className="space-y-2 flex-1">
                              <div className="flex items-center gap-2">
                                <Badge variant="outline" className={tipoConfig.className}>
                                  {tipoConfig.text} - Nível {penalidade.nivel}
                                </Badge>
                                {isAtiva && (
                                  <Badge variant="destructive">Ativa</Badge>
                                )}
                              </div>
                              
                              <p className="text-sm"><strong>Motivo:</strong> {penalidade.motivo}</p>
                              
                              <div className="text-xs text-muted-foreground space-y-1">
                                <p>
                                  <Calendar className="w-3 h-3 inline mr-1" />
                                  Aplicada em: {format(new Date(penalidade.created_at), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                                </p>
                                {penalidade.expira_em && (
                                  <p>
                                    <Clock className="w-3 h-3 inline mr-1" />
                                    Expira em: {format(new Date(penalidade.expira_em), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                                  </p>
                                )}
                                {penalidade.removida_em && (
                                  <p>
                                    <UserX className="w-3 h-3 inline mr-1" />
                                    Removida em: {format(new Date(penalidade.removida_em), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                                  </p>
                                )}
                              </div>
                            </div>
                            
                            {isAtiva && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => removerPenalidade(penalidade.penalidade_id)}
                                disabled={actionLoading === penalidade.penalidade_id}
                              >
                                {actionLoading === penalidade.penalidade_id ? 'Removendo...' : 'Remover'}
                              </Button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="suspensao" className="space-y-4">
              <div className="space-y-4">
                <h3 className="font-medium flex items-center gap-2">
                  <Shield className="w-4 h-4" />
                  Aplicar Suspensão
                </h3>
                
                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium">Duração (dias)</label>
                    <Input
                      type="number"
                      value={diasSuspensao}
                      onChange={(e) => setDiasSuspensao(e.target.value)}
                      min="1"
                      max="365"
                      placeholder="Número de dias"
                    />
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium">Motivo *</label>
                    <Textarea
                      value={motivoSuspensao}
                      onChange={(e) => setMotivoSuspensao(e.target.value)}
                      placeholder="Descreva o motivo da suspensão..."
                      rows={3}
                    />
                  </div>
                  
                  <Button
                    onClick={aplicarSuspensao}
                    disabled={actionLoading === 'suspensao' || !motivoSuspensao.trim()}
                    className="w-full"
                    variant="destructive"
                  >
                    {actionLoading === 'suspensao' ? 'Aplicando...' : `Suspender por ${diasSuspensao} dias`}
                  </Button>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="banimento" className="space-y-4">
              <div className="space-y-4">
                <h3 className="font-medium flex items-center gap-2">
                  <Ban className="w-4 h-4" />
                  Aplicar Banimento Permanente
                </h3>
                
                <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
                  <p className="text-sm text-destructive font-medium">
                    ⚠️ ATENÇÃO: Esta ação irá banir permanentemente o usuário da plataforma.
                  </p>
                </div>
                
                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium">Motivo do Banimento *</label>
                    <Textarea
                      value={motivoBanimento}
                      onChange={(e) => setMotivoBanimento(e.target.value)}
                      placeholder="Descreva o motivo do banimento permanente..."
                      rows={4}
                    />
                  </div>
                  
                  <Button
                    onClick={aplicarBanimento}
                    disabled={actionLoading === 'banimento' || !motivoBanimento.trim()}
                    className="w-full"
                    variant="destructive"
                  >
                    {actionLoading === 'banimento' ? 'Aplicando...' : 'Banir Permanentemente'}
                  </Button>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
};