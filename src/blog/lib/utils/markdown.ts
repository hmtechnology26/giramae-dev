// Utilitários para processamento de Markdown

/**
 * Remove tags HTML e Markdown de uma string
 */
export function stripMarkdown(text: string): string {
  return text
    // Remove headers
    .replace(/#{1,6}\s+/g, '')
    // Remove bold/italic
    .replace(/(\*\*|__)(.*?)\1/g, '$2')
    .replace(/(\*|_)(.*?)\1/g, '$2')
    // Remove links
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    // Remove images
    .replace(/!\[([^\]]*)\]\([^)]+\)/g, '')
    // Remove code blocks
    .replace(/```[\s\S]*?```/g, '')
    .replace(/`([^`]+)`/g, '$1')
    // Remove HTML tags
    .replace(/<[^>]*>/g, '')
    // Clean whitespace
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Extrai headings do markdown para gerar índice
 */
export function extractHeadings(markdown: string): Array<{ level: number; text: string; id: string }> {
  const headingRegex = /^(#{1,6})\s+(.+)$/gm;
  const headings: Array<{ level: number; text: string; id: string }> = [];
  let match;

  while ((match = headingRegex.exec(markdown)) !== null) {
    const level = match[1].length;
    const text = match[2].trim();
    const id = text
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-');
    
    headings.push({ level, text, id });
  }

  return headings;
}

/**
 * Adiciona IDs aos headings para navegação
 */
export function addHeadingIds(markdown: string): string {
  return markdown.replace(/^(#{1,6})\s+(.+)$/gm, (match, hashes, text) => {
    const id = text
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-');
    return `${hashes} ${text} {#${id}}`;
  });
}

/**
 * Extrai primeira imagem do markdown
 */
export function extractFirstImage(markdown: string): string | null {
  const imageRegex = /!\[([^\]]*)\]\(([^)]+)\)/;
  const match = markdown.match(imageRegex);
  return match ? match[2] : null;
}
