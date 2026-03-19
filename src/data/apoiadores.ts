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
  { id: 'hmtech', nome: 'HM Technology', tier: 'ouro', categoria: 'Tecnologia', websiteUrl: 'https://www.instagram.com/elah.essence?igsh=aW4wN2ZmYmt2Z2t4', logoUrl: '/logos/hm_logo.jpg' },
  { id: 'elah', nome: 'Elah Essence', tier: 'ouro', categoria: 'Joias', websiteUrl: 'https://www.instagram.com/hmtech_oficial?igsh=cWc0eDlxNTZtMjY=', logoUrl: '/logos/elah_logo.jpg' },

];


