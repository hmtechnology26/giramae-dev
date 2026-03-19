/**
 * Utilitário para gerar HTML de imagens otimizadas com srcset
 */

import { buildBlogImageUrl, isFullUrl } from '@/lib/cdn';

export interface ImageVariants {
  small: string;
  medium: string;
  large: string;
}

export interface OptimizedImageData {
  id: string;
  alt: string;
  variants: ImageVariants;
  width: number;
  height: number;
  mime_type: string;
}

/**
 * Constrói URL completa para variante de imagem de blog
 * Se já for URL completa (dados antigos), retorna direto
 * Se for path, constrói usando CDN
 */
function buildVariantUrl(pathOrUrl: string): string {
  if (isFullUrl(pathOrUrl)) {
    return pathOrUrl;
  }
  return buildBlogImageUrl(pathOrUrl);
}

/**
 * Gera atributos HTML para imagem otimizada
 */
export function generateOptimizedImageAttrs(data: OptimizedImageData) {
  const { variants, alt, width, height } = data;

  // Construir URLs usando CDN para cada variante
  const smallUrl = buildVariantUrl(variants.small);
  const mediumUrl = buildVariantUrl(variants.medium);
  const largeUrl = buildVariantUrl(variants.large);

  return {
    src: largeUrl, // Fallback
    srcSet: `${smallUrl} 400w, ${mediumUrl} 800w, ${largeUrl} 1200w`,
    sizes: '(max-width: 600px) 400px, (max-width: 900px) 800px, 1200px',
    alt,
    width,
    height,
    loading: 'lazy' as const,
    decoding: 'async' as const,
  };
}

/**
 * Gera markdown para imagem otimizada
 * Formato especial que será parseado pelo MarkdownRenderer
 * Salva paths (não URLs completas) para permitir migração de CDN
 */
export function generateOptimizedImageMarkdown(data: OptimizedImageData): string {
  // Formato: ![alt](large-path "small-path|medium-path|large-path|width|height")
  const { variants, alt, width, height } = data;
  
  // Para exibição no markdown, usar URL completa da variante large
  const largeUrl = buildVariantUrl(variants.large);
  
  // No title, salvar os paths (que serão usados para construir srcset)
  const title = `${variants.small}|${variants.medium}|${variants.large}|${width}|${height}`;
  return `![${alt}](${largeUrl} "${title}")`;
}

/**
 * Parse markdown de imagem otimizada
 */
export function parseOptimizedImageMarkdown(
  src: string,
  alt: string,
  title?: string
): OptimizedImageData | null {
  if (!title) return null;

  const parts = title.split('|');
  if (parts.length !== 5) return null;

  const [small, medium, large, widthStr, heightStr] = parts;

  return {
    id: crypto.randomUUID(),
    alt,
    variants: { small, medium, large },
    width: parseInt(widthStr, 10),
    height: parseInt(heightStr, 10),
    mime_type: 'image/webp',
  };
}

/**
 * Sanitiza nome de arquivo para SEO-friendly (kebab-case)
 */
export function sanitizeFileName(filename: string): string {
  return filename
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .substring(0, 50);
}
