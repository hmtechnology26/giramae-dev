import React, { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import SimpleAddressForm from '@/components/address/SimpleAddressForm';
import { useUserAddress } from '@/hooks/useUserAddress';
import LoadingSpinner from '@/components/loading/LoadingSpinner';
import { Button } from '@/components/ui/button';
import { analytics } from '@/lib/analytics';
import SEOHead from '@/components/seo/SEOHead';
import { pageTitle } from '@/lib/pageTitle';

const EnderecoOnboarding: React.FC = () => {
  const navigate = useNavigate();
  const { userAddress, isLoading: addressLoading } = useUserAddress();
  const [isNavigating, setIsNavigating] = useState(false);

  if (addressLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 flex items-center justify-center">
        <LoadingSpinner className="w-8 h-8 text-primary" />
      </div>
    );
  }

  const handleContinue = async () => {
    setIsNavigating(true);
    
    console.log('✅ Endereço salvo, redirecionando para o feed...');
    
    // ✅ ANALYTICS: Endereço completo
    if (userAddress?.cidade) {
      analytics.onboarding.addressComplete(userAddress.cidade);
    }
    
    // ✅ NOVA LÓGICA: Ir direto para o feed (sem missão obrigatória)
    setTimeout(() => {
      navigate('/feed');
    }, 1000);
  };

  const ProgressDots = () => (
    <div className="flex justify-center gap-2 mb-6">
      <div className="w-3 h-3 bg-primary rounded-full"></div>
      <div className="w-3 h-3 bg-primary rounded-full"></div>
      <div className="w-3 h-3 bg-primary rounded-full"></div>
      <div className="w-3 h-3 bg-gray-200 rounded-full"></div>
      <div className="w-3 h-3 bg-gray-200 rounded-full"></div>
    </div>
  );

  return (
    <>
      <SEOHead 
        title={pageTitle.onboarding.endereco()}
        description="Informe seu endereço para encontrar itens próximos de você"
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
            onClick={() => navigate('/onboarding/termos')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors"
            disabled={isNavigating}
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Voltar</span>
          </button>
          <span className="text-sm text-gray-500">Última etapa</span>
        </div>

        {/* Progress */}
        <ProgressDots />

        {/* Title */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            🏠 Onde você mora?
          </h1>
          <p className="text-gray-600">
            Seu endereço ajuda outras mães a encontrarem itens próximos
          </p>
        </div>

        {/* Address Form Component */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
          <SimpleAddressForm />
        </div>

        {/* Continue Button - only show when address is saved */}
        {userAddress && (
          <div className="mt-6">
            <Button
              onClick={handleContinue}
              disabled={isNavigating}
              className="w-full py-3 text-lg font-semibold"
            >
              {isNavigating ? (
                <>
                  <LoadingSpinner className="w-5 h-5 mr-2" />
                  Redirecionando...
                </>
              ) : (
                'Continuar para próxima etapa'
              )}
            </Button>
          </div>
        )}

        {/* Loading overlay */}
        {isNavigating && (
          <div className="fixed inset-0 bg-black/20 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 flex items-center gap-3">
              <LoadingSpinner className="w-5 h-5 text-primary" />
              <span className="text-gray-600">Avançando para próxima etapa...</span>
            </div>
          </div>
        )}
      </div>
    </div>
    </>
  );
};

export default EnderecoOnboarding;
