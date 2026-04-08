import React from 'react';
import { Button } from "@/components/ui/button";
import { Loader2, Upload, ShieldCheck, Heart, Info } from "lucide-react";
import { usePublicarItemFormV2 } from '@/hooks/usePublicarItemFormV2';
import { SimpleItemForm } from '@/components/forms/SimpleItemForm';
import AuthGuard from '@/components/auth/AuthGuard';
import Header from '@/components/shared/Header';
import QuickNav from '@/components/shared/QuickNav';
import Footer from '@/components/shared/Footer';
import SEOHead from '@/components/seo/SEOHead';
import { pageTitle } from '@/lib/pageTitle';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

const PublicarItem = () => {
  const {
    formData,
    updateFormData,
    errors,
    loading,
    handleSubmit
  } = usePublicarItemFormV2();

  const handleFieldChange = (field: string, value: any) => {
    updateFormData({ [field]: value });
  };

  return (
    <AuthGuard>
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-25 to-blue-50 font-sans">
        <SEOHead title={pageTitle.publicar()} />
        <Header />

        <main className="container mx-auto pt-32 pb-24 px-4 max-w-6xl">
          <div className="grid lg:grid-cols-12 gap-8 items-start">

            {/* Esquerda: Informações e Dicas */}
            <div className="lg:col-span-4 space-y-8 lg:sticky lg:top-32">
              <div className="space-y-4 px-2">
                <Badge variant="outline" className="px-4 py-1 rounded-full border-primary/20 text-primary font-bold tracking-[0.2em] uppercase text-[9px] bg-white/50 backdrop-blur-md mb-2">
                  Contribua com a Rede
                </Badge>
                <h1 className="text-4xl md:text-6xl font-black text-foreground tracking-tight leading-[1.1]">
                  Publicar <span className="text-glow text-primary italic">Novo Item</span>
                </h1>
                <p className="text-lg text-foreground/40 font-medium leading-relaxed">Dê uma nova história para peças que foram escolhidas com todo amor do mundo.</p>
              </div>

              <div className="premium-card bg-white/60 backdrop-blur-xl border-white/60 rounded-[3rem] p-10 shadow-2xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 blur-3xl -mr-16 -mt-16 group-hover:bg-primary/10 transition-colors" />

                <div className="flex items-center gap-3 mb-10">
                  <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary border border-primary/10">
                    <Info className="w-6 h-6" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] font-black uppercase text-foreground/30 tracking-widest">Guia Essencial</span>
                    <span className="text-sm font-bold text-foreground/80">Dicas da Comunidade</span>
                  </div>
                </div>

                <div className="space-y-8">
                  <div className="flex gap-5">
                    <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-100/50 shadow-sm">
                      <ShieldCheck className="w-5 h-5" />
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-black text-foreground/80 uppercase tracking-tight">Capriche nas Fotos</p>
                      <p className="text-xs font-medium text-foreground/40 leading-relaxed capitalize-first">Ambientes iluminados e fundos neutros ajudam a valorizar sua peça.</p>
                    </div>
                  </div>

                  <div className="flex gap-5">
                    <div className="w-10 h-10 rounded-2xl bg-pink-50 text-pink-600 flex items-center justify-center shrink-0 border border-pink-100/50 shadow-sm">
                      <Heart className="w-5 h-5" />
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-black text-foreground/80 uppercase tracking-tight">Descrição Honesta</p>
                      <p className="text-xs font-medium text-foreground/40 leading-relaxed">Conte detalhes sobre o estado e o carinho que o item recebeu.</p>
                    </div>
                  </div>

                  <div className="flex gap-5">
                    <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 border border-blue-100/50 shadow-sm">
                      <Info className="w-5 h-5" />
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-black text-foreground/80 uppercase tracking-tight">Valor de Troca</p>
                      <p className="text-xs font-medium text-foreground/40 leading-relaxed">Use a sugestão de Girinhas do sistema para uma troca justa e rápida.</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-8 bg-primary/5 border border-primary/10 rounded-[3rem] flex items-center gap-5 relative overflow-hidden group">
                <div className="  rounded-full flex items-center justify-center text-primary shadow-xl shadow-primary/10 font-black text-2xl italic shrink-0 border border-primary/5 group-hover:rotate-6 transition-transform">
                <img src="./girinha_frente.png" alt="Moeda Girinha" className='w-20 h-auto' />
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-bold text-primary italic uppercase tracking-widest opacity-60">Economia Circular</p>
                  <p className="text-xs font-medium text-foreground/50 leading-relaxed">Ao publicar, você ganha <strong>reputação</strong> e ajuda a fortalecer nossa economia circular de mães.</p>
                </div>
              </div>
            </div>

            {/* Direita: Formulário */}
            <div className="lg:col-span-8 animate-in fade-in slide-in-from-bottom-8 duration-1000">
              <div className="premium-card bg-white/40 backdrop-blur-2xl border-white/60 rounded-[3.5rem] p-8 md:p-14 shadow-2xl relative">
                <div className="absolute top-10 right-10 opacity-5 pointer-events-none hidden md:block">
                  <Upload className="w-32 h-32 text-primary" />
                </div>

                <form onSubmit={handleSubmit} className="relative z-10">
                  <SimpleItemForm
                    formData={formData}
                    onFieldChange={handleFieldChange}
                    errors={errors}
                  />

                  <div className="pt-14 mt-14 border-t border-primary/5">
                    <Button
                      data-tour="btn-publicar"
                      type="submit"
                      disabled={loading}
                      className="founders-button w-full h-20 text-xl text-white rounded-full shadow-2xl shadow-primary/20 group"
                    >
                      {loading ? (
                        <div className="flex items-center gap-3">
                          <Loader2 className="h-7 w-7 animate-spin" />
                          <span className="font-bold tracking-tight">Preparando seu desapego...</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-3">
                          <Upload className="h-7 w-7 transition-transform group-hover:-translate-y-1 duration-500" />
                          <span className="font-bold tracking-tight">Publicar Agora</span>
                        </div>
                      )}
                    </Button>
                    <p className="text-center text-[10px] text-foreground/20 uppercase font-black tracking-[0.3em] mt-10">
                      Ao publicar, você concorda com nossos termos de comunidade
                    </p>
                  </div>
                </form>
              </div>
            </div>

          </div>
        </main>

        <QuickNav />
        <Footer />
      </div>
    </AuthGuard>
  );
};

export default PublicarItem;
