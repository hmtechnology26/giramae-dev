import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Heart, Users, Recycle, Shield, ChevronRight, ShieldCheck } from "lucide-react";
import SEOHead from "@/components/seo/SEOHead";
import Header from "@/components/shared/Header";
import Footer from "@/components/shared/Footer";
import QuickNav from "@/components/shared/QuickNav";

const ComoFunciona = () => {
  const steps = [
    {
      number: "01",
      title: "Cadastre-se Grátis",
      description:
        "Crie sua conta em segundos e faça parte da nossa comunidade de mães conscientes.",
      icon: <Users className="h-6 w-6" />,
    },
    {
      number: "02",
      title: "Ofereça o que Não Usa",
      description:
        "Fotografe roupas que não servem mais e defina quantas Girinhas quer receber. Ou simplesmente complete missões para ganhar créditos.",
      icon: <Heart className="h-6 w-6" />,
    },
    {
      number: "03",
      title: "Encontre o que Precisa",
      description:
        "Navegue pelos itens disponíveis e reserve com suas Girinhas acumuladas.",
      icon: <Recycle className="h-6 w-6" />,
    },
    {
      number: "04",
      title: "Troque com Segurança",
      description:
        "Confirme a entrega e finalize a troca. Simples, seguro e sustentável!",
      icon: <Shield className="h-6 w-6" />,
    },
  ];

  const benefits = [
    "🆓 Gratuito para sempre",
    "💰 Economize comprando roupas",
    "🌱 Evite descartar roupas boas",
    "🤝 Conheça mães da sua região",
  ];

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name: "Como Funciona a GiraMãe - Plataforma de Trocas entre Mães",
    description: "Aprenda como usar a GiraMãe para trocar roupas, brinquedos e calçados infantis de forma sustentável usando nossa moeda virtual Girinhas.",
    step: steps.map((step, index) => ({
      "@type": "HowToStep",
      position: index + 1,
      name: step.title,
      text: step.description,
    })),
    totalTime: "PT10M",
    tool: [
      {
        "@type": "Thing",
        name: "Smartphone ou Computador"
      },
      {
        "@type": "Thing",
        name: "Girinhas (moeda virtual)"
      }
    ],
    supply: [
      {
        "@type": "Thing",
        name: "Roupas, brinquedos ou calçados infantis para trocar"
      }
    ],
    mainEntity: {
      "@type": "FAQPage",
      mainEntity: [
        {
          "@type": "Question",
          name: "O que são Girinhas?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Girinhas são nossa moeda virtual interna. 1 Girinha = R$ 1,00 em valor de referência. Você ganha vendendo itens e usa para comprar outros itens da comunidade."
          }
        },
        {
          "@type": "Question",
          name: "Como ganhar Girinhas?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Você pode ganhar Girinhas vendendo itens, completando missões, recebendo bônus diário, indicando outras mães ou comprando dentro da plataforma."
          }
        }
      ]
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-25 to-blue-50 flex flex-col font-sans">
      <SEOHead
        title="Como Funciona a GiraMãe - Troca de Roupas Infantis"
        description="Descubra como funciona a GiraMãe! Plataforma que conecta mães para trocar roupas, brinquedos e calçados infantis usando nossa moeda virtual Girinhas. Economia circular sustentável."
        keywords="como funciona giramae, troca roupas infantis, economia circular mães, sustentabilidade infantil, girinhas moeda virtual, brechó online sustentável"
        structuredData={structuredData}
      />

      <Header />

      <main className="flex-grow pt-32 pb-20">
        <div className="container mx-auto px-4 max-w-6xl">
          {/* Header */}
          <div className="text-center mb-20 space-y-6">
            <div className="flex justify-center">
              <Badge variant="outline" className="px-6 py-2 rounded-full border-primary/20 text-primary font-bold tracking-widest uppercase text-[10px] bg-white/50 backdrop-blur-md">
                Guia Completo
              </Badge>
            </div>
            <h1 className="text-5xl md:text-7xl font-black text-foreground tracking-tight leading-tight">
              Transforme o <br />
              <span className="text-glow text-primary italic">Guarda-Roupa</span>
            </h1>
            <p className="text-xl text-foreground/40 font-medium max-w-2xl mx-auto leading-relaxed">
              Descubra como nossa comunidade de mães empreendedoras utiliza as <strong>Girinhas</strong> para uma economia circular inteligente e cheia de propósito.
            </p>
          </div>

          {/* Banner de Gratuidade Premium */}
          <div className="premium-card bg-emerald-50/50 backdrop-blur-xl border-emerald-100/50 rounded-[2.5rem] p-10 mb-20 shadow-xl shadow-emerald-500/5 border relative overflow-hidden group">
            <div className="absolute -right-20 -top-20 w-64 h-64 bg-emerald-200/20 blur-[80px] rounded-full group-hover:bg-emerald-200/30 transition-colors duration-700" />

            <div className="relative z-10 flex flex-col items-center text-center space-y-6">
              <Badge className="bg-emerald-500 text-white border-0 px-4 py-1.5 rounded-full font-bold text-[10px] uppercase tracking-widest shadow-lg shadow-emerald-500/20">
                Livre para Todas
              </Badge>
              <h2 className="text-3xl md:text-4xl font-black text-emerald-900 tracking-tight">
                Você não precisa gastar dinheiro <br className="hidden md:block" />
                <span className="text-emerald-500">para participar!</span>
              </h2>
              <p className="text-emerald-700/60 font-medium max-w-2xl text-lg leading-relaxed">
                Ganhe Girinhas completando missões simples, recebendo bônus diários e oferecendo itens que sua família já não usa. É a economia circular em sua forma mais pura.
              </p>
            </div>
          </div>

          <section className="mb-20">
            <Card className="bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20">
              <CardContent className="p-8">
                <div className="grid md:grid-cols-2 gap-8 items-center">
                  <div>
                    <h2 className="text-3xl font-bold mb-4">
                      O que são as Girinhas?

                    </h2>
                    <p className="text-lg mb-6 text-muted-foreground">
                      Girinhas são nossa moeda virtual interna.{" "}
                      <strong>1 Girinha = R$ 1,00</strong> em valor de
                      referência. Você ganha Girinhas vendendo itens e usa para
                      "comprar" outros itens da comunidade.
                    </p>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <ChevronRight className="h-5 w-5 text-primary" />
                        <span>Compre Girinhas ou ganhe vendendo itens</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <ChevronRight className="h-5 w-5 text-primary" />
                        <span>Use para reservar itens que precisa</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <ChevronRight className="h-5 w-5 text-primary" />
                        <span>Sistema seguro e transparente</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="bg-primary/20 rounded-full w-64 h-64 mx-auto flex items-center justify-center">
                      <img
                        src="/girinha_sem_fundo.png"
                        alt="Girinha"
                        className="w-28 h-28 object-contain mx-auto"
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </section>

          {/* Como obter Girinhas? */}
          <section className="mb-20">
            <Card className="bg-blue-50">
              <CardContent className="p-8">
                <div className="grid md:grid-cols-2 gap-8 items-center">
                  <div className="text-center">
                    <div className="bg-primary/20 rounded-full w-64 h-64 mx-auto flex items-center justify-center text-6xl">
                      <img
                        src="/girinha_sem_fundo.png"
                        alt="Girinha"
                        className="w-28 h-28 object-contain mx-auto"
                      />
                    </div>
                  </div>
                  <div>
                    <h2 className="text-3xl font-bold mb-4">
                      Como obter Girinhas?
                    </h2>
                    <p className="text-lg mb-6 text-muted-foreground">
                      Você pode ganhar Girinhas de várias formas, tornando sua
                      participação na GiraMãe ainda mais acessível e divertida.
                    </p>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <ChevronRight className="h-5 w-5 text-primary" />
                        <span>Ganhando vendendo itens</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <ChevronRight className="h-5 w-5 text-primary" />
                        <span>Ganhando através das missões</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <ChevronRight className="h-5 w-5 text-primary" />
                        <span>Ganhando atraveś do Bônus Diário</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <ChevronRight className="h-5 w-5 text-primary" />
                        <span>Indicando e Avaliando outras Mães</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <ChevronRight className="h-5 w-5 text-primary" />
                        <span>Comprando dentro da plataforma</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </section>

          {/* Como Funciona - Steps */}
          {/* <section className="mb-20">
            <h2 className="text-3xl font-bold text-center mb-12">
              4 Passos Simples para Começar
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {steps.map((step, index) => (
                <Card
                  key={index}
                  className="relative group hover:shadow-lg transition-all duration-300 border-2 hover:border-primary/20"
                >
                  <CardContent className="p-6 text-center">
                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                      <div className="bg-primary text-primary-foreground w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm">
                        {step.number}
                      </div>
                    </div>
                    <div className="text-primary mb-4 flex justify-center mt-4">
                      {step.icon}
                    </div>
                    <h3 className="text-xl font-semibold mb-3">{step.title}</h3>
                    <p className="text-muted-foreground">{step.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section> */}

          {/* Fluxo Detalhado de Aquisição */}
          <section className="mb-24">
            <div className="text-center mb-16 space-y-4">
              <h2 className="text-4xl font-black text-foreground tracking-tight">O Ciclo de uma <span className="text-glow text-primary italic">Troca</span></h2>
              <p className="text-lg font-medium text-foreground/40 max-w-2xl mx-auto leading-relaxed">
                Acompanhe o passo a passo seguro desde o garimpo até a entrega final.
              </p>
            </div>

            <div className="max-w-4xl mx-auto space-y-10">
              {/* Step 1: Descoberta */}
              <div className="premium-card bg-white/70 backdrop-blur-xl border-blue-500/10 rounded-[2.5rem] p-8 md:p-10 shadow-xl border-l-8 border-l-blue-500 relative transition-all duration-500 hover:translate-x-1">
                <div className="flex items-start gap-6">
                  <div className="bg-blue-500 text-white rounded-2xl w-12 h-12 flex items-center justify-center font-black text-xl shadow-lg shadow-blue-500/20 shrink-0">1</div>
                  <div className="space-y-6">
                    <h3 className="text-2xl font-black text-blue-600 tracking-tight">Garimpo & Descoberta</h3>
                    <div className="grid md:grid-cols-2 gap-8">
                      <div className="space-y-4">
                        <h4 className="text-[10px] font-bold text-blue-700/40 uppercase tracking-[0.2em]">Onde Buscar</h4>
                        <ul className="space-y-3">
                          {["Feed de oportunidades", "Filtros inteligentes", "Busca por categorias", "Mães que você segue"].map((t, i) => (
                            <li key={i} className="flex items-center gap-3 text-sm font-bold text-foreground/60">
                              <div className="w-1.5 h-1.5 rounded-full bg-blue-500/30" /> {t}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div className="space-y-4">
                        <h4 className="text-[10px] font-bold text-blue-700/40 uppercase tracking-[0.2em]">O que Analisar</h4>
                        <ul className="space-y-3">
                          {["Fotos reais do item", "Valor em Girinhas", "Reputação da mãe", "Status de reserva"].map((t, i) => (
                            <li key={i} className="flex items-center gap-3 text-sm font-bold text-foreground/60">
                              <div className="w-1.5 h-1.5 rounded-full bg-blue-500/30" /> {t}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Step 3: Reserva e Código */}
              <div className="premium-card bg-white/70 backdrop-blur-xl border-purple-500/10 rounded-[2.5rem] p-8 md:p-10 shadow-xl border-l-8 border-l-purple-500 relative transition-all duration-500 hover:translate-x-1">
                <div className="flex items-start gap-6">
                  <div className="bg-purple-500 text-white rounded-2xl w-12 h-12 flex items-center justify-center font-black text-xl shadow-lg shadow-purple-500/20 shrink-0">2</div>
                  <div className="space-y-6 flex-1">
                    <h3 className="text-2xl font-black text-purple-600 tracking-tight">Reserva & Código de Segurança</h3>
                    <div className="space-y-6">
                      <div className="bg-purple-50/50 rounded-3xl p-6 border border-purple-100/50">
                        <p className="text-sm font-bold text-purple-900/60 leading-relaxed">
                          Ao reservar, suas Girinhas ficam protegidas pelo sistema e um <span className="text-purple-600">Código Único de 6 dígitos</span> é gerado instantaneamente.
                        </p>
                      </div>

                      <div className="bg-white/80 rounded-[2rem] p-8 border border-purple-100 shadow-inner text-center space-y-4">
                        <span className="text-[10px] font-bold text-purple-400 uppercase tracking-widest">Exemplo de Código</span>
                        <div className="text-4xl font-black text-purple-600 tracking-[0.3em]">ABC123</div>
                        <p className="text-xs font-bold text-foreground/30 uppercase tracking-tight">Este código é sua garantia de troca</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Step 5: Entrega e Código */}
              <div className="premium-card bg-white/70 backdrop-blur-xl border-emerald-500/10 rounded-[2.5rem] p-8 md:p-10 shadow-xl border-l-8 border-l-emerald-500 relative transition-all duration-500 hover:translate-x-1">
                <div className="flex items-start gap-6">
                  <div className="bg-emerald-500 text-white rounded-2xl w-12 h-12 flex items-center justify-center font-black text-xl shadow-lg shadow-emerald-500/20 shrink-0">3</div>
                  <div className="space-y-8 flex-1">
                    <h3 className="text-2xl font-black text-emerald-600 tracking-tight">Encontro & Validação</h3>

                    <div className="grid md:grid-cols-2 gap-8">
                      <div className="space-y-4 p-6 bg-emerald-50/30 rounded-3xl border border-emerald-100/50">
                        <h4 className="text-emerald-900 font-black text-sm">Na hora do encontro</h4>
                        <ul className="space-y-2">
                          {["Confira o estado do item", "Veja se o tamanho serve", "Valide a qualidade"].map((t, i) => (
                            <li key={i} className="flex items-center gap-2 text-xs font-bold text-emerald-800/60">
                              <div className="w-1 h-1 rounded-full bg-emerald-400" /> {t}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div className="space-y-4 p-6 bg-primary/5 rounded-3xl border border-primary/10">
                        <h4 className="text-primary font-black text-sm">Liberação de Pontos</h4>
                        <p className="text-xs font-bold text-primary/60 leading-relaxed leading-relaxed">
                          Mostre seu código para a vendedora. Assim que ela digitar no app dela, os pontos são transferidos na hora!
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* FAQ & Suporte */}
          <section className="mb-24">
            <div className="premium-card bg-red-50/30 backdrop-blur-xl border-red-200/50 rounded-[2.5rem] p-12 shadow-xl border relative overflow-hidden group text-center">
              <div className="absolute inset-0 bg-gradient-to-br from-red-500/5 via-transparent to-transparent opacity-50" />
              <div className="relative z-10 space-y-6">
                <div className="w-16 h-16 bg-red-500/10 rounded-2xl flex items-center justify-center text-red-600 mx-auto mb-6">
                  <ShieldCheck className="w-8 h-8" />
                </div>
                <h2 className="text-3xl font-black text-red-900 tracking-tight">Segurança em <span className="text-glow text-red-600 italic">Primeiro Lugar</span></h2>
                <p className="text-lg font-medium text-red-800/60 max-w-2xl mx-auto leading-relaxed">
                  Nosso sistema de códigos garante que os pontos só sejam liberados quando o produto estiver em suas mãos. Transparência total para quem vende e para quem compra.
                </p>
                <div className="pt-6">
                  <a href="/faq" className="text-red-600 font-bold hover:underline">Alguma dúvida técnica? Visite nosso FAQ</a>
                </div>
              </div>
            </div>
          </section>

          {/* CTA Final */}
          <section className="pb-12">
            <div className="premium-card bg-primary text-white rounded-[3rem] p-16 text-center relative overflow-hidden group shadow-2xl shadow-primary/20">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.2),transparent_70%)]" />
              <div className="relative z-10 space-y-10">
                <div className="space-y-4">
                  <h2 className="text-5xl md:text-6xl font-black tracking-tight leading-tight">
                    Pronta para <br />
                    <span className="italic opacity-80">Começar?</span>
                  </h2>
                  <p className="text-xl font-medium opacity-70 max-w-xl mx-auto">
                    Junte-se a milhares de mães que já estão transformando desapegos em novas histórias.
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row gap-6 justify-center">
                  <Button
                    asChild
                    size="lg"
                    className="founders-button bg-white text-primary hover:bg-white/90 px-12 h-16 rounded-full text-lg shadow-2xl shadow-black/10"
                  >
                    <a href="/auth">Cadastrar Grátis</a>
                  </Button>
                  <Button
                    asChild
                    variant="outline"
                    size="lg"
                    className="border-white/20 text-white hover:bg-white/10 px-12 h-16 rounded-full text-lg"
                  >
                    <a href="/faq">Tirar Dúvidas</a>
                  </Button>
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>

      <QuickNav />
      <Footer />
    </div>
  );
};

export default ComoFunciona;
