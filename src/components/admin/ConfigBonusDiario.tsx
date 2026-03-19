
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Gift, Save, AlertCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface ConfigValue {
  ativo?: boolean;
  girinhas?: number;
  horas?: number;
}

const ConfigBonusDiario: React.FC = () => {
  const [config, setConfig] = useState({
    ativo: true,
    valorGirinhas: 5,
    validadeHoras: 24
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    carregarConfiguracoes();
  }, []);

  const carregarConfiguracoes = async () => {
    setIsLoading(true);
    try {
      const { data: configs } = await supabase
        .from('config_sistema')
        .select('chave, valor')
        .in('chave', ['bonus_diario_ativo', 'bonus_diario_valor', 'bonus_diario_validade']);

      if (configs) {
        configs.forEach(config => {
          const configValue = config.valor as ConfigValue;
          switch (config.chave) {
            case 'bonus_diario_ativo':
              setConfig(prev => ({ ...prev, ativo: configValue?.ativo ?? true }));
              break;
            case 'bonus_diario_valor':
              setConfig(prev => ({ ...prev, valorGirinhas: configValue?.girinhas ?? 5 }));
              break;
            case 'bonus_diario_validade':
              setConfig(prev => ({ ...prev, validadeHoras: configValue?.horas ?? 24 }));
              break;
          }
        });
      }
    } catch (error) {
      console.error('Erro ao carregar configurações:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar as configurações.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const salvarConfiguracoes = async () => {
    setIsSaving(true);
    try {
      const updates = [
        {
          chave: 'bonus_diario_ativo',
          valor: { ativo: config.ativo }
        },
        {
          chave: 'bonus_diario_valor',
          valor: { girinhas: config.valorGirinhas }
        },
        {
          chave: 'bonus_diario_validade',
          valor: { horas: config.validadeHoras }
        }
      ];

      for (const update of updates) {
        const { error } = await supabase
          .from('config_sistema')
          .upsert(update);

        if (error) throw error;
      }

      toast({
        title: "Configurações salvas",
        description: "Bônus diário configurado com sucesso!"
      });
    } catch (error) {
      console.error('Erro ao salvar configurações:', error);
      toast({
        title: "Erro",
        description: "Não foi possível salvar as configurações.",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return <div>Carregando configurações do bônus diário...</div>;
  }

  const impactoDiario = config.ativo ? config.valorGirinhas : 0;
  const impactoMensal = impactoDiario * 30;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Gift className="w-5 h-5 text-purple-500" />
          Configuração do Bônus Diário
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Status do sistema */}
        <div className="flex items-center justify-between p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border">
          <div>
            <h3 className="font-semibold text-purple-800">Sistema de Bônus Diário</h3>
            <p className="text-sm text-purple-600">
              {config.ativo ? '✅ Ativo e funcionando' : '⚠️ Desativado'}
            </p>
          </div>
          <Switch
            checked={config.ativo}
            onCheckedChange={(checked) => setConfig(prev => ({ ...prev, ativo: checked }))}
          />
        </div>

        {/* Configurações principais */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="valorGirinhas">Valor em Girinhas</Label>
            <Input
              id="valorGirinhas"
              type="number"
              min="1"
              max="50"
              value={config.valorGirinhas}
              onChange={(e) => setConfig(prev => ({ 
                ...prev, 
                valorGirinhas: parseInt(e.target.value) || 5 
              }))}
            />
            <p className="text-xs text-muted-foreground">
              Quantidade de Girinhas do bônus diário
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="validadeHoras">Validade (horas)</Label>
            <Input
              id="validadeHoras"
              type="number"
              min="1"
              max="168"
              value={config.validadeHoras}
              onChange={(e) => setConfig(prev => ({ 
                ...prev, 
                validadeHoras: parseInt(e.target.value) || 24 
              }))}
            />
            <p className="text-xs text-muted-foreground">
              Tempo até as Girinhas expirarem
            </p>
          </div>
        </div>

        {/* Análise de impacto */}
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
          <h4 className="font-semibold text-blue-800 mb-2 flex items-center gap-2">
            <AlertCircle className="h-4 w-4" />
            Análise de Impacto
          </h4>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-blue-600">Impacto por usuário/dia:</span>
              <div className="font-semibold text-blue-800">
                {impactoDiario} Girinhas
              </div>
            </div>
            <div>
              <span className="text-blue-600">Impacto por usuário/mês:</span>
              <div className="font-semibold text-blue-800">
                {impactoMensal} Girinhas
              </div>
            </div>
          </div>
          
          {config.validadeHoras <= 24 && (
            <div className="mt-2 text-xs text-blue-600">
              ✅ Validade baixa minimiza inflação - configuração recomendada
            </div>
          )}
        </div>

        {/* Estratégia recomendada */}
        <div className="bg-green-50 p-4 rounded-lg border border-green-200">
          <h4 className="font-semibold text-green-800 mb-2">💡 Estratégia Recomendada</h4>
          <ul className="text-sm text-green-700 space-y-1">
            <li>• <strong>5 Girinhas:</strong> Valor ideal para incentivar sem inflar</li>
            <li>• <strong>24 horas:</strong> Cria urgência sem ser muito restritivo</li>
            <li>• <strong>Ativo:</strong> Aumenta engajamento diário significativamente</li>
          </ul>
        </div>

        {/* Botão salvar */}
        <Button 
          onClick={salvarConfiguracoes}
          disabled={isSaving}
          className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
        >
          <Save className="w-4 h-4 mr-2" />
          {isSaving ? 'Salvando...' : 'Salvar Configurações'}
        </Button>
      </CardContent>
    </Card>
  );
};

export default ConfigBonusDiario;
