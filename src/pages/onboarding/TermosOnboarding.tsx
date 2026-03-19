import React, { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useOnboarding } from '@/hooks/useOnboarding';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import LoadingSpinner from '@/components/loading/LoadingSpinner';

const TermosOnboarding: React.FC = () => {
  const navigate = useNavigate();
  const { profile, loading, updating, acceptTerms, navigateToNext, navigateBack } = useOnboarding();
  const [termosAccepted, setTermosAccepted] = useState(false);
  const [politicaAccepted, setPoliticaAccepted] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 flex items-center justify-center">
        <LoadingSpinner className="w-8 h-8 text-primary" />
      </div>
    );
  }

  const handleAcceptTerms = async () => {
    const success = await acceptTerms(termosAccepted, politicaAccepted);
    if (success) {
      navigateToNext('endereco');
    }
  };

  const canContinue = termosAccepted && politicaAccepted;

  const ProgressDots = () => (
    <div className="flex justify-center gap-2 mb-6">
      <div className="w-3 h-3 bg-primary rounded-full"></div>
      <div className="w-3 h-3 bg-primary rounded-full"></div>
      <div className="w-3 h-3 bg-primary rounded-full"></div>
      <div className="w-3 h-3 bg-gray-200 rounded-full"></div>
      <div className="w-3 h-3 bg-gray-200 rounded-full"></div>
      <div className="w-3 h-3 bg-gray-200 rounded-full"></div>
    </div>
  );

  return (
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
            onClick={navigateBack}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Voltar</span>
          </button>
          <span className="text-sm text-gray-500">Etapa 3 de 6</span>
        </div>

        {/* Progress */}
        <ProgressDots />

        {/* Title */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            📜 Termos de Uso
          </h1>
          <p className="text-gray-600">
            Antes de continuar, precisamos do seu aceite aos termos
          </p>
        </div>

        {/* Terms Content */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
          <div className="space-y-4">
            {/* PDF Buttons */}
            <div className="space-y-3">
              <Button
                variant="outline"
                onClick={() => window.open('/termos', '_blank')}
                className="w-full justify-start"
              >
                📋 Ler Termos de Uso
              </Button>
              <Button
                variant="outline"
                onClick={() => window.open('/privacidade', '_blank')}
                className="w-full justify-start"
              >
                🔒 Ler Política de Privacidade
              </Button>
            </div>

            {/* Checkboxes */}
            <div className="space-y-4 pt-4">
              <div className="flex items-start space-x-2">
                <Checkbox
                  id="termos"
                  checked={termosAccepted}
                  onCheckedChange={(checked) => setTermosAccepted(checked as boolean)}
                />
                <label htmlFor="termos" className="text-sm text-gray-700 leading-5">
                  Li e aceito os Termos de Uso
                </label>
              </div>
              
              <div className="flex items-start space-x-2">
                <Checkbox
                  id="politica"
                  checked={politicaAccepted}
                  onCheckedChange={(checked) => setPoliticaAccepted(checked as boolean)}
                />
                <label htmlFor="politica" className="text-sm text-gray-700 leading-5">
                  Li e aceito a Política de Privacidade
                </label>
              </div>
            </div>

            {/* Continue Button */}
            <Button
              onClick={handleAcceptTerms}
              disabled={!canContinue || updating}
              className="w-full mt-6"
            >
              {updating ? (
                <div className="flex items-center gap-2">
                  <LoadingSpinner className="w-4 h-4" />
                  Salvando...
                </div>
              ) : (
                'Aceitar e Continuar'
              )}
            </Button>
          </div>
        </div>

        {/* Loading overlay */}
        {updating && (
          <div className="fixed inset-0 bg-black/20 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 flex items-center gap-3">
              <LoadingSpinner className="w-5 h-5 text-primary" />
              <span className="text-gray-600">Salvando progresso...</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TermosOnboarding;