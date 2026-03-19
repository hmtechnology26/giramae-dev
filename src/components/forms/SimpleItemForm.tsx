
import React from 'react';
import { useConfigCategorias } from '@/hooks/useConfigCategorias';
import { ItemBasicInfo } from './ItemBasicInfo';
import { ItemCategorization } from './ItemCategorization';
import { ItemPricing } from './ItemPricing';
import ImageUpload from '@/components/ui/image-upload';
import ImageUploadEditor from '@/components/ui/image-upload-editor';

interface SimpleItemFormProps {
  formData: {
    titulo: string;
    descricao: string;
    categoria_id: string;
    subcategoria: string;
    genero: string;
    tamanho_categoria: string;
    tamanho_valor: string;
    estado_conservacao: string;
    preco: string;
    imagens: File[];
    imagensExistentes?: string[];
  };
  onFieldChange: (field: string, value: any) => void;
  onRemoverImagemExistente?: (url: string) => void;
  errors: any;
  isEditing?: boolean;
  isMission?: boolean;
}

export const SimpleItemForm: React.FC<SimpleItemFormProps> = ({
  formData,
  onFieldChange,
  onRemoverImagemExistente,
  errors,
  isEditing = false,
  isMission = false
}) => {
  const { getFaixaValores } = useConfigCategorias();
  const faixaPrecos = getFaixaValores(formData.categoria_id);

  return (
    <div className={`space-y-8 ${isMission ? 'px-0' : ''}`}>
      {/* Fotos do Item */}
      <div className="bg-primary/[0.02] p-6 rounded-2xl border border-primary/5 transition-all hover:border-primary/10">
        <label className="text-base font-bold mb-4 block text-foreground/80">
          Fotos do item <span className="text-primary ml-1">*</span>
        </label>

        <div className="mt-4">
          {isEditing ? (
            <ImageUploadEditor
              imagensExistentes={formData.imagensExistentes || []}
              novasImagens={formData.imagens}
              onRemoverExistente={onRemoverImagemExistente || (() => { })}
              onAdicionarNovas={(files) => onFieldChange('imagens', files)}
              maxFiles={6}
            />
          ) : (
            <ImageUpload
              value={formData.imagens}
              onChange={(files) => onFieldChange('imagens', files)}
              maxFiles={6}
            />
          )}
        </div>

        <p className="text-xs text-muted-foreground mt-4 font-light italic">💡 Dica: Adicione até 6 fotos. A primeira será a capa do anúncio.</p>
        {errors.imagens && <p className="text-destructive text-sm mt-3 font-medium bg-destructive/5 p-3 rounded-lg border border-destructive/10">{errors.imagens}</p>}
      </div>

      {/* Dados Básicos */}
      <div className="px-1">
        <ItemBasicInfo
          formData={{
            titulo: formData.titulo,
            descricao: formData.descricao,
            preco: '',
            imagens: []
          }}
          onFieldChange={onFieldChange}
          errors={errors}
          faixaPrecos={null}
          hideImageUpload={true}
        />
      </div>

      {/* Categorização */}
      <div className="bg-primary/[0.02] p-8 rounded-3xl border border-primary/5 transition-all hover:border-primary/10">
        <ItemCategorization
          formData={{
            categoria_id: formData.categoria_id,
            subcategoria: formData.subcategoria,
            genero: formData.genero,
            tamanho_categoria: formData.tamanho_categoria,
            tamanho_valor: formData.tamanho_valor,
            estado_conservacao: formData.estado_conservacao
          }}
          onFieldChange={onFieldChange}
          errors={errors}
        />
      </div>

      {/* Preço no final com sugestões */}
      <div className="px-1">
        <ItemPricing
          preco={formData.preco}
          onFieldChange={onFieldChange}
          errors={errors}
          faixaPrecos={faixaPrecos}
        />
      </div>
    </div>
  );
};
