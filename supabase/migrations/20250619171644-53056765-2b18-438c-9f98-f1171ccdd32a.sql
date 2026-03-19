
-- Corrigir a função de trigger que verifica saldo antes de criar reserva
CREATE OR REPLACE FUNCTION public.verificar_saldo_reserva()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
DECLARE
  v_saldo_atual DECIMAL(10,2);
BEGIN
  -- DEBUG: Log do trigger verificar_saldo_reserva
  RAISE NOTICE 'DEBUG verificar_saldo_reserva - Usuario: %, Valor: %', NEW.usuario_reservou, NEW.valor_girinhas;
  
  -- Verificar saldo do usuário na tabela carteiras (NÃO na profiles)
  SELECT saldo_atual INTO v_saldo_atual
  FROM public.carteiras
  WHERE user_id = NEW.usuario_reservou;
  
  -- DEBUG: Log do saldo encontrado
  RAISE NOTICE 'DEBUG verificar_saldo_reserva - Saldo encontrado: %', v_saldo_atual;
  
  IF v_saldo_atual < NEW.valor_girinhas THEN
    RAISE EXCEPTION 'Saldo insuficiente para fazer reserva';
  END IF;
  
  RETURN NEW;
END;
$function$;
