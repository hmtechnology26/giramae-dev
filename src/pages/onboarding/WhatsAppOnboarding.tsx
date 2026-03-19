// src/pages/onboarding/WhatsAppOnboarding.tsx - VERSÃO CORRIGIDA

import React, { useState, useEffect } from 'react';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import PhoneStepV2 from '@/components/cadastro/PhoneStepV2';
import LoadingSpinner from '@/components/loading/LoadingSpinner';
import { analytics } from '@/lib/analytics';
import SEOHead from '@/components/seo/SEOHead';
import { pageTitle } from '@/lib/pageTitle';

const WhatsAppOnboarding: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [isCompleting, setIsCompleting] = useState(false);

  const handlePhoneComplete = async () => {
    if (!user?.id) {
      toast({
        title: "Erro",
        description: "Usuário não autenticado",
        variant: "destructive",
      });
      return;
    }

    setIsCompleting(true);

    try {
      // ✅ CORREÇÃO: Não mais atualizar telefone_verificado aqui!
      // O campo só deve ser definido como true após verificar código no CodeStepV2
      
      console.log('✅ Telefone salvo, redirecionando para verificação de código...');
      
      toast({
        title: "Código enviado!",
        description: "Verifique seu WhatsApp e digite o código recebido.",
      });

      // Aguardar um pouco para processar a mudança
      setTimeout(() => {
        // Redirecionar para página de verificação de código
        navigate('/onboarding/codigo');
      }, 1000);

    } catch (error: any) {
      console.error('Erro inesperado:', error);
      toast({
        title: "Erro",
        description: "Erro inesperado. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsCompleting(false);
    }
  };

  // ✅ ANALYTICS: Rastrear início da verificação
  useEffect(() => {
    analytics.onboarding.phoneVerificationStart();
  }, []);

  const ProgressDots = () => (
    <div className="flex justify-center gap-2 mb-6">
      <div className="w-3 h-3 bg-primary rounded-full"></div>
      <div className="w-3 h-3 bg-gray-200 rounded-full"></div>
      <div className="w-3 h-3 bg-gray-200 rounded-full"></div>
      <div className="w-3 h-3 bg-gray-200 rounded-full"></div>
      <div className="w-3 h-3 bg-gray-200 rounded-full"></div>
    </div>
  );

  return (
    <>
      <SEOHead 
        title={pageTitle.onboarding.whatsapp()}
        description="Verifique seu WhatsApp para começar a fazer parte da comunidade GiraMãe"
        noindex={true}
      />
      <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50">
      <div className="max-w-md mx-auto px-4 py-6">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="text-4xl font-bold text-primary mb-2">
            GiraMãe
          </div>
        </div>

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={() => navigate('/auth')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors"
            disabled={isCompleting}
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Voltar</span>
          </button>
          <span className="text-sm text-gray-500">Etapa 1 de 5</span>
        </div>

        {/* Progress */}
        <ProgressDots />

        {/* Title */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            🚀 Bem-vinda à GiraMãe!
          </h1>
          <p className="text-gray-600">
            Vamos começar com seu WhatsApp
          </p>
        </div>

        {/* Form */}
        <div className="space-y-6">
        <PhoneStepV2 
          onComplete={handlePhoneComplete}
        />
        </div>

        {/* Loading overlay */}
        {isCompleting && (
          <div className="fixed inset-0 bg-black/20 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 flex items-center gap-3">
              <LoadingSpinner className="w-5 h-5 text-primary" />
              <span className="text-gray-600">Enviando código via WhatsApp...</span>
            </div>
          </div>
        )}
      </div>
    </div>
    </>
  );
};

export default WhatsAppOnboarding;
