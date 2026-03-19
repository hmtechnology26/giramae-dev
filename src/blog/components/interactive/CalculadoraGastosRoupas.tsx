// src/blog/components/interactive/CalculadoraGastosRoupas.tsx
import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { Calculator, TrendingUp, Info, Share2, Repeat, ArrowRight } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

interface CalculoResult {
  gastoAnual: number;
  gasto5Anos: number;
  economiaAnual: number;
  valorRoupasBomEstado: number;
  valorRecuperavelBrechoDireto: number;
  valorRecuperavelConsignacao: number;
  valorRecuperavelVendaDireta: number;
  valorRecuperavelTroca: number;
}

export default function CalculadoraGastosRoupas() {
  const [pecasPorMes, setPecasPorMes] = useState(4);
  const [valorMedioPeca, setValorMedioPeca] = useState(50);
  const [quantidadeFilhos, setQuantidadeFilhos] = useState(1);
  const [idadesFilhos, setIdadesFilhos] = useState<number[]>([2]);
  const [mostrarBaseCalculo, setMostrarBaseCalculo] = useState(false);
  const [percentualBomEstado, setPercentualBomEstado] = useState(60);
  const [mostrarAjustePercentual, setMostrarAjustePercentual] = useState(false);

  // Atualiza o array de idades quando muda a quantidade de filhos
  const handleQuantidadeFilhosChange = (novaQuantidade: number) => {
    setQuantidadeFilhos(novaQuantidade);
    setIdadesFilhos(prev => {
      if (novaQuantidade > prev.length) {
        // Adiciona novas idades com valor padrão 2
        return [...prev, ...Array(novaQuantidade - prev.length).fill(2)];
      } else {
        // Remove idades excedentes
        return prev.slice(0, novaQuantidade);
      }
    });
  };

  const handleIdadeChange = (index: number, idade: number) => {
    setIdadesFilhos(prev => {
      const novas = [...prev];
      novas[index] = idade;
      return novas;
    });
  };

  const resultado = useMemo<CalculoResult>(() => {
    const gastoMensal = pecasPorMes * valorMedioPeca * quantidadeFilhos;
    const gastoAnual = gastoMensal * 12;
    
    // Calcular fator de idade baseado em cada filho
    const calcularFatorIdade = (idade: number) => {
      if (idade <= 2) return 1.3;
      if (idade <= 5) return 1.15;
      return 1;
    };
    
    // Usar a média dos fatores de idade de todos os filhos
    const fatorIdadeMedio = idadesFilhos.reduce((acc, idade) => acc + calcularFatorIdade(idade), 0) / idadesFilhos.length;
    const gastoAnualAjustado = gastoAnual * fatorIdadeMedio;
    
    // Projeção de 5 anos com inflação média de 6% ao ano
    const inflacaoAnual = 0.06;
    let gasto5Anos = 0;
    for (let i = 0; i < 5; i++) {
      gasto5Anos += gastoAnualAjustado * Math.pow(1 + inflacaoAnual, i);
    }

    // Economia circular: redução estimada de 70%
    const economiaCircular = gasto5Anos * 0.7;
    const economiaAnual = gastoAnualAjustado * 0.7;

    // Valor das roupas que poderiam ser repassadas
    const valorRoupasBomEstado = gastoAnualAjustado * (percentualBomEstado / 100);
    
    // Quanto você recupera em cada cenário
    const valorRecuperavelBrechoDireto = valorRoupasBomEstado * 0.25; // 25%
    const valorRecuperavelConsignacao = valorRoupasBomEstado * 0.50; // 50%
    const valorRecuperavelVendaDireta = valorRoupasBomEstado * 0.75; // 75%
    const valorRecuperavelTroca = valorRoupasBomEstado * 1.0; // 100%
    
    return {
      gastoAnual: Math.round(gastoAnualAjustado),
      gasto5Anos: Math.round(gasto5Anos),
      economiaAnual: Math.round(economiaAnual),
      valorRoupasBomEstado: Math.round(valorRoupasBomEstado),
      valorRecuperavelBrechoDireto: Math.round(valorRecuperavelBrechoDireto),
      valorRecuperavelConsignacao: Math.round(valorRecuperavelConsignacao),
      valorRecuperavelVendaDireta: Math.round(valorRecuperavelVendaDireta),
      valorRecuperavelTroca: Math.round(valorRecuperavelTroca),
    };
  }, [pecasPorMes, valorMedioPeca, idadesFilhos, quantidadeFilhos, percentualBomEstado]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const textoCompartilhamento = `Descobri que gasto ${formatCurrency(resultado.gastoAnual)}/ano com roupas infantis! Com economia circular, posso economizar ${formatCurrency(resultado.economiaAnual)}. Faça o cálculo você também:`;
  const urlCompartilhamento = 'https://giramae.com.br/blog/calculadora-gastos-roupas-infantis';

  const compartilharWhatsApp = () => {
    window.open(`https://wa.me/?text=${encodeURIComponent(textoCompartilhamento + ' ' + urlCompartilhamento)}`, '_blank');
  };

  const compartilharFacebook = () => {
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(urlCompartilhamento)}&quote=${encodeURIComponent(textoCompartilhamento)}`, '_blank');
  };

  const compartilharTwitter = () => {
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(textoCompartilhamento)}&url=${encodeURIComponent(urlCompartilhamento)}`, '_blank');
  };

  const copiarLink = () => {
    navigator.clipboard.writeText(textoCompartilhamento + ' ' + urlCompartilhamento);
    alert('Link copiado para a área de transferência!');
  };

  return (
    <Card className="border-2 border-primary/20 shadow-lg bg-gradient-to-br from-white to-pink-50/30">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-primary">
          <Calculator className="w-6 h-6" />
          Calculadora de Gastos com Roupas Infantis
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Descubra quanto você gasta e quanto pode economizar com economia circular
        </p>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Inputs */}
        <div className="space-y-6">
          {/* Quantidade de filhos */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">
              Quantidade de filhos
            </Label>
            <div className="space-y-2">
              <Slider
                value={[quantidadeFilhos]}
                onValueChange={(v) => handleQuantidadeFilhosChange(v[0])}
                min={1}
                max={5}
                step={1}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>1</span>
                <span className="font-semibold text-primary text-base">{quantidadeFilhos} {quantidadeFilhos === 1 ? 'filho' : 'filhos'}</span>
                <span>5</span>
              </div>
            </div>
          </div>

          {/* Idades individuais de cada filho */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">
              Idade de cada filho
            </Label>
            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
              {idadesFilhos.map((idade, index) => (
                <div key={index} className="flex items-center gap-2 bg-muted/30 rounded-lg p-3">
                  <span className="text-sm font-medium text-muted-foreground min-w-fit">
                    {quantidadeFilhos === 1 ? 'Filho:' : `${index + 1}º filho:`}
                  </span>
                  <Slider
                    value={[idade]}
                    onValueChange={(v) => handleIdadeChange(index, v[0])}
                    min={0}
                    max={12}
                    step={1}
                    className="flex-1"
                  />
                  <span className="font-semibold text-primary min-w-[4rem] text-right">
                    {idade} {idade === 1 ? 'ano' : 'anos'}
                  </span>
                </div>
              ))}
            </div>
            <p className="text-xs text-muted-foreground">
              Crianças menores crescem mais rápido e precisam trocar de roupa com mais frequência
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {/* Peças por mês */}
            <div className="space-y-3">
              <Label className="text-sm font-medium">
                Peças compradas por mês (por filho)
              </Label>
              <div className="space-y-2">
                <Slider
                  value={[pecasPorMes]}
                  onValueChange={(v) => setPecasPorMes(v[0])}
                  min={1}
                  max={15}
                  step={1}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>1</span>
                  <span className="font-semibold text-primary text-base">{pecasPorMes} peças</span>
                  <span>15</span>
                </div>
              </div>
            </div>

            {/* Valor médio */}
            <div className="space-y-3">
              <Label className="text-sm font-medium">
                Valor médio por peça (R$)
              </Label>
              <Input
                type="number"
                value={valorMedioPeca}
                onChange={(e) => setValorMedioPeca(Number(e.target.value) || 0)}
                min={10}
                max={500}
                className="text-center font-semibold"
              />
              <p className="text-xs text-muted-foreground text-center">
                Inclua roupas, calçados e acessórios
              </p>
            </div>
          </div>
        </div>

        {/* Resultados */}
        <div className="space-y-4 pt-4 border-t">
          <h3 className="font-semibold text-lg text-center text-primary">
            Seus Resultados
          </h3>

          <div className="grid gap-4 md:grid-cols-2">
            {/* Gasto Anual */}
            <Card className="bg-red-50 border-red-200">
              <CardContent className="pt-4">
                <div className="flex items-center gap-3">
                  <TrendingUp className="w-8 h-8 text-red-500" />
                  <div>
                    <p className="text-sm text-red-600 font-medium">Gasto Anual Estimado</p>
                    <p className="text-2xl font-bold text-red-700">
                      {formatCurrency(resultado.gastoAnual)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Projeção 5 anos */}
            <Card className="bg-orange-50 border-orange-200">
              <CardContent className="pt-4">
                <div className="flex items-center gap-3">
                  <TrendingUp className="w-8 h-8 text-orange-500" />
                  <div>
                    <p className="text-sm text-orange-600 font-medium">Projeção em 5 Anos</p>
                    <p className="text-2xl font-bold text-orange-700">
                      {formatCurrency(resultado.gasto5Anos)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Comparativo de opções */}
          <div className="mt-6 pt-6 border-t">
            <h4 className="font-semibold text-center mb-4 flex items-center justify-center gap-2">
              <Repeat className="w-5 h-5 text-primary" />
              Quanto você recupera das roupas que não servem mais?
            </h4>
            
            {/* Explicação da base */}
            <div className="bg-muted/50 rounded-lg p-3 mb-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-sm text-muted-foreground">
                  Estimamos que <strong>{percentualBomEstado}%</strong> das roupas compradas ainda estão em bom estado quando não servem mais = <strong>{formatCurrency(resultado.valorRoupasBomEstado)}</strong>/ano
                </p>
                <button
                  onClick={() => setMostrarAjustePercentual(!mostrarAjustePercentual)}
                  className="text-xs text-primary hover:underline"
                >
                  {mostrarAjustePercentual ? 'Ocultar ajuste' : 'Ajustar percentual'}
                </button>
              </div>
              
              {mostrarAjustePercentual && (
                <div className="mt-3 pt-3 border-t border-muted">
                  <Label className="text-xs text-muted-foreground">
                    Percentual de roupas em bom estado:
                  </Label>
                  <div className="flex items-center gap-3 mt-1">
                    <Slider
                      value={[percentualBomEstado]}
                      onValueChange={(v) => setPercentualBomEstado(v[0])}
                      min={20}
                      max={90}
                      step={10}
                      className="flex-1"
                    />
                    <span className="font-semibold text-primary min-w-[3rem] text-right">
                      {percentualBomEstado}%
                    </span>
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-3">
              {/* Doar & comprar novo - 0% */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 p-3 rounded-lg bg-red-50 border border-red-200">
                <div className="flex items-center gap-3 flex-1">
                  <div className="w-14 sm:w-16 text-center flex-shrink-0">
                    <span className="text-lg sm:text-xl font-bold text-red-600">0%</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="h-2 sm:h-3 bg-gray-200 rounded-full overflow-hidden">
                      <div className="h-full bg-red-400 rounded-full" style={{ width: '0%' }} />
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between sm:justify-end gap-2 pl-14 sm:pl-0">
                  <div className="sm:min-w-[180px]">
                    <p className="font-medium text-red-700 text-sm">Doar & comprar tudo novo</p>
                    <p className="text-xs text-red-600">Você não recupera nada</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="font-bold text-red-700">{formatCurrency(0)}</p>
                  </div>
                </div>
              </div>

              {/* Brechó - 25% */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 p-3 rounded-lg bg-orange-50 border border-orange-200">
                <div className="flex items-center gap-3 flex-1">
                  <div className="w-14 sm:w-16 text-center flex-shrink-0">
                    <span className="text-lg sm:text-xl font-bold text-orange-600">25%</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="h-2 sm:h-3 bg-gray-200 rounded-full overflow-hidden">
                      <div className="h-full bg-orange-400 rounded-full" style={{ width: '25%' }} />
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between sm:justify-end gap-2 pl-14 sm:pl-0">
                  <div className="sm:min-w-[180px]">
                    <p className="font-medium text-orange-700 text-sm">Vender para brechó</p>
                    <p className="text-xs text-orange-600">Brechó fica com ~75%</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="font-bold text-orange-700">{formatCurrency(resultado.valorRecuperavelBrechoDireto)}</p>
                  </div>
                </div>
              </div>

              {/* Apps de revenda - 50% */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 p-3 rounded-lg bg-yellow-50 border border-yellow-200">
                <div className="flex items-center gap-3 flex-1">
                  <div className="w-14 sm:w-16 text-center flex-shrink-0">
                    <span className="text-lg sm:text-xl font-bold text-yellow-600">50%</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="h-2 sm:h-3 bg-gray-200 rounded-full overflow-hidden">
                      <div className="h-full bg-yellow-400 rounded-full" style={{ width: '50%' }} />
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between sm:justify-end gap-2 pl-14 sm:pl-0">
                  <div className="sm:min-w-[180px]">
                    <p className="font-medium text-yellow-700 text-sm">Vender em apps de revenda</p>
                    <p className="text-xs text-yellow-600">Comissões, taxas e frete</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="font-bold text-yellow-700">{formatCurrency(resultado.valorRecuperavelConsignacao)}</p>
                  </div>
                </div>
              </div>

              {/* Venda direta - 75% */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 p-3 rounded-lg bg-lime-50 border border-lime-200">
                <div className="flex items-center gap-3 flex-1">
                  <div className="w-14 sm:w-16 text-center flex-shrink-0">
                    <span className="text-lg sm:text-xl font-bold text-lime-600">75%</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="h-2 sm:h-3 bg-gray-200 rounded-full overflow-hidden">
                      <div className="h-full bg-lime-400 rounded-full" style={{ width: '75%' }} />
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between sm:justify-end gap-2 pl-14 sm:pl-0">
                  <div className="sm:min-w-[180px]">
                    <p className="font-medium text-lime-700 text-sm">Venda direta (OLX, grupos)</p>
                    <p className="text-xs text-lime-600">Mais trabalho, mais risco</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="font-bold text-lime-700">{formatCurrency(resultado.valorRecuperavelVendaDireta)}</p>
                  </div>
                </div>
              </div>

              {/* GiraMãe - 100% */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 p-4 rounded-lg bg-gradient-to-r from-primary/10 to-pink-100 border-2 border-primary/30 ring-2 ring-primary/10">
                <div className="flex items-center gap-3 flex-1">
                  <div className="w-14 sm:w-16 text-center flex-shrink-0">
                    <span className="text-lg sm:text-xl font-bold text-primary">100%</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="h-2 sm:h-3 bg-gray-200 rounded-full overflow-hidden">
                      <div className="h-full bg-primary rounded-full" style={{ width: '100%' }} />
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between sm:justify-end gap-2 pl-14 sm:pl-0">
                  <div className="sm:min-w-[180px]">
                    <p className="font-medium text-primary text-sm">Trocar no GiraMãe</p>
                    <p className="text-xs text-primary/80">Sua peça vira outra peça</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="font-bold text-primary">{formatCurrency(resultado.valorRecuperavelTroca)}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Explicação do comparativo */}
            <div className="bg-primary/5 rounded-lg p-4 mt-4">
              <p className="text-sm text-center">
                <strong className="text-primary">A matemática é simples:</strong> sua roupa de R$ 100 vira R$ 0 se você doar, 
                R$ 25 no brechó, ou <strong>outra roupa de R$ 100</strong> no GiraMãe. Sem intermediários, sem taxas.
              </p>
            </div>
          </div>

          {/* Compartilhar */}
          <div className="flex flex-wrap items-center justify-center gap-2 pt-4">
            <span className="text-sm text-muted-foreground flex items-center gap-1">
              <Share2 className="w-4 h-4" />
              Compartilhar:
            </span>
            <Button variant="outline" size="sm" onClick={compartilharWhatsApp} className="gap-1">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
              WhatsApp
            </Button>
            <Button variant="outline" size="sm" onClick={compartilharFacebook} className="gap-1">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
              Facebook
            </Button>
            <Button variant="outline" size="sm" onClick={compartilharTwitter} className="gap-1">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
              </svg>
              X
            </Button>
            <Button variant="outline" size="sm" onClick={copiarLink} className="gap-1">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
              </svg>
              Copiar
            </Button>
          </div>

          {/* Base de Cálculo */}
          <Collapsible open={mostrarBaseCalculo} onOpenChange={setMostrarBaseCalculo}>
            <CollapsibleTrigger asChild>
              <Button variant="ghost" size="sm" className="w-full gap-2 text-muted-foreground">
                <Info className="w-4 h-4" />
                {mostrarBaseCalculo ? 'Ocultar' : 'Ver'} base de cálculo
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <div className="bg-muted/50 rounded-lg p-4 mt-2 text-sm space-y-3">
                <div>
                  <p><strong>Como calculamos os gastos:</strong></p>
                  <ul className="list-disc list-inside space-y-1 text-muted-foreground mt-1">
                    <li><strong>Gasto mensal:</strong> {pecasPorMes} peças × R$ {valorMedioPeca} × {quantidadeFilhos} filho(s) = {formatCurrency(pecasPorMes * valorMedioPeca * quantidadeFilhos)}/mês</li>
                    <li><strong>Fator de idade:</strong> Crianças de 0-2 anos crescem mais rápido (+30% de gasto), 3-5 anos (+15%), 6+ anos (sem ajuste)</li>
                    <li><strong>Projeção de 5 anos:</strong> Considera inflação média de 6% ao ano no setor de vestuário</li>
                  </ul>
                </div>
                <div>
                  <p><strong>Como calculamos a recuperação de valor:</strong></p>
                  <ul className="list-disc list-inside space-y-1 text-muted-foreground mt-1">
                    <li><strong>Roupas em bom estado:</strong> {percentualBomEstado}% das roupas compradas ({formatCurrency(resultado.valorRoupasBomEstado)})</li>
                    <li><strong>Doar:</strong> 0% de recuperação - você compra tudo novo</li>
                    <li><strong>Brechó:</strong> ~25% - brechó precisa de margem para revender</li>
                    <li><strong>Apps de revenda:</strong> ~50% - comissões, taxas e frete consomem metade</li>
                    <li><strong>Venda direta:</strong> ~75% - você faz todo o trabalho e assume riscos</li>
                    <li><strong>GiraMãe:</strong> 100% - troca direta, sua peça vira outra peça equivalente</li>
                  </ul>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  * Valores são estimativas para fins educativos baseadas em pesquisas de mercado. Resultados reais podem variar.
                </p>
              </div>
            </CollapsibleContent>
          </Collapsible>

          {/* CTA */}
          <div className="bg-gradient-to-r from-primary/10 to-pink-100 rounded-lg p-4 text-center mt-6">
            <p className="text-sm text-primary mb-3">
              💡 No GiraMãe você troca roupas diretamente com outras mães, sem taxas e sem intermediários!
            </p>
            <Button asChild size="lg">
              <a href="/" className="gap-2">
                <ArrowRight className="w-4 h-4" />
                Começar a Trocar
              </a>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
