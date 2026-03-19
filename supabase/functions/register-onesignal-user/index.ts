
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.7";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface RegisterRequest {
  user_id: string;
  player_id?: string;
}

serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('=== REGISTER ONESIGNAL USER STARTED ===');
    
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get OneSignal credentials
    const oneSignalAppId = Deno.env.get('ONESIGNAL_APP_ID');
    const oneSignalApiKey = Deno.env.get('ONESIGNAL_REST_API_KEY');

    if (!oneSignalAppId || !oneSignalApiKey) {
      console.error('OneSignal credentials not configured');
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'OneSignal not configured' 
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Parse request body
    const body: RegisterRequest = await req.json();
    console.log('Registration request:', { user_id: body.user_id, has_player_id: !!body.player_id });

    // Validate user exists
    const { data: user, error: userError } = await supabase
      .from('profiles')
      .select('id, nome')
      .eq('id', body.user_id)
      .single();

    if (userError || !user) {
      console.error('User not found:', userError);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'User not found' 
        }),
        { 
          status: 404, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    console.log('User found:', user.nome);

    // Try to register/update external user ID in OneSignal
    try {
      if (body.player_id) {
        // Method 1: Update existing player with external user ID
        const updateResponse = await fetch(`https://onesignal.com/api/v1/players/${body.player_id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Basic ${oneSignalApiKey}`,
          },
          body: JSON.stringify({
            app_id: oneSignalAppId,
            external_user_id: body.user_id,
          }),
        });

        if (updateResponse.ok) {
          const updateResult = await updateResponse.json();
          console.log('OneSignal player updated with external ID:', updateResult);
        } else {
          console.warn('Failed to update OneSignal player:', await updateResponse.text());
        }
      }

      // Method 2: Always try to create/update using external user ID
      const createResponse = await fetch('https://onesignal.com/api/v1/players', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Basic ${oneSignalApiKey}`,
        },
        body: JSON.stringify({
          app_id: oneSignalAppId,
          device_type: 5, // Web Push
          external_user_id: body.user_id,
          identifier: body.user_id, // Use user_id as identifier
        }),
      });

      const createResult = await createResponse.json();
      console.log('OneSignal registration result:', createResult);

      // Update user preferences to mark as registered
      const { error: prefsError } = await supabase
        .from('user_notification_preferences')
        .upsert({
          user_id: body.user_id,
          push_enabled: true,
          push_subscription: {
            player_id: body.player_id || createResult.id,
            external_user_id: body.user_id,
            registered_at: new Date().toISOString()
          }
        });

      if (prefsError) {
        console.warn('Failed to update user preferences:', prefsError);
      }

      console.log('=== REGISTER ONESIGNAL USER COMPLETED ===');

      return new Response(
        JSON.stringify({
          success: true,
          message: 'User registered successfully in OneSignal',
          player_id: body.player_id || createResult.id,
          external_user_id: body.user_id
        }),
        {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );

    } catch (oneSignalError) {
      console.error('OneSignal registration failed:', oneSignalError);
      const oneSignalErrorMessage = oneSignalError instanceof Error ? oneSignalError.message : 'Unknown error';
      return new Response(
        JSON.stringify({
          success: false,
          error: 'OneSignal registration failed',
          details: oneSignalErrorMessage
        }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

  } catch (error) {
    console.error('=== REGISTER ONESIGNAL USER ERROR ===');
    console.error('Error details:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({
        success: false,
        error: 'Internal server error',
        details: errorMessage
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
