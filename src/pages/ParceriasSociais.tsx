import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Building2, Plus, ChevronRight, Users, GraduationCap, Heart, FileText } from 'lucide-react';
import { useParceriasSociais, Organizacao, Programa } from '@/hooks/parcerias/useParceriasSociais';
import { Link } from 'react-router-dom';
import { Skeleton } from '@/components/ui/skeleton';
import SEOHead from '@/components/seo/SEOHead';
import Header from '@/components/shared/Header';
import Footer from '@/components/shared/Footer';
import QuickNav from '@/components/shared/QuickNav';
import { pageTitle } from '@/lib/pageTitle';

const getIcon = (iconName: string) => {
  switch (iconName) {
    case 'Users': return Users;
    case 'GraduationCap': return GraduationCap;
    case 'Heart': return Heart;
    default: return FileText;
  }
};

export default function ParceriasSociais() {
  const { organizacoes, loading, error } = useParceriasSociais();

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-25 to-blue-50 font-sans">
      <SEOHead
        title={pageTitle.parcerias()}
        description="Comprove sua participação em programas sociais e receba benefícios em Girinhas"
        keywords="parcerias sociais, programas sociais, cadastro único, benefícios, girinhas"
      />
      <Header />

      <main className="container flex flex-col items-center justify-center mx-auto pt-32 pb-24 px-4 w-full max-w-[1600px]">
        <div className="mb-12 flex flex-col items-center text-center w-full space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-1 bg-white/40 backdrop-blur-xl border border-white/60 rounded-full text-[10px] font-black uppercase tracking-widest text-primary shadow-sm">
            <Building2 className="w-4 h-4" /> Parcerias
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-foreground tracking-tight flex items-center justify-center gap-3 w-full">
            Parcerias <span className="text-glow text-primary italic">sociais</span>
          </h1>
          <p className="text-foreground/40 font-medium max-w-2xl mx-auto leading-relaxed">
            Comprove sua participação em programas sociais e receba benefícios em Girinhas.
          </p>
        </div>

        <div className="w-full max-w-6xl space-y-6">
          {!loading && error && (
            <Card className="premium-card rounded-[2.5rem] border border-red-500/20 bg-red-50/40">
              <CardContent className="pt-6">
                <p className="text-red-600 text-center font-medium">{error}</p>
              </CardContent>
            </Card>
          )}

          {!loading && !error && (
            <>
              {/* Lista de Organizações */}
              <div className="space-y-6">
                {organizacoes.map((org) => (
                  <Card key={org.id} className="premium-card rounded-[2.5rem] border border-white/60 bg-white/40">
                    <CardHeader>
                      <div className="flex items-center gap-4">
                        {org.logo_url && (
                          <img
                            src={org.logo_url}
                            alt={org.nome}
                            className="w-12 h-12 rounded-2xl object-cover border border-white/60 bg-white/60"
                          />
                        )}
                        <div>
                          <CardTitle className="text-xl font-black tracking-tight">{org.nome}</CardTitle>
                          <p className="text-sm text-foreground/50 font-medium">
                            {org.tipo} • {org.cidade}, {org.estado}
                          </p>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {org.programas.map((programa) => (
                          <ProgramaCard key={programa.id} programa={programa} organizacao={org} />
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Call to Action */}
              <Card className="premium-card rounded-[2.5rem] bg-gradient-to-r from-blue-50/60 to-green-50/50 border border-white/60">
                <CardContent className="p-6 text-center">
                  <h3 className="text-lg font-black mb-2 text-foreground">Não encontrou sua organização?</h3>
                  <p className="text-foreground/50 font-medium mb-4">
                    Entre em contato conosco para incluir sua instituição nas parcerias.
                  </p>
                  <Button asChild className="founders-button px-8 h-12 text-white text-xs font-black uppercase tracking-widest rounded-2xl shadow-lg shadow-primary/20">
                    <Link to="/contato">
                      <Plus className="w-4 h-4 mr-2" />
                      Solicitar Nova Parceria
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            </>
          )}

          {loading && (
            <div className="space-y-6">
              <Skeleton className="h-40 w-full rounded-[2.5rem]" />
              <Skeleton className="h-72 w-full rounded-[2.5rem]" />
              <Skeleton className="h-72 w-full rounded-[2.5rem]" />
            </div>
          )}
        </div>
      </main>

      <QuickNav />
      <Footer />
    </div>
  );
}

interface ProgramaCardProps {
  programa: Programa;
  organizacao: Organizacao;
}

function ProgramaCard({ programa, organizacao }: ProgramaCardProps) {
  const IconComponent = getIcon(programa.icone);

  const getStatusBadge = () => {
    switch (programa.status_usuario) {
      case 'aprovado':
        return <Badge className="bg-green-600 hover:bg-green-700">✅ Ativo</Badge>;
      case 'pendente':
        return <Badge variant="secondary">⏳ Em análise</Badge>;
      case 'rejeitado':
        return <Badge variant="destructive">❌ Rejeitado</Badge>;
      default:
        return <Badge variant="outline">📝 Disponível</Badge>;
    }
  };

  return (
    <Card
      className="premium-card bg-white/40 border border-white/60 rounded-[2rem] hover:bg-white/60 transition-all cursor-pointer group"
      style={{ borderColor: programa.cor_tema + '25' }}
    >
      <CardContent className="p-5">
        <div className="space-y-3">
          <div className="flex items-start justify-between">
            <div className="space-y-1 flex-1">
              <div className="flex items-center gap-2">
                <IconComponent className="w-4 h-4" style={{ color: programa.cor_tema }} />
                <h4 className="font-black text-sm tracking-tight">{programa.nome}</h4>
              </div>
              <p className="text-xs text-muted-foreground line-clamp-2">
                {programa.descricao}
              </p>
            </div>
            {getStatusBadge()}
          </div>
          
          <div className="flex items-center justify-between">
            <div className="text-sm">
              <span className="text-muted-foreground">Benefício: </span>
              <span className="font-black" style={{ color: programa.cor_tema }}>
                {programa.valor_mensal} Girinhas/mês
              </span>
            </div>
            
            <Button 
              size="sm" 
              asChild
              className="rounded-2xl group-hover:scale-105 transition-transform"
              style={{ backgroundColor: programa.cor_tema }}
            >
              <Link to={`/parcerias/${organizacao.codigo}/${programa.codigo}`}>
                <ChevronRight className="w-4 h-4" />
              </Link>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
