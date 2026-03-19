
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Package, Search, Heart, ShoppingBag, PlusCircle } from 'lucide-react';

interface EmptyStateProps {
  type: 'items' | 'favoritos' | 'reservas' | 'search' | 'generic';
  title?: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

const EmptyState: React.FC<EmptyStateProps> = ({
  type,
  title,
  description,
  actionLabel,
  onAction,
  className
}) => {
  const getConfig = () => {
    switch (type) {
      case 'items':
        return {
          icon: Package,
          defaultTitle: 'Nenhum item encontrado',
          defaultDescription: 'Você ainda não publicou nenhum item. Que tal começar agora?',
          defaultAction: 'Publicar Primeiro Item'
        };
      case 'favoritos':
        return {
          icon: Heart,
          defaultTitle: 'Nenhum favorito ainda',
          defaultDescription: 'Explore o feed e favorite itens que você gostaria de trocar.',
          defaultAction: 'Explorar Feed'
        };
      case 'reservas':
        return {
          icon: ShoppingBag,
          defaultTitle: 'Nenhuma reserva',
          defaultDescription: 'Você ainda não fez nenhuma reserva. Explore os itens disponíveis!',
          defaultAction: 'Ver Itens'
        };
      case 'search':
        return {
          icon: Search,
          defaultTitle: 'Nenhum resultado encontrado',
          defaultDescription: 'Tente usar palavras-chave diferentes ou filtros menos específicos.',
          defaultAction: 'Limpar Filtros'
        };
      default:
        return {
          icon: PlusCircle,
          defaultTitle: 'Nada para mostrar',
          defaultDescription: 'Não há conteúdo disponível no momento.',
          defaultAction: 'Atualizar'
        };
    }
  };

  const config = getConfig();
  const Icon = config.icon;

  return (
    <Card className={className}>
      <CardContent className="flex flex-col items-center justify-center p-8 text-center">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
          <Icon className="w-8 h-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          {title || config.defaultTitle}
        </h3>
        <p className="text-gray-600 mb-6 max-w-md">
          {description || config.defaultDescription}
        </p>
        {onAction && (
          <Button onClick={onAction} variant="outline">
            {actionLabel || config.defaultAction}
          </Button>
        )}
      </CardContent>
    </Card>
  );
};

export default EmptyState;
