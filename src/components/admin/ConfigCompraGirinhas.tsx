
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Settings, Save } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const ConfigCompraGirinhas: React.FC = () => {
  const [config, setConfig] = useState({
    quantidadeMin: 10,
    quantidadeMax: 999000
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
        .in('chave', ['compra_girinhas_min', 'compra_girinhas_max']);

      if (configs) {
        configs.forEach(config => {
          if (config.chave === 'compra_girinhas_min') {
            const valor = config.valor as { quantidade: number };
            setConfig(prev => ({ ...prev, quantidadeMin: valor.quantidade }));
          }
          if (config.chave === 'compra_girinhas_max') {
            const valor = config.valor as { quantidade: number };
            setConfig(prev => ({ ...prev, quantidadeMax: valor.quantidade }));
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
          chave: 'compra_girinhas_min',
          valor: { quantidade: config.quantidadeMin }
        },
        {
          chave: 'compra_girinhas_max',
          valor: { quantidade: config.quantidadeMax }
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
        description: "As configurações de compra foram atualizadas com sucesso."
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
    return <div>Carregando...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="w-5 h-5" />
          Configurações de Compra de Girinhas
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="quantidadeMin">Quantidade Mínima</Label>
            <Input
              id="quantidadeMin"
              type="number"
              value={config.quantidadeMin}
              onChange={(e) => setConfig(prev => ({ 
                ...prev, 
                quantidadeMin: parseInt(e.target.value) || 0 
              }))}
              min="1"
            />
            <p className="text-xs text-muted-foreground">
              Quantidade mínima para compra de Girinhas
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="quantidadeMax">Quantidade Máxima</Label>
            <Input
              id="quantidadeMax"
              type="number"
              value={config.quantidadeMax}
              onChange={(e) => setConfig(prev => ({ 
                ...prev, 
                quantidadeMax: parseInt(e.target.value) || 0 
              }))}
              min="1"
            />
            <p className="text-xs text-muted-foreground">
              Quantidade máxima para compra de Girinhas
            </p>
          </div>
        </div>

        <Button 
          onClick={salvarConfiguracoes}
          disabled={isSaving}
          className="w-full md:w-auto"
        >
          <Save className="w-4 h-4 mr-2" />
          {isSaving ? 'Salvando...' : 'Salvar Configurações'}
        </Button>
      </CardContent>
    </Card>
  );
};

export default ConfigCompraGirinhas;
