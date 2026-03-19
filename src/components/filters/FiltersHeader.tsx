
import React from 'react';
import { Button } from '@/components/ui/button';
import { MapPin } from 'lucide-react';

interface FiltersHeaderProps {
  location?: { cidade: string; estado: string; bairro?: string } | null;
  locationDetected?: boolean;
}

export const FiltersHeader: React.FC<FiltersHeaderProps> = ({
  location,
  locationDetected
}) => {
  return (
    <div className="p-4 border-b">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">Filtros Inteligentes</h2>
        <Button variant="ghost" size="sm" className="text-primary">
          + Publicar
        </Button>
      </div>
      {location && (
        <p className="text-sm text-gray-500 mt-1 flex items-center">
          <MapPin className="w-4 h-4 mr-1" />
          {location.cidade}, {location.estado}
        </p>
      )}
    </div>
  );
};
