
import React from 'react';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';

interface AdvancedFiltersContentProps {
  precoMin: number;
  precoMax: number;
  mesmaEscola: boolean;
  mesmoBairro: boolean;
  paraFilhos: boolean;
  apenasFavoritos: boolean;
  apenasSeguidoras: boolean;
  onPrecoChange: (values: [number, number]) => void;
  onMesmaEscolaChange: (checked: boolean) => void;
  onMesmoBairroChange: (checked: boolean) => void;
  onParaFilhosChange: (checked: boolean) => void;
  onApenasFavoritosChange: (checked: boolean) => void;
  onApenasSeguidorasChange: (checked: boolean) => void;
}

export const AdvancedFiltersContent: React.FC<AdvancedFiltersContentProps> = ({
  precoMin,
  precoMax,
  mesmaEscola,
  mesmoBairro,
  paraFilhos,
  apenasFavoritos,
  apenasSeguidoras,
  onPrecoChange,
  onMesmaEscolaChange,
  onMesmoBairroChange,
  onParaFilhosChange,
  onApenasFavoritosChange,
  onApenasSeguidorasChange
}) => {
  return (
    <div className="space-y-4 pt-4 border-t border-gray-100">
      {/* Faixa de Preço */}
      <div>
        <Label className="text-sm font-medium text-gray-700 mb-2 block">
          Faixa de Preço: {precoMin} - {precoMax} Girinhas
        </Label>
        <div className="px-2">
          <Slider
            value={[precoMin, precoMax]}
            onValueChange={onPrecoChange}
            max={200}
            min={0}
            step={5}
            className="w-full"
          />
        </div>
      </div>

      {/* Switches de Filtros - Grid 2x3 */}
      <div className="grid grid-cols-2 gap-3">
        <div className="flex items-center space-x-2">
          <Switch
            id="mesma-escola"
            checked={mesmaEscola}
            onCheckedChange={onMesmaEscolaChange}
          />
          <Label htmlFor="mesma-escola" className="text-sm">
            Mesma escola que eu
          </Label>
        </div>

        <div className="flex items-center space-x-2">
          <Switch
            id="mesmo-bairro"
            checked={mesmoBairro}
            onCheckedChange={onMesmoBairroChange}
          />
          <Label htmlFor="mesmo-bairro" className="text-sm">
            Mesmo bairro
          </Label>
        </div>

        <div className="flex items-center space-x-2">
          <Switch
            id="para-filhos"
            checked={paraFilhos}
            onCheckedChange={onParaFilhosChange}
          />
          <Label htmlFor="para-filhos" className="text-sm">
            Para meus filhos
          </Label>
        </div>

        <div className="flex items-center space-x-2">
          <Switch
            id="apenas-favoritos"
            checked={apenasFavoritos}
            onCheckedChange={onApenasFavoritosChange}
          />
          <Label htmlFor="apenas-favoritos" className="text-sm">
            Apenas favoritos
          </Label>
        </div>

        <div className="flex items-center space-x-2 col-span-2">
          <Switch
            id="apenas-seguidoras"
            checked={apenasSeguidoras}
            onCheckedChange={onApenasSeguidorasChange}
          />
          <Label htmlFor="apenas-seguidoras" className="text-sm">
            Apenas minhas seguidoras
          </Label>
        </div>
      </div>
    </div>
  );
};
