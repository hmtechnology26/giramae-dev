import { Post } from '@/blog/types';

/**
 * Detecta menções a outros posts no conteúdo e adiciona links automaticamente
 * para melhorar internal linking e SEO
 */
export function autoLinkContent(content: string, allPosts: Post[], currentPostId: string): string {
  let processedContent = content;
  
  // Filtrar posts publicados (excluindo o atual)
  const publishedPosts = allPosts.filter(
    post => post.status === 'published' && post.id !== currentPostId
  );
  
  // Ordenar por tamanho do título (maiores primeiro para evitar matches parciais)
  const sortedPosts = publishedPosts.sort((a, b) => b.title.length - a.title.length);
  
  sortedPosts.forEach(post => {
    // Criar regex para encontrar o título (case insensitive, palavra completa)
    const titleRegex = new RegExp(`\\b(${escapeRegex(post.title)})\\b`, 'gi');
    
    // Substituir apenas se não estiver já em um link markdown
    processedContent = processedContent.replace(titleRegex, (match, p1) => {
      // Verificar se já está dentro de um link markdown [texto](url)
      const beforeMatch = processedContent.substring(0, processedContent.indexOf(match));
      const inLink = /\[([^\]]*)\]\([^)]*$/.test(beforeMatch);
      
      if (inLink) {
        return match; // Já está em um link, não modificar
      }
      
      // Criar link interno
      return `[${p1}](/blog/${post.slug})`;
    });
  });
  
  return processedContent;
}

/**
 * Escape caracteres especiais de regex
 */
function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Encontra posts relacionados baseado em keywords comuns no conteúdo
 */
export function findRelatedPosts(
  currentPost: Post,
  allPosts: Post[],
  maxResults: number = 3
): Post[] {
  // Extrair keywords do conteúdo atual
  const currentKeywords = extractKeywords(currentPost.content + ' ' + currentPost.title);
  
  // Calcular score de relevância para cada post
  const scored = allPosts
    .filter(post => 
      post.id !== currentPost.id && 
      post.status === 'published' &&
      post.categoryId === currentPost.categoryId // Mesma categoria
    )
    .map(post => {
      const postKeywords = extractKeywords(post.content + ' ' + post.title);
      const commonKeywords = currentKeywords.filter(kw => postKeywords.includes(kw));
      
      return {
        post,
        score: commonKeywords.length
      };
    })
    .filter(item => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, maxResults);
  
  return scored.map(item => item.post);
}

/**
 * Extrai keywords relevantes do texto (remove stopwords)
 */
function extractKeywords(text: string): string[] {
  const stopwords = new Set([
    'a', 'o', 'e', 'de', 'da', 'do', 'para', 'com', 'em', 'no', 'na',
    'por', 'um', 'uma', 'os', 'as', 'dos', 'das', 'que', 'se', 'é'
  ]);
  
  return text
    .toLowerCase()
    .replace(/[^\w\sáàâãéêíóôõúçÁÀÂÃÉÊÍÓÔÕÚÇ]/g, ' ')
    .split(/\s+/)
    .filter(word => word.length > 3 && !stopwords.has(word))
    .slice(0, 50); // Top 50 keywords
}
