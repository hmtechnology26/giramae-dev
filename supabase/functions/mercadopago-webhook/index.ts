
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.7";

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
    console.log('🔔 [mercadopago-webhook] Webhook recebido do Mercado Pago');

    const body = await req.text();
    console.log('📥 [mercadopago-webhook] Raw body:', body);

    // Parse webhook data
    let webhookData;
    try {
      webhookData = JSON.parse(body);
    } catch (parseError) {
      console.error('❌ [mercadopago-webhook] Erro ao parsear JSON:', parseError);
      return new Response("Invalid JSON", { status: 400 });
    }

    // Normalize different webhook formats
    let paymentId, webhookType, action;
    
    if (webhookData.data?.id) {
      // New format: { type: "payment", data: { id: "123" } }
      paymentId = webhookData.data.id;
      webhookType = webhookData.type;
      action = webhookData.action;
    } else if (webhookData.topic === 'payment' && webhookData.resource) {
      // Alternative format: { topic: "payment", resource: "https://..." }
      const resourceUrl = webhookData.resource;
      const matches = resourceUrl.match(/\/payments\/(\d+)/);
      paymentId = matches ? matches[1] : null;
      webhookType = webhookData.topic;
    } else if (webhookData.topic === 'merchant_order') {
      // Ignore merchant_order events
      console.log('⏭️ [mercadopago-webhook] Evento merchant_order ignorado');
      return new Response("Merchant order ignored", { status: 200 });
    }

    console.log('📥 [mercadopago-webhook] Dados recebidos:', {
      type: webhookType,
      action: action,
      dataId: paymentId,
      rawData: webhookData
    });

    // Process only payment events
    if (webhookType !== 'payment') {
      console.log('⏭️ [mercadopago-webhook] Evento ignorado:', webhookType);
      return new Response("Event ignored", { status: 200 });
    }

    if (!paymentId) {
      console.error('❌ [mercadopago-webhook] Payment ID não encontrado no webhook');
      return new Response("Payment ID not found", { status: 400 });
    }

    // Get MP access token
    const mpAccessToken = Deno.env.get('MERCADO_PAGO_ACCESS_TOKEN');
    if (!mpAccessToken) {
      throw new Error('MERCADO_PAGO_ACCESS_TOKEN não configurado');
    }

    console.log('🔑 [mercadopago-webhook] Token info:', {
      length: mpAccessToken.length,
      prefix: mpAccessToken.substring(0, 15) + '...',
      isAppToken: mpAccessToken.startsWith('APP_USR-')
    });

    // Enhanced retry logic with exponential backoff
    let payment = null;
    let attempts = 0;
    const maxAttempts = 5;
    const baseDelay = 1000; // 1 second base

    while (attempts < maxAttempts && !payment) {
      attempts++;
      
      // Exponential backoff: 1s, 2s, 4s, 8s, 16s
      const delay = attempts > 1 ? baseDelay * Math.pow(2, attempts - 2) : 0;
      
      if (delay > 0) {
        console.log(`🔄 [mercadopago-webhook] Tentativa ${attempts}/${maxAttempts} - Aguardando ${delay / 1000}s...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      } else {
        console.log(`🔍 [mercadopago-webhook] Tentativa ${attempts}/${maxAttempts} - Buscando pagamento: ${paymentId}`);
      }

      const paymentUrl = `https://api.mercadopago.com/v1/payments/${paymentId}`;
      console.log('🌐 [mercadopago-webhook] URL da requisição:', paymentUrl);

      const paymentResponse = await fetch(paymentUrl, {
        headers: {
          'Authorization': `Bearer ${mpAccessToken}`
        }
      });

      console.log('📡 [mercadopago-webhook] Response status:', {
        status: paymentResponse.status,
        statusText: paymentResponse.statusText,
        tentativa: attempts
      });

      if (paymentResponse.ok) {
        payment = await paymentResponse.json();
        console.log('✅ [mercadopago-webhook] Pagamento encontrado na tentativa', attempts);
        break;
      } else if (paymentResponse.status === 404) {
        // Common in sandbox - timing issue
        const errorText = await paymentResponse.text();
        console.log(`⚠️ [mercadopago-webhook] Payment não encontrado (tentativa ${attempts}/${maxAttempts}):`, errorText);
        
        if (attempts >= maxAttempts) {
          // Don't return 500 to avoid infinite retry loop
          console.log('❌ [mercadopago-webhook] Payment não encontrado após todas as tentativas');
          console.log('📋 [mercadopago-webhook] Possível timing issue no sandbox - retornando 200 para evitar loops');
          
          return new Response(JSON.stringify({
            warning: "Payment not found after retries",
            recommendation: "This is common in sandbox environment due to timing issues",
            payment_id: paymentId,
            attempts: maxAttempts,
            environment: "sandbox_timing_issue"
          }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 200, // Return 200 to prevent MP retry loop
          });
        }
      } else {
        // Other HTTP errors
        const errorText = await paymentResponse.text();
        console.error('❌ [mercadopago-webhook] Erro HTTP na API do MP:', {
          status: paymentResponse.status,
          body: errorText,
          tentativa: attempts
        });
        
        // Fail immediately for non-404 errors
        throw new Error(`Erro na API do MP: ${paymentResponse.status} - ${errorText}`);
      }
    }

    if (!payment) {
      console.log('❌ [mercadopago-webhook] Payment ainda não encontrado após todas as tentativas');
      return new Response(JSON.stringify({
        error: "Payment not found after retries",
        payment_id: paymentId,
        attempts: maxAttempts
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200, // 200 to prevent infinite retry
      });
    }
    
    console.log('💳 [mercadopago-webhook] Dados do pagamento obtidos:', {
      id: payment.id,
      status: payment.status,
      amount: payment.transaction_amount,
      external_reference: payment.external_reference,
      payment_method: payment.payment_method_id,
      live_mode: payment.live_mode
    });

    // Process only approved payments
    if (payment.status !== 'approved') {
      console.log(`⏳ [mercadopago-webhook] Pagamento não aprovado (status: ${payment.status}) - Aguardando aprovação`);
      return new Response(JSON.stringify({
        message: "Payment not approved yet",
        status: payment.status,
        payment_id: payment.id
      }), { 
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200 
      });
    }

    // Validate external reference
    const externalRef = payment.external_reference;
    if (!externalRef || !externalRef.startsWith('girinha_')) {
      console.error('❌ [mercadopago-webhook] Referência externa inválida:', externalRef);
      throw new Error('Referência externa inválida');
    }

    // Extract user_id from external reference
    const refParts = externalRef.split('_');
    if (refParts.length < 4) {
      throw new Error('Formato de referência externa inválido');
    }

    const userId = refParts[1];
    const quantidade = Math.floor(payment.transaction_amount); // Quantity = paid amount in reais
    
    console.log('💰 [mercadopago-webhook] Processando compra aprovada:', {
      userId,
      quantidade,
      paymentId: payment.id,
      externalRef,
      ambiente: payment.live_mode ? 'PRODUÇÃO' : 'SANDBOX'
    });

    // Validate data before processing
    if (!userId || !quantidade || quantidade < 10 || quantidade > 999000) {
      throw new Error(`Dados inválidos: userId=${userId}, quantidade=${quantidade}`);
    }

    // Create Supabase client with service role for database operations
    const supabaseService = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    // Process purchase using secure RPC function
    const { data: result, error } = await supabaseService.rpc('processar_compra_webhook_segura', {
      p_user_id: userId,
      p_quantidade: quantidade,
      p_payment_id: payment.id,
      p_external_reference: externalRef,
      p_payment_method: payment.payment_method_id || 'mercadopago',
      p_payment_status: payment.status
    });
    
    if (error) {
      console.error('❌ [mercadopago-webhook] Erro ao processar compra:', error);
      
      // If it's a duplication error, it's not critical
      if (error.message?.includes('já processado')) {
        console.log('ℹ️ [mercadopago-webhook] Pagamento já foi processado anteriormente');
        return new Response(JSON.stringify({
          success: true,
          message: "Payment already processed",
          payment_id: payment.id
        }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        });
      }
      
      throw error;
    }
    
    console.log('🎉 [mercadopago-webhook] Compra processada com sucesso!', {
      userId,
      quantidade,
      paymentId: payment.id,
      resultado: result,
      ambiente: payment.live_mode ? 'PRODUÇÃO' : 'SANDBOX'
    });

    return new Response(JSON.stringify({
      success: true,
      message: "Webhook processed successfully",
      payment_id: payment.id,
      user_id: userId,
      quantidade: quantidade,
      ambiente: payment.live_mode ? 'producao' : 'sandbox'
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    console.error('❌ [mercadopago-webhook] Erro crítico não relacionado ao timing:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    // Return 500 only for real errors (not timing issues)
    return new Response(JSON.stringify({ 
      error: "Internal server error",
      message: errorMessage,
      timestamp: new Date().toISOString()
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
