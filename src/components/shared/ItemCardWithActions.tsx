
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { MoreVertical, Edit, Eye, EyeOff, Trash2, Sparkles, Play } from 'lucide-react';
import { useAtualizarItem, Item } from '@/hooks/useItensOptimized';
import { toast } from '@/components/ui/use-toast';
import LazyImage from '@/components/ui/lazy-image';
import EditarItem from '@/components/perfil/EditarItem';

interface ItemCardWithActionsProps {
  item: Item;
}

const ItemCardWithActions: React.FC<ItemCardWithActionsProps> = ({ item }) => {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const { mutate: atualizarItem, isPending } = useAtualizarItem();

  const handleToggleStatus = () => {
    const novoStatus = item.status === 'disponivel' ? 'inativo' : 'disponivel';
    
    atualizarItem({
      itemId: item.id,
      dadosAtualizados: { status: novoStatus }
    }, {
      onSuccess: () => {
        toast({
          title: "Sucesso!",
          description: `Item ${novoStatus === 'inativo' ? 'desativado' : 'ativado'} com sucesso.`
        });
      }
    });
  };

  const handleExcluir = () => {
    atualizarItem({
      itemId: item.id,
      dadosAtualizados: { status: 'excluido' }
    }, {
      onSuccess: () => {
        toast({
          title: "Item excluído",
          description: "O item foi excluído com sucesso."
        });
        setShowDeleteDialog(false);
      }
    });
  };

  const getStatusBadge = () => {
    switch (item.status) {
      case 'disponivel':
        return <Badge className="bg-green-500 text-white">Ativo</Badge>;
      case 'reservado':
        return <Badge className="bg-orange-500 text-white">Reservado</Badge>;
      case 'inativo':
        return <Badge className="bg-gray-500 text-white">Inativo</Badge>;
      case 'cancelado':
        return <Badge className="bg-red-500 text-white">Cancelado</Badge>;
      case 'entregue':
        return <Badge className="bg-blue-500 text-white">Vendido</Badge>;
      default:
        return <Badge variant="secondary">{item.status}</Badge>;
    }
  };

  const canToggleStatus = () => {
    return ['disponivel', 'inativo'].includes(item.status);
  };

  const canEdit = () => {
    return ['disponivel', 'inativo'].includes(item.status);
  };

  const canDelete = () => {
    return ['disponivel', 'inativo', 'cancelado'].includes(item.status);
  };

  return (
    <>
      <Card className="group hover:shadow-lg transition-all duration-300 overflow-hidden bg-white/90 backdrop-blur-sm border-0 relative">
        {/* Menu de ações */}
        <div className="absolute top-2 right-2 z-10">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 bg-white/80 hover:bg-white"
                disabled={isPending}
              >
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              {canEdit() && (
                <DropdownMenuItem onClick={() => setShowEditDialog(true)}>
                  <Edit className="mr-2 h-4 w-4" />
                  Editar item
                </DropdownMenuItem>
              )}
              
              {canToggleStatus() && (
                <DropdownMenuItem onClick={handleToggleStatus}>
                  {item.status === 'disponivel' ? (
                    <>
                      <EyeOff className="mr-2 h-4 w-4" />
                      Desativar item
                    </>
                  ) : (
                    <>
                      <Play className="mr-2 h-4 w-4" />
                      Ativar item
                    </>
                  )}
                </DropdownMenuItem>
              )}
              
              {canDelete() && (
                <DropdownMenuItem 
                  onClick={() => setShowDeleteDialog(true)}
                  className="text-red-600 focus:text-red-600"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Excluir item
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="aspect-square bg-gray-100 overflow-hidden relative">
          {item.fotos && item.fotos.length > 0 ? (
            <LazyImage
              src={item.fotos[0]}
              alt={item.titulo}
              bucket="itens"
              size="medium"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              onError={() => console.error('Erro ao carregar item do perfil:', item.id)}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400">
              <span className="text-4xl">📷</span>
            </div>
          )}
          
          <div className="absolute top-2 left-2">
            {getStatusBadge()}
          </div>
        </div>

        <CardContent className="p-4">
          <h3 className="font-semibold mb-2 line-clamp-2">
            {item.titulo}
          </h3>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1">
              <Sparkles className="w-4 h-4 text-primary" />
              <span className="font-bold text-primary">
                {item.valor_girinhas}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Dialog de confirmação para exclusão */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir item</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir este item? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleExcluir}
              className="bg-red-600 hover:bg-red-700"
              disabled={isPending}
            >
              {isPending ? 'Excluindo...' : 'Excluir'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Dialog de edição */}
      {showEditDialog && (
        <EditarItem
          item={item}
          isOpen={showEditDialog}
          onClose={() => setShowEditDialog(false)}
          onSuccess={() => {
            setShowEditDialog(false);
            toast({
              title: "Sucesso!",
              description: "Item atualizado com sucesso."
            });
          }}
        />
      )}
    </>
  );
};

export default ItemCardWithActions;
