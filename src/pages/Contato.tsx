import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Mail, MessageCircle, MapPin, Clock, Phone, Send } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import SEOHead from "@/components/seo/SEOHead";
import Header from "@/components/shared/Header";
import Footer from "@/components/shared/Footer";
import QuickNav from "@/components/shared/QuickNav";
import { Link } from "react-router-dom";

const Contato = () => {
  const [formData, setFormData] = useState({
    nome: "",
    email: "",
    assunto: "",
    mensagem: "",
  });
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Cria o link do WhatsApp com mensagem pré-preenchida
    const numeroWhatsApp = "555198311780"; // substitua pelo número de atendimento com código do país e DDD
    const texto = `Olá! Meu nome é ${formData.nome}. Assunto: ${formData.assunto}. Mensagem: ${formData.mensagem}`;
    const link = `https://api.whatsapp.com/send?phone=${numeroWhatsApp}&text=${encodeURIComponent(
      texto
    )}`;

    // Abre o WhatsApp em nova aba
    window.open(link, "_blank");

    toast({
      title: "Mensagem iniciada no WhatsApp! 💕",
      description:
        "Você será direcionada para o WhatsApp para finalizar o envio.",
    });

    setFormData({ nome: "", email: "", assunto: "", mensagem: "" });
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "ContactPage",
    name: "Contato - GiraMãe",
    description: "Entre em contato com a GiraMãe. Estamos aqui para ajudar você a aproveitar ao máximo nossa plataforma de trocas sustentáveis.",
    url: "https://giramae.com.br/contato",
    mainEntity: {
      "@type": "Organization",
      name: "GiraMãe",
      contactPoint: [
        {
          "@type": "ContactPoint",
          contactType: "Atendimento ao Cliente",
          email: "atendimento@giramae.com.br",
          availableLanguage: "Portuguese",
          areaServed: "BR-RS",
          hoursAvailable: [
            {
              "@type": "OpeningHoursSpecification",
              dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
              opens: "09:00",
              closes: "18:00"
            },
            {
              "@type": "OpeningHoursSpecification", 
              dayOfWeek: "Saturday",
              opens: "09:00",
              closes: "14:00"
            }
          ]
        }
      ],
      address: {
        "@type": "PostalAddress",
        addressLocality: "Canoas",
        addressRegion: "RS", 
        addressCountry: "BR"
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-25 to-blue-50 font-sans">
      <SEOHead
        title="Contato - GiraMãe | Fale Conosco"
        description="Entre em contato com a GiraMãe! Dúvidas sobre trocas, suporte técnico ou sugestões. Estamos aqui para ajudar nossa comunidade de mães em Canoas/RS."
        keywords="contato giramae, suporte giramae, fale conosco, dúvidas trocas infantis, atendimento mães, canoas rs contato"
        structuredData={structuredData}
      />
      
      <Header />
      <main className="container flex flex-col items-center justify-center mx-auto pt-32 pb-24 px-4 w-full max-w-[1600px]">
        <div className="w-full max-w-6xl">
          <div className="mb-12 flex flex-col items-center text-center w-full space-y-4">
            <div className="inline-flex items-center gap-2 px-4 py-1 bg-white/40 backdrop-blur-xl border border-white/60 rounded-full text-[10px] font-black uppercase tracking-widest text-primary shadow-sm">
              <Mail className="w-4 h-4" /> Fale Conosco
            </div>
            <h1 className="text-4xl md:text-5xl font-black text-foreground tracking-tight flex items-center justify-center gap-3 w-full">
              Estamos aqui <span className="text-glow text-primary italic">por você</span>
            </h1>
            <p className="text-foreground/40 font-medium max-w-2xl mx-auto leading-relaxed">
              Tem dúvidas sobre como funciona? Precisa de suporte? Quer dar uma sugestão? Nossa equipe está pronta para
              ajudar.
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {/* Formulário de Contato */}
            <div className="lg:col-span-2">
              <Card className="premium-card rounded-[2.5rem] border border-white/60 bg-white/40">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3 font-black tracking-tight text-foreground">
                    <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0">
                      <MessageCircle className="h-5 w-5 text-primary" />
                    </div>
                    <span>Envie sua Mensagem</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label htmlFor="nome" className="text-sm font-bold text-foreground/70">
                          Seu Nome *
                        </label>
                        <Input
                          id="nome"
                          name="nome"
                          value={formData.nome}
                          onChange={handleChange}
                          placeholder="Como você gostaria de ser chamada?"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <label htmlFor="email" className="text-sm font-bold text-foreground/70">
                          Seu E-mail *
                        </label>
                        <Input
                          id="email"
                          name="email"
                          type="email"
                          value={formData.email}
                          onChange={handleChange}
                          placeholder="seu@email.com"
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="assunto" className="text-sm font-bold text-foreground/70">
                        Assunto *
                      </label>
                      <Input
                        id="assunto"
                        name="assunto"
                        value={formData.assunto}
                        onChange={handleChange}
                        placeholder="Sobre o que você gostaria de falar?"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="mensagem" className="text-sm font-bold text-foreground/70">
                        Sua Mensagem *
                      </label>
                      <Textarea
                        id="mensagem"
                        name="mensagem"
                        value={formData.mensagem}
                        onChange={handleChange}
                        placeholder="Conte-nos como podemos ajudar você..."
                        rows={5}
                        required
                      />
                    </div>

                    <Button
                      type="submit"
                      className="founders-button w-full h-12 text-white text-xs font-black uppercase tracking-widest rounded-2xl shadow-lg shadow-primary/20"
                    >
                      <Send className="h-4 w-4 mr-2" />
                      Enviar Mensagem
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>

            {/* Informações de Contato */}
            <div className="space-y-6">
              {/* Meios de Contato */}
              <Card className="premium-card rounded-[2.5rem] border border-white/60 bg-white/40">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3 font-black tracking-tight text-foreground">
                    <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0">
                      <Mail className="h-5 w-5 text-primary" />
                    </div>
                    <span>Nossos Contatos</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-start gap-3">
                    <Mail className="h-5 w-5 text-primary mt-1" />
                    <div>
                      <p className="font-bold text-foreground/70">E-mail</p>
                      <p className="text-sm text-foreground/50 font-medium">
                        atendimento@giramae.com.br
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    
                    <img src="/whatsapp_logo.png" alt="whatsapp" className="h-5 w-5 mt-1" />
                    <div>
                      <p className="font-bold text-foreground/70">WhatsApp</p>
                      <p className="text-sm text-foreground/50 font-medium">
                        51 98101.1805
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <MapPin className="h-5 w-5 text-primary mt-1" />
                    <div>
                      <p className="font-bold text-foreground/70">Localização</p>
                      <p className="text-sm text-foreground/50 font-medium">
                        Canoas, Rio Grande do Sul
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Horário de Atendimento */}
              <Card className="premium-card rounded-[2.5rem] border border-white/60 bg-white/40">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3 font-black tracking-tight text-foreground">
                    <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0">
                      <Clock className="h-5 w-5 text-primary" />
                    </div>
                    <span>Horário de Atendimento</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-foreground/60 font-medium">Segunda a Sexta</span>
                      <span className="text-sm font-black text-foreground/70">9h às 18h</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-foreground/60 font-medium">Sábados</span>
                      <span className="text-sm font-black text-foreground/70">9h às 12h</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-foreground/60 font-medium">Domingos</span>
                      <span className="text-sm text-foreground/40 font-medium">
                        Fechado
                      </span>
                    </div>
                  </div>
                  <p className="text-xs text-foreground/40 font-medium mt-4">
                    Respondemos todas as mensagens em até 24 horas!
                  </p>
                </CardContent>
              </Card>

              {/* FAQ Rápido */}
              <Card className="premium-card rounded-[2.5rem] bg-gradient-to-br from-primary/5 to-primary/10 border border-white/60">
                <CardHeader>
                  <CardTitle className="text-lg font-black tracking-tight">Dúvidas Frequentes?</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-foreground/50 font-medium mb-4">
                    Antes de entrar em contato, que tal dar uma olhada nas
                    perguntas mais frequentes?
                  </p>
                  <Button asChild className="founders-button w-full h-12 text-white text-xs font-black uppercase tracking-widest rounded-2xl shadow-lg shadow-primary/20">
                    <Link to="/faq">Ver FAQ Completo</Link>
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Seção adicional - Como podemos ajudar */}
          <section className="mt-20">
            <h2 className="text-3xl font-black text-center mb-12 tracking-tight text-foreground">
              Como Podemos Ajudar Você?
            </h2>
            <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
              <Card className="premium-card rounded-[2.5rem] border border-white/60 bg-white/40 text-center hover:bg-white/60 transition-all">
                <CardContent className="p-6">
                  <div className="text-primary mb-4 flex justify-center">
                    <MessageCircle className="h-8 w-8" />
                  </div>
                  <h3 className="text-lg font-black mb-2 text-foreground tracking-tight">
                    Suporte Técnico
                  </h3>
                  <p className="text-sm text-foreground/50 font-medium">
                    Problemas para usar a plataforma? Estamos aqui para ajudar!
                  </p>
                </CardContent>
              </Card>

              <Card className="premium-card rounded-[2.5rem] border border-white/60 bg-white/40 text-center hover:bg-white/60 transition-all">
                <CardContent className="p-6">
                  <div className="text-primary mb-4 flex justify-center">
                    <Mail className="h-8 w-8" />
                  </div>
                  <h3 className="text-lg font-black mb-2 text-foreground tracking-tight">
                    Dúvidas sobre Trocas
                  </h3>
                  <p className="text-sm text-foreground/50 font-medium">
                    Como funciona? Como trocar? Tire todas as suas dúvidas
                    conosco.
                  </p>
                </CardContent>
              </Card>

              <Card className="premium-card rounded-[2.5rem] border border-white/60 bg-white/40 text-center hover:bg-white/60 transition-all">
                <CardContent className="p-6">
                  <div className="text-primary mb-4 flex justify-center">
                    <Phone className="h-8 w-8" />
                  </div>
                  <h3 className="text-lg font-black mb-2 text-foreground tracking-tight">Sugestões</h3>
                  <p className="text-sm text-foreground/50 font-medium">
                    Sua opinião é muito importante! Conte suas ideias para
                    melhorarmos.
                  </p>
                </CardContent>
              </Card>
            </div>
          </section>
        </div>
      </main>

      <QuickNav />
      <Footer />
    </div>
  );
};

export default Contato;
