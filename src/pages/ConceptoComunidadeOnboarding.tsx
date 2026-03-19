import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Users, Handshake, Shield, Lightbulb, ArrowRight, CheckCircle } from 'lucide-react';
import { analytics } from '@/lib/analytics';
import SEOHead from '@/components/seo/SEOHead';
import { pageTitle } from '@/lib/pageTitle';

const ConceptoComunidadeOnboarding = () => {
  const navigate = useNavigate();

  // Simulating dynamic values from hooks, as they would be available in a real app
  // For this single-screen onboarding, these are hardcoded for demonstration.
  const recompensaPacto = 25; // Example value, would come from useMissoes
  const itensNecessarios = 2; // Example value, would come from useMissoes

  const handleStartMission = () => {
    // ✅ ANALYTICS: Conceito visualizado
    analytics.onboarding.conceptViewComplete();
    
    // Logic to navigate to the first mission or item submission page
    navigate('/publicar-primeiro-item');
  };

  return (
    <>
      <SEOHead 
        title={pageTitle.onboarding.conceito()}
        description="Entenda como funciona a comunidade de trocas GiraMãe"
        noindex={true}
      />
      <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 p-4 flex items-center justify-center">
      <div className="max-w-md w-full mx-auto">
        <Card className="shadow-xl border-0 bg-white/95 backdrop-blur-sm p-6 md:p-8 rounded-lg">
          <CardContent className="p-0">
            {/* Header Section */}
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-gradient-to-r from-primary to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-white" /> {/* Community icon */}
              </div>
              <h1 className="text-2xl font-bold text-gray-800 mb-2">
                Bem-vinda à GiraMãe!
              </h1>
              <p className="text-gray-600 text-lg">
                Onde mães cuidam de mães.
              </p>
            </div>

            {/* Main Content - Introduction and Girinhas */}
            <div className="space-y-6 mb-8 text-center md:text-left">
              <p className="text-lg text-gray-700 leading-relaxed">
                Aqui você troca itens infantis que não servem mais por outros que seu pequeno precisa. Nossa moeda interna são as <strong className="text-primary">Girinhas</strong>, e cada uma equivale a um Real.
              </p>
              <p className="text-base font-semibold text-gray-600 italic">
                "As Girinhas são créditos internos que facilitam trocas justas dentro da comunidade. Temos um controle por categoria com preço mínimo e máximo, evitando preços abusivos e garantindo que todas as mães tenham acesso a peças de qualidade por um valor justo."
              </p>
              <p className="text-base text-gray-700 leading-relaxed">
                Pense em nós como um grupo de WhatsApp, mas de forma organizada! Aqui você pode filtrar por tamanhos, categorias e muito mais, encontrando exatamente o que precisa de forma rápida e eficiente.
              </p>
            </div>

            {/* Mandatory Mission Section */}
            <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-lg p-4 border border-orange-200 mb-8">
              <div className="flex items-center gap-3 mb-3 justify-center md:justify-start">
                <Lightbulb className="w-6 h-6 text-orange-600" />
                <h3 className="font-bold text-orange-800 text-xl">Sua Primeira Missão!</h3>
              </div>
              <p className="font-semibold text-gray-800 mb-2 text-center md:text-left">
                Para manter nossa comunidade ativa e com peças sempre disponíveis para todas, temos uma <strong className="text-red-700">única missão obrigatória</strong> para você começar:
              </p>
              <div className="bg-white/60 rounded-lg p-3 mb-3 text-center md:text-left">
                <p className="text-gray-700 text-lg mb-2">
                  <strong className="text-primary">Cadastre {itensNecessarios} itens</strong> (roupas, calçados ou brinquedos)
                </p>
                <p className="text-sm text-gray-600">
                  (Não precisa trocar imediatamente, apenas cadastrar com fotos reais)
                </p>
              </div>
              <div className="flex items-center gap-2 bg-green-100 text-green-800 rounded-lg p-2 justify-center md:justify-start">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <span className="font-semibold text-base">
                  Recompensa de Boas-vindas: {recompensaPacto} Girinhas!
                </span>
              </div>
              <p className="text-blue-700 text-sm mt-4 text-center md:text-left">
                Esta missão é fundamental para garantir que todas as mães contribuam e que sempre haja itens novos para troca. Ao completá-la, você terá acesso total à plataforma para trocar livremente.
              </p>
            </div>

            {/* Call to Action */}
            <div className="space-y-3">
              <Button
                onClick={handleStartMission}
                className="w-full h-12 bg-gradient-to-r from-primary to-pink-500 hover:from-primary/90 hover:to-pink-500/90 text-white font-medium text-lg rounded-full"
              >
                Começar
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
    </>
  );
};

export default ConceptoComunidadeOnboarding;
