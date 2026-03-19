
-- Corrigir a função update_wallet_balance() para incluir todos os tipos de transação
CREATE OR REPLACE FUNCTION public.update_wallet_balance()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $$
BEGIN
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
  
  -- ✅ CORREÇÃO CRÍTICA: Recalcular cotação para operações que afetam mercado
  IF NEW.tipo IN ('compra', 'gasto', 'recebido', 'queima') THEN
    PERFORM calcular_cotacao_dinamica();
  END IF;
  
  RETURN NEW;
END;
$$;

-- Verificar se o trigger existe e recriá-lo se necessário
DROP TRIGGER IF EXISTS on_transaction_created ON public.transacoes;

CREATE TRIGGER on_transaction_created
  AFTER INSERT ON public.transacoes
  FOR EACH ROW
  EXECUTE FUNCTION public.update_wallet_balance();
