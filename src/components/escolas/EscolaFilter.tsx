
import React, { useState, useEffect } from 'react';
import { Search, MapPin, Building2, X, Filter } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useEscolas, EscolaEssencial } from '@/hooks/useEscolas';

interface EscolaFilterProps {
  value?: EscolaEssencial | null;
  onChange: (escola: EscolaEssencial | null) => void;
  preSelectedLocation?: { estado: string; cidade: string } | null;
}

const EscolaFilter: React.FC<EscolaFilterProps> = ({ value, onChange, preSelectedLocation }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [nomeEscola, setNomeEscola] = useState('');

  const { 
    escolas, 
    loading, 
    buscarEscolas
  } = useEscolas();

  const handleBuscarEscolas = async () => {
    if (!preSelectedLocation?.estado || !preSelectedLocation?.cidade) {
      return;
    }

    console.log('Buscando escolas em:', preSelectedLocation.cidade, preSelectedLocation.estado);
    await buscarEscolas(nomeEscola, preSelectedLocation.estado, preSelectedLocation.cidade);
  };

  const handleSelecionarEscola = (escola: EscolaEssencial) => {
    onChange(escola);
    setIsOpen(false);
  };

  const handleLimpar = () => {
    onChange(null);
    setNomeEscola('');
  };

  const formatarEndereco = (escola: EscolaEssencial) => {
    const partes = [escola.municipio, escola.uf].filter(Boolean);
    return partes.join(', ');
  };

  if (!preSelectedLocation) {
    return (
      <Button variant="outline" disabled className="w-full h-12">
        <Building2 className="w-4 h-4 mr-2" />
        Selecione localização primeiro
      </Button>
    );
  }

  return (
    <div className="relative">
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button 
            variant={value ? "default" : "outline"} 
            className="w-full h-12 justify-between"
          >
            <div className="flex items-center gap-2">
              <Building2 className="w-4 h-4" />
              {value ? (
                <span className="truncate max-w-32">{value.escola}</span>
              ) : (
                'Filtrar por Escola'
              )}
            </div>
            <Filter className="w-4 h-4 ml-2" />
          </Button>
        </PopoverTrigger>
        
        <PopoverContent className="w-96 p-4" align="start">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-medium">Filtrar por Escola</h4>
              {value && (
                <Button variant="ghost" size="sm" onClick={handleLimpar}>
                  <X className="w-4 h-4" />
                </Button>
              )}
            </div>

            {value ? (
              <Card className="border-primary">
                <CardContent className="p-3">
                  <h4 className="font-medium text-sm line-clamp-2">{value.escola}</h4>
                  <div className="flex items-center gap-1 mt-1 text-xs text-gray-600">
                    <MapPin className="w-3 h-3" />
                    <span>{formatarEndereco(value)}</span>
                  </div>
                  {value.categoria_administrativa && (
                    <Badge variant="secondary" className="mt-1 text-xs">
                      {value.categoria_administrativa}
                    </Badge>
                  )}
                </CardContent>
              </Card>
            ) : (
              <>
                <div className="text-sm text-gray-600">
                  Buscando escolas em {preSelectedLocation.cidade}, {preSelectedLocation.estado}
                </div>
                
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium mb-1">Nome da Escola (opcional)</label>
                    <Input
                      value={nomeEscola}
                      onChange={(e) => setNomeEscola(e.target.value)}
                      placeholder="Digite parte do nome da escola"
                    />
                  </div>

                  <Button
                    onClick={handleBuscarEscolas}
                    disabled={loading}
                    className="w-full"
                  >
                    {loading ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mx-auto"></div>
                    ) : (
                      <>
                        <Search className="w-4 h-4 mr-2" />
                        Buscar Escolas
                      </>
                    )}
                  </Button>
                </div>

                {/* Resultados */}
                {escolas.length > 0 && (
                  <div className="max-h-40 overflow-y-auto border rounded-md">
                    <div className="space-y-1 p-2">
                      {escolas.map((escola) => (
                        <div
                          key={escola.codigo_inep}
                          className="p-2 hover:bg-gray-50 cursor-pointer rounded text-sm"
                          onClick={() => handleSelecionarEscola(escola)}
                        >
                          <div className="font-medium line-clamp-1">{escola.escola}</div>
                          <div className="text-xs text-gray-500">
                            {formatarEndereco(escola)}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default EscolaFilter;
