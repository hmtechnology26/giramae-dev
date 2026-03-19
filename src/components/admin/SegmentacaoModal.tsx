
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MapPin, Users, Clock, ShoppingBag } from 'lucide-react';
import { useSubcategorias } from '@/hooks/useSubcategorias';
import { useEscolas } from '@/hooks/useEscolas';

interface SegmentacaoModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSegmentacaoChange: (criterios: any) => void;
  criteriosIniciais?: any;
}

const SegmentacaoModal: React.FC<SegmentacaoModalProps> = ({
  open,
  onOpenChange,
  onSegmentacaoChange,
  criteriosIniciais = {}
}) => {
  const [criterios, setCriterios] = useState(criteriosIniciais);
  const [previewCount, setPreviewCount] = useState(0);
  
  const { subcategorias } = useSubcategorias();
  const { escolas } = useEscolas();

  const estados = [
    'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO',
    'MA', 'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI',
    'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'
  ];

  const faixasIdade = [
    { value: '0-2', label: '0-2 anos (Bebê)' },
    { value: '3-5', label: '3-5 anos (Pré-escolar)' },
    { value: '6-8', label: '6-8 anos (Escolar inicial)' },
    { value: '9-12', label: '9-12 anos (Pré-adolescente)' },
    { value: '13-15', label: '13-15 anos (Adolescente)' },
    { value: '16+', label: '16+ anos (Jovem)' }
  ];

  const faixasSaldo = [
    { value: '0-10', label: '0-10 Girinhas' },
    { value: '11-50', label: '11-50 Girinhas' },
    { value: '51-100', label: '51-100 Girinhas' },
    { value: '100+', label: '100+ Girinhas' }
  ];

  const categorias = ['roupas', 'calcados', 'brinquedos', 'livros', 'acessorios'];

  const handleCriterioChange = (categoria: string, valor: any) => {
    const novosCriterios = { ...criterios, [categoria]: valor };
    setCriterios(novosCriterios);
    // Simular cálculo de preview (seria uma chamada real à API)
    setPreviewCount(Math.floor(Math.random() * 1000) + 50);
  };

  const handleArrayChange = (categoria: string, item: string, checked: boolean) => {
    const array = criterios[categoria] || [];
    const novoArray = checked 
      ? [...array, item]
      : array.filter((i: string) => i !== item);
    
    handleCriterioChange(categoria, novoArray.length > 0 ? novoArray : undefined);
  };

  const aplicarSegmentacao = () => {
    onSegmentacaoChange(criterios);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Configurar Segmentação de Missão
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Preview de usuários elegíveis */}
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-blue-600 font-medium">Usuários Elegíveis</p>
                  <p className="text-2xl font-bold text-blue-900">{previewCount.toLocaleString()}</p>
                </div>
                <Badge variant="secondary">
                  {previewCount > 100 ? 'Segmento Adequado' : 'Segmento Pequeno'}
                </Badge>
              </div>
            </CardContent>
          </Card>

          <Tabs defaultValue="geografico" className="space-y-4">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="geografico" className="flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                Geografia
              </TabsTrigger>
              <TabsTrigger value="demografico" className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                Demografia
              </TabsTrigger>
              <TabsTrigger value="comportamental" className="flex items-center gap-2">
                <ShoppingBag className="w-4 h-4" />
                Comportamento
              </TabsTrigger>
            </TabsList>

            <TabsContent value="geografico" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Filtros Geográficos</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Estados */}
                  <div>
                    <Label className="text-sm font-medium">Estados</Label>
                    <div className="grid grid-cols-6 gap-2 mt-2">
                      {estados.map(estado => (
                        <div key={estado} className="flex items-center space-x-2">
                          <Checkbox
                            id={`estado-${estado}`}
                            checked={criterios.estados?.includes(estado)}
                            onCheckedChange={(checked) => 
                              handleArrayChange('estados', estado, checked as boolean)
                            }
                          />
                          <Label htmlFor={`estado-${estado}`} className="text-sm">
                            {estado}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Cidades */}
                  <div>
                    <Label htmlFor="cidades">Cidades Específicas</Label>
                    <Input
                      id="cidades"
                      placeholder="Digite cidades separadas por vírgula"
                      value={criterios.cidades?.join(', ') || ''}
                      onChange={(e) => {
                        const cidades = e.target.value.split(',').map(c => c.trim()).filter(c => c);
                        handleCriterioChange('cidades', cidades.length > 0 ? cidades : undefined);
                      }}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="demografico" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Filtros Demográficos</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Idades dos filhos */}
                  <div>
                    <Label className="text-sm font-medium">Idades dos Filhos</Label>
                    <div className="grid grid-cols-2 gap-2 mt-2">
                      {faixasIdade.map(faixa => (
                        <div key={faixa.value} className="flex items-center space-x-2">
                          <Checkbox
                            id={`idade-${faixa.value}`}
                            checked={criterios.idades_filhos?.includes(faixa.value)}
                            onCheckedChange={(checked) => 
                              handleArrayChange('idades_filhos', faixa.value, checked as boolean)
                            }
                          />
                          <Label htmlFor={`idade-${faixa.value}`} className="text-sm">
                            {faixa.label}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Sexo dos filhos */}
                  <div>
                    <Label className="text-sm font-medium">Sexo dos Filhos</Label>
                    <div className="flex gap-4 mt-2">
                      {['menino', 'menina', 'ambos'].map(sexo => (
                        <div key={sexo} className="flex items-center space-x-2">
                          <Checkbox
                            id={`sexo-${sexo}`}
                            checked={criterios.sexo_filhos?.includes(sexo)}
                            onCheckedChange={(checked) => 
                              handleArrayChange('sexo_filhos', sexo, checked as boolean)
                            }
                          />
                          <Label htmlFor={`sexo-${sexo}`} className="text-sm capitalize">
                            {sexo}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="comportamental" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Filtros Comportamentais</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Faixa de saldo */}
                  <div>
                    <Label className="text-sm font-medium">Faixa de Saldo em Carteira</Label>
                    <div className="grid grid-cols-2 gap-2 mt-2">
                      {faixasSaldo.map(faixa => (
                        <div key={faixa.value} className="flex items-center space-x-2">
                          <Checkbox
                            id={`saldo-${faixa.value}`}
                            checked={criterios.faixas_saldo?.includes(faixa.value)}
                            onCheckedChange={(checked) => 
                              handleArrayChange('faixas_saldo', faixa.value, checked as boolean)
                            }
                          />
                          <Label htmlFor={`saldo-${faixa.value}`} className="text-sm">
                            {faixa.label}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Categorias favoritas */}
                  <div>
                    <Label className="text-sm font-medium">Categorias de Interesse</Label>
                    <div className="grid grid-cols-3 gap-2 mt-2">
                      {categorias.map(categoria => (
                        <div key={categoria} className="flex items-center space-x-2">
                          <Checkbox
                            id={`categoria-${categoria}`}
                            checked={criterios.categorias_favoritas?.includes(categoria)}
                            onCheckedChange={(checked) => 
                              handleArrayChange('categorias_favoritas', categoria, checked as boolean)
                            }
                          />
                          <Label htmlFor={`categoria-${categoria}`} className="text-sm capitalize">
                            {categoria}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          <div className="flex justify-between">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button onClick={aplicarSegmentacao}>
              Aplicar Segmentação
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SegmentacaoModal;
