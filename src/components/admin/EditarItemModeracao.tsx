import React, { useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2, Save } from "lucide-react";
import { SimpleItemForm } from '@/components/forms/SimpleItemForm';
import { useEditarItemForm } from '@/hooks/useEditarItemForm';

interface EditarItemModeracaoProps {
  item: any; // Item da moderação tem estrutura diferente
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const EditarItemModeracao: React.FC<EditarItemModeracaoProps> = ({ item, isOpen, onClose, onSuccess }) => {
  console.log('🔍 EditarItemModeracao - Item recebido:', item);
  
  // Adaptar o item para o formato esperado pelo useEditarItemForm
  console.log('🔍 EditarItemModeracao - Item original:', item);
  
  const adaptedItem = item ? {
    id: item.item_id,
    titulo: item.titulo,
    descricao: item.descricao,
    categoria: item.categoria,
    subcategoria: item.subcategoria,
    valor_girinhas: item.valor_girinhas,
    estado_conservacao: item.estado_conservacao,
    fotos: item.fotos || [],
    genero: item.genero,
    tamanho_valor: item.tamanho_valor,
    tamanho_categoria: item.tamanho_categoria,
    publicado_por: item.publicado_por,
    status: item.status,
    created_at: item.data_publicacao,
    updated_at: item.data_moderacao
  } : null;

  console.log('🔍 EditarItemModeracao - Item adaptado:', adaptedItem);

  const {
    formData,
    updateFormData,
    removerImagemExistente,
    errors,
    loading,
    handleSubmit,
    resetForm,
    isFormInitialized,
    isLoadingOptions
  } = useEditarItemForm(adaptedItem);

  useEffect(() => {
    if (isOpen && adaptedItem) {
      console.log('🔄 Resetando form para edição do item de moderação:', adaptedItem.id);
      resetForm(adaptedItem);
    }
  }, [isOpen, adaptedItem, resetForm]);

  const handleFieldChange = (field: string, value: any) => {
    console.log('🔄 Campo alterado:', field, value);
    updateFormData({ [field]: value });
  };

  const onSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('📝 Submetendo formulário de edição de moderação...');
    const success = await handleSubmit();
    if (success) {
      onSuccess();
      onClose();
    }
  };

  // Mostrar loading enquanto as opções estão carregando ou o formulário não foi inicializado
  if (isLoadingOptions || !isFormInitialized || !adaptedItem) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto p-0">
          <div className="bg-gradient-to-r from-pink-500 to-purple-500 text-white p-6 rounded-t-lg">
            <DialogTitle className="text-xl font-semibold text-center flex items-center justify-center gap-2">
              <Save className="w-5 h-5" />
              Editar Item
            </DialogTitle>
          </div>
          
          <div className="p-6 flex flex-col items-center justify-center min-h-[200px]">
            <Loader2 className="h-8 w-8 animate-spin text-pink-500 mb-4" />
            <p className="text-gray-600">Carregando dados do item...</p>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto p-0">
        <div className="bg-gradient-to-r from-pink-500 to-purple-500 text-white p-6 rounded-t-lg">
          <DialogTitle className="text-xl font-semibold text-center flex items-center justify-center gap-2">
            <Save className="w-5 h-5" />
            Editar Item
          </DialogTitle>
        </div>
        
        <div className="p-6">
          <form onSubmit={onSubmitForm} className="space-y-6">
            <SimpleItemForm
              formData={formData}
              onFieldChange={handleFieldChange}
              onRemoverImagemExistente={removerImagemExistente}
              errors={errors}
              isEditing={true}
            />

            <div className="pt-4 border-t border-gray-100 flex gap-3">
              <Button 
                type="button" 
                variant="outline" 
                onClick={onClose}
                className="flex-1"
                disabled={loading}
              >
                Cancelar
              </Button>
              <Button 
                type="submit"
                disabled={loading}
                className="flex-1 h-12 text-base bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 shadow-lg rounded-lg transition-all duration-200"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Salvando...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Salvar Alterações
                  </>
                )}
              </Button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EditarItemModeracao;