
-- Verificar se a função calcular_cotacao_dinamica existe
SELECT proname FROM pg_proc WHERE proname = 'calcular_cotacao_dinamica';

-- Dropar e recriar o trigger com a versão correta
DROP TRIGGER IF EXISTS on_transaction_created ON public.transacoes;

-- Recriar a função update_wallet_balance() com a versão completa
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

-- Recriar o trigger
CREATE TRIGGER on_transaction_created
  AFTER INSERT ON public.transacoes
  FOR EACH ROW
  EXECUTE FUNCTION public.update_wallet_balance();
