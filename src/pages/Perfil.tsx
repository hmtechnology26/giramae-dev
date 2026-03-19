import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import Header from "@/components/shared/Header";
import QuickNav from "@/components/shared/QuickNav";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";
import { useMeusItens } from "@/hooks/useItensOptimized";
import { Star, MapPin, Calendar, Plus, Edit3, Sparkles } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import ItemCardSkeleton from "@/components/loading/ItemCardSkeleton";
import EmptyState from "@/components/loading/EmptyState";
import LoadingSpinner from "@/components/loading/LoadingSpinner";
import FriendlyError from "@/components/error/FriendlyError";
import ItemCardWithActions from "@/components/shared/ItemCardWithActions";
import Footer from "@/components/shared/Footer";
import SEOHead from "@/components/seo/SEOHead";
import { pageTitle } from "@/lib/pageTitle";

const Perfil = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const { profile, loading: profileLoading, error: profileError } = useProfile();
    const { data: meusItens, isLoading: itensLoading, error: itensError } = useMeusItens(user?.id || '');

    // Filtrar apenas itens com status permitidos
    const itensFiltrados = meusItens?.filter(item =>
        ['disponivel', 'reservado', 'inativo', 'cancelado'].includes(item.status)
    ) || [];

    if (!user) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-25 to-blue-50 pb-32">
                <Header />
                <FriendlyError
                    type="permission"
                    title="Acesso Restrito"
                    message="Você precisa estar logado para acessar seu perfil."
                    showHomeButton={true}
                />
                <QuickNav />
                <Footer />
            </div>
        );
    }

    if (profileLoading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-25 to-blue-50 pb-32">
                <Header />
                <div className="flex flex-col items-center justify-center pt-40">
                    <LoadingSpinner
                        size="lg"
                        text="Carregando seu perfil..."
                    />
                </div>
                <QuickNav />
                <Footer />
            </div>
        );
    }

    if (profileError) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-25 to-blue-50 pb-32">
                <Header />
                <div className="pt-40 px-6">
                    <FriendlyError
                        title="Erro ao carregar perfil"
                        message={profileError}
                        onRetry={() => window.location.reload()}
                    />
                </div>
                <QuickNav />
                <Footer />
            </div>
        );
    }

    const getInitials = (name: string) => {
        return name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'U';
    };

    const formatarData = (data: string) => {
        try {
            return format(new Date(data), "MMM yyyy", { locale: ptBR });
        } catch {
            return 'Data inválida';
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-25 to-blue-50 font-sans">
            <SEOHead title={pageTitle.perfil()} />
            <Header />

            <main className="container mx-auto pt-40 pb-24 px-4 max-w-6xl">
                <div className="mb-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
                    <h1 className="text-5xl md:text-7xl font-black text-foreground tracking-tight leading-none">
                        Meu <span className="text-glow text-primary italic">Espaço</span>
                    </h1>
                    <div className="flex items-center gap-2 mt-4 ml-1">
                        <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                        <p className="text-foreground/40 font-black uppercase tracking-widest text-[10px]">Gerencie seus anúcios e sua reputação premium</p>
                    </div>
                </div>

                <div className="flex flex-col lg:flex-row gap-12">
                    {/* Sidebar do Perfil */}
                    <div className="w-full lg:w-1/3">
                        <div className="premium-card bg-white/70 backdrop-blur-2xl border-white/80 rounded-[3.5rem] p-10 shadow-[0_32px_64px_-16px_rgba(235,51,148,0.12)] space-y-10 sticky top-32 overflow-hidden group transition-all duration-700 hover:shadow-[0_48px_80px_-20px_rgba(235,51,148,0.2)]">
                            {/* Visual Accents */}
                            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-primary/30 via-primary to-primary/30" />
                            <div className="absolute -right-16 -top-16 w-48 h-48 bg-primary/5 rounded-full blur-[80px] group-hover:bg-primary/10 transition-all duration-1000" />

                            <div className="flex flex-col items-center text-center relative z-10">
                                <div className="relative mb-8 group/avatar">
                                    <div className="absolute inset-0 bg-primary/20 rounded-full blur-2xl scale-75 group-hover/avatar:scale-90 transition-transform duration-700" />
                                    <Avatar className="w-40 h-40 ring-12 ring-white/60 border-2 border-white shadow-2xl relative z-10 transition-transform duration-700 group-hover/avatar:scale-105">
                                        <AvatarImage src={profile?.avatar_url} alt={profile?.nome} className="object-cover" />
                                        <AvatarFallback className="text-3xl bg-gradient-to-br from-primary via-primary to-purple-600 text-white font-black">
                                            {getInitials(profile?.nome || 'Usuário')}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="absolute -bottom-2 -left-2 bg-white rounded-2xl p-3 shadow-xl border border-primary/5 z-20 animate-bounce cursor-default">
                                        <Sparkles className="w-7 h-7 text-primary" />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <h2 className="text-3xl font-black text-foreground tracking-tighter leading-tight drop-shadow-sm">
                                        {profile?.nome || 'Nome não informado'}
                                    </h2>
                                    <div className="flex items-center justify-center gap-3 py-2 px-6 bg-white/40 rounded-full border border-white/60 shadow-inner">
                                        <div className="flex items-center -space-x-1">
                                            {[...Array(5)].map((_, i) => (
                                                <Star
                                                    key={i}
                                                    className={`w-3.5 h-3.5 ${i < Math.floor(profile?.reputacao || 0)
                                                        ? 'fill-yellow-400 text-yellow-400'
                                                        : 'text-foreground/10'
                                                        }`}
                                                />
                                            ))}
                                        </div>
                                        <div className="h-3 w-px bg-foreground/10" />
                                        <span className="text-[10px] font-black text-foreground/40 uppercase tracking-[0.2em] leading-none">
                                            {(profile?.reputacao || 0).toFixed(1)} SCORE
                                        </span>
                                    </div>
                                </div>

                                <div className="w-full pt-10">
                                    <Button
                                        asChild
                                        className="founders-button w-full h-16 text-white text-[12px] font-black uppercase tracking-[0.2em] rounded-full shadow-2xl shadow-primary/20"
                                    >
                                        <Link to="/editar-perfil">
                                            <Edit3 className="w-4 h-4 mr-3" />
                                            Editar Perfil
                                        </Link>
                                    </Button>
                                </div>
                            </div>

                            <div className="space-y-6 pt-6 border-t border-primary/10 relative z-10">
                                <div className="flex items-center justify-between group/info">
                                    <div className="flex items-center gap-3 text-foreground/40 group-hover/info:text-primary transition-colors">
                                        <div className="p-2 bg-foreground/5 rounded-xl group-hover/info:bg-primary/5 transition-colors">
                                            <MapPin className="w-4 h-4" />
                                        </div>
                                        <span className="text-[10px] font-black uppercase tracking-[0.15em]">Localização</span>
                                    </div>
                                    <span className="text-xs font-bold text-foreground bg-white/50 px-3 py-1 rounded-lg border border-white/80">{profile?.cidade || 'Não informada'}</span>
                                </div>

                                <div className="flex items-center justify-between group/info">
                                    <div className="flex items-center gap-3 text-foreground/40 group-hover/info:text-primary transition-colors">
                                        <div className="p-2 bg-foreground/5 rounded-xl group-hover/info:bg-primary/5 transition-colors">
                                            <Calendar className="w-4 h-4" />
                                        </div>
                                        <span className="text-[10px] font-black uppercase tracking-[0.15em]">Membro Desde</span>
                                    </div>
                                    <span className="text-xs font-bold text-foreground bg-white/50 px-3 py-1 rounded-lg border border-white/80">{formatarData(profile?.created_at || '')}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Conteúdo Principal - Meus Itens */}
                    <div className="w-full lg:w-2/3 space-y-8">
                        <div className="premium-card bg-white/40 backdrop-blur-xl border-white/60 rounded-[3rem] p-10 shadow-2xl">
                            <div className="flex items-center justify-between mb-10">
                                <h2 className="text-2xl font-black text-foreground tracking-tight">
                                    Meus <span className="text-glow text-primary italic">Desapegos</span>
                                </h2>
                                <Badge variant="outline" className="rounded-full px-4 py-1 border-primary/10 text-primary font-black uppercase text-[10px] tracking-widest bg-primary/5">
                                    Total: {itensFiltrados.length}
                                </Badge>
                            </div>

                            {itensLoading ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <ItemCardSkeleton count={4} />
                                </div>
                            ) : itensError ? (
                                <FriendlyError
                                    title="Erro ao carregar itens"
                                    message={itensError.message}
                                    onRetry={() => window.location.reload()}
                                />
                            ) : !itensFiltrados || itensFiltrados.length === 0 ? (
                                <div className="py-20 text-center">
                                    <EmptyState
                                        type="items"
                                        title="Sua vitrine está vazia"
                                        description="Espalhe amor e ganhe Girinhas publicando seu primeiro item."
                                        onAction={() => navigate('/publicar')}
                                        actionLabel="Publicar Meu Primeiro Item"
                                    />
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    {itensFiltrados.map((item) => (
                                        <div key={item.id} className="transition-transform duration-500 hover:scale-[1.02]">
                                            <ItemCardWithActions item={item} />
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Banner de Incentivo */}
                        <div className="premium-card bg-primary/5 border-primary/10 rounded-[3rem] p-10 flex flex-col md:flex-row items-center justify-between gap-6 overflow-hidden relative group">
                            <div className="absolute right-0 top-0 translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-primary/10 rounded-full blur-3xl group-hover:bg-primary/20 transition-all duration-700" />
                            <div className="space-y-2 relative z-10">
                                <h3 className="text-xl font-black text-primary italic">Quer desapegar de algo mais?</h3>
                                <p className="text-sm font-medium text-foreground/50 max-w-md">Cada item que você doa ajuda uma nova mãe e faz o amor girar em nossa comunidade.</p>
                            </div>
                            <Button
                                onClick={() => navigate('/publicar')}
                                className="founders-button h-14 px-8 text-white rounded-full shadow-xl shadow-primary/20 relative z-10"
                            >
                                <Plus className="w-5 h-5 mr-2" />
                                Publicar Item
                            </Button>
                        </div>
                    </div>
                </div>
            </main>

            <QuickNav />
            <Footer />
        </div>
    );
};

export default Perfil;
