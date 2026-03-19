import { createContext } from 'react';
import { GiraTourContextType } from '../types';

export const GiraTourContext = createContext<GiraTourContextType | null>(null);