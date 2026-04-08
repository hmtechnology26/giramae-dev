import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { MessageCircle, CheckCircle } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

interface PhoneStepV2Props {
  onComplete: () => void;
}

const PhoneStepV2: React.FC<PhoneStepV2Props> = ({ onComplete }) => {
  const { user } = useAuth();
  const [phone, setPhone] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isPhoneVerified, setIsPhoneVerified] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const { toast } = useToast();

  // Carregar dados do perfil ao inicializar
  useEffect(() => {
    const loadProfileData = async () => {
      if (!user) return;
      
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('telefone, telefone_verificado')
          .eq('id', user.id)
          .single();

        if (error) {
          console.error('Erro ao carregar dados do perfil:', error);
          return;
        }

        if (data) {
          if (data.telefone) {
            setPhone(formatPhoneDisplay(data.telefone.replace('55', '')));
          }
          
          if (data.telefone_verificado) {
            setIsPhoneVerified(true);
            console.log('✅ Telefone já verificado, avançando automaticamente...');
            // Se telefone já foi verificado, avançar imediatamente
            setTimeout(() => {
              onComplete();
            }, 500);
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

  const cleanPhoneNumber = (phoneNumber: string) => {
    // Remove tudo que não é número
    let cleaned = phoneNumber.replace(/\D/g, '');
    
    // Se começar com 0, remove
    if (cleaned.startsWith('0')) {
      cleaned = cleaned.substring(1);
    }
    
    // Se começar com 55, remove (usuário não precisa digitar)
    if (cleaned.startsWith('55')) {
      cleaned = cleaned.substring(2);
    }
    
    // Adiciona o 55 automaticamente
    return '55' + cleaned;
  };

  const formatPhoneDisplay = (phone: string) => {
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length >= 11) {
      // Formato: (XX) XXXXX-XXXX (celular 9 dígitos)
      return `(${cleaned.substring(0, 2)}) ${cleaned.substring(2, 7)}-${cleaned.substring(7)}`;
    } else if (cleaned.length >= 10) {
      // Formato: (XX) XXXX-XXXX (fixo 8 dígitos)
      return `(${cleaned.substring(0, 2)}) ${cleaned.substring(2, 6)}-${cleaned.substring(6)}`;
    } else if (cleaned.length >= 6) {
      // Formato parcial: (XX) XXXXX
      return `(${cleaned.substring(0, 2)}) ${cleaned.substring(2)}`;
    } else if (cleaned.length >= 2) {
      // Formato parcial: (XX)
      return `(${cleaned.substring(0, 2)}) ${cleaned.substring(2)}`;
    }
    return phone;
  };

  const handlePhoneChange = (value: string) => {
    // Se telefone já foi verificado, não permitir alteração
    if (isPhoneVerified) {
      toast({
        title: "Telefone já verificado",
        description: "Seu número já foi confirmado e não pode ser alterado.",
        variant: "destructive",
      });
      return;
    }

    const formatted = value.replace(/[^\d\s()\-]/g, '');
    setPhone(formatPhoneDisplay(formatted));
  };

  const handleSubmit = async () => {
    // Se já foi verificado, apenas avançar
    if (isPhoneVerified) {
      onComplete();
      return;
    }

    if (!phone.trim()) {
      toast({
        title: "Campo obrigatório",
        description: "Por favor, insira seu número de telefone.",
        variant: "destructive",
      });
      return;
    }

    const cleanPhone = cleanPhoneNumber(phone);
    
    // Validação: deve ter pelo menos 10 dígitos (55 + DDD + número)
    if (cleanPhone.length < 12 || cleanPhone.length > 13) {
      toast({
        title: "Telefone inválido",
        description: "Por favor, insira um número válido com DDD.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    
    try {
      console.log('📱 Salvando telefone e gerando código:', cleanPhone);
      
      // ✅ Verificar se o telefone já existe em outra conta
      const { data: existingProfile, error: checkError } = await supabase
        .from('profiles')
        .select('id')
        .eq('telefone', cleanPhone)
        .neq('id', user?.id)
        .maybeSingle();
      
      if (checkError && checkError.code !== 'PGRST116') {
        console.error('❌ Erro ao verificar telefone:', checkError);
        toast({
          title: "Erro de verificação",
          description: "Não foi possível verificar o número.",
          variant: "destructive",
        });
        return;
      }
      
      if (existingProfile) {
        console.log('❌ Telefone já existe em outra conta');
        toast({
          title: "WhatsApp já cadastrado",
          description: "Este número já está sendo usado por outra conta. Tente fazer login ou use outro número.",
          variant: "destructive",
        });
        return;
      }
      
      // ✅ Salvar telefone
      const { data, error } = await supabase
        .from('profiles')
        .update({
          telefone: cleanPhone,
          telefone_verificado: false,
          verification_code: Math.floor(1000 + Math.random() * 9000).toString(),
          verification_code_expires: new Date(Date.now() + 10 * 60 * 1000).toISOString(),
          cadastro_step: 'code'
        })
        .eq('id', user?.id)
        .select('verification_code')
        .single();

      if (error) {
        console.error('❌ Erro ao salvar telefone:', error);
        
        // Tratar erro de duplicata
        if (error.code === '23505') {
          toast({
            title: "WhatsApp já cadastrado",
            description: "Este número já está sendo usado por outra conta. Tente fazer login ou use outro número.",
            variant: "destructive",
          });
          return;
        }
        
        toast({
          title: "Erro ao salvar telefone",
          description: error.message || "Não foi possível salvar o telefone.",
          variant: "destructive",
        });
        return;
      }

      const verificationCode = data?.verification_code;
      
      if (!verificationCode) {
        toast({
          title: "Erro",
          description: "Não foi possível gerar o código de verificação.",
          variant: "destructive",
        });
        return;
      }

      console.log('✅ Telefone salvo com telefone_verificado = false, código gerado:', verificationCode);
      
      // Enviar WhatsApp com o código gerado
      const { data: whatsappData, error: whatsappError } = await supabase.functions.invoke('send-whatsapp', {
        body: { 
          telefone: cleanPhone,
          phoneNumber: `+${cleanPhone}`,
          numero_whatsapp: cleanPhone,
          codigo: verificationCode,
          verificationCode,
          nome: user?.user_metadata?.full_name || user?.user_metadata?.name || 'usuário',
          name: user?.user_metadata?.full_name || user?.user_metadata?.name || 'usuário'
        }
      });

      if (whatsappError || !whatsappData?.success) {
        console.error('❌ Erro no WhatsApp:', whatsappError);
        toast({
          title: "Erro ao enviar WhatsApp",
          description: whatsappData?.error || "Falha no envio do código.",
          variant: "destructive",
        });
        return;
      }

      console.log('✅ WhatsApp enviado com sucesso');
      
      toast({
        title: "Código enviado!",
        description: `Código enviado para +55 ${formatPhoneDisplay(phone)} via WhatsApp.`,
      });
      
      onComplete();
    } catch (error: any) {
      console.error('❌ Erro no processo:', error);
      toast({
        title: "Erro",
        description: "Erro interno. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
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
            Seu número {phone} já foi confirmado anteriormente.
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
          Adicione seu celular
        </h3>
        
        <p className="text-sm text-gray-600 mb-4">
          Vamos te enviar um código de verificação via WhatsApp.
        </p>
        
        <label className="text-sm font-medium text-gray-700 mb-2 block">
          Número do WhatsApp
        </label>
        <div className="relative mb-4">
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 font-medium">
            +55
          </div>
          <Input
            type="tel"
            placeholder="(31) 9999-9999 ou (31) 99999-9999"
            value={phone}
            onChange={(e) => handlePhoneChange(e.target.value)}
            className="pl-12"
            disabled={isLoading || isPhoneVerified}
          />
        </div>
        
        <Button 
          onClick={handleSubmit} 
          disabled={isLoading || !phone.trim()}
          className="w-full bg-green-600 hover:bg-green-700 text-white"
        >
          {isLoading ? (
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Enviando código...
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <MessageCircle className="w-4 h-4" />
              Enviar código via WhatsApp
            </div>
          )}
        </Button>
        
        {/* Info adicional */}
        <p className="text-xs text-gray-500 mt-3 text-center">
          💡 Digite seu número com DDD (aceita 8 ou 9 dígitos)
        </p>
      </div>
    </div>
  );
};

export default PhoneStepV2;
