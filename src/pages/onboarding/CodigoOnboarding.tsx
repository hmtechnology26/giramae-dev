import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import CodeStepV2 from '@/components/cadastro/CodeStepV2';
import LoadingSpinner from '@/components/loading/LoadingSpinner';
import { analytics } from '@/lib/analytics';
import SEOHead from '@/components/seo/SEOHead';
import { pageTitle } from '@/lib/pageTitle';

// ====================================================================
// STEP 2: CÓDIGO DE VERIFICAÇÃO - PODE VOLTAR PARA WHATSAPP
// ====================================================================

const CodigoOnboarding: React.FC = () => {
  const navigate = useNavigate();

    const handleCodeComplete = async () => {
      console.log('✅ Código verificado com sucesso! Redirecionando para termos...');
      
      // ✅ ANALYTICS: Verificação completa
      analytics.onboarding.phoneVerificationComplete();
      
      setTimeout(() => {
        navigate('/onboarding/termos'); // ✅ AGORA NAVEGA PARA PRÓXIMA ETAPA
      }, 1000);
    };

  const ProgressDots = () => (
    <div className="flex justify-center gap-2 mb-6">
      <div className="w-3 h-3 bg-primary rounded-full"></div>
      <div className="w-3 h-3 bg-primary rounded-full"></div>
      <div className="w-3 h-3 bg-gray-200 rounded-full"></div>
      <div className="w-3 h-3 bg-gray-200 rounded-full"></div>
      <div className="w-3 h-3 bg-gray-200 rounded-full"></div>
    </div>
  );

  return (
    <>
      <SEOHead 
        title={pageTitle.onboarding.codigo()}
        description="Digite o código de verificação enviado para seu WhatsApp"
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
            onClick={() => navigate('/onboarding/whatsapp')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Voltar</span>
          </button>
          <span className="text-sm text-gray-500">Etapa 2 de 5</span>
        </div>

        {/* Progress */}
        <ProgressDots />

        {/* Title */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            📱 Verificar WhatsApp
          </h1>
          <p className="text-gray-600">
            Digite o código que enviamos para seu WhatsApp
          </p>
        </div>

        {/* Form */}
        <div className="space-y-6">
          <CodeStepV2 onComplete={handleCodeComplete} />
        </div>
      </div>
    </div>
    </>
  );
};

export default CodigoOnboarding;
