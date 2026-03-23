import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import BotaoSeguir from '@/components/perfil/BotaoSeguir';
import { supabase } from '@/integrations/supabase/client';
import { buildItemImageUrl } from '@/lib/cdn';
import {
  MapPin,
  Package,
  UserX,
  Eye,
  Star,
  Clock,
  Users,
  Calendar,
  Truck,
  User,
  TrendingUp,
  MessageSquare,
  ArrowLeft
} from 'lucide-react';

interface MaeSeguidaProfile {
  id: string;
  nome: string;
  sobrenome?: string;
  avatar_url?: string;
  bio?: string;
  cidade?: string;
  estado?: string;
  bairro?: string;
  data_nascimento?: string;
  reputacao: number;
  interesses?: string[];
  created_at: string;
  last_seen_at?: string;
  aceita_entrega_domicilio: boolean;
  raio_entrega_km?: number;
  estatisticas: {
    total_itens: number;
    itens_ativos: number;
    itens_disponiveis: number;
    total_seguidores: number;
    total_seguindo: number;
    avaliacoes_recebidas: number;
    media_avaliacao: number;
    ultima_atividade?: string;
    membro_desde: string;
    distancia_km?: number;
  };
  itens_recentes: Array<{
    id: string;
    titulo: string;
    categoria: string;
    valor_girinhas: number;
    fotos: string[];
    status: string;
    created_at: string;
  }>;
  escola_comum: boolean;
  logistica: {
    entrega_disponivel: boolean;
    busca_disponivel: boolean;
  };
}

interface MaeSeguidaCardProps {
  mae: MaeSeguidaProfile;
  onUnfollow?: (maeId: string) => void;
  onViewProfile?: (maeId: string) => void;
  showViewProfileButton?: boolean;
  showFollowButton?: boolean;
  showUnfollowButton?: boolean;
}

interface Avaliacao {
  id: string;
  rating: number;
  comentario: string | null;
  created_at: string;
  avaliador: {
    nome: string;
    avatar_url: string | null;
  };
}

const MaeSeguidaCard: React.FC<MaeSeguidaCardProps> = ({
  mae,
  onUnfollow,
  onViewProfile,
  showViewProfileButton = true,
  showFollowButton = false,
  showUnfollowButton = true
}) => {
  const navigate = useNavigate();
  const [showReviews, setShowReviews] = useState(false);
  const [avaliacoes, setAvaliacoes] = useState<Avaliacao[]>([]);
  const [loadingReviews, setLoadingReviews] = useState(false);

  const formatLastActivity = (timestamp: string | null) => {
    if (!timestamp) return 'Nunca vista';

    const now = new Date();
    const activity = new Date(timestamp);
    const diffMs = now.getTime() - activity.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Ativa hoje';
    if (diffDays === 1) return 'Ativa ontem';
    if (diffDays < 7) return `Ativa há ${diffDays} dias`;
    if (diffDays < 30) return `Ativa há ${Math.floor(diffDays / 7)} semanas`;
    return `Ativa há ${Math.floor(diffDays / 30)} meses`;
  };

  const calcularIdade = (dataNascimento: string) => {
    const hoje = new Date();
    const nascimento = new Date(dataNascimento);
    let idade = hoje.getFullYear() - nascimento.getFullYear();
    const m = hoje.getMonth() - nascimento.getMonth();
    if (m < 0 || (m === 0 && hoje.getDate() < nascimento.getDate())) {
      idade--;
    }
    return idade;
  };

  const formatarNomeCompleto = (nome?: string, sobrenome?: string) => {
    if (!nome) return 'Usuária GiraMãe';
    return sobrenome ? `${nome} ${sobrenome}` : nome;
  };

  const formatarDataAvaliacao = (timestamp: string) => {
    const data = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - data.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Hoje';
    if (diffDays === 1) return 'Ontem';
    if (diffDays < 7) return `${diffDays} dias atrás`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} semanas atrás`;
    return data.toLocaleDateString('pt-BR');
  };

  const carregarAvaliacoes = async () => {
    setLoadingReviews(true);
    try {
      const { data, error } = await supabase
        .from('avaliacoes')
        .select(`
          id,
          rating,
          comentario,
          created_at,
          avaliador:profiles!avaliacoes_avaliador_id_fkey (
            nome,
            avatar_url
          )
        `)
        .eq('avaliado_id', mae.id)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      setAvaliacoes(data || []);
    } catch (error) {
      console.error('Erro ao carregar avaliações:', error);
    } finally {
      setLoadingReviews(false);
    }
  };

  const handleViewReviews = async () => {
    if (!showReviews) {
      await carregarAvaliacoes();
    }
    setShowReviews(true);
  };

  const handleBackToProfile = () => {
    setShowReviews(false);
  };

  const handleViewProfile = () => {
    if (onViewProfile) {
      onViewProfile(mae.id);
    } else {
      navigate(`/perfil/${mae.id}`);
    }
  };

  const handleUnfollow = () => {
    if (onUnfollow) {
      onUnfollow(mae.id);
    }
  };

  const stats = mae.estatisticas;
  const nomeCompleto = formatarNomeCompleto(mae.nome, mae.sobrenome);

  return (
    <Card className="premium-card border-0 shadow-2xl bg-white/70 backdrop-blur-xl hover:shadow-primary/5 transition-all duration-500 rounded-[2.5rem] overflow-hidden relative">
      {/* Card Principal */}
      <div className={`transition-transform duration-300 ${showReviews ? '-translate-x-full' : 'translate-x-0'}`}>
        <CardHeader className="text-center pb-4 relative">
          {/* Badges de destaque */}
          <div className="absolute top-2 right-2 flex flex-col gap-1">
            {mae.escola_comum && (
              <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
                🏫 Mesma escola
              </Badge>
            )}
            {mae.logistica.entrega_disponivel && (
              <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">
                <Truck className="w-3 h-3 mr-1" />
                Entrega
              </Badge>
            )}
            {stats.distancia_km && stats.distancia_km <= 5 && (
              <Badge variant="outline" className="text-xs bg-orange-50 text-orange-700 border-orange-200">
                📍 {stats.distancia_km}km
              </Badge>
            )}
          </div>

          <div className="flex flex-col items-center">
            <div className="relative group/avatar mb-4">
              <div className="absolute -inset-1.5 bg-gradient-to-tr from-primary via-purple-400 to-blue-400 rounded-[2.2rem] opacity-20 group-hover/avatar:opacity-40 transition-opacity blur-sm" />
              <Avatar className="w-24 h-24 border-4 border-white shadow-2xl rounded-[2rem] relative z-10">
                <AvatarImage src={mae.avatar_url || undefined} alt={nomeCompleto} className="object-cover" />
                <AvatarFallback className="bg-primary/5 text-primary text-2xl font-black">
                  {mae.nome?.split(' ').map(n => n[0]).join('') || 'M'}
                </AvatarFallback>
              </Avatar>
              <div className="absolute -bottom-1 -right-1 bg-white p-1.5 rounded-xl shadow-lg border border-primary/5 z-20">
                <div className="w-3 h-3 bg-green-500 rounded-full border-2 border-white animate-pulse" />
              </div>
            </div>

            <h3 className="text-xl font-black text-foreground tracking-tight mb-1 text-center">
              {nomeCompleto}
            </h3>

            {/* Avaliação */}
            <div className="flex items-center gap-1 mb-4">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`w-4 h-4 ${star <= Math.floor(mae.reputacao || 0)
                    ? 'fill-current text-yellow-500'
                    : 'text-gray-300'
                    }`}
                />
              ))}
              <span className="text-sm text-gray-600 ml-1">
                ({(mae.reputacao || 0).toFixed(1)})
              </span>
              <button
                onClick={handleViewReviews}
                className="text-xs text-primary hover:underline ml-1"
              >
                ver comentários
              </button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Bio */}
          {mae.bio && (
            <div>
              <h4 className="font-semibold text-gray-800 mb-2 text-sm">Sobre</h4>
              <p className="text-gray-600 text-sm line-clamp-2">{mae.bio}</p>
            </div>
          )}

          {/* Informações básicas */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-gray-600">
              <MapPin className="w-4 h-4 text-primary flex-shrink-0" />
              <span className="text-sm">
                {mae.cidade
                  ? `${mae.cidade}, ${mae.estado || 'BR'}`
                  : 'Localização não informada'
                }
              </span>
            </div>

            {mae.data_nascimento && (
              <div className="flex items-center gap-2 text-gray-600">
                <Calendar className="w-4 h-4 text-primary flex-shrink-0" />
                <span className="text-sm">{calcularIdade(mae.data_nascimento)} anos</span>
              </div>
            )}

            <div className="flex items-center gap-2 text-gray-600">
              <Clock className="w-4 h-4 text-gray-400 flex-shrink-0" />
              <span className="text-sm">
                {formatLastActivity(stats.ultima_atividade)}
              </span>
            </div>
          </div>

          {/* Estatísticas */}
          <div className="grid grid-cols-2 gap-3 pt-4 border-t">
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 text-gray-600">
                <Users className="w-4 h-4" />
                <span className="font-bold">{stats.total_seguidores}</span>
              </div>
              <p className="text-xs text-gray-500">Seguidores</p>
            </div>

            <div className="text-center">
              <div className="flex items-center justify-center gap-1 text-gray-600">
                <Package className="w-4 h-4" />
                <span className="font-bold">{stats.itens_disponiveis}</span>
              </div>
              <p className="text-xs text-gray-500">Disponíveis</p>
            </div>

            <div className="text-center">
              <div className="flex items-center justify-center gap-1 text-gray-600">
                <TrendingUp className="w-4 h-4" />
                <span className="font-bold">{stats.total_itens}</span>
              </div>
              <p className="text-xs text-gray-500">Total itens</p>
            </div>

            <div className="text-center">
              <div className="flex items-center justify-center gap-1 text-gray-600">
                <Star className="w-4 h-4" />
                <span className="font-bold">{(mae.reputacao || 0).toFixed(1)}</span>
              </div>
              <p className="text-xs text-gray-500">Avaliação</p>
            </div>
          </div>

          {/* Itens recentes */}
          {mae.itens_recentes && mae.itens_recentes.length > 0 && (
            <div>
              <h4 className="font-semibold text-gray-800 mb-2 text-sm">Itens Recentes</h4>
              <div className="flex gap-2 overflow-x-auto pb-2">
                {mae.itens_recentes.slice(0, 4).map((item) => (
                  <div key={item.id} className="flex-shrink-0">
                    <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-100">
                      <img
                        src={item.fotos?.[0] ? buildItemImageUrl(item.fotos[0]) : '/placeholder.svg'}
                        alt={item.titulo}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.src = '/placeholder.svg';
                        }}
                      />
                    </div>
                  </div>
                ))}
                {mae.itens_recentes.length > 4 && (
                  <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center">
                    <span className="text-xs text-gray-500">+{mae.itens_recentes.length - 4}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Botões de ação */}
          <div className="flex gap-2 pt-4 border-t">
            {showViewProfileButton && (
              <Button
                variant="ghost"
                size="lg"
                onClick={handleViewProfile}
                className="flex-1 flex items-center justify-center gap-2 rounded-2xl border border-primary/10 hover:bg-primary/5 hover:text-primary transition-all font-bold text-xs uppercase tracking-widest h-12"
              >
                <Eye className="w-4 h-4" />
                Ver Perfil
              </Button>
            )}

            {showFollowButton && (
              <BotaoSeguir
                usuarioId={mae.id}
                className="flex-1 h-12 rounded-2xl shadow-lg"
              />
            )}

            {showUnfollowButton && onUnfollow && (
              <Button
                variant="destructive"
                size="sm"
                onClick={handleUnfollow}
                className="flex items-center gap-2"
              >
                <UserX className="w-4 h-4" />
                Deixar de Seguir
              </Button>
            )}
          </div>
        </CardContent>
      </div>

      {/* Painel de Avaliações */}
      <div className={`absolute inset-0 bg-white transition-transform duration-300 ${showReviews ? 'translate-x-0' : 'translate-x-full'}`}>
        <CardHeader className="text-center pb-4 relative">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleBackToProfile}
              className="p-2"
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <h3 className="text-lg font-semibold text-gray-800">
              Avaliações de {mae.nome}
            </h3>
            <div className="w-8" /> {/* Spacer */}
          </div>
        </CardHeader>

        <CardContent className="space-y-4 max-h-96 overflow-y-auto">
          {loadingReviews ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              <p className="text-sm text-gray-500 mt-2">Carregando avaliações...</p>
            </div>
          ) : avaliacoes.length > 0 ? (
            avaliacoes.map((avaliacao) => (
              <div key={avaliacao.id} className="border-b border-gray-100 pb-4 last:border-b-0">
                <div className="flex items-start gap-3">
                  <Avatar className="w-8 h-8">
                    <AvatarImage src={avaliacao.avaliador.avatar_url || undefined} />
                    <AvatarFallback className="text-xs">
                      {avaliacao.avaliador.nome.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-gray-800">
                        {avaliacao.avaliador.nome}
                      </span>
                      <span className="text-xs text-gray-500">
                        {formatarDataAvaliacao(avaliacao.created_at)}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 mb-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`w-3 h-3 ${star <= avaliacao.rating
                            ? 'fill-current text-yellow-500'
                            : 'text-gray-300'
                            }`}
                        />
                      ))}
                      <span className="text-xs text-gray-600 ml-1">
                        {avaliacao.rating}/5
                      </span>
                    </div>
                    {avaliacao.comentario && (
                      <p className="text-sm text-gray-600">
                        {avaliacao.comentario}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8">
              <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-2" />
              <p className="text-sm text-gray-500">Ainda não há avaliações</p>
            </div>
          )}
        </CardContent>
      </div>
    </Card>
  );
};

export default MaeSeguidaCard;
