/**
 * CDN Configuration and URL Helpers
 * Centraliza toda a lógica de construção de URLs de mídia
 */

// Mapeamento de buckets para CDNs
export const CDN_URLS = {
  assets: import.meta.env.VITE_ASSETS_CDN || 'https://dev-assets.giramae.com.br',
  avatars: import.meta.env.VITE_AVATARS_CDN || 'https://dev-avatars.giramae.com.br',
  docs: import.meta.env.VITE_DOCS_CDN || 'https://dev-docs.giramae.com.br',
  logos: import.meta.env.VITE_LOGOS_CDN || 'https://dev-logos.giramae.com.br',
  blogImages: import.meta.env.VITE_BLOG_IMAGES_CDN || 'https://dev-blog-images.giramae.com.br',
} as const;

// Nomes dos buckets no R2 (baseado no ambiente)
export const R2_BUCKETS = {
  itens: import.meta.env.VITE_BUCKET_ITENS || 'itens-dev',
  avatars: import.meta.env.VITE_BUCKET_AVATARS || 'avatars-dev',
  docs: import.meta.env.VITE_BUCKET_DOCS || 'documentos-parcerias-dev',
  logos: import.meta.env.VITE_BUCKET_LOGOS || 'logos-parceiros-dev',
  blogImages: import.meta.env.VITE_BUCKET_BLOG_IMAGES || 'blog-images-dev',
} as const;

// Mapeamento de bucket names para CDN keys
const BUCKET_TO_CDN: Record<string, keyof typeof CDN_URLS> = {
  'itens': 'assets',
  'itens-dev': 'assets',
  'itens-prd': 'assets',
  'avatars': 'avatars',
  'avatars-dev': 'avatars',
  'avatars-prd': 'avatars',
  'documentos-parcerias': 'docs',
  'documentos-parcerias-dev': 'docs',
  'documentos-parcerias-prd': 'docs',
  'blog-images': 'blogImages',
  'blog-images-dev': 'blogImages',
  'blog-images-prd': 'blogImages',
  'logos': 'logos',
};

/**
 * Obtém a URL do CDN para um bucket específico
 */
export function getCdnForBucket(bucket: string): string {
  const cdnKey = BUCKET_TO_CDN[bucket] || 'assets';
  return CDN_URLS[cdnKey];
}

/**
 * Verifica se uma string é uma URL completa
 */
export function isFullUrl(src: string): boolean {
  return src.startsWith('http://') || 
         src.startsWith('https://') || 
         src.startsWith('blob:') || 
         src.startsWith('data:');
}

/**
 * Constrói a URL completa de uma imagem
 * - Se já for URL completa, retorna direto (compatibilidade com dados antigos)
 * - Se for path, constrói URL usando CDN + path
 */
export function buildImageUrl(
  pathOrUrl: string, 
  bucket: string = 'itens'
): string {
  if (!pathOrUrl) return '';
  
  // Se já é URL completa, retorna direto (dados antigos do Supabase)
  if (isFullUrl(pathOrUrl)) {
    return pathOrUrl;
  }
  
  // Construir URL com CDN
  const cdn = getCdnForBucket(bucket);
  // Remove barra inicial se existir no path
  const cleanPath = pathOrUrl.startsWith('/') ? pathOrUrl.slice(1) : pathOrUrl;
  return `${cdn}/${cleanPath}`;
}

/**
 * Constrói URL de avatar
 */
export function buildAvatarUrl(pathOrUrl: string): string {
  return buildImageUrl(pathOrUrl, 'avatars');
}

/**
 * Constrói URL de imagem de item
 */
export function buildItemImageUrl(pathOrUrl: string): string {
  return buildImageUrl(pathOrUrl, 'itens');
}

/**
 * Constrói URL de imagem de blog
 */
export function buildBlogImageUrl(pathOrUrl: string): string {
  return buildImageUrl(pathOrUrl, 'blog-images');
}

/**
 * Constrói URL de documento
 */
export function buildDocumentUrl(pathOrUrl: string): string {
  return buildImageUrl(pathOrUrl, 'documentos-parcerias');
}
