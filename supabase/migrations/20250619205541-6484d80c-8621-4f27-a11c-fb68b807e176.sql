
-- Corrigir o trigger update_wallet_balance para verificar se o campo tipo existe
CREATE OR REPLACE FUNCTION public.update_wallet_balance()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
BEGIN
  -- Verificar se estamos na tabela transacoes (que tem o campo tipo)
  IF TG_TABLE_NAME = 'transacoes' THEN
    -- Tipos que aumentam o saldo (créditos)
    IF NEW.tipo IN ('recebido', 'bonus', 'compra', 'transferencia_p2p_entrada') THEN
      UPDATE public.carteiras 
      SET 
        saldo_atual = saldo_atual + NEW.valor,
        total_recebido = total_recebido + NEW.valor,
        updated_at = now()
      WHERE user_id = NEW.user_id;
      
    -- Tipos que diminuem o saldo (débitos)
    ELSIF NEW.tipo IN ('gasto', 'queima', 'transferencia_p2p_saida', 'taxa') THEN
      UPDATE public.carteiras 
      SET 
        saldo_atual = saldo_atual - NEW.valor,
        total_gasto = total_gasto + NEW.valor,
        updated_at = now()
      WHERE user_id = NEW.user_id;
    END IF;
    
    -- Tentar recalcular cotação (com tratamento de erro)
    BEGIN
      IF NEW.tipo IN ('compra', 'gasto', 'recebido', 'queima') THEN
        PERFORM calcular_cotacao_dinamica();
      END IF;
    EXCEPTION 
      WHEN OTHERS THEN
        -- Se der erro na cotação, apenas logar mas não falhar a transação
        RAISE NOTICE 'Erro ao calcular cotação: %', SQLERRM;
    END;
  END IF;
  
  RETURN NEW;
END;
$function$;
