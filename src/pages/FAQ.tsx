import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  HelpCircle,
  MessageCircle,
  Shield,
  CreditCard,
  Recycle,
  Users,
} from "lucide-react";
import SEOHead from "@/components/seo/SEOHead";
import Header from "@/components/shared/Header";
import Footer from "@/components/shared/Footer";
import QuickNav from "@/components/shared/QuickNav";

const FAQ = () => {
  const faqCategories = [
    {
      title: "Como Funciona",
      icon: <HelpCircle className="h-5 w-5" />,
      questions: [
        {
          question: "Como funciona a GiraMãe?",
          answer:
            "A GiraMãe é uma plataforma onde mães trocam roupas, brinquedos e calçados infantis usando nossa moeda virtual chamada Girinhas. Você publica itens que não usa mais, define um preço em Girinhas, e usa essas Girinhas para 'comprar' outros itens da comunidade.",
        },
        {
          question: "O que são Girinhas?",
          answer:
            "Girinhas são nossa moeda virtual interna. 1 Girinha equivale a R$ 1,00 em valor de referência. Você pode ganhar Girinhas vendendo seus itens ou comprá-las diretamente na plataforma.",
        },
        {
          question: "Como faço minha primeira troca?",
          answer:
            "1) Cadastre-se gratuitamente; 2) Publique alguns itens para ganhar suas primeiras Girinhas; 3) Navegue pelos itens disponíveis; 4) Reserve o item que deseja; 5) Combine a entrega com a vendedora; 6) Confirme o recebimento. Pronto!",
        },
        {
          question: "Preciso pagar alguma taxa?",
          answer:
            "Sim, cobramos uma pequena taxa de 5% sobre o valor do item no momento da troca. Esta taxa ajuda a manter a plataforma funcionando e segura para todas as mães.",
        },
      ],
    },
    {
      title: "Acesso e Inclusão",
      icon: <HelpCircle className="h-5 w-5" />,
      questions: [
        {
          question: "Preciso pagar para usar a plataforma?",
          answer:
            "Não! A GiraMãe é 100% gratuita. Você pode ganhar Girinhas de várias formas sem gastar dinheiro: bônus diário, completando missões simples, indicando amigas e oferecendo itens para troca.",
        },
        {
          question: "E se eu não tenho itens para oferecer no início?",
          answer:
            "Sem problemas! Você ganha Girinhas automaticamente: 5 por dia só de acessar, mais bônus por completar seu perfil e outras ações simples. Em poucos dias você já tem créditos para suas primeiras trocas.",
        },
        {
          question: "Como vocês garantem que é justo para todos?",
          answer:
            "Nosso sistema de reputação e o fato de ser gratuito criam um ambiente colaborativo. Todos começam com as mesmas oportunidades de ganhar Girinhas e participar da comunidade.",
        },
        {
          question: "Como a plataforma se mantém sendo gratuita?",
          answer:
            "Estamos na fase inicial focando em criar uma comunidade forte. Nossa sustentabilidade virá de parcerias com o poder público e iniciativa privada, sempre mantendo o uso gratuito para as mães.",
        },
        {
          question: "A plataforma pode ajudar instituições sociais?",
          answer:
            "Estamos desenvolvendo formas de parceria com escolas, creches e programas sociais de Canoas. Entre em contato através do parcerias@giramae.com.br para conversar sobre possibilidades.",
        },
      ],
    },
    {
      title: "Segurança",
      icon: <Shield className="h-5 w-5" />,
      questions: [
        {
          question: "A plataforma é segura?",
          answer:
            "Sim! Usamos sistema de códigos de confirmação para garantir que as trocas aconteçam corretamente. Além disso, as Girinhas ficam bloqueadas durante a reserva, garantindo segurança para vendedora e compradora.",
        },
        {
          question: "E se eu não receber o item?",
          answer:
            "Se houver algum problema na entrega, você pode cancelar a reserva e suas Girinhas serão devolvidas automaticamente. Nossa equipe também está disponível para mediar qualquer questão.",
        },
        {
          question: "Como funciona o código de confirmação?",
          answer:
            "Quando você reserva um item, geramos um código único. Após receber o item, você compartilha este código com a vendedora, que confirma a entrega na plataforma. Só então as Girinhas são transferidas.",
        },
        {
          question: "Posso confiar nas outras mães?",
          answer:
            "Sim! Nossa comunidade é baseada na confiança mútua entre mães. Temos sistema de avaliações e nossa equipe monitora a plataforma para garantir um ambiente seguro e respeitoso.",
        },
      ],
    },
    {
      title: "Girinhas e Pagamentos",
      icon: <CreditCard className="h-5 w-5" />,
      questions: [
        {
          question: "Como comprar Girinhas?",
          answer:
            "Você pode comprar Girinhas diretamente na plataforma usando cartão de crédito, débito ou PIX através do Mercado Pago. O processo é rápido e seguro.",
        },
        {
          question: "As Girinhas vencem?",
          answer:
            "Sim, as Girinhas têm validade de 12 meses a partir da data de aquisição. Você pode renovar a validade pagando uma pequena taxa antes do vencimento.",
        },
        {
          question: "Posso transferir Girinhas para outra mãe?",
          answer:
            "Sim! Temos a função de transferência P2P onde você pode enviar Girinhas diretamente para outra usuária. É cobrada uma pequena taxa de 1% na transferência.",
        },
        {
          question: "Qual o valor mínimo e máximo para comprar Girinhas?",
          answer:
            "O valor mínimo é de 10 Girinhas (R$ 10,00) e o máximo é de 999.000 Girinhas por compra. Você pode fazer quantas compras quiser.",
        },
      ],
    },
    {
      title: "Itens e Trocas",
      icon: <Recycle className="h-5 w-5" />,
      questions: [
        {
          question: "Que tipos de itens posso trocar?",
          answer:
            "Você pode trocar roupas, calçados, brinquedos e acessórios infantis. Os itens devem estar em bom estado de conservação e adequados para crianças.",
        },
        {
          question: "Como defino o preço do meu item?",
          answer:
            "Você pode definir livremente o preço em Girinhas baseado no estado de conservação, marca e valor original do item. Nossa comunidade é bem consciente sobre preços justos.",
        },
        {
          question: "Posso cancelar uma venda?",
          answer:
            "Sim, você pode cancelar uma reserva até o momento da confirmação de entrega. As Girinhas serão devolvidas automaticamente para a compradora.",
        },
        {
          question: "E se o item tiver defeito que não foi informado?",
          answer:
            "Nossa comunidade preza pela transparência. Se houver algum problema não informado, entre em contato conosco que mediamos a situação e, se necessário, estornamos a transação.",
        },
      ],
    },
    {
      title: "Comunidade",
      icon: <Users className="h-5 w-5" />,
      questions: [
        {
          question: "Posso indicar outras mães?",
          answer:
            "Sim! Temos um sistema de indicações onde tanto você quanto a mãe indicada ganham bônus em Girinhas. É uma forma de fazer nossa comunidade crescer!",
        },
        {
          question: "Tem limite de quantos itens posso publicar?",
          answer:
            "Não há limite! Você pode publicar quantos itens quiser. Quanto mais ativa você for, mais Girinhas ganha e mais opções tem para trocar.",
        },
        {
          question: "Posso seguir outras mães?",
          answer:
            "Sim! Você pode seguir outras mães para ver quando elas publicam itens novos. É uma ótima forma de não perder nenhuma oportunidade de troca.",
        },
        {
          question: "Onde posso trocar experiências com outras mães?",
          answer:
            "Nossa comunidade é muito ativa! Você pode interagir através dos comentários nos itens e em breve teremos grupos de discussão.",
        },
      ],
    },
    {
      title: "Suporte Técnico",
      icon: <MessageCircle className="h-5 w-5" />,
      questions: [
        {
          question: "Esqueci minha senha, como faço?",
          answer:
            "Na tela de login, clique em 'Esqueci minha senha' e siga as instruções que enviaremos para seu e-mail.",
        },
        {
          question: "Não consigo fazer upload das fotos do item",
          answer:
            "Verifique se as fotos não são muito grandes (máximo 5MB cada). Se o problema persistir, tente usar outro navegador ou entre em contato conosco.",
        },
        {
          question: "O app funciona no celular?",
          answer:
            "Sim! Nossa plataforma é totalmente responsiva e funciona perfeitamente no navegador do celular. Em breve teremos um app nativo.",
        },
        {
          question: "Como atualizar meus dados pessoais?",
          answer:
            "Vá em 'Perfil' > 'Editar Perfil' e atualize suas informações. Lembre-se de salvar as alterações.",
        },
      ],
    },
  ];

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqCategories.flatMap((category) =>
      category.questions.map((faq) => ({
        "@type": "Question",
        name: faq.question,
        acceptedAnswer: {
          "@type": "Answer",
          text: faq.answer,
        },
      }))
    ),
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-25 to-blue-50 flex flex-col font-sans">
      <SEOHead
        title="FAQ - Perguntas Frequentes | GiraMãe"
        description="Tire suas dúvidas sobre a GiraMãe! Perguntas frequentes sobre trocas, Girinhas, segurança, pagamentos e como usar nossa plataforma de trocas sustentáveis."
        keywords="faq giramae, dúvidas girinhas, como funciona trocas, perguntas frequentes sustentabilidade, suporte giramae, ajuda trocas infantis"
        structuredData={structuredData}
      />

      <Header />

      <main className="flex-grow pt-32 pb-20">
        <div className="container mx-auto px-4 max-w-5xl">
          {/* Header */}
          <div className="text-center mb-24 space-y-6">
            <div className="flex justify-center">
              <Badge variant="outline" className="px-6 py-2 rounded-full border-primary/20 text-primary font-bold tracking-widest uppercase text-[10px] bg-white/50 backdrop-blur-md">
                Central de Ajuda
              </Badge>
            </div>
            <h1 className="text-5xl md:text-7xl font-black text-foreground tracking-tight leading-tight">
              Tire Todas as <br />
              <span className="text-glow text-primary italic">Suas Dúvidas</span>
            </h1>
            <p className="text-xl text-foreground/40 font-medium max-w-2xl mx-auto leading-relaxed">
              Aqui estão as respostas para as perguntas mais comuns. Não encontrou o que procura?{' '}
              <a href="/contato" className="text-primary hover:text-primary/70 transition-colors font-bold group">
                Entre em contato
              </a>
            </p>
          </div>

          {/* FAQ Categories */}
          <div className="max-w-4xl mx-auto space-y-12">
            {faqCategories.map((category, categoryIndex) => (
              <div key={categoryIndex} className="premium-card bg-white/70 backdrop-blur-xl border-primary/5 rounded-[2.5rem] shadow-2xl p-8 md:p-12 transition-all duration-500 hover:shadow-primary/5 border">
                <div className="flex items-center gap-6 mb-10 pb-6 border-b border-primary/5">
                  <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center text-primary">
                    {React.cloneElement(category.icon as React.ReactElement, { className: "w-7 h-7" })}
                  </div>
                  <h2 className="text-3xl font-black text-foreground tracking-tight">{category.title}</h2>
                </div>

                <Accordion type="single" collapsible className="space-y-4">
                  {category.questions.map((faq, faqIndex) => (
                    <AccordionItem
                      key={faqIndex}
                      value={`${categoryIndex}-${faqIndex}`}
                      className="border border-primary/5 rounded-[1.5rem] px-6 bg-white/30 backdrop-blur-sm hover:bg-white/50 transition-colors"
                    >
                      <AccordionTrigger className="text-left py-6 hover:no-underline group">
                        <span className="font-bold text-foreground/80 group-hover:text-primary transition-colors pr-4">{faq.question}</span>
                      </AccordionTrigger>
                      <AccordionContent className="text-foreground/50 font-medium leading-relaxed pb-6">
                        {faq.answer}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </div>
            ))}
          </div>

          {/* CTA Section */}
          <section className="mt-24">
            <div className="premium-card bg-primary/5 backdrop-blur-xl border-primary/10 rounded-[2.5rem] p-12 text-center relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-50" />
              <div className="relative z-10 space-y-6">
                <h2 className="text-4xl font-black text-foreground tracking-tight">Ainda tem <span className="text-glow text-primary italic">Dúvidas?</span></h2>
                <p className="text-lg font-medium text-foreground/40 max-w-2xl mx-auto leading-relaxed">
                  Nossa equipe de suporte está sempre pronta para ajudar você em sua jornada de empreendedorismo materno.
                </p>
                <div className="flex flex-col sm:flex-row gap-6 justify-center pt-4">
                  <Button
                    asChild
                    size="lg"
                    className="founders-button text-white px-12 h-14 rounded-full shadow-xl shadow-primary/20"
                  >
                    <a href="/contato">Falar Conosco</a>
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

export default FAQ;
