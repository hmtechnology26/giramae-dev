-- Admin function to update basic item fields securely
CREATE OR REPLACE FUNCTION public.admin_update_item_basico(
  p_item_id uuid,
  p_titulo text,
  p_descricao text,
  p_categoria text,
  p_subcategoria text,
  p_valor_girinhas numeric,
  p_estado_conservacao text,
  p_genero text,
  p_tamanho_valor text
) RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_publicado_por uuid;
  v_status text;
  v_categoria_valida boolean;
BEGIN
  -- Verificar se é admin
  IF NOT EXISTS (SELECT 1 FROM public.admin_users WHERE user_id = auth.uid()) THEN
    RAISE EXCEPTION 'Acesso negado: apenas administradores';
  END IF;

  -- Buscar item e validar existência
  SELECT publicado_por, status INTO v_publicado_por, v_status FROM public.itens WHERE id = p_item_id;
  IF v_publicado_por IS NULL THEN
    RAISE EXCEPTION 'Item não encontrado';
  END IF;

  -- Validar valor de girinhas dentro dos limites da categoria (se houver categoria)
  IF p_categoria IS NOT NULL AND p_valor_girinhas IS NOT NULL THEN
    v_categoria_valida := public.validar_valor_item_categoria(p_categoria, p_valor_girinhas);
    IF NOT v_categoria_valida THEN
      RAISE EXCEPTION 'Valor % inválido para a categoria %', p_valor_girinhas, p_categoria;
    END IF;
  END IF;

  -- Atualizar apenas campos permitidos
  UPDATE public.itens SET
    titulo = COALESCE(p_titulo, titulo),
    descricao = COALESCE(p_descricao, descricao),
    categoria = COALESCE(p_categoria, categoria),
    subcategoria = COALESCE(p_subcategoria, subcategoria),
    valor_girinhas = COALESCE(p_valor_girinhas, valor_girinhas),
    estado_conservacao = COALESCE(p_estado_conservacao, estado_conservacao),
    genero = COALESCE(NULLIF(p_genero, ''), genero),
    tamanho_valor = COALESCE(NULLIF(p_tamanho_valor, ''), tamanho_valor),
    updated_at = now()
  WHERE id = p_item_id;

  RETURN true;
END;
$$;