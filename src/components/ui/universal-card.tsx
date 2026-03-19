import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Heart, Star, Sparkles, LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Link } from 'react-router-dom';
import LazyImage from '@/components/ui/lazy-image';
import { buildItemImageUrl } from '@/lib/cdn';

// Tipos base
interface BaseCardProps {
  className?: string;
  children?: React.ReactNode;
}

// Dados para card de item
interface ItemData {
  id: string;
  titulo: string;
  categoria: string;
  tamanho?: string;
  valorGirinhas: number;
  estadoConservacao: string;
  fotos?: string[];
  status: string;
  autorNome?: string;
  autorId?: string;
  autorAvatar?: string;
  autorReputacao?: number;
  descricao?: string;
}

// Dados para card de estatística
interface StatsData {
  icon: LucideIcon;
  title: string;
  value: string | number;
  subtitle?: string;
  gradient?: string;
  color?: string;
}

// Dados para card de perfil
interface ProfileData {
  id: string;
  nome: string;
  avatar?: string;
  reputacao?: number;
  localização?: string;
  badge?: string;
  badgeVariant?: 'default' | 'secondary' | 'outline';
}

// Dados para card de reserva
interface ReservationData {
  id: string;
  titulo: string;
  valor: number;
  status: string;
  data: string;
  foto?: string;
  autorNome?: string;
  type: 'compra' | 'venda';
}

// Props específicas por variante
interface ItemCardProps extends BaseCardProps {
  variant: 'item';
  data: ItemData;
  onFavorite?: () => void;
  isFavorite?: boolean;
  linkTo?: string;
  showAuthor?: boolean;
}

interface StatsCardProps extends BaseCardProps {
  variant: 'stats';
  data: StatsData;
  onClick?: () => void;
}

interface ProfileCardProps extends BaseCardProps {
  variant: 'profile';
  data: ProfileData;
  linkTo?: string;
  onAction?: () => void;
  actionLabel?: string;
}

interface ReservationCardProps extends BaseCardProps {
  variant: 'reservation';
  data: ReservationData;
  onConfirm?: () => void;
  onCancel?: () => void;
  linkTo?: string;
}

// Union type para todas as props
type UniversalCardProps = ItemCardProps | StatsCardProps | ProfileCardProps | ReservationCardProps;

const UniversalCard: React.FC<UniversalCardProps> = (props) => {
  const baseCardClass = cn(
    'overflow-hidden transition-all duration-300',
    'shadow-lg hover:shadow-xl transform hover:-translate-y-1',
    'border-0 bg-white/80 backdrop-blur-sm',
    props.className
  );

  // Card de Item
  if (props.variant === 'item') {
    const { data, onFavorite, isFavorite, linkTo, showAuthor = true } = props;
    
    // Usar helper CDN para construir URL da imagem
    const imagemPrincipal = data.fotos && data.fotos.length > 0 && data.fotos[0]
      ? buildItemImageUrl(data.fotos[0])
      : "https://images.unsplash.com/photo-1618160702438-9b02ab6515c9?w=400";

    const formatarCategoria = (categoria: string) => {
      const categorias = {
        'roupa': 'Roupas',
        'brinquedo': 'Brinquedos',
        'calcado': 'Calçados',
        'acessorio': 'Acessórios',
        'kit': 'Kits',
        'outro': 'Outros'
      };
      return categorias[categoria as keyof typeof categorias] || categoria;
    };

    const getEstadoColor = (estado: string) => {
      const colors = {
        novo: 'bg-green-500 text-white',
        otimo: 'bg-blue-500 text-white',
        bom: 'bg-yellow-500 text-white',
        razoavel: 'bg-orange-500 text-white'
      };
      return colors[estado as keyof typeof colors] || 'bg-gray-500 text-white';
    };

    const cardContent = (
      <>
        <div className="relative">
          <div className="w-full h-48 bg-gray-100">
            <LazyImage
              src={imagemPrincipal}
              alt={data.titulo}
              bucket="itens"
              size="medium"
              className="w-full h-full object-cover"
            />
          </div>
          
          {onFavorite && (
            <button 
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onFavorite();
              }}
              className="absolute top-2 right-2 p-2 bg-white/80 rounded-full hover:bg-white transition-colors"
            >
              <Heart className={cn("w-4 h-4", isFavorite ? "fill-red-500 text-red-500" : "text-gray-600")} />
            </button>
          )}

          <Badge className={cn("absolute top-2 left-2", getEstadoColor(data.estadoConservacao))}>
            {data.estadoConservacao === 'novo' ? 'Novo' :
             data.estadoConservacao === 'otimo' ? 'Ótimo' :
             data.estadoConservacao === 'bom' ? 'Bom' : 'Razoável'}
          </Badge>
        </div>

        <CardContent className="p-4">
          {showAuthor && data.autorNome && (
            <div className="flex items-center gap-2 mb-3">
              <Avatar className="w-6 h-6">
                <AvatarImage src={data.autorAvatar} />
                <AvatarFallback className="text-xs">
                  {data.autorNome.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <span className="text-sm text-primary hover:underline">
                {data.autorNome}
              </span>
              {data.autorReputacao && (
                <div className="flex items-center gap-1">
                  <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                  <span className="text-xs text-gray-500">{(data.autorReputacao/20).toFixed(1)}</span>
                </div>
              )}
            </div>
          )}

          <h3 className="font-semibold text-gray-800 mb-1 line-clamp-2">{data.titulo}</h3>
          
          <div className="flex items-center gap-2 text-xs text-gray-500 mb-2">
            <span>{formatarCategoria(data.categoria)}</span>
            {data.tamanho && (
              <>
                <span>•</span>
                <span>{data.tamanho}</span>
              </>
            )}
          </div>

          {data.descricao && (
            <p className="text-xs text-gray-500 mb-3 line-clamp-2">{data.descricao}</p>
          )}

          <div className="flex justify-between items-center">
            <div className="flex items-center gap-1 text-primary font-bold">
              <Sparkles className="w-4 h-4" />
              <span>{data.valorGirinhas}</span>
            </div>
            
            {data.status === 'disponivel' && (
              <Badge className="bg-green-500 text-white text-xs">
                Disponível
              </Badge>
            )}
          </div>
        </CardContent>
      </>
    );

    return (
      <Card className={baseCardClass}>
        {linkTo ? (
          <Link to={linkTo}>
            {cardContent}
          </Link>
        ) : (
          <div>
            {cardContent}
          </div>
        )}
      </Card>
    );
  }

  // Card de Estatística
  if (props.variant === 'stats') {
    const { data, onClick } = props;
    const Icon = data.icon;

    return (
      <Card 
        className={cn(
          baseCardClass,
          data.gradient || 'bg-gradient-to-br from-primary to-pink-500',
          'text-white cursor-pointer'
        )}
        onClick={onClick}
      >
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/80 text-sm mb-1">{data.title}</p>
              <div className="flex items-center gap-2">
                <Icon className="w-6 h-6" />
                <span className="text-2xl font-bold">{data.value}</span>
              </div>
              {data.subtitle && (
                <p className="text-white/70 text-xs mt-1">{data.subtitle}</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Card de Perfil
  if (props.variant === 'profile') {
    const { data, linkTo, onAction, actionLabel } = props;

    const cardContent = (
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          <Avatar className="w-10 h-10">
            <AvatarImage src={data.avatar} />
            <AvatarFallback>
              {data.nome.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-grow">
            <h4 className="font-medium text-gray-800">{data.nome}</h4>
            {data.localização && (
              <p className="text-sm text-gray-600">{data.localização}</p>
            )}
            {data.reputacao && (
              <div className="flex items-center gap-1 mt-1">
                <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                <span className="text-xs text-gray-500">{(data.reputacao/20).toFixed(1)}</span>
              </div>
            )}
          </div>

          {data.badge && (
            <Badge variant={data.badgeVariant || 'secondary'} className="text-xs">
              {data.badge}
            </Badge>
          )}

          {onAction && actionLabel && (
            <Button 
              size="sm" 
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onAction();
              }}
            >
              {actionLabel}
            </Button>
          )}
        </div>
      </CardContent>
    );

    return (
      <Card className={cn(baseCardClass, 'hover:bg-gray-50')}>
        {linkTo ? (
          <Link to={linkTo}>
            {cardContent}
          </Link>
        ) : (
          <div>
            {cardContent}
          </div>
        )}
      </Card>
    );
  }

  // Card de Reserva
  if (props.variant === 'reservation') {
    const { data, onConfirm, onCancel, linkTo } = props;

    return (
      <Card className={baseCardClass}>
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            {data.foto && (
              <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                <LazyImage
                  src={data.foto}
                  alt={data.titulo}
                  bucket="itens"
                  size="thumbnail"
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            
            <div className="flex-grow">
              <h4 className="font-medium text-gray-800 mb-1">{data.titulo}</h4>
              {data.autorNome && (
                <p className="text-sm text-gray-600 mb-2">{data.autorNome}</p>
              )}
              
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-1 text-primary font-bold">
                  <Sparkles className="w-4 h-4" />
                  <span>{data.valor}</span>
                </div>
                <Badge variant={data.status === 'pendente' ? 'secondary' : 'default'}>
                  {data.status}
                </Badge>
              </div>

              <p className="text-xs text-gray-500 mb-3">{data.data}</p>

              <div className="flex gap-2">
                {onConfirm && (
                  <Button size="sm" onClick={onConfirm}>
                    Confirmar
                  </Button>
                )}
                {onCancel && (
                  <Button size="sm" variant="outline" onClick={onCancel}>
                    Cancelar
                  </Button>
                )}
                {linkTo && (
                  <Button size="sm" variant="outline" asChild>
                    <Link to={linkTo}>Ver Detalhes</Link>
                  </Button>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return null;
};

export default UniversalCard;
