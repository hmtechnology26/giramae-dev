import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ArrowRight,
  CheckCircle,
  ChevronDown,
  Users,
  Shield,
  Trophy,
} from "lucide-react";
import { Link } from "react-router-dom";
import Header from "@/components/shared/Header";
import Footer from "@/components/shared/Footer";
import QuickNav from "@/components/shared/QuickNav";
import { useAuth } from "@/hooks/useAuth";
import { useConfigSistema } from "@/hooks/useConfigSistema";
import { useMissoes } from "@/hooks/useMissoes";
import { referralStorage } from '@/utils/referralStorage';
import SEOHead from '@/components/seo/SEOHead';
import { cn } from "@/lib/utils";

const LandingPageOptimized = () => {
  const [openFaq, setOpenFaq] = useState(null);
  const { user } = useAuth();
  const { taxaTransacao } = useConfigSistema();
  const { missoes } = useMissoes();

  // Capturar parâmetro de indicação da URL
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const indicadorId = urlParams.get('indicador');

    if (indicadorId && !user) {
      // Armazenar indicação apenas se usuário não estiver logado
      referralStorage.set(indicadorId);
    }
  }, [user]);

  const missaoPactoEntrada = missoes?.find(m => m.tipo_missao === 'basic' && m.categoria === 'pacto_entrada');
  const recompensaPacto = missaoPactoEntrada?.recompensa_girinhas || 50;
  const itensNecessarios = missaoPactoEntrada?.condicoes?.quantidade || 2;

  // Dados para a seção de diferenciais
  const differentials = [
    {
      title: "Comunidade Real",
      description: "Feito por mães e para mães. Um espaço de apoio mútuo onde todas ganham valorizando o reuso.",
      icon: <Users className="w-5 h-5 text-primary" />
    },
    {
      title: "Transparência Total",
      description: `Taxa de ${taxaTransacao}% apenas para manter a infraestrutura. Sem pegadinhas ou custos ocultos.`,
      icon: <CheckCircle className="w-5 h-5 text-primary" />
    },
    {
      title: "Segurança Ativa",
      description: "Privacidade absoluta. Contatos liberados apenas após a confirmação da reserva pela plataforma.",
      icon: <Shield className="w-5 h-5 text-primary" />
    }
  ];

  // Benefícios reais
  const realBenefits = [
    {
      title: "Economia Inteligente",
      description: "Suas peças valem Girinhas que garantem o próximo tamanho do seu filho sem gastar um centavo."
    },
    {
      title: "Praticidade",
      description: "Anúncios rápidos e trocas simplificadas com mães da sua região."
    },
    {
      title: "Conexão Local",
      description: "Fortaleça a rede de apoio perto de você, facilitando a logística de entrega."
    }
  ];

  const newChallengesResolved = [
    "Valorização justa das suas peças.",
    "Logística simples e local.",
    "Trocas rápidas e eficientes.",
    "Qualidade garantida por avaliações.",
    "Transparência em todas as etapas.",
    "Segurança e proteção de dados.",
    "Economia circular e sustentável.",
    "Equilíbrio entre oferta e demanda.",
    "Comunidade ativa de mães reais."
  ];

  const faqs = [
    {
      q: "Quais as garantias da plataforma?",
      a: "Somos uma plataforma transparente com CNPJ e regras claras. As peças permanecem sob sua posse até a troca física, e nosso sistema de reputação garante que apenas mães comprometidas façam parte."
    },
    {
      q: "Posso confiar nas outras mães?",
      a: "Sim! Implementamos um sistema de avaliações mútuas. O histórico de cada usuária é visível, e comportamentos fora das diretrizes resultam em suspensão imediata."
    },
    {
      q: "O que é a fila de espera?",
      a: "Se um item já está reservado, você entra na fila gratuitamente. Se houver desistência ou não confirmação, a vez passa para a próxima mãe da fila automaticamente."
    },
    {
      q: "Como combino a entrega?",
      a: "Após a reserva oficial no app, os números de WhatsApp são liberados. Você combina local e horário diretamente com a outra mãe, preferencialmente em lugares públicos ou escolas."
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-25 to-blue-50 flex flex-col font-sans overflow-x-hidden">
      <SEOHead
        title="GiraMãe - Economia Circular e Afeto"
        description="Plataforma de troca de roupas infantis entre mães. Economia circular e sustentabilidade."
        keywords="troca roupas infantis, brechó online, GiraMãe"
        url="https://giramae.com.br/"
      />
      <Header />

      <main className="flex-grow pt-20 md:pt-28">
        {/* HERO SECTION - REFINED FONT SIZES */}
        <section className="relative min-h-[72vh] md:min-h-[85vh] flex flex-col items-center justify-center px-4 md:px-6 overflow-hidden">
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-primary/10 blur-[120px] rounded-full -z-10 opacity-50" />

          <div className="max-w-5xl mx-auto text-center z-10">
            <div className="flex justify-center mb-5 md:mb-8 mt-2 md:mt-4">
              <Badge variant="outline" className="px-4 md:px-6 py-2 rounded-full border-primary/20 text-primary font-bold tracking-[0.16em] md:tracking-[0.2em] uppercase text-[9px] md:text-[10px] bg-white/50 backdrop-blur-md">
                Rede Exclusiva para Mães
              </Badge>
            </div>

            <h1 className="text-4xl sm:text-5xl md:text-8xl font-black tracking-tight mb-4 md:mb-8 leading-[1.05] animate-in fade-in slide-in-from-bottom-4 duration-700 delay-100">
              Onde <span className="text-glow text-primary italic">Mães</span> se apoiam <br className="hidden md:block" />
              e o <span className="text-glow text-primary">amor</span> circula.
            </h1>

            <p className="text-base md:text-2xl text-foreground/50 mb-7 md:mb-12 max-w-2xl mx-auto leading-relaxed font-medium animate-in fade-in slide-in-from-bottom-2 duration-700 delay-300">
              Transforme desapegos em novas histórias. Um espaço de confiança e economia para o futuro dos pequenos.
            </p>

            <div className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-6 animate-in fade-in slide-in-from-bottom-2 duration-700 delay-500">
              <Button
                size="lg"
                asChild
                className="founders-button text-white px-8 md:px-12 h-14 md:h-16 text-sm md:text-lg rounded-full shadow-2xl shadow-primary/20 group"
              >
                <Link to={user ? "/feed" : "/auth"} className="flex items-center">
                  {user ? "Acessar Plataforma" : "Começar Agora"}
                  <ArrowRight className="ml-2.5 h-5 w-5 md:h-6 md:w-6 transition-transform duration-300 group-hover:translate-x-1" />
                </Link>
              </Button>
              <Button size="lg" variant="ghost" className="px-8 md:px-12 h-14 md:h-16 text-sm md:text-lg rounded-full text-foreground/60 hover:bg-white/50 hover:text-primary transition-all backdrop-blur-sm border border-transparent hover:border-primary/10" asChild>
                <a href="#como-funciona">Ver detalhes</a>
              </Button>
            </div>
          </div>

          <div className="hidden md:block mt-12 md:mt-16 w-full max-w-5xl px-4 animate-in fade-in slide-in-from-bottom-10 duration-1000 delay-700">
            <div className="relative rounded-[3rem] overflow-hidden bg-white/40 backdrop-blur-xl border border-white/60 p-4 shadow-2xl">
              <div className="rounded-[2.5rem] overflow-hidden bg-muted aspect-[21/9] relative">
                <img
                  src="/maes_troca_parquinho.png"
                  alt="Comunidade GiraMãe"
                  className="w-full h-full object-cover opacity-90 transition-transform duration-1000 hover:scale-105"
                />
              </div>
            </div>
          </div>
        </section>

        <section className="md:hidden px-4 pb-10">
          <div className="max-w-md mx-auto space-y-4">
            <div className="premium-card rounded-[2rem] bg-white/70 backdrop-blur-xl border border-primary/5 p-5">
              <p className="text-[10px] font-black uppercase tracking-[0.22em] text-primary mb-3">Como funciona</p>
              <div className="grid grid-cols-1 gap-3">
                {[
                  { n: "1", t: "Cadastre", d: "Crie sua conta e publique as peças." },
                  { n: "2", t: "Troque", d: "Use Girinhas para reservar o que precisa." },
                  { n: "3", t: "Combine", d: "Finalize a entrega com segurança." },
                ].map((step) => (
                  <div key={step.n} className="flex items-start gap-3 rounded-2xl bg-white/80 p-4 border border-primary/5">
                    <div className="w-9 h-9 rounded-full bg-primary text-white font-black flex items-center justify-center shrink-0">{step.n}</div>
                    <div className="min-w-0">
                      <h3 className="font-black text-foreground text-sm">{step.t}</h3>
                      <p className="text-xs leading-relaxed text-foreground/55 mt-1">{step.d}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="premium-card rounded-[2rem] bg-white/70 backdrop-blur-xl border border-primary/5 p-5 space-y-3">
              <p className="text-[10px] font-black uppercase tracking-[0.22em] text-primary">O que você encontra</p>
              <ul className="space-y-2 text-sm text-foreground/60">
                <li className="flex gap-2"><CheckCircle className="w-4 h-4 text-primary shrink-0 mt-0.5" />Trocas locais e seguras.</li>
                <li className="flex gap-2"><CheckCircle className="w-4 h-4 text-primary shrink-0 mt-0.5" />Girinhas como moeda interna.</li>
                <li className="flex gap-2"><CheckCircle className="w-4 h-4 text-primary shrink-0 mt-0.5" />Comunidade feita para mães.</li>
              </ul>
            </div>
          </div>
        </section>

        {/* ESSÊNCIA - ORGANIZED BLOCKS */}
        <section className="hidden md:block py-16 md:py-18 px-6">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-12 md:mb-16 space-y-4">
              <Badge variant="outline" className="px-6 py-2 rounded-full border-primary/20 text-primary font-bold tracking-[0.2em] uppercase text-[10px] bg-white/50 backdrop-blur-md">
              <span className="text-[10px] font-bold text-primary uppercase tracking-[0.3em]">Nossos Valores</span>
              </Badge>
              <h2 className="text-4xl md:text-6xl font-black text-foreground tracking-tight italic">A Essência do GiraMãe</h2>
            </div>

            <div className="grid md:grid-cols-3 gap-10">
              {differentials.map((item, index) => (
                <div key={index} className="premium-card p-10 rounded-[3rem] bg-white/60 backdrop-blur-xl border-primary/5 hover:bg-white transition-all duration-500 shadow-xl border">
                  <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-8 border border-primary/10 text-primary">
                    {item.icon}
                  </div>
                  <h3 className="text-2xl font-black mb-4 tracking-tight text-foreground">{item.title}</h3>
                  <p className="text-foreground/50 leading-relaxed text-base font-medium">{item.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* REASONS - COMPACT & REFINED */}
        <section className="hidden md:block py-16 md:py-16 px-6 relative overflow-hidden">
          <div className="max-w-7xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-12 md:gap-16 items-center">
              <div className="space-y-12">
                <h2 className="text-5xl md:text-7xl font-black text-foreground tracking-tight leading-[1.05]">
                  Feito para <br /><span className="text-glow text-primary italic">humanizar</span> <br />suas trocas
                </h2>
                <p className="text-xl text-foreground/40 leading-relaxed font-medium">
                  Um ecossistema seguro onde cada peça mantém sua história e valor para outra família brasileira.
                </p>

                <div className="space-y-6">
                  {newChallengesResolved.slice(0, 5).map((point, index) => (
                    <div key={index} className="flex items-center gap-6 bg-white/60 backdrop-blur-lg p-6 rounded-[2rem] border border-primary/5 hover:border-primary/20 transition-all shadow-sm">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                        <CheckCircle className="w-6 h-6 text-primary" />
                      </div>
                      <span className="text-lg font-bold tracking-tight text-foreground/70">{point}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 items-start">
                <div className="space-y-8">
                  {realBenefits.slice(0, 2).map((benefit, index) => (
                    <div key={index} className="premium-card p-10 rounded-[2.5rem] bg-white/70 backdrop-blur-xl border border-primary/5 h-full shadow-lg">
                      <h4 className="text-primary font-black mb-4 text-xl tracking-tight">{benefit.title}</h4>
                      <p className="text-base text-foreground/50 leading-relaxed font-medium">{benefit.description}</p>
                    </div>
                  ))}
                </div>
                <div className="space-y-8">
                  <div className="premium-card p-10 rounded-[2.5rem] bg-primary/5 backdrop-blur-xl border border-primary/20">
                    <p className="text-2xl font-black leading-tight italic text-primary">"As roupas que você escolheu com carinho não viram lixo nem mixaria."</p>
                  </div>
                  <div className="premium-card p-10 rounded-[2.5rem] bg-white/70 backdrop-blur-xl border border-primary/5 shadow-lg">
                    <h4 className="text-primary font-black mb-4 text-xl tracking-tight">{realBenefits[2].title}</h4>
                    <p className="text-base text-foreground/50 leading-relaxed font-medium">{realBenefits[2].description}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* HOW IT WORKS CTA */}
        <section id="como-funciona" className="hidden md:block py-16 md:py-16 px-6">
          <div className="max-w-5xl mx-auto text-center space-y-10 md:space-y-12">
            <h2 className="text-5xl md:text-[6rem] font-black text-foreground tracking-tighter leading-none italic opacity-90">Como Funciona</h2>

            <div className="grid md:grid-cols-3 gap-8">
              {[
                { n: "1", t: "Poste Agora", d: `Suba ${itensNecessarios} peças e ganhe ${recompensaPacto} G$.` },
                { n: "2", t: "Escolha Livre", d: "Troque seus créditos por peças novas." },
                { n: "3", t: "Combine Tudo", d: "Entrega simples, segura e humana." }
              ].map((step, i) => (
                <div key={i} className="space-y-6">
                  <div className="w-20 h-20 bg-primary rounded-[2rem] flex items-center justify-center mx-auto shadow-2xl shadow-primary/30 relative">
                    <span className="text-3xl font-black text-white">{step.n}</span>
                    <div className="absolute inset-0 bg-white/20 rounded-[2rem] scale-90" />
                  </div>
                  <h3 className="text-2xl font-black text-foreground tracking-tight">{step.t}</h3>
                  <p className="text-foreground/40 font-medium leading-relaxed">{step.d}</p>
                </div>
              ))}
            </div>

            <div className="pt-12">
              <Button asChild size="lg" variant="outline" className="rounded-full px-12 h-14 border-primary/20 text-primary font-bold hover:bg-primary/5">
                <Link to="/como-funciona">Ver guia completo de segurança</Link>
              </Button>
            </div>
          </div>
        </section>

        {/* MISSIONS */}
        {missoes && missoes.length > 0 && (
          <section className="hidden md:block py-16 md:py-10 px-6">
            <div className="max-w-7xl mx-auto">
              <div className="flex flex-col md:flex-row justify-between items-center mb-12 md:mb-16 gap-8">
                <div className="w-full ml-36 space-y-2 flex flex-col items-center">
                  <Badge variant="outline" className="px-6 py-2 rounded-full border-primary/20 text-primary font-bold tracking-[0.2em] uppercase text-[10px] bg-white/50 backdrop-blur-md">
                    <span className="text-[10px] font-bold text-primary uppercase tracking-[0.3em]">Conquistas</span>
                  </Badge>
                  <h2 className="text-4xl md:text-6xl font-black tracking-tight italic text-foreground">Missões Ativas</h2>
                  <p className="text-lg text-foreground/40 font-medium max-w-xl">Complete passos simples e acelere suas próximas trocas.</p>
                </div>
                <Trophy className="w-24 h-24 text-primary opacity-10 hidden lg:block" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                {missoes.map((missao) => (
                  <div key={missao.id} className="premium-card p-10 rounded-[3rem] border border-primary/5 hover:border-primary/20 group relative transition-all duration-500 bg-white/60 shadow-xl overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 blur-3xl -mr-16 -mt-16 group-hover:bg-primary/10 transition-colors" />
                    <h3 className="text-2xl font-black mb-4 tracking-tight text-foreground group-hover:text-primary transition-colors relative z-10">{missao.titulo}</h3>
                    <p className="text-foreground/40 mb-10 text-base leading-relaxed font-medium min-h-[60px] relative z-10">{missao.descricao}</p>
                    <div className="flex justify-between items-center gap-4 relative z-10">
                      <div className="px-6 py-2.5 rounded-2xl bg-primary text-white font-black text-sm shadow-lg shadow-primary/20">
                        {missao.recompensa_girinhas} G$
                      </div>
                      <span className="text-[10px] text-foreground/30 font-bold uppercase tracking-widest leading-none">
                        META: {missao.condicoes.quantidade} ITENS
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* FAQ */}
        <section id="faq" className="hidden md:block py-16 md:py-16 px-6">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12 md:mb-16 space-y-4">
              <div className="w-full flex flex-col items-center">
                <Badge variant="outline" className="px-6 py-2 rounded-full border-primary/20 text-primary font-bold tracking-[0.2em] uppercase text-[10px] bg-white/50 backdrop-blur-md">
                  <span className="text-[10px] font-bold text-primary uppercase tracking-[0.3em]">Ajuda Rápida</span>
                </Badge>
              </div>
              <h2 className="text-4xl md:text-6xl font-black mb-4 italic tracking-tight text-foreground">Dúvidas Frequentes</h2>
              <p className="text-lg text-foreground/40 font-medium">Transparência total para sua total segurança.</p>
            </div>

            <div className="space-y-6">
              {faqs.map((faq, index) => (
                <div key={index} className="premium-card rounded-[2.5rem] overflow-hidden border border-primary/5 bg-white/20 hover:bg-white/40 shadow-sm transition-all duration-500">
                  <button
                    className="w-full flex justify-between items-center p-8 text-left group"
                    onClick={() => setOpenFaq(openFaq === index ? null : index)}
                  >
                    <span className="font-bold text-xl text-foreground/80 group-hover:text-primary transition-colors pr-6">{faq.q}</span>
                    <div className={cn("w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center transition-transform duration-500", openFaq === index ? "rotate-180" : "")}>
                      <ChevronDown className="w-5 h-5 text-primary" />
                    </div>
                  </button>
                  <div className={cn(
                    "overflow-hidden transition-all duration-500 ease-in-out",
                    openFaq === index ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0"
                  )}>
                    <div className="p-8 pt-0 text-foreground/50 text-lg leading-relaxed font-medium">
                      {faq.a}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="text-center mt-12">
              <Link to="/faq" className="text-primary font-bold hover:underline">Ver todas as perguntas</Link>
            </div>
          </div>
        </section>

        {/* CTA FINAL */}
        <section className="hidden md:block py-20 md:py-32 px-6 relative overflow-hidden bg-primary shadow-[0_-20px_50px_rgba(235,51,148,0.1)]">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(255,255,255,0.15),transparent_60%)]" />
          <div className="max-w-5xl mx-auto text-center relative space-y-12">
            <h2 className="text-5xl md:text-8xl font-black mb-8 tracking-tighter leading-[0.9] text-white">
              Faça a <br />
              <span className="italic opacity-80">Vida</span> Girar.
            </h2>

            <p className="text-xl md:text-3xl text-white/70 max-w-2xl mx-auto italic font-medium leading-relaxed">
              "Porque mães cuidam de mães. <br /> E é nisso que acreditamos."
            </p>

            <div className="pt-6">
              <Button size="lg" asChild className="founders-button bg-white text-white hover:bg-white/90 px-16 h-20 text-2xl rounded-full shadow-2xl shadow-black/20 transition-all hover:scale-[1.05]">
                <Link to={user ? "/feed" : "/auth"}>
                  {user ? "Acessar Plataforma" : "Quero Participar"}
                  <ArrowRight className="ml-4 h-10 w-10" />
                </Link>
              </Button>
            </div>
          </div>
        </section>
      </main>

      <QuickNav />
      <Footer />
    </div>
  );
};

export default LandingPageOptimized;
