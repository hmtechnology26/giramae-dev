// src/App.tsx - VERSÃO COM NOVO SISTEMA DE GUARDS + ANALYTICS

import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { Toaster } from '@/components/ui/toaster';
import { Toaster as SonnerToaster } from '@/components/ui/sonner';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { HelmetProvider } from 'react-helmet-async';

// ============================================================================
// ANALYTICS
// ============================================================================
import { trackPageView } from './lib/analytics';

// Guards
import AuthGuard from '@/components/auth/AuthGuard';
import OnboardingGuard from '@/components/auth/OnboardingGuard';
import MissaoGuard from '@/components/auth/MissaoGuard';
import AguardandoCidadeGuard from '@/components/auth/AguardandoCidadeGuard';
import AcessoTotalGuard from '@/components/auth/AcessoTotalGuard';
import AdminGuard from '@/components/auth/AdminGuard';

// Pages - Public
import Index from '@/pages/Index';
import Auth from '@/pages/Auth';
import Login from '@/pages/Login';
import AuthCallback from '@/pages/AuthCallback';
import TermosOnboarding from '@/pages/onboarding/TermosOnboarding';
import TermosUso from '@/pages/TermosUso';
import PoliticaPrivacidade from '@/pages/PoliticaPrivacidade';
import ComoFunciona from '@/pages/ComoFunciona';
import Contato from '@/pages/Contato';
import Sobre from '@/pages/Sobre';
import FAQ from '@/pages/FAQ';
import Institucional from '@/pages/Institucional';

// Pages - Blog
import Blog from '@/pages/Blog';
import BlogPost from '@/pages/BlogPost';
import BuscaBlog from '@/pages/BuscaBlog';
import CategoryPage from '@/pages/blog/CategoryPage';
import CategoriesPage from '@/pages/blog/CategoriesPage';
import TagPage from '@/pages/blog/TagPage';
import AuthorPage from '@/pages/blog/AuthorPage';

// Pages - Admin Blog
import AdminBlogHome from '@/pages/admin/blog/AdminBlogHome';
import NovoPost from '@/pages/admin/blog/NovoPost';
import EditarPost from '@/pages/admin/blog/EditarPost';

// Pages - Onboarding
import WhatsAppOnboarding from '@/pages/onboarding/WhatsAppOnboarding';
import CodigoOnboarding from '@/pages/onboarding/CodigoOnboarding';
import EnderecoOnboarding from '@/pages/onboarding/EnderecoOnboarding';
import ConceptoComunidadeOnboarding from '@/pages/ConceptoComunidadeOnboarding';
import PublicarPrimeiroItem from '@/pages/PublicarPrimeiroItem';
import AguardandoLiberacao from '@/pages/onboarding/AguardandoLiberacao';

// Pages - Core Features
import FeedOptimized from '@/pages/FeedOptimized';
import BuscarItens from '@/pages/BuscarItens';
import PublicarItem from '@/pages/PublicarItem';
import DetalhesItem from '@/pages/DetalhesItem';
import Perfil from '@/pages/Perfil';
import EditarPerfil from '@/pages/EditarPerfil';
import PerfilPublicoMae from '@/pages/PerfilPublicoMae';
import Carteira from '@/pages/Carteira';
import ComprarGirinhas from '@/pages/ComprarGirinhas';
import Missoes from '@/pages/Missoes';
import Indicacoes from '@/pages/Indicacoes';
import Apoiadores from '@/pages/Apoiadores';
import MinhasReservas from '@/pages/MinhasReservas';
import Configuracoes from '@/pages/Configuracoes';
import MaesSeguidas from '@/pages/MaesSeguidas';
import ItensFavoritos from '@/pages/ItensFavoritos';

// Pages - Parcerias
import ParceriasSociais from '@/pages/ParceriasSociais';
import ProgramaDetalhes from '@/pages/ProgramaDetalhes';

// Pages - Admin
import AdminDashboard from '@/pages/AdminDashboard';
import AdminLedger from '@/pages/AdminLedger';
import ParceriasDashboard from '@/pages/admin/parcerias/ParceriasDashboard';
import GestaoPrograma from '@/pages/admin/parcerias/GestaoPrograma';
import PerfilBeneficiario from '@/pages/admin/parcerias/PerfilBeneficiario';
import NovaParceria from '@/pages/admin/parcerias/NovaParceria';

// Pages - 404
import NotFound from '@/pages/NotFound';

// Providers
import { RecompensasProvider } from '@/components/recompensas/ProviderRecompensas';
import { GiraTourProvider, OnboardingChecklist } from '@/modules/onboarding';

// ============================================================================
// QUERY CLIENT CONFIGURATION
// ============================================================================
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
      retry: 1,
      staleTime: 1 * 60 * 1000,
      gcTime: 5 * 60 * 1000,
    },
  },
});

// ============================================================================
// ANALYTICS WRAPPER COMPONENT
// ============================================================================
const AnalyticsWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();

  useEffect(() => {
    trackPageView(location.pathname + location.search);
  }, [location]);

  return <>{children}</>;
};

// ============================================================================
// MAIN APP COMPONENT
// ============================================================================
function App() {
  return (
    <HelmetProvider>
      <QueryClientProvider client={queryClient}>
        <RecompensasProvider>
          <GiraTourProvider>
            <Toaster />
            <SonnerToaster />
            <BrowserRouter>
              <AnalyticsWrapper>
                {/* Menu flutuante de jornadas */}
                <OnboardingChecklist />
              
              <Routes>
                {/* ================================================ */}
                {/* ROTAS PÚBLICAS (sem proteção)                   */}
                {/* ================================================ */}
                <Route path="/" element={<Index />} />
                <Route path="/auth" element={<Auth />} />
                <Route path="/auth-callback" element={<AuthCallback />} />
                <Route path="/login" element={<Login />} />
                
                {/* ✅ ROTAS PÚBLICAS - Termos e Política */}
                <Route path="/onboarding/termos" element={<TermosOnboarding />} />
                <Route path="/termos" element={<TermosUso />} />
                <Route path="/onboarding/privacidade" element={<PoliticaPrivacidade />} />
                <Route path="/privacidade" element={<PoliticaPrivacidade />} />
                
                {/* ✅ ROTAS PÚBLICAS - SEO */}
                <Route path="/como-funciona" element={<ComoFunciona />} />
                <Route path="/contato" element={<Contato />} />
                <Route path="/sobre" element={<Sobre />} />
                <Route path="/faq" element={<FAQ />} />
                <Route path="/institucional" element={<Institucional />} />
                <Route path="/apoiadores" element={<Apoiadores />} />
                
                {/* ✅ ROTAS PÚBLICAS - Blog */}
                <Route path="/blog" element={<Blog />} />
                <Route path="/buscar" element={<BuscaBlog />} />
                <Route path="/blog/categorias" element={<CategoriesPage />} />
                <Route path="/blog/categoria/:slug" element={<CategoryPage />} />
                <Route path="/blog/tag/:slug" element={<TagPage />} />
                <Route path="/blog/autor/:slug" element={<AuthorPage />} />
                <Route path="/blog/:slug" element={<BlogPost />} />
                
                {/* ================================================ */}
                {/* ADMIN BLOG                                       */}
                {/* ================================================ */}
                <Route path="/admin/blog" element={<AuthGuard><AdminGuard><AdminBlogHome /></AdminGuard></AuthGuard>} />
                <Route path="/admin/blog/novo" element={<AuthGuard><AdminGuard><NovoPost /></AdminGuard></AuthGuard>} />
                <Route path="/admin/blog/editar/:id" element={<AuthGuard><AdminGuard><EditarPost /></AdminGuard></AuthGuard>} />

                {/* ================================================ */}
                {/* NÍVEL 1: ROTAS DE ONBOARDING                    */}
                {/* ================================================ */}
                <Route path="/onboarding/whatsapp" element={<AuthGuard><OnboardingGuard><WhatsAppOnboarding /></OnboardingGuard></AuthGuard>} />
                <Route path="/onboarding/codigo" element={<AuthGuard><OnboardingGuard><CodigoOnboarding /></OnboardingGuard></AuthGuard>} />
                <Route path="/onboarding/endereco" element={<AuthGuard><OnboardingGuard><EnderecoOnboarding /></OnboardingGuard></AuthGuard>} />

                {/* ================================================ */}
                {/* NÍVEL 2: ROTAS DE MISSÃO                        */}
                {/* ================================================ */}
                <Route path="/conceito-comunidade" element={<AuthGuard><MissaoGuard><ConceptoComunidadeOnboarding /></MissaoGuard></AuthGuard>} />
                <Route path="/publicar-primeiro-item" element={<AuthGuard><MissaoGuard><PublicarPrimeiroItem /></MissaoGuard></AuthGuard>} />

                {/* ================================================ */}
                {/* NÍVEL 3: AGUARDANDO CIDADE                      */}
                {/* ================================================ */}
                <Route path="/aguardando-liberacao" element={<AuthGuard><AguardandoCidadeGuard><AguardandoLiberacao /></AguardandoCidadeGuard></AuthGuard>} />

                {/* ================================================ */}
                {/* NÍVEL 4: ACESSO TOTAL                           */}
                {/* ================================================ */}
                <Route path="/feed" element={<AuthGuard><AcessoTotalGuard><FeedOptimized /></AcessoTotalGuard></AuthGuard>} />
                <Route path="/missoes" element={<AuthGuard><AcessoTotalGuard><Missoes /></AcessoTotalGuard></AuthGuard>} />
                <Route path="/buscar-itens" element={<AuthGuard><AcessoTotalGuard><BuscarItens /></AcessoTotalGuard></AuthGuard>} />
                <Route path="/publicar" element={<AuthGuard><AcessoTotalGuard><PublicarItem /></AcessoTotalGuard></AuthGuard>} />
                <Route path="/perfil" element={<AuthGuard><AcessoTotalGuard><Perfil /></AcessoTotalGuard></AuthGuard>} />
                <Route path="/perfil/editar" element={<AuthGuard><AcessoTotalGuard><EditarPerfil /></AcessoTotalGuard></AuthGuard>} />
                <Route path="/carteira" element={<AuthGuard><AcessoTotalGuard><Carteira /></AcessoTotalGuard></AuthGuard>} />
                <Route path="/comprar-girinhas" element={<AuthGuard><AcessoTotalGuard><ComprarGirinhas /></AcessoTotalGuard></AuthGuard>} />
                <Route path="/indicacoes" element={<AuthGuard><AcessoTotalGuard><Indicacoes /></AcessoTotalGuard></AuthGuard>} />
                <Route path="/minhas-reservas" element={<AuthGuard><AcessoTotalGuard><MinhasReservas /></AcessoTotalGuard></AuthGuard>} />
                <Route path="/configuracoes" element={<AuthGuard><AcessoTotalGuard><Configuracoes /></AcessoTotalGuard></AuthGuard>} />
                <Route path="/parcerias" element={<AuthGuard><AcessoTotalGuard><ParceriasSociais /></AcessoTotalGuard></AuthGuard>} />
                <Route path="/parcerias/:organizacao_codigo/:programa_codigo" element={<AuthGuard><AcessoTotalGuard><ProgramaDetalhes /></AcessoTotalGuard></AuthGuard>} />
                
                {/* ================================================ */}
                {/* ROTAS ESPECÍFICAS - ACESSO TOTAL                */}
                {/* ================================================ */}
                <Route path="/item/:id" element={<AuthGuard><AcessoTotalGuard><DetalhesItem /></AcessoTotalGuard></AuthGuard>} />
                <Route path="/perfil/:id" element={<AuthGuard><AcessoTotalGuard><PerfilPublicoMae /></AcessoTotalGuard></AuthGuard>} />
                <Route path="/maes-seguidas" element={<AuthGuard><AcessoTotalGuard><MaesSeguidas /></AcessoTotalGuard></AuthGuard>} />
                <Route path="/favoritos" element={<AuthGuard><AcessoTotalGuard><ItensFavoritos /></AcessoTotalGuard></AuthGuard>} />

                {/* ================================================ */}
                {/* NÍVEL 5: ADMINISTRATIVO                         */}
                {/* ================================================ */}
                <Route path="/admin" element={<AuthGuard><AdminGuard><AdminDashboard /></AdminGuard></AuthGuard>} />
                <Route path="/admin/ledger" element={<AuthGuard><AdminGuard><AdminLedger /></AdminGuard></AuthGuard>} />
                <Route path="/admin/parcerias" element={<AuthGuard><AdminGuard><ParceriasDashboard /></AdminGuard></AuthGuard>} />
                <Route path="/admin/parcerias/nova-parceria" element={<AuthGuard><AdminGuard><NovaParceria /></AdminGuard></AuthGuard>} />
                <Route path="/admin/parcerias/:programaId" element={<AuthGuard><AdminGuard><GestaoPrograma /></AdminGuard></AuthGuard>} />
                <Route path="/admin/parcerias/:programaId/beneficiario/:userId" element={<AuthGuard><AdminGuard><PerfilBeneficiario /></AdminGuard></AuthGuard>} />

                {/* ================================================ */}
                {/* 404 NOT FOUND                                    */}
                {/* ================================================ */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </AnalyticsWrapper>
          </BrowserRouter>
          </GiraTourProvider>
        </RecompensasProvider>
      </QueryClientProvider>
    </HelmetProvider>
  );
}

export default App;
