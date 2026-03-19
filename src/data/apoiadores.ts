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
  { id: 'hmtech', nome: 'HM Technology', tier: 'ouro', categoria: 'Tecnologia', websiteUrl: 'https://hmtechnology.com.br', logoUrl: '/logos/empresa-x.svg' },
  { id: 'elah', nome: 'Elah Essence', tier: 'ouro', categoria: 'Joias', websiteUrl: 'https://hmtechnology.com.br', logoUrl: '/logos/empresa-x.svg' },
  { id: 'wvtech', nome: 'WV Tech', tier: 'ouro', categoria: 'Mecânica', websiteUrl: 'https://wvtech.com.br', logoUrl: '/logos/empresa-x.svg' },
  { id: 'havan', nome: 'Havan', tier: 'ouro', categoria: 'Varejo', websiteUrl: 'https://havan.com.br', logoUrl: '/logos/empresa-x.svg' },

];


