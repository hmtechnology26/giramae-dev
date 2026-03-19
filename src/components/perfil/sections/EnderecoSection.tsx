
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import SimpleAddressForm from '@/components/address/SimpleAddressForm';
import type { Address } from '@/hooks/useAddress';

interface EnderecoSectionProps {
  formData: {
    aceita_entrega_domicilio: boolean;
    raio_entrega_km: number;
    ponto_retirada_preferido: string;
  };
  onInputChange: (field: string, value: any) => void;
}

const EnderecoSection: React.FC<EnderecoSectionProps> = ({
  formData,
  onInputChange
}) => {
  return (
    <div className="space-y-6">
      <SimpleAddressForm />

      <Card>
        <CardHeader>
          <CardTitle>Preferências de Entrega</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="aceita_entrega">Aceita entrega em domicílio</Label>
            <input
              id="aceita_entrega"
              type="checkbox"
              checked={formData.aceita_entrega_domicilio}
              onChange={(e) => onInputChange('aceita_entrega_domicilio', e.target.checked)}
              className="rounded"
            />
          </div>

          {formData.aceita_entrega_domicilio && (
            <div>
              <Label htmlFor="raio_entrega">Raio de entrega (km)</Label>
              <Select
                value={formData.raio_entrega_km.toString()}
                onValueChange={(value) => onInputChange('raio_entrega_km', parseInt(value))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[1, 2, 3, 5, 10, 15, 20].map(km => (
                    <SelectItem key={km} value={km.toString()}>
                      {km} km
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div>
            <Label htmlFor="ponto_retirada">Ponto de retirada preferido</Label>
            <Input
              id="ponto_retirada"
              value={formData.ponto_retirada_preferido}
              onChange={(e) => onInputChange('ponto_retirada_preferido', e.target.value)}
              placeholder="Ex: Shopping, estação de metrô..."
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EnderecoSection;
