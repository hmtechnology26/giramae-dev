
import React from 'react';
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Sparkles } from "lucide-react";

interface ItemPricingProps {
  preco: string;
  onFieldChange: (field: string, value: any) => void;
  errors: any;
  faixaPrecos?: { minimo: number; maximo: number } | null;
}

export const ItemPricing: React.FC<ItemPricingProps> = ({
  preco,
  onFieldChange,
  errors,
  faixaPrecos
}) => {
  // Gerar sugestões de preços baseadas na faixa
  const gerarSugestoesPreco = () => {
    if (!faixaPrecos) return [];

    const { minimo, maximo } = faixaPrecos;
    const sugestoes = [];

    // Adicionar o preço mínimo
    sugestoes.push(minimo);

    // Adicionar alguns valores intermediários
    const diferenca = maximo - minimo;
    if (diferenca > 10) {
      const meio = Math.round((minimo + maximo) / 2);
      const quartil1 = Math.round(minimo + diferenca * 0.25);
      const quartil3 = Math.round(minimo + diferenca * 0.75);

      if (quartil1 > minimo && quartil1 < maximo) sugestoes.push(quartil1);
      if (meio > minimo && meio < maximo) sugestoes.push(meio);
      if (quartil3 > minimo && quartil3 < maximo) sugestoes.push(quartil3);
    }

    // Adicionar o preço máximo se diferente do mínimo
    if (maximo > minimo) {
      sugestoes.push(maximo);
    }

    // Remover duplicatas e ordenar
    return [...new Set(sugestoes)].sort((a, b) => a - b);
  };

  const sugestoes = gerarSugestoesPreco();

  const handleSugestaoClick = (valor: number) => {
    onFieldChange('preco', valor.toString());
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <Label className="text-sm font-bold text-foreground/70 ml-1 uppercase tracking-wider flex items-center gap-2">
          Quantidade de Girinhas
          <Sparkles className="w-4 h-4 text-primary animate-pulse" />
          <span className="text-primary">*</span>
        </Label>

        <div className="relative group">
          <Input
            type="number"
            name="preco"
            value={preco}
            onChange={(e) => onFieldChange('preco', e.target.value)}
            placeholder="25"
            className="h-14 text-2xl font-bold border-primary/10 focus:border-primary/30 focus:ring-primary/5 rounded-2xl bg-white/50 pl-14 transition-all"
          />
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-primary">
            <Sparkles className="w-6 h-6" />
          </div>
        </div>

        <p className="text-xs text-muted-foreground font-light italic ml-1">✨ 1 Girinha equivale ao valor simbólico de R$ 1,00 para troca.</p>
        {errors.preco && <p className="text-destructive text-xs mt-1 font-medium">{errors.preco}</p>}
      </div>

      {/* Sugestões de Preços */}
      {faixaPrecos && sugestoes.length > 0 && (
        <div className="bg-primary/5 p-6 rounded-3xl border border-primary/10 animate-in zoom-in-95 duration-500">
          <p className="text-sm font-bold text-foreground/70 mb-4 flex items-center gap-2 uppercase tracking-wide">
            💡 Sugestões para esta categoria:
          </p>
          <div className="flex flex-wrap gap-2.5">
            {sugestoes.map((valor) => (
              <button
                key={valor}
                type="button"
                onClick={() => handleSugestaoClick(valor)}
                className={`px-5 py-2.5 rounded-full text-sm font-bold transition-all duration-300 border flex items-center gap-2 ${preco === valor.toString()
                  ? 'bg-primary text-white border-primary shadow-lg shadow-primary/20 scale-105'
                  : 'bg-white text-foreground/60 border-primary/10 hover:border-primary/30 hover:bg-primary/[0.02] hover:shadow-sm'
                  }`}
              >
                {valor}
                <Sparkles className={`w-3 h-3 ${preco === valor.toString() ? 'text-white' : 'text-primary/40'}`} />
              </button>
            ))}
          </div>
          <p className="text-[11px] text-primary/60 font-medium mt-4 uppercase tracking-widest">
            Faixa recomendada: {faixaPrecos.minimo} - {faixaPrecos.maximo} Girinhas
          </p>
        </div>
      )}
    </div>
  );
};
