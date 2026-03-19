import React, { useState, useEffect, useCallback } from 'react';
import { 
  Calculator, 
  ChevronDown, 
  Copy, 
  Share2, 
  Shirt, 
  Crown, 
  PiggyBank, 
  Baby, 
  Tag, 
  List, 
  Ruler, 
  Rocket, 
  Settings2,
  CheckCircle2,
  Info
} from 'lucide-react';

// --- CONFIGURAÇÃO PADRÃO (CONSTANTES V4.1) ---
const DEFAULT_CONF = {
  inflacaoAnual: 5.8,
  depreciacao: 30,
  economiaGiraMae: 60,
  perfis: {
    economico: { nome: "Econômico", custoMedioPeca: 22.00, itensBasicosMes: 3 },
    padrao: { nome: "Padrão", custoMedioPeca: 45.90, itensBasicosMes: 5 },
    premium: { nome: "Premium", custoMedioPeca: 89.90, itensBasicosMes: 6 }
  },
  fases: [
    { maxMeses: 3, fatorGiro: 4.6, pecasNecessarias: 60, desc: "RN" },
    { maxMeses: 6, fatorGiro: 3.5, pecasNecessarias: 55, desc: "Bebê P" },
    { maxMeses: 12, fatorGiro: 2.9, pecasNecessarias: 50, desc: "Bebê M/G" },
    { maxMeses: 24, fatorGiro: 2.0, pecasNecessarias: 45, desc: "1-2 Anos" },
    { maxMeses: 48, fatorGiro: 1.5, pecasNecessarias: 40, desc: "2-4 Anos" },
    { maxMeses: 96, fatorGiro: 1.3, pecasNecessarias: 35, desc: "4-8 Anos" },
    { maxMeses: 999, fatorGiro: 1.0, pecasNecessarias: 28, desc: "8+ Anos" }
  ]
} as const;

type PerfilKey = 'economico' | 'padrao' | 'premium';

interface Resultados {
  gastoTotal: number;
  economiaAnual: number;
  mesesVida: number;
  pecasEstimadas: number;
  valorRevendaArmario: number;
  mesesParaTroca: number;
  porcentagemPerda: string;
  gastoFuturo5Anos: number;
}

const formatBRL = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

const getFase = (meses: number) => {
  return DEFAULT_CONF.fases.find(f => meses <= f.maxMeses) || DEFAULT_CONF.fases[DEFAULT_CONF.fases.length - 1];
};

const calcularMeses = (dataNasc: string): number => {
  const hoje = new Date();
  const nasc = new Date(dataNasc);
  if (isNaN(nasc.getTime())) return -1;
  let meses = (hoje.getFullYear() - nasc.getFullYear()) * 12 + (hoje.getMonth() - nasc.getMonth());
  if (hoje.getDate() < nasc.getDate()) meses--;
  return Math.max(meses, 0);
};

export default function App() {
  const [nome, setNome] = useState('');
  const [nascimento, setNascimento] = useState('');
  const [perfil, setPerfil] = useState<PerfilKey>('padrao');
  const [showResults, setShowResults] = useState(false);
  const [showAjustes, setShowAjustes] = useState(false);
  const [error, setError] = useState(false);
  const [copied, setCopied] = useState(false);

  // Estados de Ajuste Fino
  const [adjCusto, setAdjCusto] = useState<number>(DEFAULT_CONF.perfis.padrao.custoMedioPeca);
  const [adjVolume, setAdjVolume] = useState<number>(DEFAULT_CONF.perfis.padrao.itensBasicosMes);
  const [adjInflacao, setAdjInflacao] = useState<number>(DEFAULT_CONF.inflacaoAnual);
  const [adjDepreciacao, setAdjDepreciacao] = useState<number>(DEFAULT_CONF.depreciacao);
  const [adjEconomiaGM, setAdjEconomiaGM] = useState<number>(DEFAULT_CONF.economiaGiraMae);

  const [resultados, setResultados] = useState<Resultados | null>(null);

  // Reseta os inputs de ajuste quando troca o perfil
  const resetarAjustes = useCallback((perfilKey: PerfilKey) => {
    const perfilData = DEFAULT_CONF.perfis[perfilKey];
    setAdjCusto(perfilData.custoMedioPeca);
    setAdjVolume(perfilData.itensBasicosMes);
    setAdjInflacao(DEFAULT_CONF.inflacaoAnual);
    setAdjDepreciacao(DEFAULT_CONF.depreciacao);
    setAdjEconomiaGM(DEFAULT_CONF.economiaGiraMae);
  }, []);

  // Lógica Matemática (Core v4.1)
  const executarMatematica = useCallback(() => {
    const mesesVida = calcularMeses(nascimento);
    if (mesesVida < 0) return null;

    const faseAtual = getFase(mesesVida);
    const inflacaoDecimal = adjInflacao / 100;
    const depDecimal = adjDepreciacao / 100;
    const econDecimal = adjEconomiaGM / 100;

    // 1. Histórico
    let gastoTotalAcumulado = 0;
    for (let m = 1; m <= mesesVida; m++) {
      const faseM = getFase(m);
      const gastoMes = (adjCusto * adjVolume) * (faseM.fatorGiro / 2.0);
      gastoTotalAcumulado += gastoMes;
    }
    // Enxoval inicial
    if (mesesVida === 0 || gastoTotalAcumulado === 0) {
      gastoTotalAcumulado = adjCusto * 40;
    }

    // 2. Armário Atual
    const pecasEstimadas = faseAtual.pecasNecessarias;
    const valorNovoArmario = pecasEstimadas * adjCusto;
    const valorRevendaArmario = valorNovoArmario * depDecimal;

    // 3. Projeção 5 Anos
    let gastoFuturo5Anos = 0;
    for (let i = 1; i <= 60; i++) {
      const idadeProjetada = mesesVida + i;
      const faseProj = getFase(idadeProjetada);
      const fatorInflacao = Math.pow(1 + inflacaoDecimal, i / 12);
      const gastoBase = (adjCusto * adjVolume) * (faseProj.fatorGiro / 2.0);
      gastoFuturo5Anos += (gastoBase * fatorInflacao);
    }

    // 4. Economia
    const gastoAnualLoja = gastoFuturo5Anos / 5;
    const economiaAnual = gastoAnualLoja * econDecimal;

    // 5. Churn
    let mesesParaTroca = 3;
    if (mesesVida > 12) mesesParaTroca = 6;
    if (mesesVida > 48) mesesParaTroca = 12;
    const porcentagemPerda = mesesVida < 12 ? "80%" : "50%";

    return {
      gastoTotal: gastoTotalAcumulado,
      economiaAnual,
      mesesVida,
      pecasEstimadas,
      valorRevendaArmario,
      mesesParaTroca,
      porcentagemPerda,
      gastoFuturo5Anos
    };
  }, [nascimento, adjCusto, adjVolume, adjInflacao, adjDepreciacao, adjEconomiaGM]);

  // Efeito para recálculo em tempo real (Live Update)
  useEffect(() => {
    if (showResults && nascimento) {
      const res = executarMatematica();
      setResultados(res);
    }
  }, [adjCusto, adjVolume, adjInflacao, adjDepreciacao, adjEconomiaGM, showResults, nascimento, executarMatematica]);

  const iniciarCalculo = () => {
    if (!nome.trim() || !nascimento) {
      setError(true);
      return;
    }
    setError(false);
    
    // Calcula primeira vez
    const res = executarMatematica();
    setResultados(res);
    setShowResults(true);
    
    // Scroll suave
    setTimeout(() => {
      document.getElementById('resultsSection')?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const handlePerfilChange = (novoPerf: PerfilKey) => {
    setPerfil(novoPerf);
    resetarAjustes(novoPerf);
  };

  const gerarRelatorio = () => {
    if (!resultados) return '';
    const anos = Math.floor(resultados.mesesVida / 12);
    const meses = resultados.mesesVida % 12;
    return `📊 *Relatório do Armário: ${nome}*

👶 Idade: *${anos}a ${meses}m*
💰 Gasto histórico: *${formatBRL(resultados.gastoTotal)}*
♻ Valor de revenda hoje: *${formatBRL(resultados.valorRevendaArmario)}*

📈 Projeção 5 anos:
➡ ${formatBRL(resultados.gastoFuturo5Anos)}

🔥 *Economia anual GiraMãe:* ${formatBRL(resultados.economiaAnual)}

Veja o seu em: https://giramae.com.br`;
  };

  const compartilharZap = () => {
    const texto = gerarRelatorio();
    if (!texto) return;
    window.open(`https://wa.me/?text=${encodeURIComponent(texto)}`, '_blank');
  };

  const copiarRelatorio = async () => {
    const texto = gerarRelatorio();
    if (!texto) return;
    await navigator.clipboard.writeText(texto);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  const formatIdade = (meses: number) => {
    if (meses < 12) return `${meses} meses`;
    return `${Math.floor(meses / 12)}a ${meses % 12}m`;
  };

  return (
    <div className="min-h-screen bg-gray-50 text-slate-800 font-sans pb-10">
      
      {/* NAV */}
      <nav className="bg-white shadow-sm border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 py-3 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-pink-600 rounded-full flex items-center justify-center text-white font-bold text-lg">G</div>
            <span className="font-extrabold text-lg tracking-tight text-gray-900">Gira<span className="text-pink-600">Mãe</span></span>
          </div>
          <span className="text-[10px] font-bold bg-green-100 text-green-700 px-2 py-1 rounded-full uppercase tracking-wide">v4.1 Calibrada</span>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-4 py-6 space-y-6">

        {/* HERO */}
        <header className="text-center space-y-3 animate-fade-in">
          <h1 className="text-2xl md:text-4xl font-extrabold text-gray-900 leading-tight">
            Descubra o <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-600 to-purple-600">Custo Real</span> do guarda-roupa
          </h1>
          <p className="text-sm md:text-base text-gray-600 max-w-xl mx-auto">
            Algoritmo financeiro que revela quanto você gasta e quanto pode economizar com o crescimento do seu filho.
          </p>
        </header>

        {/* CALCULADORA CARD */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden animate-fade-in">
          <div className="h-1 bg-gradient-to-r from-pink-500 to-purple-600" />
          
          <div className="p-5 md:p-8 space-y-6">
            
            {/* Dados Básicos */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-pink-600 font-bold uppercase text-xs tracking-wider">
                <Baby size={16} /> Dados da Criança
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">Nome</label>
                  <input
                    type="text"
                    placeholder="Ex: Alice"
                    value={nome}
                    onChange={(e) => setNome(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-pink-500 focus:border-pink-500 outline-none transition-all text-gray-800 font-semibold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">Nascimento</label>
                  <input
                    type="date"
                    value={nascimento}
                    onChange={(e) => setNascimento(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-pink-500 focus:border-pink-500 outline-none transition-all text-gray-800 font-semibold"
                  />
                </div>
              </div>
            </div>

            {/* Perfil de Consumo */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-purple-600 font-bold uppercase text-xs tracking-wider">
                <Tag size={16} /> Perfil de Compra
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <PerfilOption 
                  id="economico" 
                  selected={perfil === 'economico'} 
                  onClick={() => handlePerfilChange('economico')}
                  icon={<PiggyBank className="text-green-600" size={20} />}
                  bg="bg-green-100"
                  title="Econômico"
                  desc="Foco em promoções e básicos."
                />
                <PerfilOption 
                  id="padrao" 
                  selected={perfil === 'padrao'} 
                  onClick={() => handlePerfilChange('padrao')}
                  icon={<Shirt className="text-blue-600" size={20} />}
                  bg="bg-blue-100"
                  title="Padrão"
                  desc="Lojas de shopping e departamento."
                />
                <PerfilOption 
                  id="premium" 
                  selected={perfil === 'premium'} 
                  onClick={() => handlePerfilChange('premium')}
                  icon={<Crown className="text-yellow-600" size={20} />}
                  bg="bg-yellow-100"
                  title="Premium"
                  desc="Marcas renomadas e tecidos nobres."
                />
              </div>
            </div>

            {error && (
              <div className="bg-red-50 text-red-600 px-4 py-3 rounded-lg text-sm flex items-center gap-2 animate-bounce">
                <Info size={16} /> <span>Preencha nome e data corretamente.</span>
              </div>
            )}

            <button
              onClick={iniciarCalculo}
              className="w-full bg-gray-900 active:bg-gray-800 text-white font-bold py-4 rounded-xl shadow-lg hover:shadow-xl transform active:scale-[0.98] transition-all duration-200 flex items-center justify-center gap-3 text-lg"
            >
              <span>Gerar Análise</span>
              <Calculator size={20} />
            </button>
          </div>
        </div>

        {/* RESULTADOS */}
        {showResults && resultados && (
          <div id="resultsSection" className="space-y-6 animate-fade-in">
            
            {/* ADJUSTMENT PANEL */}
            <div className="bg-white rounded-xl shadow border border-gray-100 overflow-hidden">
              <button
                onClick={() => setShowAjustes(!showAjustes)}
                className="w-full px-5 py-4 flex items-center justify-between bg-gray-50 hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <div className="bg-purple-100 text-purple-600 p-1.5 rounded-md">
                    <Settings2 size={16} />
                  </div>
                  <div className="text-left">
                    <span className="block font-bold text-sm text-gray-700">Personalizar Premissas</span>
                    <span className="block text-[10px] text-gray-400">Ajuste custo, inflação e volume</span>
                  </div>
                </div>
                <ChevronDown size={16} className={`text-gray-400 transform transition-transform duration-300 ${showAjustes ? 'rotate-180' : ''}`} />
              </button>
              
              <div className={`transition-all duration-500 ease-in-out overflow-hidden ${showAjustes ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'}`}>
                <div className="p-5 space-y-5 border-t border-gray-100 bg-white">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <InputGroup label="Custo Médio (R$)" value={adjCusto} onChange={setAdjCusto} prefix="R$" />
                    <InputGroup label="Volume (Peças/mês)" value={adjVolume} onChange={setAdjVolume} note="*Multiplicado pela fase" />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <InputGroup label="Inflação Anual (%)" value={adjInflacao} onChange={setAdjInflacao} suffix="%" step={0.1} />
                    <InputGroup label="Valor Revenda (%)" value={adjDepreciacao} onChange={setAdjDepreciacao} suffix="%" step={5} />
                    <InputGroup label="Econ. GiraMãe (%)" value={adjEconomiaGM} onChange={setAdjEconomiaGM} suffix="%" step={5} />
                  </div>

                  <div className="bg-yellow-50 text-yellow-800 text-xs p-3 rounded-lg flex gap-2">
                    <Info size={14} className="mt-0.5" />
                    <p>Os cálculos são atualizados automaticamente ao alterar estes valores.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* STATS GRID */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <StatCard 
                label="Investimento Total Estimado" 
                value={formatBRL(resultados.gastoTotal)} 
                desc="Acumulado desde o nascimento."
                color="pink"
              />
              <StatCard 
                label="Economia Potencial (Anual)" 
                value={formatBRL(resultados.economiaAnual)} 
                desc="Usando economia circular."
                color="green"
              />
            </div>

            {/* DETAILED LIST */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-4 border-b border-gray-50 flex justify-between items-center bg-gray-50/50">
                <h2 className="font-bold text-gray-800 text-sm flex items-center gap-2"><List size={16} className="text-pink-500" /> Detalhes</h2>
                <span className="bg-white border border-gray-200 text-gray-600 px-2 py-0.5 rounded text-[10px] font-bold uppercase">
                  {formatIdade(resultados.mesesVida)}
                </span>
              </div>
              
              <div className="divide-y divide-gray-50 text-sm">
                <DetailRow 
                  icon={<Shirt size={18} className="text-blue-500" />}
                  title="Armário Atual"
                >
                  Estimativa de <span className="font-bold text-gray-800">{resultados.pecasEstimadas} peças</span>. 
                  Valor de revenda aprox. <span className="font-bold text-green-600">{formatBRL(resultados.valorRevendaArmario)}</span>.
                </DetailRow>

                <DetailRow 
                  icon={<Ruler size={18} className="text-yellow-500" />}
                  title="Próxima Troca (Churn)"
                >
                  Mudança crítica em <span className="font-bold text-gray-800">{resultados.mesesParaTroca} meses</span>. 
                  Risco de perda: <span className="font-bold text-red-500">{resultados.porcentagemPerda}</span>.
                </DetailRow>

                <DetailRow 
                  icon={<Rocket size={18} className="text-purple-500" />}
                  title="Projeção 5 Anos"
                >
                  Custo futuro estimado: <span className="font-bold text-purple-600">{formatBRL(resultados.gastoFuturo5Anos)}</span> (c/ inflação).
                </DetailRow>
              </div>
            </div>

            {/* SHARE */}
            <div className="bg-gray-900 rounded-2xl p-5 text-white text-center space-y-4">
              <div>
                <h3 className="font-bold text-lg">Compartilhar Resultado</h3>
                <p className="text-gray-400 text-xs mt-1">Ajude outras mães a enxergarem essa conta.</p>
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={compartilharZap}
                  className="bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg font-bold text-sm flex items-center justify-center gap-2 transition-colors"
                >
                  <Share2 size={16} /> WhatsApp
                </button>
                <button
                  onClick={copiarRelatorio}
                  className="bg-gray-700 hover:bg-gray-600 text-white py-3 rounded-lg font-bold text-sm flex items-center justify-center gap-2 transition-colors"
                >
                  <Copy size={16} /> Copiar
                </button>
              </div>
              {copied && (
                <p className="text-green-400 text-[10px] font-bold uppercase tracking-wide animate-pulse">Copiado!</p>
              )}
            </div>
          </div>
        )}

      </main>
    </div>
  );
}

// --- SUBCOMPONENTES PARA LIMPEZA ---

function PerfilOption({ id, selected, onClick, icon, bg, title, desc }: any) {
  return (
    <div
      onClick={onClick}
      className={`cursor-pointer border-2 rounded-xl p-3 transition-all h-full flex sm:block items-center gap-3 relative
        ${selected ? 'border-pink-500 bg-pink-50 shadow-md' : 'border-gray-100 hover:border-pink-300'}`}
    >
      <div className={`${bg} w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0`}>
        {icon}
      </div>
      <div>
        <h3 className="font-bold text-gray-800 text-sm">{title}</h3>
        <p className="text-[10px] text-gray-500 leading-tight">{desc}</p>
      </div>
      {selected && (
        <CheckCircle2 size={16} className="text-pink-600 ml-auto sm:ml-0 sm:absolute sm:top-3 sm:right-3" />
      )}
    </div>
  );
}

function InputGroup({ label, value, onChange, prefix, suffix, note, step = 1 }: any) {
  return (
    <div>
      <label className="block text-xs font-bold text-gray-500 mb-1">{label}</label>
      <div className="relative">
        {prefix && <span className="absolute left-3 top-2.5 text-gray-400 text-sm">{prefix}</span>}
        <input
          type="number"
          step={step}
          value={value}
          onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
          className={`w-full py-2.5 rounded-lg border border-gray-200 focus:border-pink-500 outline-none font-bold text-gray-700
            ${prefix ? 'pl-10 pr-3' : 'px-3'} ${suffix ? 'pr-8' : ''}`}
        />
        {suffix && <span className="absolute right-3 top-2.5 text-gray-400 text-sm">{suffix}</span>}
      </div>
      {note && <p className="text-[10px] text-gray-400 mt-1">{note}</p>}
    </div>
  );
}

function StatCard({ label, value, desc, color }: any) {
  const borderClass = color === 'pink' ? 'border-pink-500' : 'border-green-500';
  const textClass = color === 'pink' ? 'text-gray-900' : 'text-green-600';
  
  return (
    <div className={`bg-white p-5 rounded-2xl shadow-sm border-l-4 ${borderClass}`}>
      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{label}</p>
      <h3 className={`text-3xl font-extrabold mt-1 tracking-tight ${textClass}`}>{value}</h3>
      <p className="text-[10px] text-gray-500 mt-1">{desc}</p>
    </div>
  );
}

function DetailRow({ icon, title, children }: any) {
  return (
    <div className="p-4 flex gap-3">
      <div className="pt-1">{icon}</div>
      <div>
        <h4 className="font-bold text-gray-700">{title}</h4>
        <p className="text-gray-500 mt-0.5 leading-snug">
          {children}
        </p>
      </div>
    </div>
  );
}