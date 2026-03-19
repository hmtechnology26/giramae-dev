
-- Migração para Sistema de Indicação - Ajustes e Melhorias (CORRIGIDA)

-- 1. Adicionar novo tipo de bônus para usuário indicado
INSERT INTO configuracoes_bonus (tipo_bonus, valor_girinhas, descricao, ativo)
VALUES ('bonus_cadastro_indicado', 5.00, 'Bônus para usuário indicado ao se cadastrar', true)
ON CONFLICT (tipo_bonus) DO NOTHING;

-- 2. Função para processar bônus do usuário indicado
CREATE OR REPLACE FUNCTION processar_bonus_indicado() 
RETURNS TRIGGER AS $$
DECLARE
  v_valor_bonus NUMERIC;
  v_indicacao_record RECORD;
BEGIN
  -- Buscar se este usuário foi indicado
  SELECT * INTO v_indicacao_record
  FROM indicacoes WHERE indicado_id = NEW.id;
  
  IF FOUND THEN
    -- Obter valor do bônus para indicado
    SELECT valor_girinhas INTO v_valor_bonus
    FROM configuracoes_bonus 
    WHERE tipo_bonus = 'bonus_cadastro_indicado' AND ativo = true;
    
    IF v_valor_bonus > 0 THEN
      -- Dar bônus ao indicado
      INSERT INTO transacoes (user_id, tipo, valor, descricao)
      VALUES (NEW.id, 'bonus', v_valor_bonus, 'Bônus de boas-vindas - Você foi indicado!');
      
      -- Atualizar carteira do indicado
      UPDATE carteiras
      SET 
        saldo_atual = saldo_atual + v_valor_bonus,
        total_recebido = total_recebido + v_valor_bonus
      WHERE user_id = NEW.id;
      
      -- Se carteira não existir, criar
      IF NOT FOUND THEN
        INSERT INTO carteiras (user_id, saldo_atual, total_recebido, total_gasto)
        VALUES (NEW.id, v_valor_bonus, v_valor_bonus, 0);
      END IF;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Criar trigger para processar bônus do indicado
DROP TRIGGER IF EXISTS trigger_bonus_indicado ON profiles;
CREATE TRIGGER trigger_bonus_indicado
  AFTER INSERT ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION processar_bonus_indicado();

-- 4. Remover coluna obsoleta bonus_pago (se existir)
ALTER TABLE indicacoes DROP COLUMN IF EXISTS bonus_pago;

-- 5. Manter a função trigger_bonus_indicacao() pois ela tem dependências ativas
-- Não vamos removê-la para evitar quebrar os triggers existentes
