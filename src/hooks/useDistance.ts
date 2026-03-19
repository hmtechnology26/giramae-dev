
import { useState, useEffect } from 'react';

export interface DistanceResult {
  distance: number;
  unit: 'km' | 'm';
  formattedDistance: string;
}

export const useDistance = () => {
  const calculateDistance = async (cep1: string, cep2: string): Promise<DistanceResult | null> => {
    if (!cep1 || !cep2) return null;
    
    try {
      // Por enquanto usando distância simulada
      // Em produção, integraria com API de CEPs
      const distance = Math.random() * 50;
      
      return {
        distance,
        unit: 'km',
        formattedDistance: distance < 1 
          ? `${Math.round(distance * 1000)}m`
          : `${distance.toFixed(1)}km`
      };
    } catch (error) {
      console.error('Erro ao calcular distância:', error);
      return null;
    }
  };

  const isNearby = (distance: number, maxKm: number): boolean => {
    return distance <= maxKm;
  };

  return {
    calculateDistance,
    isNearby
  };
};
