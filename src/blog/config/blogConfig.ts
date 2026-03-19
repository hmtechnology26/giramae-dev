// Configuração central do blog
export const blogConfig = {
  // Informações básicas
  name: 'Blog GiraMãe',
  description: 'Dicas práticas sobre maternidade, economia e sustentabilidade para mães de Canoas e região',
  url: import.meta.env.VITE_BASE_URL || 'https://giramae.com.br',
  
  // Configurações de paginação
  postsPerPage: 12,
  relatedPostsCount: 3,
  
  // Configurações de conteúdo
  readingSpeed: 200, // palavras por minuto
  excerptLength: 200, // caracteres
  
  // Redes sociais
  social: {
    facebook: 'https://facebook.com/giramae',
    instagram: 'https://instagram.com/giramae',
    twitter: 'https://twitter.com/giramae',
    whatsapp: 'https://wa.me/5551981011805',
  },
  
  // Autor padrão
  defaultAuthor: {
    id: 'author-1',
    name: 'Equipe GiraMãe',
    slug: 'equipe-giramae',
  },
  
  // Features
  features: {
    comments: false,
    newsletter: true,
    relatedPosts: true,
    shareButtons: true,
    tableOfContents: true,
    viewCounter: true,
  },
  
  // Analytics
  analytics: {
    googleAnalytics: import.meta.env.VITE_GA_ID,
  },
} as const;

export type BlogConfig = typeof blogConfig;
