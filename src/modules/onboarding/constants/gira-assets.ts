import { GiraEmotion } from "../types";

// Import actual GIFs
import giraCelebrating from "@/assets/gira/gira_celebrating.gif";

// Using placeholder images for emotions that don't have actual GIFs yet
const PLACEHOLDER_BASE = "https://placehold.co/200x200/EC4899/FFFFFF?text=";

export const GIRA_ASSETS: Record<GiraEmotion, { path: string; description: string; useCases: string[] }> = {
  idle: {
    path: `${PLACEHOLDER_BASE}Gira+Idle`,
    description: 'Flutuando suavemente, Girinhas orbitando',
    useCases: ['Estado padrão', 'Esperando input'],
  },
  waving: {
    path: `${PLACEHOLDER_BASE}Gira+Waving`,
    description: 'Acenando com a mão',
    useCases: ['Boas-vindas', 'Início de tour'],
  },
  talking: {
    path: `${PLACEHOLDER_BASE}Gira+Talking`,
    description: 'Boca mexendo, explicando',
    useCases: ['Explicações longas', 'Conceitos'],
  },
  pointing: {
    path: `${PLACEHOLDER_BASE}Gira+Pointing`,
    description: 'Apontando para a direita',
    useCases: ['Destacar elemento', 'Chamar atenção'],
  },
  thinking: {
    path: `${PLACEHOLDER_BASE}Gira+Thinking`,
    description: 'Mão no queixo, pensativa',
    useCases: ['Carregando', 'Processando'],
  },
  celebrating: {
    path: giraCelebrating,
    description: 'Pulando de alegria, confetes',
    useCases: ['Conquista', 'Fim de tour', 'Recompensa'],
  },
  thumbsup: {
    path: `${PLACEHOLDER_BASE}Gira+ThumbsUp`,
    description: 'Joinha com sorriso',
    useCases: ['Confirmação', 'Ação correta'],
  },
} as const;
