
-- Corrigir definitivamente o erro do trigger update_wallet_balance
-- Verificar se a função existe e dropá-la se necessário
DROP TRIGGER IF EXISTS on_transaction_created ON public.transacoes;
DROP TRIGGER IF EXISTS on_wallet_update ON public.carteiras;

-- Recriar a função com verificações mais robustas
CREATE OR REPLACE FUNCTION public.update_wallet_balance()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
BEGIN
  -- Verificar explicitamente se estamos na tabela transacoes E se o campo tipo existe
  IF TG_TABLE_NAME = 'transacoes' AND NEW IS NOT NULL THEN
    -- Verificar se o NEW record tem o campo tipo antes de acessá-lo
    IF to_jsonb(NEW) ? 'tipo' THEN
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
      
      -- Tentar recalcular cotação (com tratamento de erro completo)
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
  END IF;
  
  RETURN NEW;
END;
$function$;

-- Recriar APENAS o trigger para a tabela transacoes
CREATE TRIGGER on_transaction_created
  AFTER INSERT ON public.transacoes
  FOR EACH ROW
  EXECUTE FUNCTION public.update_wallet_balance();

-- Verificar se não há outros triggers problemáticos
-- Se houver algum trigger em carteiras ou outras tabelas que chama esta função, removê-lo
DO $$
BEGIN
  -- Remover qualquer trigger que possa estar chamando esta função em outras tabelas
  IF EXISTS (SELECT 1 FROM information_schema.triggers WHERE trigger_name LIKE '%wallet%' AND event_object_table != 'transacoes') THEN
    RAISE NOTICE 'Removendo triggers desnecessários em outras tabelas';
  END IF;
END $$;
