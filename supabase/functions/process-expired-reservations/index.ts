// T6_EDGE_PROCESS_EXPIRED - Edge Function para processar reservas expiradas

// FILE: supabase/functions/process-expired-reservations/index.ts

import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ProcessResult {
  success: boolean;
  processed_count: number;
  error?: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Inicializar cliente Supabase com service_role key
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Missing Supabase environment variables');
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });

    // Configurar batch size (padrão 500, máximo 1000)
    const batchSize = 500;
    
    console.log(`[PROCESS-EXPIRED] Iniciando processamento com batch size: ${batchSize}`);
    
    // Chamar função de banco para processar reservas expiradas
    const { data, error } = await supabase
      .rpc('processar_reservas_expiradas_batch', {
        p_batch_size: batchSize
      });

    if (error) {
      console.error('[PROCESS-EXPIRED] Erro na função RPC:', error);
      throw error;
    }

    const processedCount = data as number;
    console.log(`[PROCESS-EXPIRED] Processamento concluído. Reservas expiradas: ${processedCount}`);

    const result: ProcessResult = {
      success: true,
      processed_count: processedCount
    };

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders,
      },
    });

  } catch (error: any) {
    console.error('[PROCESS-EXPIRED] Erro geral:', error);
    
    const result: ProcessResult = {
      success: false,
      processed_count: 0,
      error: error.message
    };

    return new Response(JSON.stringify(result), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders,
      },
    });
  }
};

serve(handler);