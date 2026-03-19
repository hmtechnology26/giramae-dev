
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Sparkles, Heart, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import Header from "@/components/shared/Header";
import CompraLivre from "@/components/girinhas/CompraLivre";
import { useMercadoPago } from "@/hooks/useMercadoPago";
import { analytics } from '@/lib/analytics';
import SEOHead from '@/components/seo/SEOHead';
import { pageTitle } from '@/lib/pageTitle';

const ComprarGirinhas = () => {
  const { verificarStatusPagamento } = useMercadoPago();

  useEffect(() => {
    // Verificar se há parâmetros de retorno do Mercado Pago
    verificarStatusPagamento();
  }, [verificarStatusPagamento]);

  return (
    <>
      <SEOHead 
        title={pageTitle.comprarGirinhas()}
        description="Compre Girinhas e comece a trocar itens infantis na comunidade GiraMãe"
        keywords="comprar girinhas, moeda virtual, troca de roupas infantis"
      />
      <div className="min-h-screen bg-background text-foreground flex flex-col pb-24 md:pb-8">
      <Header />
      
      <main className="flex-grow container mx-auto px-4 py-6">
        <div className="max-w-2xl mx-auto">
          <CompraLivre />
        </div>
      </main>

      <footer className="bg-muted py-8">
        <div className="container mx-auto px-4 text-center text-muted-foreground">
          <div className="text-2xl font-bold text-primary flex items-center justify-center mb-4">
             <Link to="/" className="flex items-center text-primary">
                <Sparkles className="h-6 w-6 mr-2" />
                GiraMãe
            </Link>
          </div>
          <p>&copy; {new Date().getFullYear()} GiraMãe. Feito com <Heart className="inline h-4 w-4 text-primary" /> por e para mães.</p>
          <div className="flex justify-center gap-6 mt-4">
            <a href="#" className="hover:text-primary">Sobre</a>
            <a href="#" className="hover:text-primary">FAQ</a>
            <a href="#" className="hover:text-primary">Contato</a>
          </div>
        </div>
      </footer>
    </div>
    </>
  );
};

export default ComprarGirinhas;
