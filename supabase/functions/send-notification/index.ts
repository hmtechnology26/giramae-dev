
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.7";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface NotificationRequest {
  user_id: string;
  title: string;
  message: string;
  type?: string;
  data?: Record<string, any>;
  send_push?: boolean;
}

serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('=== SEND NOTIFICATION EDGE FUNCTION STARTED ===');
    
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get OneSignal credentials
    const oneSignalAppId = Deno.env.get('ONESIGNAL_APP_ID');
    const oneSignalApiKey = Deno.env.get('ONESIGNAL_REST_API_KEY');

    console.log('OneSignal Config:', {
      appId: oneSignalAppId ? 'SET' : 'NOT_SET',
      apiKey: oneSignalApiKey ? 'SET' : 'NOT_SET'
    });

    // Parse request body
    const body: NotificationRequest = await req.json();
    console.log('Request body:', body);

    // Validate required fields
    if (!body.user_id || !body.title || !body.message) {
      console.error('Missing required fields');
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Missing required fields: user_id, title, message' 
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Verify user exists
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

    // Check user notification preferences
    const { data: preferences } = await supabase
      .from('user_notification_preferences')
      .select('*')
      .eq('user_id', body.user_id)
      .single();

    console.log('User preferences:', preferences);

    // Save in-app notification
    const { data: notification, error: notificationError } = await supabase
      .from('notifications')
      .insert({
        user_id: body.user_id,
        type: body.type || 'sistema',
        title: body.title,
        message: body.message,
        data: body.data || {},
        read: false
      })
      .select()
      .single();

    if (notificationError) {
      console.error('Error saving notification:', notificationError);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Failed to save notification' 
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    console.log('In-app notification saved:', notification.id);

    let pushResult: any = null;

    // Send push notification if enabled and user has push preferences enabled
    if ((body.send_push !== false) && 
        preferences?.push_enabled && 
        oneSignalAppId && 
        oneSignalApiKey) {
      
      console.log('Sending push notification via OneSignal...');
      
      try {
        const oneSignalPayload = {
          app_id: oneSignalAppId,
          include_external_user_ids: [body.user_id],
          headings: { en: body.title },
          contents: { en: body.message },
          data: body.data || {},
          web_url: body.data?.action_url || '/',
        };

        console.log('OneSignal payload:', oneSignalPayload);

        const pushResponse = await fetch('https://onesignal.com/api/v1/notifications', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Basic ${oneSignalApiKey}`,
          },
          body: JSON.stringify(oneSignalPayload),
        });

        pushResult = await pushResponse.json();
        console.log('OneSignal response:', pushResult);

        if (!pushResponse.ok) {
          console.error('OneSignal API error:', pushResult);
        }

      } catch (pushError) {
        console.error('Push notification failed:', pushError);
        pushResult = { errors: pushError };
      }
    } else {
      console.log('Push notification skipped:', {
        send_push: body.send_push,
        preferences_push_enabled: preferences?.push_enabled,
        oneSignalConfigured: !!(oneSignalAppId && oneSignalApiKey)
      });
    }

    // Log notification sent
    await supabase
      .from('notification_logs')
      .insert({
        user_id: body.user_id,
        template_tipo: body.type || 'sistema',
        canal: pushResult ? 'push_and_in_app' : 'in_app',
        status: 'enviado',
        dados_envio: {
          notification_id: notification.id,
          push_result: pushResult,
          title: body.title,
          message: body.message
        }
      });

    console.log('=== SEND NOTIFICATION COMPLETED SUCCESSFULLY ===');

    // Return success response
    return new Response(
      JSON.stringify({
        success: true,
        notification_id: notification.id,
        push_sent: !!pushResult?.id,
        push_recipients: pushResult?.recipients || 0,
        message: 'Notification sent successfully'
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('=== SEND NOTIFICATION ERROR ===');
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
