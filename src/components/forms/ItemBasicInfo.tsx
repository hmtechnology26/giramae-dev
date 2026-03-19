
import React from 'react';
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import ImageUpload from "@/components/ui/image-upload";

interface ItemBasicInfoProps {
  formData: {
    titulo: string;
    descricao: string;
    preco: string;
    imagens: File[];
  };
  onFieldChange: (field: string, value: any) => void;
  errors: any;
  faixaPrecos?: { minimo: number; maximo: number } | null;
  hideImageUpload?: boolean;
}

export const ItemBasicInfo: React.FC<ItemBasicInfoProps> = ({
  formData,
  onFieldChange,
  errors,
  faixaPrecos,
  hideImageUpload = false
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    onFieldChange(name, value);
  };

  return (
    <div className="space-y-8">
      {/* Fotos do Item - só mostra se não estiver oculto */}
      {!hideImageUpload && (
        <div className="bg-primary/[0.02] p-6 rounded-2xl border border-primary/5">
          <Label className="text-base font-bold mb-4 block text-foreground/80">
            Fotos do Item <span className="text-primary ml-1">*</span>
          </Label>
          <div className="mt-4">
            <ImageUpload
              value={formData.imagens}
              onChange={(files) => onFieldChange('imagens', files)}
              maxFiles={6}
            />
          </div>
          <p className="text-xs text-muted-foreground mt-4 font-light italic">💡 Dica: Adicione até 6 fotos. A primeira será a capa do anúncio.</p>
          {errors.imagens && <p className="text-destructive text-sm mt-3 font-medium bg-destructive/5 p-3 rounded-lg border border-destructive/10">{errors.imagens}</p>}
        </div>
      )}

      {/* Título */}
      <div className="space-y-3">
        <Label htmlFor="titulo" className="text-sm font-bold text-foreground/70 ml-1 uppercase tracking-wider">
          Título do Anúncio <span className="text-primary">*</span>
        </Label>
        <Input
          type="text"
          id="titulo"
          name="titulo"
          value={formData.titulo}
          onChange={handleChange}
          placeholder="Ex: Vestido de Festa Rosa - Tam 4 anos"
          className="h-12 text-base border-primary/10 focus:border-primary/30 focus:ring-primary/5 rounded-xl bg-white/50 transition-all"
        />
        {errors.titulo && <p className="text-destructive text-xs mt-1 font-medium">{errors.titulo}</p>}
      </div>

      {/* Descrição Detalhada */}
      <div className="space-y-3">
        <Label htmlFor="descricao" className="text-sm font-bold text-foreground/70 ml-1 uppercase tracking-wider">
          Descrição Detalhada
        </Label>
        <Textarea
          id="descricao"
          name="descricao"
          value={formData.descricao}
          onChange={handleChange}
          placeholder="Descreva o item detalhadamente, incluindo características especiais, defeitos (se houver), marca, etc..."
          className="min-h-[140px] text-base border-primary/10 focus:border-primary/30 focus:ring-primary/5 rounded-xl bg-white/50 transition-all resize-none p-4"
          rows={5}
        />
        {errors.descricao && <p className="text-destructive text-xs mt-1 font-medium">{errors.descricao}</p>}
      </div>
    </div>
  );
};
