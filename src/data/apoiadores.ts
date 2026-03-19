export type ApoiadorTier = 'principal' | 'ouro' | 'prata' | 'apoio';

export interface Apoiador {
  id: string;
  nome: string;
  tier: ApoiadorTier;
  descricao?: string;
  categoria?: string;
  websiteUrl?: string;
  logoUrl?: string;
}

export const apoiadores: Apoiador[] = [
  { id: 'hmtech', nome: 'HM Technology', tier: 'ouro', categoria: 'Tecnologia', websiteUrl: 'https://hmtechnology.com.br', logoUrl: '/logos/hm_logo.jpg' },
  { id: 'elah', nome: 'Elah Essence', tier: 'ouro', categoria: 'Joias', websiteUrl: 'https://hmtechnology.com.br', logoUrl: '/logos/elah_logo.jpg' },

];


