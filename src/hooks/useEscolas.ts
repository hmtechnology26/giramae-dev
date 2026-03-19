
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Tables } from '@/integrations/supabase/types';

// Tipo otimizado com apenas campos essenciais
export type EscolaEssencial = {
  codigo_inep: number;
  escola: string;
  municipio: string;
  uf: string;
  endereco: string;
  categoria_administrativa: string;
};

// Use the proper Supabase type for schools
export type Escola = Tables<'escolas_inep'>;

interface UseEscolasParams {
  searchTerm?: string;
  uf?: string;
  municipio?: string;
}

export const useEscolas = (params?: UseEscolasParams) => {
  const [escolas, setEscolas] = useState<EscolaEssencial[]>([]);
  const [municipios, setMunicipios] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingMunicipios, setLoadingMunicipios] = useState(false);

  // Query para buscar escolas automaticamente se os parâmetros estão presentes
  const queryResult = useQuery({
    queryKey: ['escolas', params],
    queryFn: async () => {
      if (!params?.searchTerm || params.searchTerm.length < 3) {
        return [];
      }

      console.log('Buscando escolas com parâmetros:', params);

      // Selecionar apenas campos essenciais para melhor performance
      let query = supabase
        .from('escolas_inep')
        .select('codigo_inep, escola, municipio, uf, endereco, categoria_administrativa')
        .order('escola')
        .limit(50); // Reduzir limite para melhor performance

      // Aplicar filtros se fornecidos
      if (params?.uf) {
        query = query.eq('uf', params.uf);
      }

      if (params?.municipio) {
        query = query.eq('municipio', params.municipio);
      }

      if (params?.searchTerm && params.searchTerm.length >= 3) {
        query = query.ilike('escola', `%${params.searchTerm}%`);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Erro ao buscar escolas:', error);
        throw error;
      }
      
      console.log('Escolas encontradas:', data?.length || 0);
      console.log('Primeira escola:', data?.[0]);
      
      return data as EscolaEssencial[];
    },
    enabled: !!(params?.searchTerm && params.searchTerm.length >= 3),
    staleTime: 5 * 60 * 1000, // 5 minutos
    gcTime: 10 * 60 * 1000, // 10 minutos
  });

  const buscarEscolas = async (nome: string, estado: string, cidade: string) => {
    if (!estado || !cidade || nome.length < 3) return;
    
    setLoading(true);
    try {
      console.log('Busca manual de escolas:', { nome, estado, cidade });

      let query = supabase
        .from('escolas_inep')
        .select('codigo_inep, escola, municipio, uf, endereco, categoria_administrativa')
        .eq('uf', estado)
        .eq('municipio', cidade)
        .order('escola')
        .limit(50);

      if (nome) {
        query = query.ilike('escola', `%${nome}%`);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Erro ao buscar escolas:', error);
        return;
      }

      console.log('Escolas encontradas (busca manual):', data?.length || 0);
      setEscolas(data || []);
    } catch (error) {
      console.error('Erro ao buscar escolas:', error);
    } finally {
      setLoading(false);
    }
  };

  const buscarMunicipios = async (estado: string) => {
    if (!estado) return;
    
    setLoadingMunicipios(true);
    try {
      const { data, error } = await supabase
        .from('escolas_inep')
        .select('municipio')
        .eq('uf', estado)
        .order('municipio');

      if (error) {
        console.error('Erro ao buscar municípios:', error);
        return;
      }

      // Extrair municípios únicos
      const municipiosUnicos = [...new Set(data?.map(item => item.municipio).filter(Boolean))];
      setMunicipios(municipiosUnicos);
    } catch (error) {
      console.error('Erro ao buscar municípios:', error);
    } finally {
      setLoadingMunicipios(false);
    }
  };

  return {
    escolas: queryResult.data || escolas,
    isLoading: queryResult.isLoading,
    error: queryResult.error,
    municipios,
    loading,
    loadingMunicipios,
    buscarEscolas,
    buscarMunicipios
  };
};
