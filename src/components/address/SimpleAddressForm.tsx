
import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, MapPin, Edit, Save, X } from 'lucide-react';
import { useAddress, type Address } from '@/hooks/useAddress';
import { useUserAddress } from '@/hooks/useUserAddress';

const SimpleAddressForm: React.FC = () => {
  const { userAddress, isLoading, updateAddress, isUpdating } = useUserAddress();
  const { loading: viaCepLoading, error: viaCepError, fetchAddress, formatCep, validateAddress } = useAddress();
  
  const [isEditing, setIsEditing] = useState(!userAddress);
  const [formData, setFormData] = useState<Partial<Address>>({
    cep: '',
    endereco: '',
    numero: '',
    bairro: '',
    cidade: '',
    estado: '',
    complemento: '',
    ponto_referencia: ''
  });

  useEffect(() => {
    if (userAddress) {
      setFormData(userAddress);
      setIsEditing(false);
    } else {
      setIsEditing(true);
    }
  }, [userAddress]);

  const handleCepChange = async (cep: string) => {
    const formattedCep = formatCep(cep);
    setFormData(prev => ({ ...prev, cep: formattedCep }));

    if (formattedCep.replace(/\D/g, '').length === 8) {
      const addressData = await fetchAddress(formattedCep);
      if (addressData) {
        setFormData(prev => ({
          ...prev,
          ...addressData,
          numero: prev.numero || '', // Manter número se já preenchido
          complemento: prev.complemento || '',
          ponto_referencia: prev.ponto_referencia || ''
        }));
      }
    }
  };

  const handleInputChange = (field: keyof Address, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    const errors = validateAddress(formData);
    if (errors.length > 0) {
      errors.forEach(error => console.error(error));
      return;
    }

    updateAddress(formData as Address);
  };

  const handleCancel = () => {
    if (userAddress) {
      setFormData(userAddress);
      setIsEditing(false);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <Loader2 className="w-6 h-6 animate-spin mr-2" />
            Carregando endereço...
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <MapPin className="w-5 h-5 text-primary" />
            Meu Endereço
          </CardTitle>
          {userAddress && !isEditing && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsEditing(true)}
              className="flex items-center gap-1"
            >
              <Edit className="w-4 h-4" />
              Editar
            </Button>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {!isEditing && userAddress ? (
          // Visualização do endereço
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium text-gray-600">CEP:</span>
                <p>{userAddress.cep}</p>
              </div>
              <div>
                <span className="font-medium text-gray-600">Estado:</span>
                <p>{userAddress.estado}</p>
              </div>
            </div>
            
            <div>
              <span className="font-medium text-gray-600">Endereço:</span>
              <p>{userAddress.endereco}, {userAddress.numero}</p>
            </div>
            
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium text-gray-600">Bairro:</span>
                <p>{userAddress.bairro}</p>
              </div>
              <div>
                <span className="font-medium text-gray-600">Cidade:</span>
                <p>{userAddress.cidade}</p>
              </div>
            </div>
            
            {userAddress.complemento && (
              <div>
                <span className="font-medium text-gray-600">Complemento:</span>
                <p>{userAddress.complemento}</p>
              </div>
            )}
            
            {userAddress.ponto_referencia && (
              <div>
                <span className="font-medium text-gray-600">Ponto de Referência:</span>
                <p>{userAddress.ponto_referencia}</p>
              </div>
            )}
          </div>
        ) : (
          // Formulário de edição/criação
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="cep">CEP *</Label>
                <div className="relative">
                  <Input
                    id="cep"
                    placeholder="00000-000"
                    value={formData.cep || ''}
                    onChange={(e) => handleCepChange(e.target.value)}
                    maxLength={9}
                  />
                  {viaCepLoading && (
                    <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 animate-spin" />
                  )}
                </div>
                {viaCepError && <p className="text-red-500 text-sm mt-1">{viaCepError}</p>}
              </div>

              <div>
                <Label htmlFor="estado">Estado *</Label>
                <Input
                  id="estado"
                  placeholder="SP"
                  value={formData.estado || ''}
                  onChange={(e) => handleInputChange('estado', e.target.value.toUpperCase())}
                  maxLength={2}
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="col-span-2">
                <Label htmlFor="endereco">Rua/Endereço *</Label>
                <Input
                  id="endereco"
                  placeholder="Nome da rua/avenida"
                  value={formData.endereco || ''}
                  onChange={(e) => handleInputChange('endereco', e.target.value)}
                />
              </div>
              
              <div>
                <Label htmlFor="numero">Número *</Label>
                <Input
                  id="numero"
                  placeholder="123"
                  value={formData.numero || ''}
                  onChange={(e) => handleInputChange('numero', e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="bairro">Bairro *</Label>
                <Input
                  id="bairro"
                  placeholder="Nome do bairro"
                  value={formData.bairro || ''}
                  onChange={(e) => handleInputChange('bairro', e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="cidade">Cidade *</Label>
                <Input
                  id="cidade"
                  placeholder="Nome da cidade"
                  value={formData.cidade || ''}
                  onChange={(e) => handleInputChange('cidade', e.target.value)}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="complemento">Complemento</Label>
              <Input
                id="complemento"
                placeholder="Apartamento, sala, etc."
                value={formData.complemento || ''}
                onChange={(e) => handleInputChange('complemento', e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="ponto_referencia">Ponto de Referência</Label>
              <Textarea
                id="ponto_referencia"
                placeholder="Próximo ao shopping, em frente à padaria..."
                value={formData.ponto_referencia || ''}
                onChange={(e) => handleInputChange('ponto_referencia', e.target.value)}
                rows={2}
              />
            </div>

            <div className="flex gap-2 pt-2">
              <Button 
                onClick={handleSave}
                disabled={isUpdating || viaCepLoading}
                className="flex-1"
              >
                {isUpdating ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Salvando...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Salvar Endereço
                  </>
                )}
              </Button>
              
              {userAddress && (
                <Button 
                  variant="outline" 
                  onClick={handleCancel}
                  className="flex-1"
                >
                  <X className="w-4 h-4 mr-2" />
                  Cancelar
                </Button>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default SimpleAddressForm;
