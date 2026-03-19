// src/blog/components/interactive/SimuladorTamanhoRoupa.tsx
import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Ruler, Calendar, TrendingUp, Info, RefreshCw } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

// Tabela de crescimento baseada em dados pediátricos (percentil 50)
const TABELA_CRESCIMENTO = {
  masculino: [
    { idadeMeses: 0, altura: 50 },
    { idadeMeses: 3, altura: 61 },
    { idadeMeses: 6, altura: 67 },
    { idadeMeses: 9, altura: 72 },
    { idadeMeses: 12, altura: 76 },
    { idadeMeses: 18, altura: 82 },
    { idadeMeses: 24, altura: 87 },
    { idadeMeses: 36, altura: 96 },
    { idadeMeses: 48, altura: 103 },
    { idadeMeses: 60, altura: 110 },
    { idadeMeses: 72, altura: 116 },
    { idadeMeses: 84, altura: 122 },
    { idadeMeses: 96, altura: 128 },
    { idadeMeses: 108, altura: 133 },
    { idadeMeses: 120, altura: 138 },
  ],
  feminino: [
    { idadeMeses: 0, altura: 49 },
    { idadeMeses: 3, altura: 59 },
    { idadeMeses: 6, altura: 65 },
    { idadeMeses: 9, altura: 70 },
    { idadeMeses: 12, altura: 74 },
    { idadeMeses: 18, altura: 80 },
    { idadeMeses: 24, altura: 85 },
    { idadeMeses: 36, altura: 95 },
    { idadeMeses: 48, altura: 102 },
    { idadeMeses: 60, altura: 108 },
    { idadeMeses: 72, altura: 115 },
    { idadeMeses: 84, altura: 121 },
    { idadeMeses: 96, altura: 127 },
    { idadeMeses: 108, altura: 133 },
    { idadeMeses: 120, altura: 138 },
  ],
};

// Mapeamento altura -> tamanho de roupa
const TAMANHOS_ROUPA = [
  { alturaMax: 56, tamanho: 'RN', label: 'Recém-nascido (RN)' },
  { alturaMax: 62, tamanho: 'P', label: 'P (0-3 meses)' },
  { alturaMax: 68, tamanho: 'M', label: 'M (3-6 meses)' },
  { alturaMax: 74, tamanho: 'G', label: 'G (6-9 meses)' },
  { alturaMax: 80, tamanho: 'GG', label: 'GG (9-12 meses)' },
  { alturaMax: 86, tamanho: '1', label: 'Tamanho 1 (1 ano)' },
  { alturaMax: 92, tamanho: '2', label: 'Tamanho 2 (2 anos)' },
  { alturaMax: 98, tamanho: '3', label: 'Tamanho 3 (3 anos)' },
  { alturaMax: 104, tamanho: '4', label: 'Tamanho 4 (4 anos)' },
  { alturaMax: 110, tamanho: '6', label: 'Tamanho 6 (5-6 anos)' },
  { alturaMax: 116, tamanho: '8', label: 'Tamanho 8 (7-8 anos)' },
  { alturaMax: 128, tamanho: '10', label: 'Tamanho 10 (9-10 anos)' },
  { alturaMax: 140, tamanho: '12', label: 'Tamanho 12 (11-12 anos)' },
  { alturaMax: 999, tamanho: '14', label: 'Tamanho 14 (13+ anos)' },
];

export default function SimuladorTamanhoRoupa() {
  const [idadeAnos, setIdadeAnos] = useState(1);
  const [idadeMeses, setIdadeMeses] = useState(0);
  const [sexo, setSexo] = useState<'masculino' | 'feminino'>('masculino');
  const [alturaAtual, setAlturaAtual] = useState<number | ''>('');
  const [mesesProjecao, setMesesProjecao] = useState(6);
  const [calculado, setCalculado] = useState(false);

  const resultado = useMemo(() => {
    const idadeTotalMeses = idadeAnos * 12 + idadeMeses;
    const tabela = TABELA_CRESCIMENTO[sexo];

    // Encontrar altura atual estimada se não informada
    let alturaBase = alturaAtual || 0;
    if (!alturaAtual) {
      const idadeAnterior = tabela.filter(t => t.idadeMeses <= idadeTotalMeses).pop();
      const idadePosterior = tabela.find(t => t.idadeMeses > idadeTotalMeses);
      
      if (idadeAnterior && idadePosterior) {
        const proporcao = (idadeTotalMeses - idadeAnterior.idadeMeses) / 
                          (idadePosterior.idadeMeses - idadeAnterior.idadeMeses);
        alturaBase = idadeAnterior.altura + proporcao * (idadePosterior.altura - idadeAnterior.altura);
      } else if (idadeAnterior) {
        alturaBase = idadeAnterior.altura;
      }
    }

    // Projetar altura futura
    const idadeFutura = idadeTotalMeses + mesesProjecao;
    let alturaFutura = alturaBase;
    
    const idadeAnteriorFutura = tabela.filter(t => t.idadeMeses <= idadeFutura).pop();
    const idadePosteriorFutura = tabela.find(t => t.idadeMeses > idadeFutura);
    
    if (idadeAnteriorFutura && idadePosteriorFutura) {
      const proporcao = (idadeFutura - idadeAnteriorFutura.idadeMeses) / 
                        (idadePosteriorFutura.idadeMeses - idadeAnteriorFutura.idadeMeses);
      alturaFutura = idadeAnteriorFutura.altura + proporcao * (idadePosteriorFutura.altura - idadeAnteriorFutura.altura);
    } else if (idadeAnteriorFutura) {
      alturaFutura = idadeAnteriorFutura.altura;
    }

    // Se altura atual foi informada, ajustar projeção proporcionalmente
    if (alturaAtual) {
      const idadeAnterior = tabela.filter(t => t.idadeMeses <= idadeTotalMeses).pop();
      if (idadeAnterior) {
        const diferenca = Number(alturaAtual) - idadeAnterior.altura;
        alturaFutura += diferenca;
      }
    }

    // Determinar tamanhos
    const tamanhoAtual = TAMANHOS_ROUPA.find(t => alturaBase <= t.alturaMax);
    const tamanhoFuturo = TAMANHOS_ROUPA.find(t => alturaFutura <= t.alturaMax);

    return {
      alturaAtualEstimada: Math.round(alturaBase),
      alturaFuturaEstimada: Math.round(alturaFutura),
      crescimentoEstimado: Math.round(alturaFutura - alturaBase),
      tamanhoAtual: tamanhoAtual || TAMANHOS_ROUPA[0],
      tamanhoFuturo: tamanhoFuturo || TAMANHOS_ROUPA[TAMANHOS_ROUPA.length - 1],
      mudouTamanho: tamanhoAtual?.tamanho !== tamanhoFuturo?.tamanho,
    };
  }, [idadeAnos, idadeMeses, sexo, alturaAtual, mesesProjecao]);

  const handleCalcular = () => setCalculado(true);
  const handleReset = () => {
    setIdadeAnos(1);
    setIdadeMeses(0);
    setSexo('masculino');
    setAlturaAtual('');
    setMesesProjecao(6);
    setCalculado(false);
  };

  return (
    <Card className="border-2 border-primary/20 shadow-lg bg-gradient-to-br from-white to-blue-50/30">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-primary">
          <Ruler className="w-6 h-6" />
          Simulador de Tamanho de Roupa
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Preveja qual tamanho seu filho vai usar nos próximos meses
        </p>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Inputs */}
        <div className="grid gap-4 md:grid-cols-2">
          {/* Idade */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Idade atual</Label>
            <div className="flex gap-2">
              <div className="flex-1">
                <Input
                  type="number"
                  value={idadeAnos}
                  onChange={(e) => setIdadeAnos(Math.max(0, Number(e.target.value)))}
                  min={0}
                  max={12}
                />
                <span className="text-xs text-muted-foreground">anos</span>
              </div>
              <div className="flex-1">
                <Input
                  type="number"
                  value={idadeMeses}
                  onChange={(e) => setIdadeMeses(Math.min(11, Math.max(0, Number(e.target.value))))}
                  min={0}
                  max={11}
                />
                <span className="text-xs text-muted-foreground">meses</span>
              </div>
            </div>
          </div>

          {/* Sexo */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Sexo</Label>
            <Select value={sexo} onValueChange={(v) => setSexo(v as any)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="masculino">Masculino</SelectItem>
                <SelectItem value="feminino">Feminino</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Altura atual */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Altura atual (cm) - opcional</Label>
            <Input
              type="number"
              value={alturaAtual}
              onChange={(e) => setAlturaAtual(e.target.value ? Number(e.target.value) : '')}
              placeholder="Ex: 75"
              min={40}
              max={180}
            />
            <p className="text-xs text-muted-foreground">
              Deixe em branco para usar estimativa
            </p>
          </div>

          {/* Projeção */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Projetar para quantos meses?</Label>
            <Select value={String(mesesProjecao)} onValueChange={(v) => setMesesProjecao(Number(v))}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="3">3 meses</SelectItem>
                <SelectItem value="6">6 meses</SelectItem>
                <SelectItem value="9">9 meses</SelectItem>
                <SelectItem value="12">12 meses</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Botões */}
        <div className="flex gap-3 justify-center pt-2">
          <Button onClick={handleCalcular} size="lg" className="gap-2">
            <Calendar className="w-4 h-4" />
            Simular Tamanho
          </Button>
          {calculado && (
            <Button onClick={handleReset} variant="outline" size="lg" className="gap-2">
              <RefreshCw className="w-4 h-4" />
              Nova Simulação
            </Button>
          )}
        </div>

        {/* Resultados */}
        {calculado && (
          <div className="space-y-4 pt-4 border-t">
            <h3 className="font-semibold text-lg text-center text-primary">
              Resultado da Simulação
            </h3>

            <div className="grid gap-4 md:grid-cols-2">
              {/* Tamanho atual */}
              <Card className="bg-blue-50 border-blue-200">
                <CardContent className="pt-4">
                  <div className="text-center">
                    <p className="text-sm text-blue-600 font-medium mb-1">Tamanho Atual</p>
                    <p className="text-3xl font-bold text-blue-700">
                      {resultado.tamanhoAtual.tamanho}
                    </p>
                    <p className="text-xs text-blue-600 mt-1">
                      {resultado.tamanhoAtual.label}
                    </p>
                    <p className="text-sm text-blue-500 mt-2">
                      Altura: ~{resultado.alturaAtualEstimada}cm
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Tamanho futuro */}
              <Card className={resultado.mudouTamanho ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'}>
                <CardContent className="pt-4">
                  <div className="text-center">
                    <p className={`text-sm font-medium mb-1 ${resultado.mudouTamanho ? 'text-green-600' : 'text-gray-600'}`}>
                      Em {mesesProjecao} meses
                    </p>
                    <p className={`text-3xl font-bold ${resultado.mudouTamanho ? 'text-green-700' : 'text-gray-700'}`}>
                      {resultado.tamanhoFuturo.tamanho}
                    </p>
                    <p className={`text-xs mt-1 ${resultado.mudouTamanho ? 'text-green-600' : 'text-gray-600'}`}>
                      {resultado.tamanhoFuturo.label}
                    </p>
                    <p className={`text-sm mt-2 ${resultado.mudouTamanho ? 'text-green-500' : 'text-gray-500'}`}>
                      Altura: ~{resultado.alturaFuturaEstimada}cm
                      <span className="ml-1">(+{resultado.crescimentoEstimado}cm)</span>
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Dica */}
            <Alert className="bg-primary/5 border-primary/20">
              <Info className="h-4 w-4 text-primary" />
              <AlertDescription className="text-sm">
                {resultado.mudouTamanho ? (
                  <>
                    <strong>Dica:</strong> Seu filho provavelmente vai mudar de tamanho! 
                    Ao comprar peças para os próximos meses, prefira o tamanho <strong>{resultado.tamanhoFuturo.tamanho}</strong>.
                  </>
                ) : (
                  <>
                    <strong>Boa notícia:</strong> Seu filho deve continuar no mesmo tamanho pelos próximos {mesesProjecao} meses.
                    Aproveite para adquirir peças no tamanho atual com segurança.
                  </>
                )}
              </AlertDescription>
            </Alert>

            {/* CTA */}
            <div className="bg-gradient-to-r from-primary/10 to-pink-100 rounded-lg p-4 text-center mt-4">
              <p className="text-sm text-primary mb-3">
                🔄 No GiraMãe você encontra roupas no tamanho certo por uma fração do preço!
              </p>
              <Button asChild>
                <a href="/vitrine" className="gap-2">
                  Ver Peças Disponíveis
                </a>
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
