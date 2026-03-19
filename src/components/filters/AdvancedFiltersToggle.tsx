
import React from 'react';
import { Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface AdvancedFiltersToggleProps {
  showAdvanced: boolean;
  activeFiltersCount: number;
  onToggle: () => void;
  onResetFilters: () => void;
}

export const AdvancedFiltersToggle: React.FC<AdvancedFiltersToggleProps> = ({
  showAdvanced,
  activeFiltersCount,
  onToggle,
  onResetFilters
}) => {
  return (
    <div className="flex items-center justify-between pt-2">
      <Button
        variant="ghost"
        onClick={onToggle}
        className="text-sm flex items-center gap-2"
      >
        <Filter className="w-4 h-4" />
        Filtros Avançados
        {activeFiltersCount > 0 && (
          <Badge variant="secondary" className="ml-1 bg-green-100 text-green-800">
            {activeFiltersCount}
          </Badge>
        )}
      </Button>
      
      {activeFiltersCount > 0 && (
        <Button variant="ghost" size="sm" onClick={onResetFilters} className="text-gray-500">
          Limpar filtros
        </Button>
      )}
    </div>
  );
};
