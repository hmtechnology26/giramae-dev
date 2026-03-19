import React, { useState } from 'react';
import { useFeedFilters } from '@/contexts/FeedFiltersContext';
import { useConfigCategorias } from '@/hooks/useConfigCategorias';
import { useSubcategorias } from '@/hooks/useSubcategorias';
import { useTiposTamanho } from '@/hooks/useTamanhosPorCategoria';
import { FiltersHeader } from '@/components/filters/FiltersHeader';
import { SearchBar } from '@/components/filters/SearchBar';
import { BasicFilters } from '@/components/filters/BasicFilters';
import { LocationFilter } from '@/components/filters/LocationFilter';
import { AdvancedFiltersToggle } from '@/components/filters/AdvancedFiltersToggle';
import { AdvancedFiltersContent } from '@/components/filters/AdvancedFiltersContent';

interface AdvancedFiltersProps {
  onSearch?: () => void;
}

const AdvancedFilters: React.FC<AdvancedFiltersProps> = ({ onSearch }) => {
  const { filters, updateFilter, updateFilters, getActiveFiltersCount, setLocationDetected } = useFeedFilters();
  const { configuracoes } = useConfigCategorias();
  const { subcategorias: allSubcategorias } = useSubcategorias();
  
  // ✅ Hook para buscar tamanhos baseado na categoria
  const { tiposTamanho } = useTiposTamanho(filters.categoria !== 'todas' ? filters.categoria : undefined);
  const [showAdvanced, setShowAdvanced] = useState(false);

  const handleSearch = () => {
    if (onSearch) {
      onSearch();
    }
  };

  const handleLocationDetected = (location: { cidade: string; estado: string; bairro?: string }) => {
    setLocationDetected(location);
  };

  const handleResetFilters = () => {
    updateFilters({
      busca: '',
      categoria: 'todas',
      subcategoria: '',
      ordem: 'recentes',
      mesmaEscola: false,
      mesmoBairro: false,
      paraFilhos: false,
      apenasFavoritos: false,
      apenasSeguidoras: false,
      precoMin: 0,
      precoMax: 200,
      genero: 'todos',
      tamanho: 'todos',
    });
  };

  // Convert configuracoes to categorias format
  const categorias = configuracoes?.map(config => ({
    id: config.codigo,
    nome: config.nome,
    icone: config.icone
  })) || [];

  // Get subcategorias for selected category
  const subcategorias = filters.categoria !== 'todas' 
    ? allSubcategorias.filter(sub => sub.categoria_pai === filters.categoria).map(sub => sub.nome)
    : [];

  // ✅ CORRIGIDO: Obter TODOS os tamanhos de TODOS os tipos (roupa_bebe, roupa_crianca, tamanho_letra, etc)
  const tamanhosDisponiveis = React.useMemo(() => {
    if (!tiposTamanho || typeof tiposTamanho !== 'object') {
      return [];
    }

    try {
      // 🔥 IMPORTANTE: Object.values() pega TODOS os arrays de todos os tipos
      // Em vez de só types[0], isso pega roupa_bebe + roupa_crianca + tamanho_letra
      const todosTamanhos = Object.values(tiposTamanho).flat();
      
      if (!Array.isArray(todosTamanhos) || todosTamanhos.length === 0) {
        return [];
      }

      // Remover duplicatas baseado no valor (alguns valores podem repetir entre tipos)
      const tamanhosUnicos = todosTamanhos.reduce((acc, tamanho) => {
        if (tamanho && tamanho.valor && !acc.some(item => item?.valor === tamanho.valor)) {
          acc.push(tamanho);
        }
        return acc;
      }, [] as typeof todosTamanhos);

      // Ordenar pela ordem do banco de dados (1, 2, 3...)
      return tamanhosUnicos.sort((a, b) => {
        const ordemA = a && typeof a.ordem === 'number' ? a.ordem : 999;
        const ordemB = b && typeof b.ordem === 'number' ? b.ordem : 999;
        return ordemA - ordemB;
      });
    } catch (error) {
      console.error('❌ Erro ao processar tamanhos:', error);
      return [];
    }
  }, [tiposTamanho]);

  // ✅ Reset tamanho quando categoria muda para 'todas'
  React.useEffect(() => {
    if (filters.categoria === 'todas') {
      updateFilter('tamanho', 'todos');
    }
  }, [filters.categoria, updateFilter]);

  // ✅ Reset tamanho se o valor selecionado não existe mais nos tamanhos disponíveis
  React.useEffect(() => {
    if (filters.tamanho && filters.tamanho !== 'todos' && tamanhosDisponiveis.length > 0) {
      const tamanhoExiste = tamanhosDisponiveis.some(t => t.valor === filters.tamanho);
      if (!tamanhoExiste) {
        console.log('⚠️ Tamanho selecionado não existe na nova categoria, resetando...');
        updateFilter('tamanho', 'todos');
      }
    }
  }, [tamanhosDisponiveis, filters.tamanho, updateFilter]);

  const activeFiltersCount = getActiveFiltersCount();

  return (
    <div className="bg-white rounded-lg shadow-sm border mb-6">
      <FiltersHeader 
        location={filters.location}
        locationDetected={filters.locationDetected}
      />

      <div className="p-4 space-y-4">
        <SearchBar
          value={filters.busca}
          onChange={(value) => updateFilter('busca', value)}
          onSearch={handleSearch}
        />

        <BasicFilters
          categoria={filters.categoria}
          ordem={filters.ordem}
          subcategoria={filters.subcategoria}
          genero={filters.genero}
          tamanho={filters.tamanho}
          categorias={categorias}
          subcategorias={subcategorias}
          tamanhosDisponiveis={tamanhosDisponiveis}
          onCategoriaChange={(value) => updateFilter('categoria', value)}
          onOrdemChange={(value) => updateFilter('ordem', value)}
          onSubcategoriaChange={(value) => updateFilter('subcategoria', value === "todas_sub" ? '' : value)}
          onGeneroChange={(value) => updateFilter('genero', value)}
          onTamanhoChange={(value) => updateFilter('tamanho', value)}
        />

        <LocationFilter
          location={filters.location}
          locationDetected={filters.locationDetected}
          onLocationDetected={handleLocationDetected}
          onLocationClear={() => updateFilters({ location: null, locationDetected: false })}
        />

        <AdvancedFiltersToggle
          showAdvanced={showAdvanced}
          activeFiltersCount={activeFiltersCount}
          onToggle={() => setShowAdvanced(!showAdvanced)}
          onResetFilters={handleResetFilters}
        />

        {showAdvanced && (
          <AdvancedFiltersContent
            precoMin={filters.precoMin}
            precoMax={filters.precoMax}
            mesmaEscola={filters.mesmaEscola}
            mesmoBairro={filters.mesmoBairro}
            paraFilhos={filters.paraFilhos}
            apenasFavoritos={filters.apenasFavoritos}
            apenasSeguidoras={filters.apenasSeguidoras}
            onPrecoChange={([min, max]) => updateFilters({ precoMin: min, precoMax: max })}
            onMesmaEscolaChange={(checked) => updateFilter('mesmaEscola', checked)}
            onMesmoBairroChange={(checked) => updateFilter('mesmoBairro', checked)}
            onParaFilhosChange={(checked) => updateFilter('paraFilhos', checked)}
            onApenasFavoritosChange={(checked) => updateFilter('apenasFavoritos', checked)}
            onApenasSeguidorasChange={(checked) => updateFilter('apenasSeguidoras', checked)}
          />
        )}
      </div>
    </div>
  );
};

export default AdvancedFilters;
