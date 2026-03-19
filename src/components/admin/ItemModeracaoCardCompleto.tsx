import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { 
  Check, 
  X, 
  AlertTriangle, 
  Calendar,
  Eye,
  Clock,
  CheckCircle,
  XCircle,
  Flag,
  DollarSign,
  MapPin,
  Star,
  Info,
  Package,
  Shirt,
  Palette,
  Phone,
  Mail,
  School,
  Wallet,
  Edit,
  User,
  Image,
  FileText,
  CreditCard,
  Activity
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useUserCarteira } from '@/hooks/useUserCarteira';
import { useUserProfiles } from '@/hooks/useUserProfiles';
import EditarItemModeracao from './EditarItemModeracao';
import { buildItemImageUrl } from '@/lib/cdn';

interface ItemModeracaoCardCompletoProps {
  item: any;
  onAprovar: (moderacaoId: string) => Promise<void>;
  onRejeitar: (moderacaoId: string, motivo: string, observacoes?: string) => Promise<void>;
  onAceitarDenuncia: (denunciaId: string, comentario: string, observacoes?: string) => Promise<void>;
  onRejeitarDenuncia: (denunciaId: string, observacoes: string) => Promise<void>;
  loading: boolean;
}

const ItemModeracaoCardCompleto: React.FC<ItemModeracaoCardCompletoProps> = ({
  item,
  onAprovar,
  onRejeitar,
  onAceitarDenuncia,
  onRejeitarDenuncia,
  loading
}) => {
  const [userModalAberto, setUserModalAberto] = useState(false);
  const [editModalAberto, setEditModalAberto] = useState(false);
  const [fullImageModal, setFullImageModal] = useState<string | null>(null);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  
  // Estados para modais de moderação
  const [rejeitandoItem, setRejeitandoItem] = useState(false);
  const [motivoRejeicao, setMotivoRejeicao] = useState('');
  const [observacoesRejeicao, setObservacoesRejeicao] = useState('');

  // Estados para modais de denúncia
  const [aceitandoDenuncia, setAceitandoDenuncia] = useState(false);
  const [rejeitandoDenuncia, setRejeitandoDenuncia] = useState(false);
  const [comentarioAceitar, setComentarioAceitar] = useState('');
  const [observacoesAceitar, setObservacoesAceitar] = useState('');
  const [observacoesRejeitar, setObservacoesRejeitar] = useState('');

  const { profiles, fetchUserProfile } = useUserProfiles();
  const { data: carteiraData } = useUserCarteira(item.usuario_id);
  
  const userProfile = profiles[item.usuario_id];

  // Options para os selects
  const motivosRejeicao = [
    { value: 'conteudo_inadequado', label: 'Conteúdo inadequado' },
    { value: 'preco_incorreto', label: 'Preço incorreto' },
    { value: 'fotos_ruins', label: 'Fotos de baixa qualidade' },
    { value: 'descricao_insuficiente', label: 'Descrição insuficiente' },
    { value: 'item_danificado', label: 'Item muito danificado' },
    { value: 'categoria_errada', label: 'Categoria incorreta' },
    { value: 'duplicado', label: 'Item duplicado' },
    { value: 'outros', label: 'Outros motivos' }
  ];

  const motivosAceitarDenuncia = [
    { value: 'denuncia_procedente', label: 'Denúncia procedente' },
    { value: 'conteudo_inapropriado', label: 'Conteúdo inapropriado' },
    { value: 'preco_abusivo', label: 'Preço abusivo' },
    { value: 'informacoes_falsas', label: 'Informações falsas' },
    { value: 'item_danificado', label: 'Item danificado' },
    { value: 'spam', label: 'Spam' },
    { value: 'violacao_termos', label: 'Violação dos termos' }
  ];

  useEffect(() => {
    if (item.usuario_id && !userProfile) {
      console.log('🔍 Buscando perfil para usuário:', item.usuario_id);
      fetchUserProfile(item.usuario_id);
    }
  }, [item.usuario_id, userProfile, fetchUserProfile]);

  // Handlers para confirmar ações
  const handleRejeitarItemConfirm = async () => {
    if (!motivoRejeicao) return;
    
    await onRejeitar(item.moderacao_id, motivoRejeicao, observacoesRejeicao);
    setRejeitandoItem(false);
    setMotivoRejeicao('');
    setObservacoesRejeicao('');
  };

  const handleAceitarDenunciaConfirm = async () => {
    if (!comentarioAceitar) return;
    
    await onAceitarDenuncia(item.denuncia_id, comentarioAceitar, observacoesAceitar);
    setAceitandoDenuncia(false);
    setComentarioAceitar('');
    setObservacoesAceitar('');
  };

  const handleRejeitarDenunciaConfirm = async () => {
    if (!observacoesRejeitar) return;
    
    await onRejeitarDenuncia(item.denuncia_id, observacoesRejeitar);
    setRejeitandoDenuncia(false);
    setObservacoesRejeitar('');
  };

  const StatusBadge = ({ status, temDenuncia }: { status: string; temDenuncia: boolean }) => {
    if (temDenuncia) {
      return (
        <Badge variant="destructive" className="gap-1 animate-pulse">
          <AlertTriangle className="w-3 h-3" />
          Denunciado
        </Badge>
      );
    }
    
    switch (status) {
      case 'pendente':
        return <Badge variant="secondary" className="gap-1"><Clock className="w-3 h-3" />Pendente</Badge>;
      case 'em_analise':
        return <Badge variant="outline" className="gap-1 border-yellow-500 text-yellow-600"><Eye className="w-3 h-3" />Em Análise</Badge>;
      case 'aprovado':
        return <Badge variant="default" className="gap-1 bg-green-500"><CheckCircle className="w-3 h-3" />Aprovado</Badge>;
      case 'rejeitado':
        return <Badge variant="destructive" className="gap-1"><XCircle className="w-3 h-3" />Rejeitado</Badge>;
      default:
        return <Badge variant="secondary">-</Badge>;
    }
  };

  const getCategoriaIcon = (categoria: string) => {
    switch (categoria.toLowerCase()) {
      case 'eletrônicos':
        return <Package className="w-4 h-4" />;
      case 'moda':
        return <Shirt className="w-4 h-4" />;
      default:
        return <Palette className="w-4 h-4" />;
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  return (
    <>
      <Card className={`hover:shadow-lg transition-all duration-200 ${item.tem_denuncia ? 'ring-2 ring-red-200 bg-red-50/30' : ''}`}>
        <CardContent className="p-0">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-0">
            
            {/* Coluna 1: Imagens do Item */}
            <div className="p-6 border-r border-border">
              <div className="space-y-4">
                {/* Imagem Principal */}
                <div className="relative">
                  <div className="aspect-square bg-muted rounded-lg overflow-hidden cursor-pointer" 
                       onClick={() => setFullImageModal(item.fotos?.[activeImageIndex] || item.primeira_foto)}>
                    {(item.fotos?.[activeImageIndex] || item.primeira_foto) ? (
                      <img 
                        src={item.fotos?.[activeImageIndex] || item.primeira_foto} 
                        alt={item.titulo}
                        className="w-full h-full object-cover hover:scale-105 transition-transform"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Package className="w-12 h-12 text-muted-foreground" />
                      </div>
                    )}
                  </div>
                  
                  {/* Indicador de múltiplas fotos */}
                  {item.fotos && item.fotos.length > 1 && (
                    <div className="absolute top-2 right-2 bg-black/70 text-white px-2 py-1 rounded-md text-xs">
                      <Image className="w-3 h-3 inline mr-1" />
                      {activeImageIndex + 1}/{item.fotos.length}
                    </div>
                  )}
                </div>

                {/* Thumbnails */}
                {item.fotos && item.fotos.length > 1 && (
                  <div className="flex gap-2 overflow-x-auto">
                    {item.fotos.map((foto: string, index: number) => (
                      <div
                        key={index}
                        className={`flex-shrink-0 w-16 h-16 rounded-md overflow-hidden cursor-pointer border-2 
                          ${index === activeImageIndex ? 'border-primary' : 'border-transparent'}`}
                        onClick={() => setActiveImageIndex(index)}
                      >
                        <img src={foto} alt={`${item.titulo} ${index + 1}`} className="w-full h-full object-cover" />
                      </div>
                    ))}
                  </div>
                )}

                {/* Status e Ações Rápidas */}
                <div className="space-y-2">
                  <StatusBadge status={item.moderacao_status} temDenuncia={item.tem_denuncia} />
                  
                  <div className="flex gap-2">
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="flex-1 gap-1 h-8"
                      onClick={() => setEditModalAberto(true)}
                    >
                      <Edit className="w-3 h-3" />
                      Editar
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="flex-1 gap-1 h-8"
                      onClick={() => setFullImageModal(item.fotos?.[0] || item.primeira_foto)}
                    >
                      <Eye className="w-3 h-3" />
                      Ver
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            {/* Coluna 2: Informações do Item */}
            <div className="p-6 border-r border-border">
              <div className="space-y-4">
                {/* Título e Categoria */}
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    {getCategoriaIcon(item.categoria)}
                    <span className="text-sm text-muted-foreground">{item.categoria}</span>
                    {item.subcategoria && <span className="text-xs text-muted-foreground">• {item.subcategoria}</span>}
                  </div>
                  <h3 className="font-semibold text-lg leading-tight">{item.titulo}</h3>
                </div>

                {/* Preço */}
                <div className="flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-green-600" />
                  <span className="text-xl font-bold text-green-600">{item.valor_girinhas} Girinhas</span>
                  <span className="text-sm text-muted-foreground">≈ {formatCurrency(item.valor_girinhas * 1.0)}</span>
                </div>

                {/* Características */}
                <div className="space-y-2">
                  <div className="flex gap-2 flex-wrap">
                    <Badge variant="outline" className="text-xs">
                      {item.estado_conservacao}
                    </Badge>
                    {item.genero && (
                      <Badge variant="outline" className="text-xs">
                        {item.genero}
                      </Badge>
                    )}
                    {item.tamanho_valor && (
                      <Badge variant="outline" className="text-xs">
                        Tam. {item.tamanho_valor}
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Descrição */}
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <FileText className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Descrição</span>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed max-h-24 overflow-y-auto">
                    {item.descricao}
                  </p>
                </div>

                {/* Data de Publicação */}
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="w-4 h-4" />
                  <span>Publicado {formatDistanceToNow(new Date(item.data_publicacao), { addSuffix: true, locale: ptBR })}</span>
                </div>

                {/* Informações de Denúncia */}
                {item.tem_denuncia && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <AlertTriangle className="w-4 h-4 text-red-600" />
                      <span className="font-medium text-red-800">Denúncia Recebida</span>
                      <Badge variant="destructive" className="text-xs">
                        {item.total_denuncias} denúncia{item.total_denuncias > 1 ? 's' : ''}
                      </Badge>
                    </div>
                    <div className="space-y-1 text-sm text-red-700">
                      <p><strong>Motivo:</strong> {item.motivo_denuncia}</p>
                      {item.descricao_denuncia && (
                        <p><strong>Descrição:</strong> {item.descricao_denuncia}</p>
                      )}
                      {item.data_denuncia && (
                        <p><strong>Denunciado:</strong> {formatDistanceToNow(new Date(item.data_denuncia), { addSuffix: true, locale: ptBR })}</p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Coluna 3: Informações do Usuário e Ações */}
            <div className="p-6">
              <div className="space-y-4">
                {/* Informações do Usuário */}
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <User className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Informações do Vendedor</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setUserModalAberto(true)}
                      className="h-6 w-6 p-0 ml-auto"
                    >
                      <Info className="w-3 h-3" />
                    </Button>
                  </div>

                  <div className="space-y-3">
                    {/* Avatar e Nome */}
                    <div className="flex items-center gap-3">
                      <Avatar className="w-10 h-10">
                        <AvatarImage src={userProfile?.avatar_url} />
                        <AvatarFallback className="text-sm">
                          {item.usuario_nome.split(' ').map((n: string) => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <p className="font-medium">{item.usuario_nome}</p>
                        <Button
                          variant="link"
                          size="sm"
                          className="h-auto p-0 text-blue-600 text-xs"
                          onClick={() => window.open(`/perfil/${item.usuario_id}`, '_blank')}
                        >
                          Ver perfil público →
                        </Button>
                      </div>
                    </div>

                    {/* Informações Básicas */}
                    {userProfile && (
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center gap-2">
                          <Mail className="w-3 h-3 text-muted-foreground" />
                          <span className="text-muted-foreground">{userProfile.email}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Phone className="w-3 h-3 text-muted-foreground" />
                          <span className="text-muted-foreground">{userProfile.telefone || 'Não informado'}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin className="w-3 h-3 text-muted-foreground" />
                          <span className="text-muted-foreground">{userProfile.cidade}, {userProfile.estado}</span>
                        </div>
                      </div>
                    )}

                    {/* Estatísticas do Usuário */}
                      {userProfile && (
                        <div className="grid grid-cols-2 gap-2 text-center">
                          <div className="p-2 bg-muted rounded-md">
                            <p className="text-lg font-bold text-green-600">{userProfile.total_vendas || 0}</p>
                            <p className="text-xs text-muted-foreground">Vendas</p>
                          </div>
                          <div className="p-2 bg-muted rounded-md">
                            <p className="text-lg font-bold text-blue-600">{userProfile.total_compras || 0}</p>
                            <p className="text-xs text-muted-foreground">Compras</p>
                          </div>
                        </div>
                      )}

                      {/* Saldo da Carteira */}
                      {carteiraData && (
                        <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                          <div className="flex items-center gap-2 mb-2">
                            <Wallet className="w-4 h-4 text-green-600" />
                            <span className="font-medium text-green-800">Carteira</span>
                          </div>
                          <div className="grid grid-cols-3 gap-2 text-center text-sm">
                            <div>
                              <p className="font-bold text-green-600">{carteiraData.saldo_atual}</p>
                              <p className="text-xs text-muted-foreground">Saldo</p>
                            </div>
                            <div>
                              <p className="font-bold text-blue-600">{carteiraData.total_recebido}</p>
                              <p className="text-xs text-muted-foreground">Recebido</p>
                            </div>
                            <div>
                              <p className="font-bold text-red-600">{carteiraData.total_gasto}</p>
                              <p className="text-xs text-muted-foreground">Gasto</p>
                            </div>
                          </div>
                        </div>
                      )}

                    {/* Reputação */}
                    {userProfile?.reputacao && (
                      <div className="flex items-center gap-2 justify-center">
                        <Star className="w-4 h-4 text-yellow-500 fill-current" />
                        <span className="font-medium">{userProfile.reputacao}</span>
                        <span className="text-sm text-muted-foreground">de reputação</span>
                      </div>
                    )}
                  </div>
                </div>

                <Separator />

                {/* Ações de Moderação */}
                <div className="space-y-2">
                  <h4 className="text-sm font-medium flex items-center gap-2">
                    <Activity className="w-4 h-4" />
                    Ações de Moderação
                  </h4>
                  
                  {item.tem_denuncia && item.denuncia_id ? (
                    <div className="space-y-2">
                      <Dialog open={aceitandoDenuncia} onOpenChange={setAceitandoDenuncia}>
                        <DialogTrigger asChild>
                          <Button
                            size="sm"
                            variant="destructive"
                            disabled={loading}
                            className="w-full gap-2"
                          >
                            <Check className="w-4 h-4" />
                            Aceitar Denúncia
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Aceitar Denúncia</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div>
                              <label className="text-sm font-medium">Motivo da aceitação</label>
                              <Select value={comentarioAceitar} onValueChange={setComentarioAceitar}>
                                <SelectTrigger>
                                  <SelectValue placeholder="Selecione o motivo" />
                                </SelectTrigger>
                                <SelectContent>
                                  {motivosAceitarDenuncia.map((motivo) => (
                                    <SelectItem key={motivo.value} value={motivo.value}>
                                      {motivo.label}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                            
                            <div>
                              <label className="text-sm font-medium">Observações (opcional)</label>
                              <Textarea
                                placeholder="Detalhes adicionais sobre a decisão..."
                                value={observacoesAceitar}
                                onChange={(e) => setObservacoesAceitar(e.target.value)}
                              />
                            </div>
                            
                            <div className="flex gap-2 justify-end">
                              <Button variant="outline" onClick={() => setAceitandoDenuncia(false)}>
                                Cancelar
                              </Button>
                              <Button 
                                variant="destructive" 
                                onClick={handleAceitarDenunciaConfirm}
                                disabled={!comentarioAceitar || loading}
                              >
                                {loading ? 'Processando...' : 'Aceitar Denúncia'}
                              </Button>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>

                      <Dialog open={rejeitandoDenuncia} onOpenChange={setRejeitandoDenuncia}>
                        <DialogTrigger asChild>
                          <Button
                            size="sm"
                            className="w-full gap-2 bg-green-600 hover:bg-green-700"
                            disabled={loading}
                          >
                            <X className="w-4 h-4" />
                            Rejeitar Denúncia
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Rejeitar Denúncia</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div>
                              <label className="text-sm font-medium">Motivo da rejeição</label>
                              <Textarea
                                placeholder="Explique por que a denúncia está sendo rejeitada..."
                                value={observacoesRejeitar}
                                onChange={(e) => setObservacoesRejeitar(e.target.value)}
                              />
                            </div>
                            
                            <div className="flex gap-2 justify-end">
                              <Button variant="outline" onClick={() => setRejeitandoDenuncia(false)}>
                                Cancelar
                              </Button>
                              <Button 
                                className="bg-green-600 hover:bg-green-700"
                                onClick={handleRejeitarDenunciaConfirm}
                                disabled={!observacoesRejeitar || loading}
                              >
                                {loading ? 'Processando...' : 'Rejeitar Denúncia'}
                              </Button>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <Button
                        onClick={() => onAprovar(item.moderacao_id)}
                        size="sm"
                        className="w-full gap-2 bg-green-600 hover:bg-green-700"
                        disabled={loading}
                      >
                        <Check className="w-4 h-4" />
                        Aprovar Item
                      </Button>
                      
                      <Dialog open={rejeitandoItem} onOpenChange={setRejeitandoItem}>
                        <DialogTrigger asChild>
                          <Button
                            size="sm"
                            variant="destructive"
                            disabled={loading}
                            className="w-full gap-2"
                          >
                            <X className="w-4 h-4" />
                            Rejeitar Item
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Rejeitar Item</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div>
                              <label className="text-sm font-medium">Motivo da rejeição</label>
                              <Select value={motivoRejeicao} onValueChange={setMotivoRejeicao}>
                                <SelectTrigger>
                                  <SelectValue placeholder="Selecione o motivo" />
                                </SelectTrigger>
                                <SelectContent>
                                  {motivosRejeicao.map((motivo) => (
                                    <SelectItem key={motivo.value} value={motivo.value}>
                                      {motivo.label}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                            
                            <div>
                              <label className="text-sm font-medium">Observações</label>
                              <Textarea
                                placeholder="Detalhes adicionais sobre a rejeição..."
                                value={observacoesRejeicao}
                                onChange={(e) => setObservacoesRejeicao(e.target.value)}
                              />
                            </div>
                            
                            <div className="flex gap-2 justify-end">
                              <Button variant="outline" onClick={() => setRejeitandoItem(false)}>
                                Cancelar
                              </Button>
                              <Button 
                                variant="destructive" 
                                onClick={handleRejeitarItemConfirm}
                                disabled={!motivoRejeicao || loading}
                              >
                                {loading ? 'Processando...' : 'Confirmar Rejeição'}
                              </Button>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Modal de Informações Completas do Usuário */}
      <Dialog open={userModalAberto} onOpenChange={setUserModalAberto}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Informações Completas do Usuário</DialogTitle>
          </DialogHeader>
          
          {userProfile && (
            <div className="space-y-4">
              {/* Avatar e Nome */}
              <div className="flex items-center gap-4">
                <Avatar className="w-16 h-16">
                  <AvatarImage src={userProfile.avatar_url} />
                  <AvatarFallback className="text-lg">
                    {userProfile.nome.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-semibold text-lg">{userProfile.nome}</h3>
                  <p className="text-muted-foreground">{userProfile.email}</p>
                </div>
              </div>

              {/* Informações Pessoais */}
              <div className="grid grid-cols-1 gap-3 text-sm">
                <div>
                  <p className="font-medium">Telefone</p>
                  <p className="text-muted-foreground">{userProfile.telefone || 'Não informado'}</p>
                </div>
                <div>
                  <p className="font-medium">Localização</p>
                  <p className="text-muted-foreground">{userProfile.cidade}, {userProfile.estado}</p>
                </div>
                <div>
                  <p className="font-medium">Membro desde</p>
                  <p className="text-muted-foreground">
                    {formatDistanceToNow(new Date(userProfile.created_at), { addSuffix: true, locale: ptBR })}
                  </p>
                </div>
              </div>

              {/* Estatísticas */}
              <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                <div className="text-center">
                  <p className="text-2xl font-bold text-green-600">{userProfile.total_vendas || 0}</p>
                  <p className="text-sm text-muted-foreground">Vendas</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-blue-600">{userProfile.total_compras || 0}</p>
                  <p className="text-sm text-muted-foreground">Compras</p>
                </div>
              </div>

              {userProfile.reputacao && (
                <div className="text-center pt-4 border-t">
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <Star className="w-4 h-4 text-yellow-500 fill-current" />
                    <span className="font-bold">{userProfile.reputacao}</span>
                  </div>
                  <p className="text-sm text-muted-foreground">Reputação</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Modal de Imagem em Tela Cheia */}
      <Dialog open={!!fullImageModal} onOpenChange={() => setFullImageModal(null)}>
        <DialogContent className="max-w-4xl w-full p-0">
          <div className="relative">
            {fullImageModal && (
              <img 
                src={fullImageModal} 
                alt={item.titulo}
                className="w-full h-auto max-h-[80vh] object-contain"
              />
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal de Edição */}
      {editModalAberto && (
        <EditarItemModeracao
          item={item}
          isOpen={editModalAberto}
          onClose={() => setEditModalAberto(false)}
          onSuccess={() => {
            setEditModalAberto(false);
            // Aqui poderia chamar um refetch se necessário
          }}
        />
      )}
    </>
  );
};

export default ItemModeracaoCardCompleto;
