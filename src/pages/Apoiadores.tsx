import React from "react";
import Header from "@/components/shared/Header";
import QuickNav from "@/components/shared/QuickNav";
import Footer from "@/components/shared/Footer";
import SEOHead from "@/components/seo/SEOHead";
import { pageTitle } from "@/lib/pageTitle";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { apoiadores, ApoiadorTier } from "@/data/apoiadores";
import { ExternalLink, Building2, BicepsFlexed } from "lucide-react";
import { Link } from "react-router-dom";

const tierLabel: Record<ApoiadorTier, string> = {
  principal: "Apoiador Principal",
  ouro: "Apoiador Ouro",
  prata: "Apoiador Prata",
  apoio: "Apoiador",
};

const tierOrder: ApoiadorTier[] = ["principal", "ouro", "prata", "apoio"];

const tierBadgeVariant: Record<
  ApoiadorTier,
  "default" | "secondary" | "outline"
> = {
  principal: "default",
  ouro: "secondary",
  prata: "outline",
  apoio: "outline",
};

const Apoiadores = () => {
  const apoiadoresPorTier = new Map<ApoiadorTier, typeof apoiadores>();
  for (const tier of tierOrder) apoiadoresPorTier.set(tier, []);
  for (const item of apoiadores) {
    const bucket = apoiadoresPorTier.get(item.tier) || [];
    bucket.push(item);
    apoiadoresPorTier.set(item.tier, bucket);
  }

  const totalApoiadores = apoiadores.length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-25 to-blue-50 font-sans">
      <SEOHead
        title={pageTitle.apoiadores()}
        description="Conheça as empresas que apoiam o GiraMãe e ajudam a sustentar o impacto social da plataforma."
        keywords="apoiadores, patrocinadores, empresas, impacto social, giramãe"
      />
      <Header />

      <main className="container flex flex-col items-center justify-center mx-auto pt-32 pb-24 px-4 w-full max-w-[1600px]">
        <div className="mb-12 flex flex-col items-center text-center w-full space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-1 bg-white/40 backdrop-blur-xl border border-white/60 rounded-full text-[10px] font-black uppercase tracking-widest text-primary shadow-sm">
            <BicepsFlexed className="w-4 h-4" /> Apoiadores
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-foreground tracking-tight flex items-center justify-center gap-3 w-full">
            Empresas que fazem{" "}
            <span className="text-glow text-primary italic">parte</span>
          </h1>
          <p className="text-foreground/40 font-medium max-w-2xl mx-auto leading-relaxed">
            Apoiadores ajudam o GiraMãe a crescer com sustentabilidade — e, em
            troca, a marca ganha visibilidade dentro da plataforma.
          </p>

          <div className="flex items-center justify-center gap-8 pt-6">
            <div className="text-center">
              <p className="text-4xl font-black text-foreground tracking-tighter">
                {totalApoiadores}
              </p>
              <p className="text-[10px] font-black text-foreground/30 uppercase tracking-widest">
                Empresas
              </p>
            </div>
            <div className="w-px h-12 bg-primary/10" />
            <div className="text-center">
              <p className="text-4xl font-black text-primary tracking-tighter">
                + impacto
              </p>
              <p className="text-[10px] font-black text-foreground/30 uppercase tracking-widest">
                na comunidade
              </p>
            </div>
          </div>
        </div>

        <div className="w-full max-w-6xl space-y-6">
          {totalApoiadores === 0 ? (
            <Card className="premium-card rounded-[2.5rem] border border-white/60 bg-white/40">
              <CardContent className="p-10 text-center space-y-6">
                <div className="w-16 h-16 rounded-3xl bg-white/60 border border-white/60 flex items-center justify-center mx-auto">
                  <Building2 className="w-8 h-8 text-foreground/40" />
                </div>
                <div className="space-y-2">
                  <h2 className="text-2xl font-black text-foreground tracking-tight">
                    Sua empresa pode ser a primeira
                  </h2>
                  <p className="text-foreground/50 font-medium max-w-xl mx-auto">
                    Estamos abrindo espaço para apoiadores com contrapartidas de
                    visibilidade e impacto. Fale com a gente e vamos construir
                    essa parceria.
                  </p>
                </div>
                <Button
                  asChild
                  className="founders-button px-10 h-12 text-white text-xs font-black uppercase tracking-widest rounded-2xl shadow-lg shadow-primary/20"
                >
                  <Link to="/contato">
                    <BicepsFlexed className="w-4 h-4 mr-2" />
                    Quero apoiar
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-6">
              {tierOrder.map((tier) => {
                const items = apoiadoresPorTier.get(tier) || [];
                if (items.length === 0) return null;

                return (
                  <Card
                    key={tier}
                    className="premium-card rounded-[2.5rem] border border-white/60 bg-white/40"
                  >
                    <CardHeader className="pb-4">
                      <CardTitle className="flex items-center gap-3 font-black tracking-tight text-foreground">
                        <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0">
                          <BicepsFlexed className="w-5 h-5 text-primary" />
                        </div>
                        <span>{tierLabel[tier]}</span>
                        <Badge
                          variant={tierBadgeVariant[tier]}
                          className="ml-auto rounded-full"
                        >
                          {items.length}
                        </Badge>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {items.map((apoiador) => (
                          <Card
                            key={apoiador.id}
                            className="premium-card bg-white/40 border border-white/60 rounded-[2rem] hover:bg-white/60 transition-all"
                          >
                            <CardContent className="p-6 space-y-4">
                              <div className="flex items-center gap-4">
                                <div className="relative w-20 h-20 shrink-0">
                                  <div className="absolute inset-0 rounded-full bg-gradient-to-br from-pink-500 via-purple-500 to-yellow-400 p-[2px]">
                                    <div className="w-full h-full rounded-full bg-white/80 flex items-center justify-center overflow-hidden">
                                      {apoiador.logoUrl ? (
                                        <img
                                          src={apoiador.logoUrl}
                                          alt={apoiador.nome}
                                          className="w-full h-full object-cover"
                                          loading="lazy"
                                        />
                                      ) : (
                                        <span className="text-sm font-black text-foreground/40">
                                          {apoiador.nome
                                            .slice(0, 2)
                                            .toUpperCase()}
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                </div>

                                <div className="min-w-0 space-y-1">
                                  <p className="font-black text-foreground tracking-tight truncate">
                                    {apoiador.nome}
                                  </p>
                                  {apoiador.categoria && (
                                    <p className="text-[10px] font-black uppercase tracking-widest text-foreground/30 truncate">
                                      {apoiador.categoria}
                                    </p>
                                  )}
                                </div>
                              </div>

                              {apoiador.descricao && (
                                <p className="text-sm font-medium text-foreground/50 leading-relaxed line-clamp-3">
                                  {apoiador.descricao}
                                </p>
                              )}

                              <div className="flex items-center justify-between gap-3">
                                <Badge
                                  variant="outline"
                                  className="rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-widest"
                                >
                                  {tierLabel[tier]}
                                </Badge>

                                {apoiador.websiteUrl ? (
                                  <Button
                                    asChild
                                    variant="outline"
                                    className="rounded-2xl"
                                  >
                                    <a
                                      href={apoiador.websiteUrl}
                                      target="_blank"
                                      rel="noreferrer"
                                    >
                                      <ExternalLink className="w-4 h-4 mr-2" />
                                      Visitar
                                    </a>
                                  </Button>
                                ) : null}
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}

          <Card className="premium-card rounded-[2.5rem] bg-gradient-to-r from-purple-50/60 to-pink-50/60 border border-white/60">
            <CardContent className="p-8 flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="space-y-2 text-center md:text-left">
                <p className="text-[10px] font-black text-primary uppercase tracking-widest">
                  Visibilidade + Impacto
                </p>
                <h3 className="text-2xl font-black text-foreground tracking-tight">
                  Sua marca dentro do GiraMãe
                </h3>
                <p className="text-foreground/50 font-medium max-w-2xl">
                  Criamos espaços para apoiadores aparecerem com logo, descrição
                  e link. Quer entrar nessa lista?
                </p>
              </div>
              <Button
                asChild
                className="founders-button px-10 h-12 text-white text-xs font-black uppercase tracking-widest rounded-2xl shadow-lg shadow-primary/20"
              >
                <Link to="/contato">
                  <BicepsFlexed className="w-4 h-4 mr-2" />
                  Seja apoiador
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>

      <QuickNav />
      <Footer />
    </div>
  );
};

export default Apoiadores;
