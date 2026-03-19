import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';

export interface FeedFilters {
  busca: string;
  categoria: string;
  subcategoria: string;
  ordem: string;
  mesmaEscola: boolean;
  mesmoBairro: boolean;
  paraFilhos: boolean;
  apenasFavoritos: boolean;
  apenasSeguidoras: boolean;
  location: { estado: string; cidade: string; bairro?: string } | null;
  locationDetected: boolean;
  precoMin: number;
  precoMax: number;
  // ✅ ADICIONADO: Filtros de gênero e tamanho
  genero: string;
  tamanho: string;
}

interface FeedFiltersContextType {
  filters: FeedFilters;
  updateFilter: (key: keyof FeedFilters, value: any) => void;
  updateFilters: (updates: Partial<FeedFilters>) => void;
  resetFilters: () => void;
  getActiveFiltersCount: () => number;
  setLocationDetected: (location: { cidade: string; estado: string; bairro?: string }) => void;
}

const defaultFilters: FeedFilters = {
  busca: '',
  categoria: 'todas',
  subcategoria: '',
  ordem: 'recentes',
  mesmaEscola: false,
  mesmoBairro: false,
  paraFilhos: false,
  apenasFavoritos: false,
  apenasSeguidoras: false,
  location: null,
  locationDetected: false,
  precoMin: 0,
  precoMax: 200,
  // ✅ ADICIONADO: Valores padrão para gênero e tamanho
  genero: 'todos',
  tamanho: 'todos',
};

const FeedFiltersContext = createContext<FeedFiltersContextType | undefined>(undefined);

export const FeedFiltersProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [filters, setFilters] = useState<FeedFilters>(defaultFilters);

  const updateFilter = useCallback((key: keyof FeedFilters, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  }, []);

  const updateFilters = useCallback((updates: Partial<FeedFilters>) => {
    setFilters(prev => ({ ...prev, ...updates }));
  }, []);

  const resetFilters = useCallback(() => {
    setFilters(defaultFilters);
  }, []);

  const setLocationDetected = useCallback((location: { cidade: string; estado: string; bairro?: string }) => {
    setFilters(prev => ({
      ...prev,
      location,
      locationDetected: true
    }));
  }, []);

  const getActiveFiltersCount = useCallback(() => {
    let count = 0;
    if (filters.mesmaEscola) count++;
    if (filters.mesmoBairro) count++;
    if (filters.paraFilhos) count++;
    if (filters.apenasFavoritos) count++;
    if (filters.apenasSeguidoras) count++;
    if (filters.categoria !== 'todas') count++;
    if (filters.subcategoria) count++;
    if (filters.location) count++;
    if (filters.precoMin > 0 || filters.precoMax < 200) count++;
    // ✅ ADICIONADO: Contagem para gênero e tamanho
    if (filters.genero !== 'todos') count++;
    if (filters.tamanho !== 'todos') count++;
    return count;
  }, [filters]);

  const value = {
    filters,
    updateFilter,
    updateFilters,
    resetFilters,
    getActiveFiltersCount,
    setLocationDetected,
  };

  return (
    <FeedFiltersContext.Provider value={value}>
      {children}
    </FeedFiltersContext.Provider>
  );
};

export const useFeedFilters = (): FeedFiltersContextType => {
  const context = useContext(FeedFiltersContext);
  if (!context) {
    throw new Error('useFeedFilters deve ser usado dentro de um FeedFiltersProvider');
  }
  return context;
};
