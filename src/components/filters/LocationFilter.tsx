
import React from 'react';
import { MapPin, X } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { LocationDetectionButton } from '@/components/location/LocationDetectionButton';

interface LocationFilterProps {
  location?: { cidade: string; estado: string; bairro?: string } | null;
  locationDetected?: boolean;
  onLocationDetected: (location: { cidade: string; estado: string; bairro?: string }) => void;
  onLocationClear: () => void;
}

export const LocationFilter: React.FC<LocationFilterProps> = ({
  location,
  locationDetected,
  onLocationDetected,
  onLocationClear
}) => {
  return (
    <div>
      <Label className="text-sm font-medium text-gray-700 mb-1 block">Localização</Label>
      {location ? (
        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-primary" />
            <span className="text-sm">
              {location.cidade}, {location.estado}
              {locationDetected && " (detectada automaticamente)"}
            </span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onLocationClear}
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      ) : (
        <LocationDetectionButton
          onLocationDetected={onLocationDetected}
          className="w-full"
        />
      )}
    </div>
  );
};
