import React from 'react';
import { useGiraTour } from '../core/useGiraTour';

export const TourReplayButton: React.FC<{ tourId: string }> = ({ tourId }) => {
  const { startTour } = useGiraTour();
  
  return (
    <button 
      onClick={() => startTour(tourId)}
      className="text-xs text-pink-500 hover:underline flex items-center gap-1"
    >
      <span>↺</span> Ver tutorial
    </button>
  );
};