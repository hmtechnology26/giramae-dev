import { useContext } from 'react';
import { GiraTourContext } from './GiraTourContext';

export const useGiraTour = () => {
  const context = useContext(GiraTourContext);
  if (!context) {
    throw new Error('useGiraTour must be used within a GiraTourProvider');
  }
  return context;
};