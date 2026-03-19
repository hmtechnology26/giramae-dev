
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  // Only accept POST requests
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  try {
    console.log('🚀 [create-mercadopago-preference] Iniciando criação de preferência');

    // Create Supabase client for auth and config
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Get authenticated user
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("Authorization header is required");
    }

    const token = authHeader.replace("Bearer ", "");
    
    // Verificar usuário autenticado
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    
    if (userError || !userData.user) {
      throw new Error("User not authenticated");
    }

    const user = userData.user;
    const { quantidade } = await req.json();

    // 🔒 SEGURANÇA: Validações rigorosas
    if (!quantidade || !Number.isInteger(quantidade)) {
      throw new Error('Quantidade deve ser um número inteiro');
    }

    if (quantidade < 10 || quantidade > 999000) {
      throw new Error('Quantidade deve estar entre 10 e 999.000 Girinhas');
    }

    // 🆕 NOVO: Buscar configuração de ambiente (teste/produção)
    const { data: configData } = await supabaseClient
      .from('config_sistema')
      .select('valor')
      .eq('chave', 'mercadopago_ambiente_teste')
      .single();

    const usarAmbienteTeste = configData?.valor?.ativo ?? true;

    console.log('⚙️ [create-mercadopago-preference] Configuração ambiente:', {
      usarAmbienteTeste,
      ambiente: usarAmbienteTeste ? 'TESTE (Sandbox)' : 'PRODUÇÃO'
    });

    const valorTotal = quantidade * 1.00; // R$ 1,00 por Girinha

    // 🔒 SEGURANÇA: Gerar referência única com timestamp e user ID
    const externalReference = `girinha_${user.id}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    console.log('💰 [create-mercadopago-preference] Criando preferência:', {
      quantidade,
      valorTotal,
      userId: user.id,
      externalReference,
      ambiente: usarAmbienteTeste ? 'TESTE' : 'PRODUÇÃO'
    });

    // 🔒 CORREÇÃO: URLs base corrigidas
    const baseUrl = Deno.env.get('SITE_URL') || 'http://localhost:3000';
    
    // 🔧 CORREÇÃO: Configurar payer baseado no ambiente
    const payerConfig = usarAmbienteTeste 
      ? {} // Em teste, deixa o MP gerenciar o login sem email específico
      : { email: user.email }; // Em produção, usa o email do usuário logado

    console.log('👤 [create-mercadopago-preference] Configuração do payer:', {
      ambiente: usarAmbienteTeste ? 'TESTE' : 'PRODUÇÃO',
      payerConfig: usarAmbienteTeste ? 'Login gerenciado pelo MP' : `Email: ${user.email}`
    });
    
    const preferenceData = {
      items: [{
        id: 'girinhas',
        title: `${quantidade} Girinhas - GiraMãe`,
        description: `Compra de ${quantidade} Girinhas para marketplace de trocas entre mães`,
        quantity: 1,
        currency_id: 'BRL',
        unit_price: valorTotal
      }],
      payer: payerConfig, // 🔧 Configuração dinâmica do payer
      external_reference: externalReference,
      notification_url: `${Deno.env.get('SUPABASE_URL')}/functions/v1/mercadopago-webhook`,
      back_urls: {
        success: `${baseUrl}/carteira?payment=success&ref=${externalReference}`,
        failure: `${baseUrl}/carteira?payment=failure&ref=${externalReference}`,
        pending: `${baseUrl}/carteira?payment=pending&ref=${externalReference}`
      },
      auto_return: 'approved',
      statement_descriptor: 'GIRAMAE_GIRINHAS',
      payment_methods: {
        excluded_payment_types: [],
        installments: 12,
        default_installments: 1
      },
      // 🔒 SEGURANÇA: Expiração automática de 30 minutos
      expires: true,
      expiration_date_from: new Date().toISOString(),
      expiration_date_to: new Date(Date.now() + 30 * 60 * 1000).toISOString()
    };

    // 🔒 SEGURANÇA: Requisição autenticada ao Mercado Pago
    const mpAccessToken = Deno.env.get('MERCADO_PAGO_ACCESS_TOKEN');
    if (!mpAccessToken) {
      throw new Error('MERCADO_PAGO_ACCESS_TOKEN não configurado');
    }

    const response = await fetch('https://api.mercadopago.com/checkout/preferences', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${mpAccessToken}`,
        'Content-Type': 'application/json',
        'X-Idempotency-Key': externalReference
      },
      body: JSON.stringify(preferenceData)
    });

    const preference = await response.json();

    if (!response.ok) {
      console.error('❌ [create-mercadopago-preference] Erro na API do Mercado Pago:', preference);
      throw new Error(preference.message || 'Erro ao criar preferência de pagamento');
    }

    console.log('✅ [create-mercadopago-preference] Preferência criada com sucesso:', preference.id);

    // 🆕 INTELIGENTE: Selecionar URL baseada na configuração
    const checkoutUrl = usarAmbienteTeste 
      ? preference.sandbox_init_point 
      : preference.init_point;

    console.log('🔗 [create-mercadopago-preference] URL selecionada:', {
      ambiente: usarAmbienteTeste ? 'TESTE' : 'PRODUÇÃO',
      url: checkoutUrl
    });

    return new Response(JSON.stringify({
      preference_id: preference.id,
      init_point: preference.init_point,
      external_reference: externalReference,
      sandbox_init_point: preference.sandbox_init_point,
      checkout_url: checkoutUrl, // 🆕 URL já selecionada baseada na config
      ambiente: usarAmbienteTeste ? 'teste' : 'producao'
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    console.error('❌ [create-mercadopago-preference] Erro:', error);
    
    const errorMessage = error instanceof Error ? error.message : "Erro interno do servidor";
    return new Response(JSON.stringify({ 
      error: errorMessage,
      timestamp: new Date().toISOString()
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
