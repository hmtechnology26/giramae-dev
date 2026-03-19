
import { useMemo } from 'react';
import { useProfile } from '@/hooks/useProfile';
import { Tables } from '@/integrations/supabase/types';

type Item = Tables<'itens'>;

interface CompatibilityInfo {
  isCompatible: boolean;
  compatibleChildren: Array<{
    nome: string;
    motivo: string;
  }>;
}

export const useItemCompatibility = (item: Item): CompatibilityInfo => {
  const { filhos } = useProfile();

  const compatibility = useMemo(() => {
    const compatibleChildren: Array<{ nome: string; motivo: string }> = [];

    filhos.forEach(filho => {
      const reasons: string[] = [];
      
      // Verificar gênero
      if (item.genero) {
        if (item.genero === 'unissex') {
          reasons.push('unissex');
        } else if (
          (item.genero === 'menino' && filho.sexo === 'masculino') ||
          (item.genero === 'menina' && filho.sexo === 'feminino')
        ) {
          reasons.push('gênero compatível');
        }
      }

      // Verificar tamanho de roupas
      if (item.categoria === 'roupas' && item.tamanho_valor && filho.tamanho_roupas) {
        if (item.tamanho_valor === filho.tamanho_roupas) {
          reasons.push('tamanho de roupa');
        }
      }

      // Verificar tamanho de calçados
      if (item.categoria === 'calcados' && item.tamanho_valor && filho.tamanho_calcados) {
        if (item.tamanho_valor === filho.tamanho_calcados) {
          reasons.push('tamanho de calçado');
        }
      }

      // Verificar idade (para brinquedos e livros)
      if (item.categoria === 'brinquedos' || item.categoria === 'livros') {
        const idade = Math.floor((new Date().getTime() - new Date(filho.data_nascimento).getTime()) / (1000 * 60 * 60 * 24 * 365.25));
        if (idade >= 0 && idade <= 12) {
          reasons.push('idade apropriada');
        }
      }

      if (reasons.length > 0) {
        compatibleChildren.push({
          nome: filho.nome,
          motivo: reasons.join(', ')
        });
      }
    });

    return {
      isCompatible: compatibleChildren.length > 0,
      compatibleChildren
    };
  }, [item, filhos]);

  return compatibility;
};
