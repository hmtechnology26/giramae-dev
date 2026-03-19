import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';
import { useOnboarding } from '@/hooks/useOnboarding';
import { useRegiao } from '@/hooks/useRegiao';
import LoadingSpinner from '@/components/loading/LoadingSpinner';

const AguardandoLiberacao: React.FC = () => {
  const { user } = useAuth();
  const { profile, loading } = useOnboarding();
  const { cidade, estado, usuariosAguardando, loading: loadingRegiao } = useRegiao();

  if (loading || loadingRegiao) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 flex items-center justify-center">
        <LoadingSpinner className="w-8 h-8 text-primary" />
      </div>
    );
  }

  const formatPhoneDisplay = (phone: string) => {
    if (!phone) return '';
    const cleaned = phone.replace(/\D/g, '').replace(/^55/, '');
    if (cleaned.length >= 11) {
      return `(${cleaned.substring(0, 2)}) ${cleaned.substring(2, 7)}-${cleaned.substring(7)}`;
    } else if (cleaned.length >= 10) {
      return `(${cleaned.substring(0, 2)}) ${cleaned.substring(2, 6)}-${cleaned.substring(6)}`;
    }
    return phone;
  };

  const handleInviteClick = () => {
    const whatsappMessage = encodeURIComponent(
      `Oi! Acabei de me cadastrar na GiraMãe, um app incrível para trocar roupas e brinquedos das crianças entre mães da mesma região! 👶👕\n\nVocê deveria se cadastrar também! É gratuito e ajuda a economizar e dar nova vida aos itens das crianças. 💚\n\nAcesse: https://giramae.com.br`
    );
    window.open(`https://wa.me/?text=${whatsappMessage}`, '_blank');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50">
      <div className="max-w-md mx-auto px-4 py-6">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="text-4xl font-bold text-primary mb-2">
            GiraMãe
          </div>
        </div>

        {/* Title */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            🎉 Parabéns!
          </h1>
          <p className="text-xl text-gray-700 mb-4">
            Cadastro completo!
          </p>
          <h2 className="text-lg font-semibold text-gray-800">
            {cidade && estado ? (
              `🏘️ Aguardando liberação para ${cidade}/${estado}`
            ) : (
              '🏘️ Aguardando liberação para sua região'
            )}
          </h2>
        </div>

        {/* Main Content */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <p className="text-gray-700 mb-6">
              {cidade && estado ? (
                usuariosAguardando > 0 ? (
                  <>
                    Sua região tem <span className="font-semibold text-orange-600">{usuariosAguardando} usuárias</span> aguardando liberação.
                    <br />
                    Você será notificada assim que {cidade} for ativada!
                  </>
                ) : (
                  `Você é a primeira usuária cadastrada em ${cidade}! Convide suas amigas para acelerar a liberação da região.`
                )
              ) : (
                'Para que a troca de itens funcione bem, precisamos de uma comunidade ativa em cada região.'
              )}
            </p>

            {/* Completed Tasks */}
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-gray-900 mb-3">
                ✅ Você já fez sua parte:
              </h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>• WhatsApp verificado</li>
                <li>• Termos aceitos</li>
                <li>• Endereço confirmado</li>
                <li>• 2 itens cadastrados</li>
              </ul>
            </div>

            {/* Next Steps */}
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-3">
                ⏳ O que acontece agora:
              </h3>
              <p className="text-sm text-gray-600">
                Quando atingirmos o número ideal de usuárias no seu bairro, você receberá uma mensagem no WhatsApp e poderá começar a usar a plataforma!
              </p>
            </div>
          </CardContent>
        </Card>

        {/* WhatsApp Contact */}
        <div className="text-center mb-6">
          <p className="text-sm text-gray-600 mb-2">
            📱 Te avisaremos pelo WhatsApp:
          </p>
          <p className="text-sm font-mono font-semibold text-gray-900">
            +55 {formatPhoneDisplay(profile?.telefone || '')}
          </p>
        </div>

        {/* Invite Button */}
        <Button
          onClick={handleInviteClick}
          className="w-full bg-green-600 hover:bg-green-700 text-white"
        >
          Convidar Amigas
        </Button>

        {/* Additional Info */}
        <div className="mt-6 text-center">
          <p className="text-xs text-gray-500">
            Quanto mais mães se cadastrarem em sua região, mais rápido liberamos o acesso para todos! 🚀
          </p>
        </div>
      </div>
    </div>
  );
};

export default AguardandoLiberacao;