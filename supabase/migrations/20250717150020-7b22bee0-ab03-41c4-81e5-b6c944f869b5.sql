-- T5_FUNC_PROCESSAR_RESERVA_PATCH - Patch para ler prazo de config_sistema

-- FILE: supabase/migrations/20250117000004_patch_processar_reserva_prazo.sql

-- TODO: HUMANO CONFIRMAR - Verificar se função processar_reserva existe
-- Execute: \df public.processar_reserva para ver assinaturas disponíveis

-- Esta função estende processar_reserva para usar prazo configurável
-- Preserva todas as funcionalidades existentes

CREATE OR REPLACE FUNCTION public.get_prazo_reserva_horas()
RETURNS integer
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
AS $function$
DECLARE
    v_config JSONB;
    v_horas INTEGER;
BEGIN
    -- Buscar configuração de prazo
    SELECT valor INTO v_config
    FROM config_sistema 
    WHERE chave = 'reserva_prazo_horas';
    
    IF v_config IS NOT NULL THEN
        v_horas := (v_config->>'valor')::INTEGER;
    END IF;
    
    -- Fallback para 48h se não configurado
    RETURN COALESCE(v_horas, 48);
END;
$function$;

-- Helper para calcular data de expiração
CREATE OR REPLACE FUNCTION public.calcular_prazo_expiracao()
RETURNS timestamp with time zone
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
AS $function$
DECLARE
    v_horas INTEGER;
BEGIN
    v_horas := get_prazo_reserva_horas();
    RETURN now() + (v_horas || ' hours')::interval;
END;
$function$;

-- Nota: O patch completo da função processar_reserva será aplicado
-- quando soubermos sua assinatura exata. Por enquanto, criamos helpers
-- que podem ser chamados dentro da função existente.

-- Exemplo de como usar dentro de processar_reserva:
-- UPDATE reservas SET prazo_expiracao = calcular_prazo_expiracao() WHERE id = v_reserva_id;