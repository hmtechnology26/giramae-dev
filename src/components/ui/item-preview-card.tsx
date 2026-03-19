import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Heart, User, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { buildItemImageUrl } from '@/lib/cdn';

interface ItemPreviewCardProps {
  titulo: string;
  valorGirinhas: number;
  categoria: string;
  estadoConservacao: string;
  tamanho?: string;
  fotos: File[] | string[];
  className?: string;
}

const ItemPreviewCard: React.FC<ItemPreviewCardProps> = ({
  titulo,
  valorGirinhas,
  categoria,
  estadoConservacao,
  tamanho,
  fotos,
  className
}) => {
  // Verificar se fotos são Files ou strings (paths ou URLs)
  const getPreviewImage = () => {
    if (fotos.length === 0) return null;
    
    const firstPhoto = fotos[0];
    
    // Se for File, criar blob URL
    if (firstPhoto instanceof File) {
      return URL.createObjectURL(firstPhoto);
    }
    
    // Se for string (path ou URL), usar helper CDN
    return buildItemImageUrl(firstPhoto as string);
  };

  const previewImage = getPreviewImage();

  const getCategoriaLabel = (cat: string) => {
    const labels: Record<string, string> = {
      roupa: 'Roupa',
      brinquedo: 'Brinquedo', 
      calcado: 'Calçado',
      acessorio: 'Acessório',
      kit: 'Kit',
      outro: 'Outro'
    };
    return labels[cat] || cat;
  };

  const getEstadoColor = (estado: string) => {
    const colors: Record<string, string> = {
      novo: 'bg-green-100 text-green-800',
      otimo: 'bg-blue-100 text-blue-800',
      bom: 'bg-yellow-100 text-yellow-800',
      razoavel: 'bg-orange-100 text-orange-800'
    };
    return colors[estado] || 'bg-gray-100 text-gray-800';
  };

  return (
    <Card className={cn('overflow-hidden hover:shadow-lg transition-all duration-200', className)}>
      <div className="relative">
        {/* Imagem do item */}
        <div className="aspect-square bg-gray-100 relative overflow-hidden">
          {previewImage ? (
            <img 
              src={previewImage}
              alt={titulo || "Preview do item"}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400">
              <div className="text-center">
                <Sparkles className="w-8 h-8 mx-auto mb-2" />
                <p className="text-sm">Adicione uma foto</p>
              </div>
            </div>
          )}
        </div>

        {/* Botão de favorito */}
        <button className="absolute top-2 right-2 p-2 bg-white/80 rounded-full hover:bg-white transition-colors">
          <Heart className="w-4 h-4 text-gray-600" />
        </button>

        {/* Badge de estado */}
        {estadoConservacao && (
          <Badge 
            className={cn('absolute top-2 left-2 text-xs', getEstadoColor(estadoConservacao))}
          >
            {estadoConservacao === 'novo' ? 'Novo' :
             estadoConservacao === 'otimo' ? 'Ótimo' :
             estadoConservacao === 'bom' ? 'Bom' : 'Razoável'}
          </Badge>
        )}
      </div>

      <CardContent className="p-3 space-y-2">
        {/* Título */}
        <h3 className={cn(
          'font-medium text-sm leading-tight line-clamp-2 min-h-[2.5rem]',
          titulo ? 'text-gray-900' : 'text-gray-400'
        )}>
          {titulo || 'Digite o título do item...'}
        </h3>

        {/* Categoria e tamanho */}
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <span>{categoria ? getCategoriaLabel(categoria) : 'Categoria'}</span>
          {tamanho && (
            <>
              <span>•</span>
              <span>{tamanho}</span>
            </>
          )}
        </div>

        {/* Preço */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            <Sparkles className="w-4 h-4 text-yellow-500" />
            <span className="font-bold text-lg text-primary">
              {valorGirinhas || 0}
            </span>
            <span className="text-sm text-gray-500">Girinhas</span>
          </div>
        </div>

        {/* Perfil da mãe (simulado) */}
        <div className="flex items-center gap-2 pt-2 border-t border-gray-100">
          <div className="w-6 h-6 bg-gradient-to-r from-pink-400 to-purple-500 rounded-full flex items-center justify-center">
            <User className="w-3 h-3 text-white" />
          </div>
          <span className="text-xs text-gray-600">Você</span>
        </div>

        {/* Botão de ação */}
        <Button 
          size="sm" 
          className="w-full mt-2 bg-gradient-to-r from-primary to-pink-500 hover:from-primary/90 hover:to-pink-500/90"
          disabled
        >
          Ver Detalhes
        </Button>
      </CardContent>
    </Card>
  );
};

export default ItemPreviewCard;
