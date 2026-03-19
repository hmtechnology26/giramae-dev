
-- Migration: Otimização crítica do Feed com paginação e todos os filtros
-- Reduz 11+ requests para 1 request mantendo 100% da funcionalidade

CREATE OR REPLACE FUNCTION carregar_dados_feed_paginado(
    p_user_id UUID,
    p_page INTEGER DEFAULT 0,
    p_limit INTEGER DEFAULT 20,
    p_busca TEXT DEFAULT '',
    p_cidade TEXT DEFAULT '',
    p_categoria TEXT DEFAULT 'todas',
    p_subcategoria TEXT DEFAULT 'todas',
    p_genero TEXT DEFAULT 'todos',
    p_tamanho TEXT DEFAULT 'todos',
    p_preco_min INTEGER DEFAULT 0,
    p_preco_max INTEGER DEFAULT 200,
    p_mostrar_reservados BOOLEAN DEFAULT true
)
RETURNS JSON AS $$
DECLARE
    resultado JSON;
    offset_calc INTEGER;
    where_conditions TEXT[];
    final_where TEXT;
BEGIN
    offset_calc := p_page * p_limit;
    where_conditions := ARRAY[]::TEXT[];
    
    -- Condição base para status
    IF p_mostrar_reservados THEN
        where_conditions := array_append(where_conditions, 'i.status IN (''disponivel'', ''reservado'')');
    ELSE
        where_conditions := array_append(where_conditions, 'i.status = ''disponivel''');
    END IF;
    
    -- Filtro por categoria
    IF p_categoria != 'todas' AND p_categoria != '' THEN
        where_conditions := array_append(where_conditions, 'i.categoria = ' || quote_literal(p_categoria));
    END IF;
    
    -- Filtro por subcategoria
    IF p_subcategoria != 'todas' AND p_subcategoria != '' THEN
        where_conditions := array_append(where_conditions, 'i.subcategoria = ' || quote_literal(p_subcategoria));
    END IF;
    
    -- Filtro por gênero
    IF p_genero != 'todos' AND p_genero != '' THEN
        where_conditions := array_append(where_conditions, 'i.genero = ' || quote_literal(p_genero));
    END IF;
    
    -- Filtro por tamanho
    IF p_tamanho != 'todos' AND p_tamanho != '' THEN
        where_conditions := array_append(where_conditions, 'i.tamanho_valor = ' || quote_literal(p_tamanho));
    END IF;
    
    -- Filtro por busca no título
    IF p_busca != '' THEN
        where_conditions := array_append(where_conditions, 'i.titulo ILIKE ' || quote_literal('%' || p_busca || '%'));
    END IF;
    
    -- Filtro por cidade do vendedor
    IF p_cidade != '' THEN
        where_conditions := array_append(where_conditions, 'p.cidade ILIKE ' || quote_literal('%' || p_cidade || '%'));
    END IF;
    
    -- Filtro por faixa de preço
    where_conditions := array_append(where_conditions, 'i.valor_girinhas >= ' || p_preco_min);
    where_conditions := array_append(where_conditions, 'i.valor_girinhas <= ' || p_preco_max);
    
    -- Construir WHERE final
    final_where := array_to_string(where_conditions, ' AND ');
    
    -- Query principal com todos os dados consolidados
    EXECUTE format('
        SELECT json_build_object(
            ''itens'', (
                SELECT COALESCE(json_agg(
                    json_build_object(
                        ''id'', i.id,
                        ''titulo'', i.titulo,
                        ''descricao'', i.descricao,
                        ''categoria'', i.categoria,
                        ''subcategoria'', i.subcategoria,
                        ''genero'', i.genero,
                        ''tamanho_categoria'', i.tamanho_categoria,
                        ''tamanho_valor'', i.tamanho_valor,
                        ''estado_conservacao'', i.estado_conservacao,
                        ''valor_girinhas'', i.valor_girinhas,
                        ''fotos'', i.fotos,
                        ''status'', i.status,
                        ''publicado_por'', i.publicado_por,
                        ''created_at'', i.created_at,
                        ''updated_at'', i.updated_at,
                        ''endereco_bairro'', p.bairro,
                        ''endereco_cidade'', p.cidade,
                        ''endereco_estado'', p.estado,
                        ''aceita_entrega'', p.aceita_entrega_domicilio,
                        ''raio_entrega_km'', p.raio_entrega_km,
                        ''publicado_por_profile'', json_build_object(
                            ''nome'', p.nome,
                            ''avatar_url'', p.avatar_url,
                            ''reputacao'', COALESCE(p.reputacao, 0)
                        ),
                        ''escolas_inep'', CASE 
                            WHEN f.escola_id IS NOT NULL THEN
                                json_build_object(''escola'', e.escola)
                            ELSE NULL
                        END
                    ) ORDER BY i.created_at DESC
                ), ''[]''::json)
                FROM itens i
                LEFT JOIN profiles p ON i.publicado_por = p.id
                LEFT JOIN filhos f ON f.mae_id = i.publicado_por
                LEFT JOIN escolas_inep e ON e.codigo_inep = f.escola_id
                WHERE %s
                LIMIT %s
                OFFSET %s
            ),
            ''configuracoes'', CASE 
                WHEN %s = 0 THEN (
                    SELECT json_build_object(
                        ''categorias'', (
                            SELECT COALESCE(json_agg(
                                json_build_object(
                                    ''codigo'', codigo,
                                    ''nome'', nome,
                                    ''icone'', icone,
                                    ''ordem'', ordem
                                ) ORDER BY ordem
                            ), ''[]''::json) 
                            FROM categorias WHERE ativo = true
                        ),
                        ''subcategorias'', (
                            SELECT COALESCE(json_agg(
                                json_build_object(
                                    ''id'', id,
                                    ''nome'', nome,
                                    ''categoria_pai'', categoria_pai,
                                    ''icone'', icone,
                                    ''ordem'', ordem
                                ) ORDER BY categoria_pai, ordem
                            ), ''[]''::json) 
                            FROM subcategorias WHERE ativo = true
                        )
                    )
                )
                ELSE NULL
            END,
            ''profile_essencial'', CASE 
                WHEN %s = 0 THEN (
                    SELECT json_build_object(
                        ''id'', id,
                        ''nome'', nome,
                        ''cidade'', cidade,
                        ''estado'', estado,
                        ''bairro'', bairro,
                        ''avatar_url'', avatar_url
                    )
                    FROM profiles WHERE id = %L
                )
                ELSE NULL
            END,
            ''has_more'', (
                SELECT COUNT(*) > (%s + %s)
                FROM itens i
                LEFT JOIN profiles p ON i.publicado_por = p.id
                WHERE %s
            ),
            ''total_count'', (
                SELECT COUNT(*)
                FROM itens i
                LEFT JOIN profiles p ON i.publicado_por = p.id
                WHERE %s
            )
        )', 
        final_where, p_limit, offset_calc, 
        p_page, p_page, p_user_id,
        offset_calc, p_limit, final_where, final_where
    ) INTO resultado;
    
    RETURN resultado;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Política RLS para a função
GRANT EXECUTE ON FUNCTION carregar_dados_feed_paginado TO authenticated;

-- Índices para otimizar performance
CREATE INDEX IF NOT EXISTS idx_itens_feed_otimizado ON itens(status, categoria, created_at DESC) WHERE status IN ('disponivel', 'reservado');
CREATE INDEX IF NOT EXISTS idx_itens_preco_feed ON itens(valor_girinhas) WHERE status IN ('disponivel', 'reservado');
CREATE INDEX IF NOT EXISTS idx_itens_busca_feed ON itens USING gin(to_tsvector('portuguese', titulo)) WHERE status IN ('disponivel', 'reservado');
