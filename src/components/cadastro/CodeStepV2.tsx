import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { MessageCircle, Timer, RefreshCw, CheckCircle } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

interface CodeStepV2Props {
  onComplete: () => void;
}

const CodeStepV2: React.FC<CodeStepV2Props> = ({ onComplete }) => {
  const { user } = useAuth();
  const [codeInputs, setCodeInputs] = useState(['', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [timeLeft, setTimeLeft] = useState(600); // 10 minutos
  const [isPhoneVerified, setIsPhoneVerified] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [initialLoading, setInitialLoading] = useState(true);
  const { toast } = useToast();

  // Carregar dados do perfil e verificar status
  useEffect(() => {
    const loadProfileData = async () => {
      if (!user) return;
      
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('telefone, telefone_verificado, verification_code_expires')
          .eq('id', user.id)
          .single();

        if (error) {
          console.error('Erro ao carregar dados do perfil:', error);
          return;
        }

        if (data) {
          setPhoneNumber(data.telefone || '');
          
          if (data.telefone_verificado) {
            setIsPhoneVerified(true);
            console.log('✅ Telefone já verificado, avançando automaticamente...');
            // Se telefone já foi verificado, avançar imediatamente
            setTimeout(() => {
              onComplete();
            }, 500);
            return;
          }

          // Calcular tempo restante se há expiração
          if (data.verification_code_expires) {
            const expiresAt = new Date(data.verification_code_expires);
            const now = new Date();
            const secondsLeft = Math.max(0, Math.floor((expiresAt.getTime() - now.getTime()) / 1000));
            setTimeLeft(secondsLeft);
          }
        }
      } catch (error) {
        console.error('Erro ao carregar dados:', error);
      } finally {
        setInitialLoading(false);
      }
    };

    loadProfileData();
  }, [user, onComplete]);

  // Timer countdown - não avança automaticamente quando expira
  useEffect(() => {
    if (timeLeft > 0 && !isPhoneVerified) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [timeLeft, isPhoneVerified]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

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

  const handleCodeInput = (index: number, value: string) => {
    if (value.length > 1) return;
    
    const newInputs = [...codeInputs];
    newInputs[index] = value;
    setCodeInputs(newInputs);

    // Focar no próximo input
    if (value && index < 3) {
      const nextInput = document.getElementById(`code-${index + 1}`);
      nextInput?.focus();
    }

    // Auto-submit quando todos os 4 dígitos forem preenchidos
    const fullCode = newInputs.join('');
    if (fullCode.length === 4) {
      setTimeout(() => handleSubmit(fullCode), 100);
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !codeInputs[index] && index > 0) {
      const prevInput = document.getElementById(`code-${index - 1}`);
      prevInput?.focus();
    }
  };

  const handleSubmit = async (code?: string) => {
    // Se já foi verificado, apenas avançar
    if (isPhoneVerified) {
      onComplete();
      return;
    }

    const finalCode = code || codeInputs.join('');
    
    if (finalCode.length !== 4) {
      toast({
        title: "Código incompleto",
        description: "Por favor, insira o código de 4 dígitos.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    
    try {
      console.log('🔍 Verificando código:', finalCode);
      
      // Verificar código diretamente no banco
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('verification_code, verification_code_expires, telefone_verificado')
        .eq('id', user?.id)
        .single();

      if (profileError) {
        console.error('❌ Erro ao buscar perfil:', profileError);
        toast({
          title: "Erro na verificação",
          description: "Erro ao verificar código.",
          variant: "destructive",
        });
        setCodeInputs(['', '', '', '']);
        return;
      }

      if (profile?.telefone_verificado) {
        console.log('✅ Telefone já verificado');
        setIsPhoneVerified(true);
        onComplete();
        return;
      }

      if (!profile?.verification_code) {
        toast({
          title: "Código não encontrado",
          description: "Solicite um novo código.",
          variant: "destructive",
        });
        setCodeInputs(['', '', '', '']);
        return;
      }

      if (profile.verification_code_expires && new Date(profile.verification_code_expires) < new Date()) {
        toast({
          title: "Código expirado",
          description: "Solicite um novo código.",
          variant: "destructive",
        });
        setCodeInputs(['', '', '', '']);
        return;
      }

      if (profile.verification_code === finalCode) {
        // ✅ ÚNICO LOCAL ONDE telefone_verificado = true DEVE SER DEFINIDO
        const { error: updateError } = await supabase
          .from('profiles')
          .update({
            telefone_verificado: true, // ✅ SÓ AQUI, após verificar código correto
            verification_code: null,
            verification_code_expires: null,
            cadastro_step: 'personal'
          })
          .eq('id', user?.id);

        if (updateError) {
          console.error('❌ Erro ao atualizar perfil:', updateError);
          toast({
            title: "Erro na verificação",
            description: "Erro ao confirmar código.",
            variant: "destructive",
          });
          return;
        }

        console.log('✅ Código verificado com sucesso - telefone_verificado = true');
        toast({
          title: "Código verificado!",
          description: "Seu telefone foi confirmado com sucesso.",
        });
        setIsPhoneVerified(true);
        onComplete();
      } else {
        console.log('❌ Código inválido');
        toast({
          title: "Código incorreto",
          description: "Verifique o código e tente novamente.",
          variant: "destructive",
        });
        setCodeInputs(['', '', '', '']);
        const firstInput = document.getElementById('code-0');
        firstInput?.focus();
      }
    } catch (error: any) {
      console.error('❌ Erro na verificação:', error);
      toast({
        title: "Erro na verificação",
        description: "Erro interno. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendCode = async () => {
    if (isPhoneVerified) {
      toast({
        title: "Telefone já verificado",
        description: "Seu número já foi confirmado.",
        variant: "destructive",
      });
      return;
    }

    setIsResending(true);
    
    try {
      console.log('🔄 Reenviando código...');
      
      // Gerar novo código
      const newCode = Math.floor(1000 + Math.random() * 9000).toString();
      const newExpiry = new Date(Date.now() + 10 * 60 * 1000).toISOString();
      
      // ✅ MANTER telefone_verificado = false ao reenviar código
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          telefone_verificado: false, // ✅ GARANTIR que continua false até verificar
          verification_code: newCode,
          verification_code_expires: newExpiry
        })
        .eq('id', user?.id);

      if (updateError) {
        console.error('❌ Erro ao atualizar código:', updateError);
        toast({
          title: "Erro ao reenviar",
          description: "Não foi possível gerar um novo código.",
          variant: "destructive",
        });
        return;
      }

      // Enviar novo código via WhatsApp
      const { data: whatsappData, error: whatsappError } = await supabase.functions.invoke('send-whatsapp', {
        body: { 
          telefone: phoneNumber,
          phoneNumber: `+${phoneNumber}`,
          numero_whatsapp: phoneNumber,
          codigo: newCode,
          verificationCode: newCode,
          nome: user?.user_metadata?.full_name || user?.user_metadata?.name || 'usuário',
          name: user?.user_metadata?.full_name || user?.user_metadata?.name || 'usuário'
        }
      });

      if (whatsappError || !whatsappData?.success) {
        console.error('❌ Erro no WhatsApp:', whatsappError);
        toast({
          title: "Erro ao enviar WhatsApp",
          description: whatsappData?.error || whatsappError?.message || "Falha no envio do novo código.",
          variant: "destructive",
        });
        return;
      }

      console.log('✅ Código reenviado - telefone_verificado mantido como false');
      toast({
        title: "Código reenviado!",
        description: "Um novo código foi enviado para seu WhatsApp.",
      });
      
      // Reset timer para 10 minutos
      setTimeLeft(600);
      
      // Limpar inputs
      setCodeInputs(['', '', '', '']);
      const firstInput = document.getElementById('code-0');
      firstInput?.focus();
      
    } catch (error: any) {
      console.error('❌ Erro ao reenviar:', error);
      toast({
        title: "Erro ao reenviar",
        description: "Erro interno. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsResending(false);
    }
  };

  // Loading inicial
  if (initialLoading) {
    return (
      <div className="px-6 pb-5 pt-1">
        <div className="flex items-center justify-center py-8">
          <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          <span className="ml-2 text-gray-600">Carregando...</span>
        </div>
      </div>
    );
  }

  // Se telefone já foi verificado, mostrar status
  if (isPhoneVerified) {
    return (
      <div className="px-6 pb-5 pt-1">
        <div className="text-center py-6">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Telefone já verificado!
          </h3>
          <p className="text-sm text-gray-600 mb-4">
            Seu número foi confirmado com sucesso.
          </p>
          <Button 
            onClick={onComplete}
            className="w-full bg-green-600 hover:bg-green-700 text-white"
          >
            Continuar
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="px-6 pb-5 pt-1">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Insira o código do WhatsApp
        </h3>
        
        {/* WhatsApp Info */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4">
          <div className="flex items-center gap-2 mb-1">
            <MessageCircle className="w-4 h-4 text-green-600" />
            <span className="text-sm font-medium text-green-800">Código enviado via WhatsApp</span>
          </div>
          <p className="text-xs text-green-700">
            Enviado para: {formatPhoneDisplay(phoneNumber)}
          </p>
        </div>

        {/* Timer */}
        {timeLeft > 0 ? (
          <div className="flex items-center justify-center gap-2 mb-4">
            <Timer className="w-4 h-4 text-gray-500" />
            <span className="text-sm text-gray-600">
              Código expira em: <span className="font-mono font-semibold text-orange-600">{formatTime(timeLeft)}</span>
            </span>
          </div>
        ) : (
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 mb-4">
            <p className="text-sm text-orange-800 text-center">
              ⏰ Código expirado. Solicite um novo código para continuar.
            </p>
          </div>
        )}
        
        {/* Code Inputs */}
        <div className="flex gap-3 justify-center mb-4">
          {codeInputs.map((value, index) => (
            <Input
              key={index}
              id={`code-${index}`}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={value}
              onChange={(e) => handleCodeInput(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              className="w-12 h-12 text-center text-lg font-semibold border-2 focus:border-green-500"
              disabled={isLoading || timeLeft === 0}
              autoComplete="off"
            />
          ))}
        </div>
        
        {/* Submit Button */}
        <Button 
          onClick={() => handleSubmit()}
          disabled={isLoading || codeInputs.join('').length !== 4 || timeLeft === 0}
          className="w-full bg-green-600 hover:bg-green-700 text-white mb-4"
        >
          {isLoading ? (
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Verificando...
            </div>
          ) : (
            'Verificar código'
          )}
        </Button>
        
        {/* Resend Button */}
        <div className="text-center">
          <Button
            variant="outline"
            size="sm"
            onClick={handleResendCode}
            disabled={isResending || timeLeft > 0}
            className="text-green-600 border-green-600 hover:bg-green-50"
          >
            {isResending ? (
              <div className="flex items-center gap-2">
                <RefreshCw className="w-4 h-4 animate-spin" />
                Reenviando...
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <MessageCircle className="w-4 h-4" />
                {timeLeft > 0 ? `Reenviar em ${formatTime(timeLeft)}` : 'Reenviar código via WhatsApp'}
              </div>
            )}
          </Button>
        </div>
        
        <p className="text-xs text-gray-500 mt-4 text-center">
          💡 Se não recebeu no WhatsApp, verifique se o número está correto
        </p>
      </div>
    </div>
  );
};

export default CodeStepV2;
