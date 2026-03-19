// Configuração de SEO
export const seoConfig = {
  // Meta tags padrão
  defaultTitle: 'Blog GiraMãe | Maternidade, Economia e Sustentabilidade',
  defaultDescription: 'Dicas práticas para mães sobre economia, sustentabilidade infantil e vida em Canoas/RS. Aprenda a economizar e viver de forma consciente.',
  titleTemplate: '%s | Blog GiraMãe',
  
  // Open Graph
  openGraph: {
    type: 'website',
    locale: 'pt_BR',
    siteName: 'GiraMãe',
    images: [
      {
        url: '/og-blog.jpg',
        width: 1200,
        height: 630,
        alt: 'Blog GiraMãe',
      },
    ],
  },
  
  // Twitter Card
  twitter: {
    cardType: 'summary_large_image',
    site: '@giramae',
    creator: '@giramae',
  },
  
  // Robots
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  
  // Palavras-chave principais
  keywords: [
    'maternidade',
    'economia infantil',
    'sustentabilidade',
    'troca de roupas',
    'Canoas RS',
    'economia circular',
    'bebê econômico',
  ],
  
  // Schema.org
  organization: {
    name: 'GiraMãe',
    url: 'https://giramae.com.br',
    logo: 'https://giramae.com.br/logo.png',
    sameAs: [
      'https://facebook.com/giramae',
      'https://instagram.com/giramae',
      'https://twitter.com/giramae',
    ],
  },
} as const;

export type SEOConfig = typeof seoConfig;
