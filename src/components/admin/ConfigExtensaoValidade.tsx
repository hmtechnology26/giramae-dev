
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Sparkles, Save, AlertCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface ConfigValue {
  ativo?: boolean;
  percentual?: number;
  dias?: number;
}

const ConfigExtensaoValidade: React.FC = () => {
  const [config, setConfig] = useState({
    ativo: true,
    percentual: 20,
    dias: 30
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
        .in('chave', ['extensao_validade_ativa', 'extensao_validade_percentual', 'extensao_validade_dias']);

      if (configs) {
        configs.forEach(config => {
          const configValue = config.valor as ConfigValue;
          switch (config.chave) {
            case 'extensao_validade_ativa':
              setConfig(prev => ({ ...prev, ativo: configValue?.ativo ?? true }));
              break;
            case 'extensao_validade_percentual':
              setConfig(prev => ({ ...prev, percentual: configValue?.percentual ?? 20 }));
              break;
            case 'extensao_validade_dias':
              setConfig(prev => ({ ...prev, dias: configValue?.dias ?? 30 }));
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
          chave: 'extensao_validade_ativa',
          valor: { ativo: config.ativo }
        },
        {
          chave: 'extensao_validade_percentual',
          valor: { percentual: config.percentual }
        },
        {
          chave: 'extensao_validade_dias',
          valor: { dias: config.dias }
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
        description: "Extensão de validade configurada com sucesso!"
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
    return <div>Carregando configurações de extensão de validade...</div>;
  }

  const custoExemplo = Math.max(Math.round(50 * (config.percentual / 100)), 1);
  const girinhasSalvasExemplo = 50 - custoExemplo;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-purple-500" />
          Configuração da Extensão de Validade
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Status do sistema */}
        <div className="flex items-center justify-between p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border">
          <div>
            <h3 className="font-semibold text-purple-800">Sistema de Extensão de Validade</h3>
            <p className="text-sm text-purple-600">
              {config.ativo ? '✅ Ativo - Usuários podem estender validade' : '⚠️ Desativado'}
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
            <Label htmlFor="percentual">Percentual de Custo (%)</Label>
            <Input
              id="percentual"
              type="number"
              min="1"
              max="100"
              value={config.percentual}
              onChange={(e) => setConfig(prev => ({ 
                ...prev, 
                percentual: parseInt(e.target.value) || 20 
              }))}
            />
            <p className="text-xs text-muted-foreground">
              Percentual das Girinhas expirando cobrado para extensão
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="dias">Dias de Extensão</Label>
            <Input
              id="dias"
              type="number"
              min="1"
              max="365"
              value={config.dias}
              onChange={(e) => setConfig(prev => ({ 
                ...prev, 
                dias: parseInt(e.target.value) || 30 
              }))}
            />
            <p className="text-xs text-muted-foreground">
              Quantos dias são adicionados na extensão
            </p>
          </div>
        </div>

        {/* Exemplo prático */}
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
          <h4 className="font-semibold text-blue-800 mb-2 flex items-center gap-2">
            <AlertCircle className="h-4 w-4" />
            Exemplo Prático
          </h4>
          <div className="text-sm text-blue-700 space-y-1">
            <p>• <strong>Cenário:</strong> Usuário tem 50 Girinhas expirando em 3 dias</p>
            <p>• <strong>Custo da extensão:</strong> {custoExemplo} Girinha{custoExemplo !== 1 ? 's' : ''} ({config.percentual}%)</p>
            <p>• <strong>Girinhas salvas:</strong> {girinhasSalvasExemplo} por +{config.dias} dias</p>
            <p>• <strong>Resultado:</strong> Paga {custoExemplo}, salva {girinhasSalvasExemplo} por mais {config.dias} dias</p>
          </div>
        </div>

        {/* Análise de impacto */}
        <div className="bg-green-50 p-4 rounded-lg border border-green-200">
          <h4 className="font-semibold text-green-800 mb-2">💡 Análise de Impacto</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-green-600">Queima por extensão:</span>
              <div className="font-semibold text-green-800">
                {config.percentual}% das Girinhas expirando
              </div>
            </div>
            <div>
              <span className="text-green-600">Período de graça:</span>
              <div className="font-semibold text-green-800">
                +{config.dias} dias adicionais
              </div>
            </div>
          </div>
          
          {config.percentual <= 25 && (
            <div className="mt-2 text-xs text-green-600">
              ✅ Percentual equilibrado - incentiva uso sem ser abusivo
            </div>
          )}
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

export default ConfigExtensaoValidade;
