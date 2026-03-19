
import React from 'react';
import LoadingSpinner from './LoadingSpinner';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

interface InfiniteScrollIndicatorProps {
  isFetchingNextPage: boolean;
  hasNextPage: boolean;
  itemsCount: number;
  isInitialLoading: boolean;
  onCreateItem?: () => void;
}

export const InfiniteScrollIndicator: React.FC<InfiniteScrollIndicatorProps> = ({
  isFetchingNextPage,
  hasNextPage,
  itemsCount,
  isInitialLoading,
  onCreateItem
}) => {
  if (isInitialLoading) {
    return null; // Não mostrar nada durante carregamento inicial
  }

  if (isFetchingNextPage) {
    return (
      <div className="flex items-center justify-center gap-2 p-8">
        <LoadingSpinner />
        <span className="text-gray-600">Carregando mais itens...</span>
      </div>
    );
  }

  if (!hasNextPage && itemsCount > 0) {
    return (
      <div className="text-center p-8">
        <p className="text-gray-500 mb-4">🎉 Você viu todos os itens disponíveis!</p>
        {onCreateItem && (
          <Button onClick={onCreateItem} variant="outline">
            <Plus className="w-4 h-4 mr-2" />
            Publicar um item
          </Button>
        )}
      </div>
    );
  }

  if (!hasNextPage && itemsCount === 0) {
    return (
      <div className="text-center p-8">
        <p className="text-gray-500 mb-4">Nenhum item encontrado</p>
        {onCreateItem && (
          <Button onClick={onCreateItem} variant="outline">
            <Plus className="w-4 h-4 mr-2" />
            Seja o primeiro a publicar
          </Button>
        )}
      </div>
    );
  }

  return null;
};

export default InfiniteScrollIndicator;
