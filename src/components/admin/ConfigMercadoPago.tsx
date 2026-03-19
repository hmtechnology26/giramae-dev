
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { 
  CreditCard, 
  TestTube, 
  ShieldCheck,
  Save,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const ConfigMercadoPago: React.FC = () => {
  const [config, setConfig] = useState({
    usarAmbienteTeste: true
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
      const { data } = await supabase
        .from('config_sistema')
        .select('chave, valor')
        .eq('chave', 'mercadopago_ambiente_teste');

      if (data && data.length > 0) {
        const valor = data[0].valor as { ativo: boolean };
        setConfig(prev => ({ 
          ...prev, 
          usarAmbienteTeste: valor.ativo 
        }));
      }
    } catch (error) {
      console.error('Erro ao carregar configurações:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar as configurações do Mercado Pago.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const salvarConfiguracoes = async () => {
    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('config_sistema')
        .upsert({
          chave: 'mercadopago_ambiente_teste',
          valor: { ativo: config.usarAmbienteTeste }
        });

      if (error) throw error;

      toast({
        title: "Configurações salvas",
        description: `Mercado Pago configurado para ${config.usarAmbienteTeste ? 'TESTE (Sandbox)' : 'PRODUÇÃO'}.`
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
    return <div>Carregando configurações do Mercado Pago...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="w-5 h-5" />
          Configurações do Mercado Pago
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Controle de Ambiente */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label htmlFor="ambiente-teste" className="text-base font-medium">
                Ambiente de Testes
              </Label>
              <p className="text-sm text-muted-foreground">
                Ativar para usar o ambiente sandbox do Mercado Pago
              </p>
            </div>
            <Switch
              id="ambiente-teste"
              checked={config.usarAmbienteTeste}
              onCheckedChange={(checked) => 
                setConfig(prev => ({ ...prev, usarAmbienteTeste: checked }))
              }
            />
          </div>

          {/* Status atual */}
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">Status atual:</span>
            {config.usarAmbienteTeste ? (
              <Badge variant="secondary" className="gap-1">
                <TestTube className="w-3 h-3" />
                AMBIENTE DE TESTE
              </Badge>
            ) : (
              <Badge variant="default" className="gap-1">
                <ShieldCheck className="w-3 h-3" />
                AMBIENTE DE PRODUÇÃO
              </Badge>
            )}
          </div>
        </div>

        {/* Informações do ambiente */}
        {config.usarAmbienteTeste ? (
          <Alert className="border-orange-200 bg-orange-50">
            <TestTube className="h-4 w-4 text-orange-600" />
            <AlertDescription className="text-orange-800">
              <div className="space-y-2">
                <p><strong>Modo de Teste Ativado</strong></p>
                <ul className="text-xs space-y-1 ml-4">
                  <li>• Use seu Access Token real (APP_USR-...)</li>
                  <li>• O sistema usará automaticamente o sandbox_init_point</li>
                  <li>• Usuários serão redirecionados para sandbox.mercadopago.com</li>
                  <li>• Use contas de teste para simular pagamentos</li>
                  <li>• Nenhum pagamento real será processado</li>
                </ul>
              </div>
            </AlertDescription>
          </Alert>
        ) : (
          <Alert className="border-red-200 bg-red-50">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">
              <div className="space-y-2">
                <p><strong>Modo de Produção Ativado</strong></p>
                <ul className="text-xs space-y-1 ml-4">
                  <li>• Pagamentos reais serão processados</li>
                  <li>• Use apenas Access Token de produção válido</li>
                  <li>• Usuários serão direcionados para mercadopago.com</li>
                  <li>• ⚠️ Cuidado: transações reais acontecerão</li>
                </ul>
              </div>
            </AlertDescription>
          </Alert>
        )}

        {/* Instruções técnicas */}
        <div className="bg-muted/50 p-4 rounded-lg space-y-3">
          <h4 className="text-sm font-medium flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-green-600" />
            Como funciona
          </h4>
          <div className="text-xs text-muted-foreground space-y-2">
            <p>
              <strong>Teste:</strong> O sistema usará sandbox_init_point retornado pela API,
              redirecionando para ambiente seguro de testes.
            </p>
            <p>
              <strong>Produção:</strong> O sistema usará init_point normal,
              processando pagamentos reais.
            </p>
            <p>
              <strong>Configuração:</strong> O Access Token deve ser sempre real (APP_USR-...), 
              a diferença está no link de checkout utilizado.
            </p>
          </div>
        </div>

        {/* Botão de salvar */}
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

export default ConfigMercadoPago;
