import { useState } from 'react';
import { usePosts } from '@/blog/hooks/usePosts';
import { useCategories } from '@/blog/hooks/useCategories';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Search, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import BlogLayout from '@/blog/components/layout/BlogLayout';
import BlogSidebar from '@/blog/components/layout/BlogSidebar';
import CategoryBadge from '@/blog/components/ui/CategoryBadge';
import PostMeta from '@/blog/components/ui/PostMeta';
import SEOHead from '@/components/seo/SEOHead';
import { seoConfig } from '@/blog/config/seoConfig';

export default function Blog() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [page, setPage] = useState(1);

  // Handlers que resetam a página quando filtros mudam
  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    setPage(1);
  };

  const handleCategoryChange = (categoryId: string | null) => {
    setSelectedCategory(categoryId);
    setPage(1);
  };

  const { categories } = useCategories();
  const { posts, loading, hasMore } = usePosts(
    {
      status: 'published',
      search: searchQuery || undefined,
      categoryId: selectedCategory || undefined,
    },
    12
  );

  if (loading && posts.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Structured Data para Blog e Organization (Google Best Practices)
  const structuredData = [
    {
      "@context": "https://schema.org",
      "@type": "Blog",
      "name": "Blog GiraMãe",
      "description": seoConfig.defaultDescription,
      "url": "https://giramae.com.br/blog",
      "inLanguage": "pt-BR",
      "publisher": {
        "@type": "Organization",
        "name": "GiraMãe",
        "url": "https://giramae.com.br",
        "logo": {
          "@type": "ImageObject",
          "url": "https://giramae.com.br/logo.png",
          "width": 600,
          "height": 60
        }
      }
    },
    {
      "@context": "https://schema.org",
      "@type": "Organization",
      "name": "GiraMãe",
      "url": "https://giramae.com.br",
      "logo": {
        "@type": "ImageObject",
        "url": "https://giramae.com.br/logo.png",
        "width": 600,
        "height": 60
      },
      "description": "Plataforma de economia circular para mães trocarem roupas e itens infantis em Canoas/RS",
      "address": {
        "@type": "PostalAddress",
        "addressLocality": "Canoas",
        "addressRegion": "RS",
        "addressCountry": "BR"
      },
      "sameAs": seoConfig.organization.sameAs
    }
  ];

  return (
    <>
      <SEOHead
        title={seoConfig.defaultTitle}
        description={seoConfig.defaultDescription}
        keywords={seoConfig.keywords.join(', ')}
        url="https://giramae.com.br/blog"
        type="website"
        structuredData={structuredData}
      />
      
      <BlogLayout sidebar={<BlogSidebar />}>
      {/* Header */}
      <div className="bg-gradient-to-br from-primary/15 via-secondary/10 to-background -mx-4 mb-8 rounded-2xl overflow-hidden">
  <div className="container mx-auto px-4">
    <div className="relative mt-6 h-36 md:h-30 lg:h-30">
      <img 
        src="/blog190kb.png" 
        alt="Banner Blog GiraMãe" 
        className="w-full h-full object-cover rounded-2xl"
      />
      {/* Overlay escuro */}
      <div className="absolute inset-0 bg-black/40 rounded-2xl"></div>
      
      {/* Texto */}
      <div className="absolute inset-0 flex flex-col items-center justify-center text-white text-center px-4">
        <h1 className="text-3xl md:text-5xl font-bold mb-4">
          Blog GiraMãe
        </h1>
        <p className="text-md md:text-xl max-w-2xl">
          Dicas práticas sobre maternidade, economia e sustentabilidade
        </p>
      </div>
    </div>
  </div>
</div>

      <div className="space-y-8">
        {/* Search & Filters */}
        <Card className="mb-8">
          <CardContent className="pt-6 space-y-4">
            {/* Search */}
            <div className="relative max-w-xl">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Buscar posts..."
                value={searchQuery}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Categories */}
            <div className="flex flex-wrap gap-2">
              <Button
                variant={selectedCategory === null ? 'default' : 'outline'}
                size="sm"
                onClick={() => handleCategoryChange(null)}
              >
                Todas
              </Button>
              {categories.map((category) => (
                <Button
                  key={category.id}
                  variant={selectedCategory === category.id ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handleCategoryChange(category.id)}
                >
                  {category.name}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Posts Grid */}
        {posts.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground text-lg">Nenhum post encontrado</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {posts.map((post) => (
                <Card key={post.id} className="hover:shadow-lg transition-shadow h-full flex flex-col">
                  <CardHeader>
                    {post.category && (
                      <CategoryBadge category={post.category} className="mb-2" />
                    )}
                    <Link to={`/blog/${post.slug}`}>
                      <h3 className="text-xl font-bold hover:text-primary transition-colors line-clamp-2">
                        {post.title}
                      </h3>
                    </Link>
                  </CardHeader>

                  <CardContent className="flex-1">
                    <p className="text-muted-foreground line-clamp-3">{post.excerpt}</p>
                  </CardContent>

                  <CardFooter>
                    <PostMeta 
                      readingTimeMinutes={post.readingTimeMinutes}
                      viewCount={post.viewCount}
                      date={post.publishedAt || post.createdAt}
                      variant="compact"
                    />
                  </CardFooter>
                </Card>
              ))}
            </div>

            {/* Load More */}
            {hasMore && (
              <div className="flex justify-center">
                <Button
                  onClick={() => setPage((p) => p + 1)}
                  disabled={loading}
                  size="lg"
                  variant="outline"
                >
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Carregar mais posts
                </Button>
              </div>
            )}
          </>
        )}
      </div>
      </BlogLayout>
    </>
  );
}
