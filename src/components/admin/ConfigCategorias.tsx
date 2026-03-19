
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Settings, Save, AlertCircle, Coins } from 'lucide-react';
import { useConfigCategorias } from '@/hooks/useConfigCategorias';
import { Alert, AlertDescription } from '@/components/ui/alert';

const ConfigCategorias: React.FC = () => {
  const { configuracoes, isLoading, atualizarConfig, isAtualizando } = useConfigCategorias();
  const [editando, setEditando] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    valor_minimo: 0,
    valor_maximo: 0,
    descricao: '',
    ativo: true
  });

  const handleEditar = (config: any) => {
    setEditando(config.codigo);
    setFormData({
      valor_minimo: config.valor_minimo,
      valor_maximo: config.valor_maximo,
      descricao: config.descricao || '',
      ativo: config.ativo
    });
  };

  const handleSalvar = () => {
    if (!editando) return;

    if (formData.valor_minimo >= formData.valor_maximo) {
      alert('O valor mínimo deve ser menor que o máximo');
      return;
    }

    atualizarConfig({
      codigo: editando,
      valor_minimo: formData.valor_minimo,
      valor_maximo: formData.valor_maximo,
      descricao: formData.descricao,
      ativo: formData.ativo
    });

    setEditando(null);
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Carregando configurações...
          </CardTitle>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Coins className="w-5 h-5 text-primary" />
            Configuração de Valores por Categoria
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <strong>Importante:</strong> Estas configurações definem os valores mínimos e máximos 
              de Girinhas que podem ser definidos para cada categoria de item. Isso ajuda a manter 
              a economia equilibrada e orienta os usuários sobre preços justos.
            </AlertDescription>
          </Alert>

          <div className="grid gap-4">
            {configuracoes?.map((config) => (
              <Card key={config.codigo} className="border-l-4 border-l-primary">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold text-lg flex items-center gap-2">
                          {config.icone} {config.nome}
                        </h3>
                        <Badge variant={config.ativo ? "default" : "secondary"}>
                          {config.ativo ? "Ativo" : "Inativo"}
                        </Badge>
                      </div>

                      {editando === config.codigo ? (
                        <div className="space-y-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label>Valor Mínimo (Girinhas)</Label>
                              <Input
                                type="number"
                                min="0"
                                step="0.01"
                                value={formData.valor_minimo}
                                onChange={(e) => setFormData(prev => ({
                                  ...prev,
                                  valor_minimo: parseFloat(e.target.value) || 0
                                }))}
                              />
                            </div>
                            <div>
                              <Label>Valor Máximo (Girinhas)</Label>
                              <Input
                                type="number"
                                min="0"
                                step="0.01"
                                value={formData.valor_maximo}
                                onChange={(e) => setFormData(prev => ({
                                  ...prev,
                                  valor_maximo: parseFloat(e.target.value) || 0
                                }))}
                              />
                            </div>
                          </div>

                          <div>
                            <Label>Descrição</Label>
                            <Textarea
                              value={formData.descricao}
                              onChange={(e) => setFormData(prev => ({
                                ...prev,
                                descricao: e.target.value
                              }))}
                              placeholder="Descrição da categoria..."
                            />
                          </div>

                          <div className="flex items-center gap-2">
                            <Switch
                              checked={formData.ativo}
                              onCheckedChange={(checked) => setFormData(prev => ({
                                ...prev,
                                ativo: checked
                              }))}
                            />
                            <Label>Categoria ativa</Label>
                          </div>

                          <div className="flex gap-2">
                            <Button
                              onClick={handleSalvar}
                              disabled={isAtualizando}
                              size="sm"
                            >
                              <Save className="w-4 h-4 mr-2" />
                              {isAtualizando ? 'Salvando...' : 'Salvar'}
                            </Button>
                            <Button
                              variant="outline"
                              onClick={() => setEditando(null)}
                              size="sm"
                            >
                              Cancelar
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <div className="flex items-center gap-4 text-sm text-gray-600">
                            <span>
                              <strong>Min:</strong> {config.valor_minimo} Girinhas
                            </span>
                            <span>
                              <strong>Max:</strong> {config.valor_maximo} Girinhas
                            </span>
                          </div>
                          
                          {config.descricao && (
                            <p className="text-sm text-gray-500">{config.descricao}</p>
                          )}

                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditar(config)}
                          >
                            <Settings className="w-4 h-4 mr-2" />
                            Editar
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ConfigCategorias;
