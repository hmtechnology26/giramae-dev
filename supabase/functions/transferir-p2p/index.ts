
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { destinatario_id, quantidade } = await req.json()
    
    // VALIDAÇÕES DE SEGURANÇA
    
    // 1. Validar dados de entrada
    if (!destinatario_id || !quantidade) {
      throw new Error('Dados obrigatórios não informados')
    }
    
    if (typeof quantidade !== 'number' || quantidade <= 0) {
      throw new Error('Quantidade deve ser um número positivo')
    }
    
    if (quantidade > 10000) {
      throw new Error('Quantidade máxima por transferência: 10.000 Girinhas')
    }
    
    // 2. Obter usuário autenticado
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      throw new Error('Token de autorização obrigatório')
    }
    
    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(token)
    
    if (authError || !user) {
      throw new Error('Token inválido ou expirado')
    }
    
    // 3. Validar que não está transferindo para si mesmo
    if (user.id === destinatario_id) {
      throw new Error('Não é possível transferir para você mesmo')
    }
    
    // 4. Verificar se destinatário existe e está ativo
    const { data: destinatario, error: destinatarioError } = await supabaseClient
      .from('profiles')
      .select('id, nome')
      .eq('id', destinatario_id)
      .single()
    
    if (destinatarioError || !destinatario) {
      throw new Error('Destinatário não encontrado')
    }
    
    // 5. Verificar saldo atual do remetente
    const { data: carteira, error: carteiraError } = await supabaseClient
      .from('carteiras')
      .select('saldo_atual')
      .eq('user_id', user.id)
      .single()
    
    if (carteiraError || !carteira) {
      throw new Error('Carteira do remetente não encontrada')
    }
    
    if (carteira.saldo_atual < quantidade) {
      throw new Error(`Saldo insuficiente. Saldo atual: ${carteira.saldo_atual} Girinhas`)
    }
    
    // 6. Verificar limite de transferências por usuário (anti-spam)
    const { data: transferenciasRecentes } = await supabaseClient
      .from('transferencias_girinhas')
      .select('id')
      .eq('remetente_id', user.id)
      .gte('created_at', new Date(Date.now() - 60000).toISOString()) // Últimos 60 segundos
    
    if (transferenciasRecentes && transferenciasRecentes.length >= 3) {
      throw new Error('Muitas transferências recentes. Aguarde 1 minuto.')
    }

    // 7. Processar transferência com função segura do banco
    const { data, error } = await supabaseClient.rpc('transferir_girinhas_p2p', {
      p_remetente_id: user.id,
      p_destinatario_id: destinatario_id,
      p_quantidade: quantidade
    })

    if (error) {
      console.error('Erro na transferência:', error)
      throw new Error(error.message || 'Erro interno na transferência')
    }

    return new Response(
      JSON.stringify({ 
        transferencia_id: data, 
        success: true,
        mensagem: `Transferência realizada com sucesso para ${destinatario.nome}`,
        quantidade_transferida: quantidade
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )
  } catch (error) {
    console.error('Erro na edge function:', error)
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ 
        error: errorMessage,
        success: false,
        codigo: 'TRANSFER_ERROR'
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      },
    )
  }
})
