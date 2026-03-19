
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  CheckCircle,
  RefreshCw,
  Activity,
  Coins,
  Flame,
  Users,
  PieChart,
  BarChart3
} from 'lucide-react';
import { useMetricasSaude } from '@/hooks/useMetricasSaude';

const PainelSaudeGirinha = () => {
  const { metricas, isLoading, refetch, getStatusSaude } = useMetricasSaude();

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-48 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!metricas) {
    return (
      <div className="p-6">
        <Alert className="border-red-200 bg-red-50">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            Erro ao carregar métricas. Tente novamente.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  // Componente de métrica individual
  const MetricaCard = ({ titulo, valor, formula, faixaSaudavel, icone: Icon, metrica, unidade = '' }) => {
    const status = getStatusSaude(metrica, valor);
    const statusColors = {
      saudavel: 'border-green-200 bg-green-50',
      alerta: 'border-yellow-200 bg-yellow-50',
      critico: 'border-red-200 bg-red-50'
    };
    
    const statusIcons = {
      saudavel: <CheckCircle className="w-4 h-4 text-green-600" />,
      alerta: <AlertTriangle className="w-4 h-4 text-yellow-600" />,
      critico: <AlertTriangle className="w-4 h-4 text-red-600" />
    };

    return (
      <Card className={`transition-all ${statusColors[status]}`}>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Icon className="w-5 h-5 text-gray-600" />
              <CardTitle className="text-base">{titulo}</CardTitle>
            </div>
            {statusIcons[status]}
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="text-3xl font-bold text-gray-900">
              {typeof valor === 'number' ? valor.toFixed(2) : valor}{unidade}
            </div>
            
            <div className="space-y-1">
              <p className="text-xs text-gray-600 font-medium">Fórmula:</p>
              <p className="text-xs text-gray-500">{formula}</p>
            </div>
            
            <div className="space-y-1">
              <p className="text-xs text-gray-600 font-medium">Faixa saudável:</p>
              <p className="text-xs text-gray-500">{faixaSaudavel}</p>
            </div>
            
            <Badge variant={status === 'saudavel' ? 'default' : status === 'alerta' ? 'secondary' : 'destructive'}>
              {status === 'saudavel' ? 'Saudável' : status === 'alerta' ? 'Atenção' : 'Crítico'}
            </Badge>
          </div>
        </CardContent>
      </Card>
    );
  };

  // Ações recomendadas com base nas métricas
  const getAcoesRecomendadas = () => {
    const acoes = [];
    
    if (metricas.cotacao_implicita < 0.90) {
      acoes.push({
        tipo: 'critico',
        metrica: 'Cotação Implícita',
        acao: 'Subir taxa de queima de 5% → 8% ou reduzir bônus',
        icone: TrendingDown
      });
    } else if (metricas.cotacao_implicita > 1.10) {
      acoes.push({
        tipo: 'critico',
        metrica: 'Cotação Implícita',
        acao: 'Liberar mais bônus ou baixar preço de emissão',
        icone: TrendingUp
      });
    }
    
    if (metricas.burn_rate < 3) {
      acoes.push({
        tipo: 'alerta',
        metrica: 'Burn Rate',
        acao: 'Aumentar queima para 7% ou encurtar validade',
        icone: Flame
      });
    }
    
    if (metricas.velocity < 0.20) {
      acoes.push({
        tipo: 'alerta',
        metrica: 'Velocity',
        acao: 'Lançar missões "gaste-já" ou cupons temporários',
        icone: Activity
      });
    }
    
    if (metricas.itens_no_teto > 50) {
      acoes.push({
        tipo: 'critico',
        metrica: 'Itens no Teto',
        acao: 'Subir teto da categoria em +10%',
        icone: BarChart3
      });
    }
    
    return acoes;
  };

  const acoesRecomendadas = getAcoesRecomendadas();

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">📊 Painel de Saúde da Girinha</h1>
          <p className="text-gray-600 mt-1">Monitoramento em tempo real da economia</p>
        </div>
        <Button onClick={() => refetch()} className="gap-2">
          <RefreshCw className="w-4 h-4" />
          Atualizar
        </Button>
      </div>

      {/* Status Geral */}
      <Card className="bg-gradient-to-r from-purple-50 to-pink-50">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Status Geral do Sistema</h2>
              <p className="text-sm text-gray-600 mt-1">
                Última atualização: {new Date().toLocaleTimeString('pt-BR')}
              </p>
            </div>
            <div className="text-right">
              {acoesRecomendadas.length === 0 ? (
                <Badge className="bg-green-500 text-white">Sistema Saudável ✅</Badge>
              ) : (
                <Badge variant="destructive">
                  {acoesRecomendadas.filter(a => a.tipo === 'critico').length} alertas críticos
                </Badge>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Grid de Métricas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <MetricaCard
          titulo="Cotação Implícita"
          valor={metricas.cotacao_implicita}
          unidade=" R$"
          formula="R$ entrados ÷ Girinhas vivas (30d)"
          faixaSaudavel="R$ 0,90 - 1,10"
          icone={Coins}
          metrica="cotacao_implicita"
        />
        
        <MetricaCard
          titulo="Burn Rate"
          valor={metricas.burn_rate}
          unidade="%"
          formula="(Queimadas + Expiradas) ÷ Emitidas (30d)"
          faixaSaudavel="4% - 7%"
          icone={Flame}
          metrica="burn_rate"
        />
        
        <MetricaCard
          titulo="Velocity"
          valor={metricas.velocity}
          formula="Girinhas trocadas ÷ Girinhas vivas (30d)"
          faixaSaudavel="0,30 - 0,60"
          icone={Activity}
          metrica="velocity"
        />
        
        <MetricaCard
          titulo="Burn por Mãe Ativa"
          valor={metricas.burn_por_mae_ativa}
          unidade=" G"
          formula="Girinhas queimadas ÷ Mães com ≥1 troca (30d)"
          faixaSaudavel="Mantém-se estável"
          icone={Users}
          metrica="burnPorMaeAtiva"
        />
        
        <MetricaCard
          titulo="% Itens no Teto"
          valor={metricas.itens_no_teto}
          unidade="%"
          formula="Itens no preço máximo ÷ Total listados"
          faixaSaudavel="< 40%"
          icone={BarChart3}
          metrica="itens_no_teto"
        />
        
        <MetricaCard
          titulo="Concentração de Saldo"
          valor={metricas.concentracao_saldo}
          unidade="%"
          formula="Girinhas top-10 ÷ Total vivas"
          faixaSaudavel="< 25%"
          icone={PieChart}
          metrica="concentracao_saldo"
        />
      </div>

      {/* Ações Recomendadas */}
      {acoesRecomendadas.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-orange-500" />
              Ações Recomendadas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {acoesRecomendadas.map((acao, index) => {
                const Icon = acao.icone;
                return (
                  <Alert 
                    key={index} 
                    className={acao.tipo === 'critico' ? 'border-red-200 bg-red-50' : 'border-yellow-200 bg-yellow-50'}
                  >
                    <Icon className={`w-4 h-4 ${acao.tipo === 'critico' ? 'text-red-600' : 'text-yellow-600'}`} />
                    <AlertDescription className={acao.tipo === 'critico' ? 'text-red-800' : 'text-yellow-800'}>
                      <strong>{acao.metrica}:</strong> {acao.acao}
                    </AlertDescription>
                  </Alert>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Checklist Semanal */}
      <Card>
        <CardHeader>
          <CardTitle>✅ Checklist Semanal do Administrador</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {[
              { check: metricas.cotacao_implicita >= 0.90 && metricas.cotacao_implicita <= 1.10, label: 'Cotação entre 0,90-1,10?' },
              { check: metricas.burn_rate >= 4 && metricas.burn_rate <= 7, label: 'Burn Rate entre 4-7%?' },
              { check: metricas.velocity >= 0.30, label: 'Velocity ≥ 0,30?' },
              { check: true, label: 'Burn/Mãe estável?' },
              { check: metricas.itens_no_teto < 40, label: 'Itens no teto < 40%?' },
              { check: metricas.concentracao_saldo <= 25, label: 'Concentração ≤ 25%?' }
            ].map((item, index) => (
              <div key={index} className="flex items-center gap-3">
                <div className={`w-5 h-5 rounded ${item.check ? 'bg-green-500' : 'bg-red-500'} flex items-center justify-center`}>
                  {item.check && <CheckCircle className="w-3 h-3 text-white" />}
                </div>
                <span className={`text-sm ${item.check ? 'text-gray-700' : 'text-red-700 font-medium'}`}>
                  {item.label}
                </span>
              </div>
            ))}
          </div>
          
          <Alert className="mt-4 border-blue-200 bg-blue-50">
            <AlertDescription className="text-blue-800">
              💡 <strong>Regra de ouro:</strong> Quando 2+ indicadores ficam vermelhos por dois relatórios seguidos, 
              ajuste apenas UMA alavanca por vez e aguarde 2 semanas para medir o impacto.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </div>
  );
};

export default PainelSaudeGirinha;
