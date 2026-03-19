import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    console.log('📸 [instagram-webhook] Webhook recebido');

    // Verificação do webhook Instagram (GET request)
    if (req.method === 'GET') {
      const url = new URL(req.url);
      const mode = url.searchParams.get('hub.mode');
      const token = url.searchParams.get('hub.verify_token');
      const challenge = url.searchParams.get('hub.challenge');

      const VERIFY_TOKEN = Deno.env.get('INSTAGRAM_WEBHOOK_VERIFY_TOKEN') || 'giramae_instagram_2025';

      if (mode === 'subscribe' && token === VERIFY_TOKEN) {
        console.log('✅ [instagram-webhook] Webhook verificado');
        return new Response(challenge, { status: 200 });
      } else {
        console.error('❌ [instagram-webhook] Falha na verificação do webhook');
        return new Response('Forbidden', { status: 403 });
      }
    }

    // Processar notificação (POST request)
    if (req.method === 'POST') {
      const payload = await req.json();
      console.log('📦 [instagram-webhook] Payload recebido:', JSON.stringify(payload, null, 2));

      if (payload.object === 'instagram' && payload.entry) {
        for (const entry of payload.entry) {
          if (entry.changes) {
            for (const change of entry.changes) {
              if (change.field === 'mentions') {
                const mention = change.value;
                console.log('🎯 [instagram-webhook] Menção detectada:', mention);

                const instagramUserId = mention.from?.id;
                const instagramUsername = mention.from?.username;
                const mediaId = mention.media_id;

                if (!instagramUserId || !instagramUsername) {
                  console.warn('⚠️ [instagram-webhook] Dados incompletos da menção');
                  continue;
                }

                const supabase = createClient(
                  Deno.env.get('SUPABASE_URL') ?? '',
                  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
                );

                const { data: verification, error: findError } = await supabase
                  .from('user_instagram_verifications')
                  .select('*')
                  .eq('instagram_username', instagramUsername)
                  .single();

                if (findError || !verification) {
                  console.log(`ℹ️ [instagram-webhook] Instagram @${instagramUsername} não cadastrado no sistema`);
                  continue;
                }

                const { error: updateError } = await supabase
                  .from('user_instagram_verifications')
                  .update({
                    verification_status: 'verified',
                    instagram_user_id: instagramUserId,
                    connection_proof_url: `https://www.instagram.com/p/${mediaId}`,
                    verified_at: new Date().toISOString()
                  })
                  .eq('id', verification.id);

                if (updateError) {
                  console.error('❌ [instagram-webhook] Erro ao atualizar verificação:', updateError);
                  continue;
                }

                console.log(`✅ [instagram-webhook] Verificação confirmada para @${instagramUsername}`);
              }
            }
          }
        }
      }

      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      });
    }

    return new Response('Method not allowed', { status: 405 });

  } catch (error) {
    console.error('❌ [instagram-webhook] Erro:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500
    });
  }
});
