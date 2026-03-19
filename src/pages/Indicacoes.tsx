import Header from "@/components/shared/Header";
import QuickNav from "@/components/shared/QuickNav";
import Footer from "@/components/shared/Footer";
import PaginaIndicacoes from "@/components/indicacoes/PaginaIndicacoes";
import SEOHead from "@/components/seo/SEOHead";
import { pageTitle } from "@/lib/pageTitle";
import { Users } from "lucide-react";

const Indicacoes = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-25 to-blue-50 font-sans">
      <SEOHead title={pageTitle.indicacoes()} />
      <Header />
      <main className="container flex flex-col items-center justify-center mx-auto pt-32 pb-24 px-4 w-full max-w-[1600px]">
        <div className="mb-12 flex flex-col items-center text-center w-full space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-1 bg-white/40 backdrop-blur-xl border border-white/60 rounded-full text-[10px] font-black uppercase tracking-widest text-primary shadow-sm">
            <Users className="w-4 h-4" /> Indicações
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-foreground tracking-tight flex items-center justify-center gap-3 w-full">
            Indique <span className="text-glow text-primary italic">amigas</span>
          </h1>
          <p className="text-foreground/40 font-medium max-w-2xl mx-auto leading-relaxed">
            Compartilhe seu link e ganhe Girinhas quando suas amigas se cadastrarem e começarem a usar a plataforma.
          </p>
        </div>

        <div className="w-full max-w-5xl">
          <PaginaIndicacoes />
        </div>
      </main>
      <QuickNav />
      <Footer />
    </div>
  );
};

export default Indicacoes;
