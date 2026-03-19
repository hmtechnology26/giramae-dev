import React, { useMemo, useEffect } from 'react';
import Header from "@/components/shared/Header";
import QuickNav from "@/components/shared/QuickNav";
import Footer from "@/components/shared/Footer";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Wallet, History, ShoppingCart, Send, Sparkles, TrendingUp, Calendar, Clock, ArrowUpRight, ArrowDownLeft } from "lucide-react";
import { useCarteira } from "@/hooks/useCarteira";
import { useGirinhasExpiracaoSegura } from "@/hooks/useGirinhasExpiracaoSegura";
import CotacaoWidget from "@/modules/girinhas/components/CotacaoWidget";
import TransferenciaP2P from "@/modules/girinhas/components/TransferenciaP2P";
import CompraComImpacto from "@/modules/girinhas/components/CompraComImpacto";
import ValidadeGirinhasSegura from "@/components/carteira/ValidadeGirinhasSegura";
import BonusDiarioWidget from '@/components/carteira/BonusDiarioWidget';
import { useConfigSistema } from "@/hooks/useConfigSistema";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { analytics } from '@/lib/analytics';
import SEOHead from '@/components/seo/SEOHead';
import { pageTitle } from '@/lib/pageTitle';
import { useTourTrigger } from '@/modules/onboarding';
import LoadingSpinner from '@/components/loading/LoadingSpinner';
import { CardTitle } from '@/components/ui/card';

const Carteira = () => {
  const { carteira, transacoes, loading, saldo, totalRecebido, totalGasto } = useCarteira();
  const { expiracao } = useGirinhasExpiracaoSegura();
  const { taxaTransferencia, taxaTransacao } = useConfigSistema();

  // ✅ TOUR: Dispara automaticamente na primeira visita
  useTourTrigger('carteira-tour', {
    condition: 'first-visit',
    delay: 1000,
    ready: !loading
  });

  // ✅ ANALYTICS: Visualização da carteira
  useEffect(() => {
    analytics.feed.view();
  }, []);

  // ✅ Performance: Memoizar cálculos que dependem de transacoes
  const transacoesEsteMes = useMemo(() =>
    transacoes.filter(t =>
      new Date(t.data_criacao).getMonth() === new Date().getMonth()
    ).length,
    [transacoes]
  );

  const ultimaMovimentacao = useMemo(() =>
    transacoes.length > 0
      ? format(new Date(transacoes[0].data_criacao), 'dd/MM/yyyy', { locale: ptBR })
      : 'Nenhuma',
    [transacoes]
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-25 to-blue-50 flex flex-col items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-25 to-blue-50 font-sans">
      <SEOHead title={pageTitle.carteira()} />
      <Header />

      <main className="container flex flex-col items-center justify-center mx-auto pt-32 pb-24 px-4 w-full max-w-[1600px]">
        <div className="mb-12 flex flex-col items-center text-center w-full">
          <h1 data-tour="carteira-titulo" className="text-4xl md:text-5xl font-black text-foreground tracking-tight flex items-center justify-center gap-4 w-full">
            Minha <span className="text-glow text-primary italic">Carteira</span>
          </h1>
          <p className="text-foreground/40 font-bold uppercase tracking-widest text-[10px] mt-2 w-full text-center">Gerencie suas Girinhas e transações</p>
        </div>

        {/* Widgets superiores - 4 blocos na tela desktop */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-12 w-full items-stretch">
          
          {/* 1. Widget de Bônus Diário */}
          <div data-tour="bonus-diario" className="w-full flex h-full">
            <div className="w-full h-full">
              <BonusDiarioWidget />
            </div>
          </div>

          {/* 2. Saldo atual */}
          <div data-tour="saldo-display" className="w-full h-full bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-200 shadow-lg rounded-xl p-6 relative group transition-all duration-700 hover:shadow-xl flex flex-col justify-between">
            {/* Visual Accents */}
            <div className="absolute top-0 left-0 right-0 h-2" />
            <div className="absolute right-0 top-0 translate-x-1/4 -translate-y-1/4 w-64 h-64 bg-primary/5 rounded-full blur-[100px] group-hover:bg-primary/10 transition-all duration-1000" />

            <div className="relative z-10 space-y-6 flex-grow flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <CardTitle className="flex items-center gap-2">
                            <img src="/girinha_sem_fundo.png" alt="girinha" className="h-10 w-auto"/>
                            <div className="flex flex-col">
                           <span className="text-[10px] font-black uppercase text-foreground/30 tracking-[0.2em] leading-none mb-1">Saldo Atual</span>
                            <span className="text-xs font-bold text-primary/60">Economia Ativa</span>
                            </div>
                          </CardTitle>
                </div>
            </div>

              <div className="text-center py-4">
                <div className="inline-flex items-baseline gap-2 relative">
                  <p className="text-7xl font-black text-foreground tracking-tighter drop-shadow-sm font-sans">
                    {saldo.toFixed(2)}
                  </p>
                  <span className="text-3xl font-black text-primary italic drop-shadow-sm">G$</span>
                  <div className="absolute -bottom-2 left-0 right-0 h-1.5 bg-primary/10 blur-sm rounded-full scale-x-75" />
                </div>

                {expiracao.total_expirando_7_dias > 0 && (
                  <div className="mt-8 inline-flex items-center gap-2.5 px-5 py-2 bg-red-50/80 backdrop-blur-md text-red-600 rounded-full border border-red-100 shadow-sm animate-in zoom-in duration-700">
                    <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                    <span className="text-[10px] font-black uppercase tracking-[0.15em]">{expiracao.total_expirando_7_dias.toFixed(2)} expiram em breve</span>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-5">
                <div className="p-5 bg-emerald-500/[0.03] rounded-[2rem] border border-emerald-500/10 space-y-2 group/stat hover:bg-emerald-500/5 transition-colors">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-emerald-100 rounded-lg text-emerald-600">
                      <ArrowDownLeft className="w-3 h-3" />
                    </div>
                    <p className="text-[9px] font-black text-emerald-600/60 uppercase tracking-widest">Entradas</p>
                  </div>
                  <p className="text-2xl font-black text-emerald-700 font-sans tracking-tight">+{totalRecebido.toFixed(2)}</p>
                </div>
                <div className="p-5 bg-red-500/[0.03] rounded-[2rem] border border-red-500/10 space-y-2 group/stat hover:bg-red-500/5 transition-colors">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-red-100 rounded-lg text-red-600">
                      <ArrowUpRight className="w-3 h-3" />
                    </div>
                    <p className="text-[9px] font-black text-red-600/60 uppercase tracking-widest">Saídas</p>
                  </div>
                  <p className="text-2xl font-black text-red-700 font-sans tracking-tight">-{totalGasto.toFixed(2)}</p>
                </div>
              </div>
            </div>
          </div>

          {/* 3. Widget de cotação */}
          <div className="w-full flex h-full">
            <div className="w-full h-full">
              <CotacaoWidget />
            </div>
          </div>

          {/* 4. Estatísticas rápidas */}
          <div className="w-full h-full bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-200 shadow-lg rounded-xl p-6 relative group transition-all duration-700 hover:shadow-xl flex flex-col justify-between overflow-hidden">
            <div className="absolute top-0 right-0 w-48 h-48 bg-purple-500/5 blur-[80px] -mr-24 -mt-24 group-hover:bg-purple-500/10 transition-all duration-1000" />

            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-purple-500/10 rounded-2xl flex items-center justify-center text-purple-600 shadow-inner">
                <TrendingUp className="w-7 h-7" />
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] font-black uppercase text-foreground/30 tracking-[0.2em] leading-none mb-1">Insight Express</span>
                <span className="text-xs font-bold text-purple-600/60">Sua Performance</span>
              </div>
            </div>

            <div className="flex flex-col justify-center flex-grow space-y-4">
              <div className="p-4 lg:p-5 bg-white/50 rounded-[2rem] border border-white/80 flex justify-between items-center group/item hover:bg-white/80 hover:shadow-lg transition-all duration-500">
                <div className="space-y-1.5">
                  <p className="text-[10px] font-black text-foreground/30 uppercase tracking-[0.15em]">Trocas (Mês)</p>
                  <p className="text-3xl font-black text-foreground tracking-tighter">{transacoesEsteMes}</p>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-foreground/5 flex items-center justify-center text-foreground/10 group-hover/item:text-primary/20 group-hover/item:bg-primary/5 transition-all">
                  <History className="w-6 h-6" />
                </div>
              </div>

              <div className="p-4 lg:p-5 bg-white/50 rounded-[2rem] border border-white/80 flex justify-between items-center group/item hover:bg-white/80 hover:shadow-lg transition-all duration-500">
                <div className="space-y-1.5">
                  <p className="text-[10px] font-black text-foreground/30 uppercase tracking-[0.15em]">Último Registro</p>
                  <p className="text-2xl font-black text-foreground tracking-tight">{ultimaMovimentacao}</p>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-foreground/5 flex items-center justify-center text-foreground/10 group-hover/item:text-primary/20 group-hover/item:bg-primary/5 transition-all">
                  <Calendar className="w-6 h-6" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs principais */}
        <div className="w-full premium-card bg-white/40 backdrop-blur-xl border-white/60 rounded-[3rem] p-2 shadow-2xl overflow-hidden">
          <Tabs data-tour="carteira-tabs" defaultValue="historico" className="w-full">
            <div className="px-4 md:px-8 pt-6 md:pt-8 pb-4 flex justify-center w-full">
              <TabsList className="bg-primary/5 p-1.5 md:p-1 rounded-3xl md:rounded-2xl h-auto md:h-14 w-full md:w-auto grid grid-cols-2 gap-2 md:flex md:flex-row md:gap-0 mt-2 md:mt-0">
                <TabsTrigger value="historico" className="rounded-xl px-3 md:px-6 py-3 md:py-0 h-full font-black text-[9px] md:text-[10px] uppercase tracking-widest data-[state=active]:bg-white data-[state=active]:shadow-lg data-[state=active]:text-primary transition-all flex items-center justify-center whitespace-nowrap">
                  <History className="w-4 h-4 shrink-0 mr-1.5 md:mr-2" />
                  Histórico
                </TabsTrigger>
                <TabsTrigger value="validades" className="rounded-xl px-3 md:px-6 py-3 md:py-0 h-full font-black text-[9px] md:text-[10px] uppercase tracking-widest data-[state=active]:bg-white data-[state=active]:shadow-lg data-[state=active]:text-primary transition-all flex items-center justify-center whitespace-nowrap">
                  <Calendar className="w-4 h-4 shrink-0 mr-1.5 md:mr-2" />
                  Validades
                </TabsTrigger>
                <TabsTrigger value="comprar" data-tour="btn-comprar-girinhas" className="rounded-xl px-3 md:px-6 py-3 md:py-0 h-full font-black text-[9px] md:text-[10px] uppercase tracking-widest data-[state=active]:bg-white data-[state=active]:shadow-lg data-[state=active]:text-primary transition-all flex items-center justify-center whitespace-nowrap">
                  <ShoppingCart className="w-4 h-4 shrink-0 mr-1.5 md:mr-2" />
                  Comprar
                </TabsTrigger>
                <TabsTrigger value="transferir" className="rounded-xl px-3 md:px-6 py-3 md:py-0 h-full font-black text-[9px] md:text-[10px] uppercase tracking-widest data-[state=active]:bg-white data-[state=active]:shadow-lg data-[state=active]:text-primary transition-all flex items-center justify-center whitespace-nowrap">
                  <Send className="w-4 h-4 shrink-0 mr-1.5 md:mr-2" />
                  Transferir
                </TabsTrigger>
              </TabsList>
            </div>

            <div className="p-8">
              <TabsContent value="historico" className="mt-0">
                {transacoes.length === 0 ? (
                  <div className="text-center py-20 bg-white/20 rounded-[2.5rem] border border-dashed border-primary/20">
                    <History className="w-16 h-16 text-primary/10 mx-auto mb-4" />
                    <p className="text-foreground/40 font-bold uppercase tracking-widest text-[10px]">Nenhuma transação encontrada</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {transacoes.map((transacao) => (
                      <div
                        key={transacao.transacao_id}
                        className="flex flex-col md:flex-row items-center justify-between gap-4 md:gap-0 p-6 bg-white/40 border border-white/60 rounded-[2rem] hover:bg-white/60 transition-all group"
                      >
                        <div className="flex flex-col md:flex-row items-center gap-4 md:gap-6 text-center md:text-left">
                          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 ${Number(transacao.valor) >= 0 ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
                            {Number(transacao.valor) >= 0 ? <ArrowDownLeft className="w-6 h-6" /> : <ArrowUpRight className="w-6 h-6" />}
                          </div>
                          <div className="space-y-2 md:space-y-1 flex flex-col items-center md:items-start">
                            <p className="font-black text-foreground tracking-tight group-hover:text-primary transition-colors">{transacao.descricao}</p>
                            <div className="flex flex-col md:flex-row items-center gap-2 md:gap-3">
                              <Badge variant="outline" className={`rounded-xl px-3 py-0.5 font-black uppercase text-[8px] tracking-widest border-none ${Number(transacao.valor) >= 0 ? 'bg-emerald-500/10 text-emerald-600' : 'bg-red-500/10 text-red-600'}`}>
                                {transacao.config?.descricao_pt || transacao.descricao || transacao.tipo}
                              </Badge>
                              <span className="text-[10px] font-bold text-foreground/30 uppercase tracking-widest">
                                {format(new Date(transacao.data_criacao), "d 'de' MMMM", { locale: ptBR })}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="text-center md:text-right space-y-1">
                          <p className={`text-xl font-black tracking-tighter w-full ${Number(transacao.valor) >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                            {Number(transacao.valor) >= 0 ? '+' : '-'} {Math.abs(Number(transacao.valor)).toFixed(2)} G$
                          </p>
                          {transacao.metadata?.cotacao_utilizada && (
                            <p className="text-[9px] font-black text-foreground/20 uppercase tracking-widest leading-none">
                              R$ {Number(transacao.metadata.cotacao_utilizada).toFixed(2)} cada
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="validades" className="mt-0">
                <div className="p-4 bg-white/20 rounded-[2.5rem] border border-white/40 transition-all">
                  <ValidadeGirinhasSegura />
                </div>
              </TabsContent>

              <TabsContent value="comprar" className="mt-0">
                <div className="p-4 bg-white/20 rounded-[2.5rem] border border-white/40 transition-all">
                  <CompraComImpacto />
                </div>
              </TabsContent>

              <TabsContent value="transferir" className="mt-0">
                <div className="space-y-8">
                  <div className="p-6 bg-primary/5 border border-primary/10 rounded-[2.5rem] flex items-center justify-between">
                    <div className="space-y-1">
                      <p className="text-[10px] font-black text-primary uppercase tracking-widest">Taxas do Sistema</p>
                      <p className="text-sm font-medium text-foreground/50">Utilizamos taxas simbólicas para manter a economia da comunidade equilibrada.</p>
                    </div>
                    <div className="flex gap-4">
                      <div className="text-center px-6 py-2 bg-white rounded-2xl shadow-sm border border-primary/5">
                        <p className="text-[10px] font-black text-primary uppercase tracking-widest">P2P</p>
                        <p className="text-xl font-black text-foreground">{taxaTransferencia}%</p>
                      </div>
                      <div className="text-center px-6 py-2 bg-white rounded-2xl shadow-sm border border-primary/5">
                        <p className="text-[10px] font-black text-primary uppercase tracking-widest">Serviço</p>
                        <p className="text-xl font-black text-foreground">{taxaTransacao}%</p>
                      </div>
                    </div>
                  </div>
                  <div className="p-4 bg-white/20 rounded-[2.5rem] border border-white/40 transition-all">
                    <TransferenciaP2P />
                  </div>
                </div>
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </main>

      <QuickNav />
      <Footer />
    </div>
  );
};

export default Carteira;
