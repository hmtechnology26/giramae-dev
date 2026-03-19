import { getBlogRepository } from '@/blog/lib/data';

/**
 * Gera sitemap.xml dinâmico com todos os posts do blog
 * Para usar: chamar essa função em um edge function ou build script
 */
export async function generateBlogSitemap(): Promise<string> {
  try {
    const repository = getBlogRepository();
    const posts = await repository.getPosts(
      { status: 'published' },
      { page: 1, pageSize: 1000 }
    );
    
    const postUrls = posts.map(post => `
  <url>
    <loc>https://giramae.com.br/blog/${post.slug}</loc>
    <lastmod>${new Date(post.updatedAt).toISOString().split('T')[0]}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`).join('');
    
    const categories = await repository.getCategories();
    const categoryUrls = categories.map(cat => `
  <url>
    <loc>https://giramae.com.br/blog/categoria/${cat.slug}</loc>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>`).join('');
    
    return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <!-- Homepage -->
  <url>
    <loc>https://giramae.com.br</loc>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  
  <!-- Blog Home -->
  <url>
    <loc>https://giramae.com.br/blog</loc>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>
  
  <!-- Blog Posts -->
  ${postUrls}
  
  <!-- Categories -->
  ${categoryUrls}
  
  <!-- Páginas Principais -->
  <url>
    <loc>https://giramae.com.br/sobre</loc>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>
  <url>
    <loc>https://giramae.com.br/como-funciona</loc>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>
  <url>
    <loc>https://giramae.com.br/faq</loc>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>
</urlset>`;
  } catch (error) {
    console.error('Erro ao gerar sitemap:', error);
    return '';
  }
}

/**
 * Salva o sitemap no arquivo public/sitemap.xml
 * Nota: Em produção, isso deve ser executado automaticamente
 * via edge function ou durante o build
 */
export async function saveSitemap(): Promise<void> {
  const sitemap = await generateBlogSitemap();
  // Implementar salvamento no filesystem ou storage
  console.log('Sitemap gerado com sucesso');
  console.log(sitemap);
}
