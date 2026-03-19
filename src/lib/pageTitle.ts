/**
 * Helper para gerar títulos padronizados de páginas
 * Estrutura: [Ação/Conteúdo] | [Seção] | GiraMãe
 */
export const pageTitle = {
  // Públicas
  home: () => 'Início | GiraMãe - Troca de Roupas Infantis',
  auth: () => 'Entrar ou Cadastrar | GiraMãe',
  login: () => 'Login | GiraMãe',
  comoFunciona: () => 'Como Funciona | GiraMãe',
  contato: () => 'Contato | GiraMãe',
  sobre: () => 'Sobre Nós | GiraMãe',
  faq: () => 'Perguntas Frequentes | GiraMãe',
  termos: () => 'Termos de Uso | GiraMãe',
  privacidade: () => 'Política de Privacidade | GiraMãe',
  
  // Onboarding
  onboarding: {
    whatsapp: () => 'Verificar WhatsApp | Onboarding | GiraMãe',
    codigo: () => 'Código de Verificação | Onboarding | GiraMãe',
    endereco: () => 'Seu Endereço | Onboarding | GiraMãe',
    termos: () => 'Aceitar Termos | Onboarding | GiraMãe',
    conceito: () => 'Bem-vinda à Comunidade | Onboarding | GiraMãe',
    primeiroItem: () => 'Publicar Primeiro Item | Onboarding | GiraMãe',
    aguardando: () => 'Aguardando Liberação | Onboarding | GiraMãe',
  },
  
  // Core Features
  feed: () => 'Feed de Itens | GiraMãe',
  buscar: () => 'Buscar Itens | GiraMãe',
  publicar: () => 'Publicar Item | GiraMãe',
  item: (nome: string) => `${nome} | Detalhe | GiraMãe`,
  
  // Financeiro
  carteira: () => 'Minha Carteira | GiraMãe',
  comprarGirinhas: () => 'Comprar Girinhas | GiraMãe',
  transacoes: () => 'Minhas Transações | GiraMãe',
  reservas: () => 'Minhas Reservas | GiraMãe',
  
  // Social
  perfil: () => 'Meu Perfil | GiraMãe',
  editarPerfil: () => 'Editar Perfil | GiraMãe',
  perfilPublico: (nome: string) => `Perfil de ${nome} | GiraMãe`,
  maesSeguidas: () => 'Mães que Sigo | GiraMãe',
  favoritos: () => 'Itens Favoritos | GiraMãe',
  
  // Gamificação
  missoes: () => 'Missões | GiraMãe',
  indicacoes: () => 'Indicar Amigas | GiraMãe',
  apoiadores: () => 'Apoiadores | GiraMãe',
  configuracoes: () => 'Configurações | GiraMãe',
  
  // Blog
  blog: {
    home: () => 'Blog | Dicas para Mães | GiraMãe',
    post: (titulo: string) => `${titulo} | Blog | GiraMãe`,
    categoria: (nome: string) => `${nome} | Blog | GiraMãe`,
    categorias: () => 'Todas as Categorias | Blog | GiraMãe',
    tag: (nome: string) => `Tag: ${nome} | Blog | GiraMãe`,
    autor: (nome: string) => `Posts de ${nome} | Blog | GiraMãe`,
    busca: () => 'Buscar no Blog | GiraMãe',
  },
  
  // Parcerias
  parcerias: () => 'Parcerias Sociais | GiraMãe',
  programaDetalhes: (nome: string) => `${nome} | Parcerias | GiraMãe`,
  
  // Admin
  admin: {
    dashboard: () => 'Dashboard | Admin | GiraMãe',
    ledger: () => 'Ledger Financeiro | Admin | GiraMãe',
    blog: () => 'Gerenciar Blog | Admin | GiraMãe',
    blogNovo: () => 'Novo Post | Admin | GiraMãe',
    blogEditar: (titulo: string) => `Editar: ${titulo} | Admin | GiraMãe`,
    parcerias: () => 'Gerenciar Parcerias | Admin | GiraMãe',
    parceriasNova: () => 'Nova Parceria | Admin | GiraMãe',
    parceriasGestao: (nome: string) => `Gestão: ${nome} | Admin | GiraMãe`,
    parceriasPerfil: (nome: string) => `Perfil: ${nome} | Admin | GiraMãe`,
  },
  
  // Institucional
  institucional: () => 'Institucional | GiraMãe',
};
