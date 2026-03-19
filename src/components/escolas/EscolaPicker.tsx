
import React, { useState, useEffect, useRef } from 'react';
import { Search, MapPin, Building2, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useEscolas, EscolaEssencial } from '@/hooks/useEscolas';
import { ESTADOS_BRASIL } from '@/constants/estados';

interface EscolaPickerProps {
  value?: EscolaEssencial | null;
  onChange: (escola: EscolaEssencial | null) => void;
  placeholder?: string;
  className?: string;
}

const EscolaPicker: React.FC<EscolaPickerProps> = ({
  value,
  onChange,
  placeholder = "Buscar escola...",
  className = ""
}) => {
  const [estado, setEstado] = useState('');
  const [cidade, setCidade] = useState('');
  const [nomeEscola, setNomeEscola] = useState('');
  const [mostrarResultados, setMostrarResultados] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const { 
    escolas, 
    municipios, 
    loading, 
    loadingMunicipios, 
    buscarEscolas, 
    buscarMunicipios 
  } = useEscolas();

  useEffect(() => {
    if (estado) {
      buscarMunicipios(estado);
      setCidade('');
    }
  }, [estado, buscarMunicipios]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setMostrarResultados(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleBuscarEscolas = async () => {
    if (!estado || !cidade) {
      alert('Por favor, selecione o estado e a cidade antes de buscar');
      return;
    }

    if (nomeEscola.length < 3) {
      alert('Digite pelo menos 3 caracteres do nome da escola');
      return;
    }

    await buscarEscolas(nomeEscola, estado, cidade);
    setMostrarResultados(true);
  };

  const handleSelecionarEscola = (escola: EscolaEssencial) => {
    onChange(escola);
    setMostrarResultados(false);
  };

  const handleLimpar = () => {
    onChange(null);
    setEstado('');
    setCidade('');
    setNomeEscola('');
    setMostrarResultados(false);
  };

  const formatarEndereco = (escola: EscolaEssencial) => {
    const partes = [escola.municipio, escola.uf].filter(Boolean);
    return partes.join(', ');
  };

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      {value && (
        <div className="mb-4">
          <Card className="border-primary">
            <CardContent className="p-3">
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-sm line-clamp-2 mb-1">{value.escola}</h4>
                  <div className="flex items-center gap-1 text-xs text-gray-600">
                    <MapPin className="w-3 h-3 flex-shrink-0" />
                    <span className="truncate">{formatarEndereco(value)}</span>
                  </div>
                  {value.categoria_administrativa && (
                    <Badge variant="secondary" className="mt-1 text-xs">
                      {value.categoria_administrativa}
                    </Badge>
                  )}
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="p-1 h-6 w-6 ml-2 flex-shrink-0"
                  onClick={handleLimpar}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {!value && (
        <div className="space-y-4">
          <div className="text-sm text-gray-600 mb-3 px-1">
            Para buscar uma escola, primeiro selecione o estado e cidade, depois digite parte do nome da escola.
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700">Estado *</label>
              <Select value={estado} onValueChange={setEstado}>
                <SelectTrigger className="w-full h-12">
                  <SelectValue placeholder="Selecione o estado" />
                </SelectTrigger>
                <SelectContent className="max-h-60">
                  {ESTADOS_BRASIL.map((uf) => (
                    <SelectItem key={uf.sigla} value={uf.sigla}>
                      {uf.nome} ({uf.sigla})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700">Cidade *</label>
              <Select 
                value={cidade} 
                onValueChange={setCidade}
                disabled={!estado || loadingMunicipios}
              >
                <SelectTrigger className="w-full h-12">
                  <SelectValue 
                    placeholder={
                      !estado ? "Selecione o estado primeiro" :
                      loadingMunicipios ? "Carregando cidades..." :
                      "Selecione a cidade"
                    } 
                  />
                </SelectTrigger>
                <SelectContent className="max-h-60">
                  {municipios.map((municipio) => (
                    <SelectItem key={municipio} value={municipio}>
                      {municipio}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {loadingMunicipios && (
                <div className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                  <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-primary"></div>
                  Carregando cidades...
                </div>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-gray-700">Nome da Escola *</label>
            <div className="space-y-3">
              <Input
                value={nomeEscola}
                onChange={(e) => setNomeEscola(e.target.value)}
                placeholder="Digite pelo menos 3 caracteres do nome da escola"
                className="h-12"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleBuscarEscolas();
                  }
                }}
              />
              <Button
                type="button"
                onClick={handleBuscarEscolas}
                disabled={!estado || !cidade || nomeEscola.length < 3}
                className="w-full h-12 text-base"
              >
                <Search className="w-4 h-4 mr-2" />
                Buscar Escola
              </Button>
            </div>
          </div>
        </div>
      )}

      {mostrarResultados && !value && (
        <Card className="absolute top-full left-0 right-0 z-50 mt-1 max-h-80 overflow-y-auto bg-white shadow-lg">
          <CardContent className="p-2">
            {loading ? (
              <div className="p-6 text-center text-gray-500">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                <p className="mt-3 text-sm">Buscando escolas...</p>
              </div>
            ) : escolas.length > 0 ? (
              <div className="space-y-2">
                {escolas.map((escola) => (
                  <div
                    key={escola.codigo_inep}
                    className="p-4 hover:bg-gray-50 cursor-pointer rounded-lg border active:bg-gray-100 transition-colors"
                    onClick={() => handleSelecionarEscola(escola)}
                  >
                    <div className="flex items-start gap-3">
                      <Building2 className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-sm leading-5 mb-2">{escola.escola}</h4>
                        <div className="flex items-center gap-1 mb-2 text-xs text-gray-600">
                          <MapPin className="w-3 h-3 flex-shrink-0" />
                          <span className="truncate">{formatarEndereco(escola)}</span>
                        </div>
                        {escola.categoria_administrativa && (
                          <Badge variant="outline" className="text-xs">
                            {escola.categoria_administrativa}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-6 text-center text-gray-500">
                <Building2 className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p className="text-sm font-medium">Nenhuma escola encontrada</p>
                <p className="text-xs text-gray-400 mt-1">
                  Verifique se o estado, cidade e nome da escola estão corretos
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default EscolaPicker;
