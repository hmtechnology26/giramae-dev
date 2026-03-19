// T7_EDGE_SEND_REMINDERS - Edge Function para enviar lembretes de reserva

// FILE: supabase/functions/send-reservation-reminders/index.ts

import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ReminderResult {
  success: boolean;
  reminders_sent: number;
  error?: string;
}

interface ReservaParaLembrete {
  id: string;
  usuario_reservou: string;
  usuario_item: string;
  item_id: string;
  prazo_expiracao: string;
  valor_girinhas: number;
  horas_restantes: number;
  itens?: {
    titulo: string;
  };
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

    console.log('[SEND-REMINDERS] Iniciando processamento de lembretes');

    // 1. Buscar configuração de marcos de notificação
    const { data: configData, error: configError } = await supabase
      .from('config_sistema')
      .select('valor')
      .eq('chave', 'notificacao_horas')
      .single();

    if (configError) {
      throw new Error(`Erro ao buscar configuração: ${configError.message}`);
    }

    const marcos = (configData?.valor as any)?.valores || [24, 6, 1];
    console.log(`[SEND-REMINDERS] Marcos configurados: ${JSON.stringify(marcos)}`);

    let totalLembretes = 0;

    // 2. Para cada marco, buscar reservas que precisam de lembrete
    for (const marco of marcos) {
      const minHoras = marco - 1;
      const maxHoras = marco;
      
      console.log(`[SEND-REMINDERS] Processando marco: ${marco}h (janela: ${minHoras}h-${maxHoras}h)`);

      // Buscar reservas na janela de tempo
      const { data: reservas, error: reservasError } = await supabase
        .from('reservas')
        .select(`
          id,
          usuario_reservou,
          usuario_item,
          item_id,
          prazo_expiracao,
          valor_girinhas,
          itens!inner(titulo)
        `)
        .eq('status', 'pendente')
        .gte('prazo_expiracao', new Date(Date.now() + (minHoras * 60 * 60 * 1000)).toISOString())
        .lt('prazo_expiracao', new Date(Date.now() + (maxHoras * 60 * 60 * 1000)).toISOString());

      if (reservasError) {
        console.error(`[SEND-REMINDERS] Erro ao buscar reservas para marco ${marco}h:`, reservasError);
        continue;
      }

      if (!reservas || reservas.length === 0) {
        console.log(`[SEND-REMINDERS] Nenhuma reserva encontrada para marco ${marco}h`);
        continue;
      }

      console.log(`[SEND-REMINDERS] Encontradas ${reservas.length} reservas para marco ${marco}h`);

      // 3. Para cada reserva, verificar se já não foi enviado lembrete recente
      for (const reserva of reservas) {
        try {
          // Verificar se já existe notificação recente (últimas 2h)
          const { data: notificacaoExistente } = await supabase
            .from('notifications')
            .select('id')
            .eq('user_id', reserva.usuario_reservou)
            .eq('type', 'reserva_expirando')
            .gte('created_at', new Date(Date.now() - (2 * 60 * 60 * 1000)).toISOString()) // últimas 2h
            .like('data', `%"reserva_id":"${reserva.id}"%`)
            .limit(1);

          if (notificacaoExistente && notificacaoExistente.length > 0) {
            console.log(`[SEND-REMINDERS] Lembrete já enviado para reserva ${reserva.id}`);
            continue;
          }

          // Calcular horas restantes exatas
          const horasRestantes = Math.ceil(
            (new Date(reserva.prazo_expiracao).getTime() - Date.now()) / (1000 * 60 * 60)
          );

          // Enviar lembrete para o comprador
          const { error: notificacaoError } = await supabase
            .from('notifications')
            .insert({
              user_id: reserva.usuario_reservou,
              type: 'reserva_expirando',
              title: `⏰ Reserva expira em ${horasRestantes}h`,
              message: `Sua reserva do item "${(reserva as any).itens?.titulo}" expira em ${horasRestantes} hora(s). Complete a troca ou ela será cancelada automaticamente.`,
              data: {
                reserva_id: reserva.id,
                item_id: reserva.item_id,
                horas_restantes: horasRestantes,
                valor_girinhas: reserva.valor_girinhas,
                marco_notificacao: marco
              }
            });

          if (notificacaoError) {
            console.error(`[SEND-REMINDERS] Erro ao criar notificação para reserva ${reserva.id}:`, notificacaoError);
            continue;
          }

          totalLembretes++;
          console.log(`[SEND-REMINDERS] Lembrete enviado para reserva ${reserva.id} (${horasRestantes}h restantes)`);

        } catch (error) {
          console.error(`[SEND-REMINDERS] Erro ao processar reserva ${reserva.id}:`, error);
        }
      }
    }

    console.log(`[SEND-REMINDERS] Processamento concluído. Total de lembretes enviados: ${totalLembretes}`);

    const result: ReminderResult = {
      success: true,
      reminders_sent: totalLembretes
    };

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders,
      },
    });

  } catch (error: any) {
    console.error('[SEND-REMINDERS] Erro geral:', error);
    
    const result: ReminderResult = {
      success: false,
      reminders_sent: 0,
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